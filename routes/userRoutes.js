const express = require('express');

const { uploadUserPhoto, resizeUserPhoto, getAllUsers, updateMe, deleteMe, createUser, getMe, getUser, updateUser, deleteUser} = require('./../controllers/userController');

const authController = require('./../controllers/authController');

//const upload = multer({ dest: 'public/img/users'});


const router =express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.use(authController.protect);
//protect middleware burdan sonraki tüm routelar için çalışır. tek tek route lara eklemek yerine burda ekleyblyrz



router.get('/me', getMe, getUser);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
//router.patch('/updateMe', upload.single('photo'), updateMe);

router.delete('/deleteMe', deleteMe);


router.use(authController.restrictTo('admin'));
//restrictTo middleware burdan sonraki tüm routelar için çalışır. tek tek route lara eklemek yerine burda ekleyblyrz

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);


/*
router.get('/me', authController.protect, getMe, getUser);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.patch('/updateMe', authController.protect, updateMe);
router.delete('/deleteMe', authController.protect, deleteMe);


router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
*/

module.exports = router;