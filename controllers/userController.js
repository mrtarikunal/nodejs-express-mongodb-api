const multer = require('multer');
//image upload için
const sharp = require('sharp');
//resize için
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
//tekrar eden fonksiyonları buna aldık


/*
const multerStorage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, 'public/img/users');
    },

    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
    }
});
//resmin kaydedileceğil yeri ve ismini belirledik
*/

const multerStorage = multer.memoryStorage();
//image geçici hafızaya aldıryrz

const multerFilter = (req, file, cb) => {

    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image, please upload an image', 400), false);
    }
};

//yüklenen şeyin image olup olmadığını konrtol edyrz

//const upload = multer({ dest: 'public/img/users'});
//image lerin yükleneceği yeri beelirttik

const upload = multer({
     storage: multerStorage,
     fileFilter: multerFilter
    });

exports.uploadUserPhoto = upload.single('photo');
//photo resmi yüklediğimiz field ın name i

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {

    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);

    next();

});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {

        if(allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.getAllUsers = factory.getAll(User);


/*
exports.getAllUsers = catchAsync(async (req, res, next) => {

    const user = await User.find();
    res.status(200).json({
        status: 'sucess',
        data: {
            user
        }
    });
});
*/


exports.getMe =(req, res, next) => {

    req.params.id = req.user.id;
    next();
};


exports.updateMe = catchAsync(async (req, res, next) => {

    console.log(req.file);
    //password burda update etmyrz
    if(req.body.password || req.body.passwordConfirm) {
        return next(new AppError('you cannot update password rom this url', 400));
    }



    const filteredBody = filterObj(req.body, 'name', 'email');
    //req.body den gelen datayı filtereldk. sadece email ve name update edebilmesi için
   
    if(req.file) {

        filteredBody.photo = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, 
        runValidators: true
    });
    //user authenticate oldupu için user.id protect middleware den gelyr

    

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

});

exports.deleteMe = catchAsync(async (req, res, next) => {
    //user gerçekte silmyrz. active fieldını değşryz

    await User.findByIdAndUpdate(req.user.id, {active: false});
    
    res.status(204).json({

        status: 'success',
        data: null
    });

});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not defined'
    });
}


exports.getUser = factory.getOne(User);


exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
