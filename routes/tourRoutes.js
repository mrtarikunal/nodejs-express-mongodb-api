const express = require('express');
const tourController = require('./../controllers/tourController');

const authController = require('./../controllers/authController');

const reviewRouter = require('./../routes/reviewRoutes');

//const reviewController = require('./../controllers/reviewController');

const router =express.Router();

//router.param('id', tourController.checkID);
//route param ile id paramatresine ulaşyrz. param middleware


router.use('/:tourId/reviews', reviewRouter);
//review router nı mount ettik buraya


router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
//en çok kullanılan url için alias belrldk normalde urlde gelmesi gerekn query stringleri middleware ile
//kendimiz manupule edyrz(tourController.aliasTopTours middleware ile)


router.route('/tour-stats').get(tourController.getTourStats);
//aggerate pipeline kullanarak çeşitli istatistikleri döndryrz

router.route('/monthly-plan/:year').get(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'), 
    tourController.getMonthlyPlan);
//aggerate pipeline kullanarak çeşitli istatistikleri döndryrz

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);


router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router.route('/')
.get(tourController.getAllTours)
.post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);


/*
router.route('/')
.get(authController.protect, tourController.getAllTours)
.post(tourController.createTour);
*/


//router.route('/')
//.get(tourController.getAllTours)
//.post(tourController.checkBody, tourController.createTour);
//tourController.checkBody tourController.createTour çalışmadan önce çalşr
//iki middleware chain ettik

router.route('/:id')
.get(tourController.getTour)
.patch(authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);


/*
router.route('/:tourId/reviews')
.post(
    authController.protect, 
    authController.restrictTo('user'), 
    reviewController.createReview
    );
    */


module.exports = router;