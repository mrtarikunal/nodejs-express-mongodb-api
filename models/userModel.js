const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'please enter your name'],
    },
    email: {
        type:String,
        required: [true, 'please enter your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please enter a valid email']
    },
    photo: {type: String, default: 'default.jpg'},
    role: {
        type:String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type:String,
        required: [true, 'please enter a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type:String,
        required: [true, 'please re-enter your password'],
        validate: {
            //this only works on create and save!!!
            validator: function(el) {
                return el === this.password;
            },
            message: 'passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }


});

//test datasındaki tüm password ler test1234

userSchema.pre('save', async function(next) {


    if(!this.isModified('password')) {
        return next();
    }
//password modify olmamışsa

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    //db de bunu kaydetmeye gerek yok

    next();

});



userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) {
        return next();
    }

    this.passwordChangedAt = Date.now() - 1000;
    //bazen token passwordChangedAt den önce olşrlyr bu durumda user login olamyr. bunu önlemek için 1000(1s) çıkardık

    next();

});



userSchema.pre(/^find/, function(next) {

    //this points to query()
    this.find({active: {$ne: false}});
    next();

});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};
//instance metod , tüm user document larda geçerli. yani db den user ile dönen tüm yerlerde

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
        //password token olştrulduktan sonra değişdiyse true dönyr
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function() {

    const resetToken = crypto.randomBytes(32).toString('hex');
    //32 basamkalı bir reset token olştrdk

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    //reset token encrpyt ettik(db de saklamak için)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;