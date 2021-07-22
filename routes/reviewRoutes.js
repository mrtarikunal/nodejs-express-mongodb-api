const express = require('express');
const reviewController = require('./../controllers/reviewController');

const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true});
//tourdan gelen parametreleri almak için merge kullandık
//post /tour/234/reviews


router.use(authController.protect);
//protect middleware burdan sonraki tüm routelar için çalışır. tek tek route lara eklemek yerine burda ekleyblyrz


router.route('/')
.get(reviewController.getAllReviews)
.post(
    authController.protect, 
    authController.restrictTo('user'), 
    reviewController.setTourUserIds,
    reviewController.createReview
    );


router.route('/:id')
.get(reviewController.getReview)
.delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
.patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);
module.exports = router;