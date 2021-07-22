const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');


const signToken = id => {
    return jwt.sign({ id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);

    const cookieOptions = {
        expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true

    };

    if(process.env.NODE_ENV === 'production') {
        cookieOptions.secure= true;
    }

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    //password response da göstermemek için

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }

    });

};

exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    //const email = req.body.email;
    //const {email} = req.body;
    //üstündeki ile aynı object destruction

    const {email, password} = req.body;

    if(!email || !password) {

      return next(new AppError('please provide email and password', 400));
    }

    const user = await User.findOne({email: email}).select('+password');
    //select('+password'); password select kapalıydı. böyle yaparak datayı çektik

    //const correct = await user.correctPassword(password, user.password);
    //user model içinde yazdığımız instance metdonu kullandık

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, res);
    
    
});

exports.logout = (req, res) => {

    res.cookie('jwt', 'loggedout', {

        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({ status: 'success'});
};


exports.protect = catchAsync(async(req, res, next) => {

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if(!token) {
        return next(new AppError('You are not logged in', 401));
    }


    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //dönen promise de error varsa otomatik next middle ware ile global error handle ne gider
//token geçerlimi kontrol edyrz

    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('User is not exist', 401));
    }
    //user varmı kontrol edyrz

    if(currentUser.changedPasswordAfter(decoded.iat)) {
        //user token olştrdulktan sonra password değişştrse hata dönyrz
        return next(new AppError('User recently changed password', 401));
    };
    //iat issued at yani token olştrduğu zaman



    req.user = currentUser;
    //currentUser ı req de tanımladık bir sonraki aşamaya aktarılsın diye
    res.locals.user = currentUser;
    //res.locals da koyduğumuz dataya tüm pug template leri ulaşablyr
    next();

});


exports.isLoggedIn = async(req, res, next) => {

    if(req.cookies.jwt) {

        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    

    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next();
    }
    //user varmı kontrol edyrz

    if(currentUser.changedPasswordAfter(decoded.iat)) {
        //user token olştrdulktan sonra password değişştrse hata dönyrz
        return next();
    };
    //iat issued at yani token olştrduğu zaman



    res.locals.user = currentUser;
    //res.locals da koyduğumuz dataya tüm pug template leri ulaşablyr
    return next();
            
        } catch (error) {
            return next();
        }

    

    }
    next();

};


exports.restrictTo = (...roles) => {
    //middlewareden parametre gönderemeyecğmz için bu şekilde wrapper olştrdulktan
    //func içinde func gibi

    return (req, res, next) => {

        if(!roles.includes(req.user.role)) {
            //protect middleware de en son req e user eklemşdk
            return next(new AppError('you dont have permission to perform this action', 403));
        }

        next();
    }

    
};


exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email});

    if(!user) {
        return next(new AppError('No user with this email address', 404));
    }

    const resetToken = user.createPasswordResetToken();
    //user Model içinde reset token olştrdk
    await user.save({ validateBeforeSave: false});
    //burda da reset token db ye kaydedyrz.


    /*
    const message = `Forgot your password? submit your new password: 
    passwordConfirm to: ${resetUrl}`;*/

    try {
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        /*
        await sendEmail({
        email: user.email,
        subject: 'your password reset token(valid for 10 mins)',
        message
    });*/

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email'
    });
        
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        //email gitmezse olştrlan reset token ile reset tokenı ve expires time nı db de boşaltyrz

        await user.save({ validateBeforeSave: false});

        return next(new AppError('There was an error sending the email', 500));
        
    }
    

});

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    //url parametresinden encypt olamayn reset token alıp encrypt ettik, db de kayıtlı olanla karşılaştrcz

    const user = await User.findOne({ passwordResetToken:hashedToken, passwordResetExpires: {$gt: Date.now()}});

    if(!user) {
        return next(new AppError('Token is invalid or expired', 400));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

     createSendToken(user, 200, res);

    
    
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //user protect middleare den gelyr. login olmş user password nu update edeblyr
    const user = await User.findById(req.user.id).select('+password');
    //select('+password'); password select kapalıydı. böyle yaparak datayı çektik

    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('your current password is incorrect', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);



});