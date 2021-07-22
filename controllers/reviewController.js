const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
//tekrar eden fonksiyonları buna aldık



exports.getAllReviews = factory.getAll(Review);

/*
exports.getAllReviews = catchAsync(async (req, res, next) => {
    //127.0.0.1:3000/api/v1/tours/5c88fa8cf4afda39709c2955/reviews
    //burda tourıd params da varsa sadece o touru dönecek, yoksa tüm turları

    let filter = {};

    if(req.params.tourId) {
        filter = { tour: req.params.tourId };
    }

    const reviews = await Review.find(filter);

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }

    });

});

*/

exports.setTourUserIds = (req, res, next) => {

    if(!req.body.tour) {
        req.body.tour = req.params.tourId;
    }

    if(!req.body.user) {
        req.body.user = req.user.id;
    }

    next();

};

exports.createReview = factory.createOne(Review);

/*
exports.createReview = catchAsync(async (req, res, next) => {

    if(!req.body.tour) {
        req.body.tour = req.params.tourId;
    }

    if(!req.body.user) {
        req.body.user = req.user.id;
    }
    const newReview = await Review.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            review: newReview
        }

    });


});
*/

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);