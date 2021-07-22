const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type:String,
        required: [true, 'review can not be empty']
    },
    rating: {
        type: Number,
        min:1,
        max:5
    },
    createdAt: {
        type:Date,
        default: Date.now()
    },
    tour:  {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'a review must belong to a tour']

        },
        //parent referenccing
    user:  {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'a review must belong to a user']

        }
        //parent referenccing    
    
}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
    //tanımladğmz virtual fielddan sonuçta gösterilmesi için
});


reviewSchema.index( { tour:1, user:1}, { unique: true});
//her userın sadece bir review yapabilmesi için

reviewSchema.pre(/^find/, function() {

    /*
    this.populate({

        path: 'tour',
        select: 'name'
    }).populate({

        path: 'user',
        select: 'name photo'
    });
    */

    this.populate({

        path: 'user',
        select: 'name photo'
    });
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
    {
        $match: { tour: tourId}
    },
    {
        $group: {
            _id: '$tour',
            nRating: { $sum: 1},
            avgRating: { $avg: '$rating'}
        }
    }

    ]);

    if(stats.length > 0) {

        await Tour.findByIdAndUpdate(tourId, {

        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
       });
    } else {
         await Tour.findByIdAndUpdate(tourId, {

        ratingsQuantity: 0,
        ratingsAverage: 4.5
       });
    }
    
};
//rating sayısını ve ortalamasını hesaplayıp tour modelinde ilgili fieldları güncellemek için için statik bir metod tanımladık.

reviewSchema.post('save', function() {

    this.constructor.calcAverageRatings(this.tour);
    //this.constructor Review modelini ifade eder. Review aşağıda tanımlandığı için böyle yaptk
    //post middleware de next kullanmıyrz
});
//review create olduktan sonra tanımladığımız ststik metodu çağırdık

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    //query middleware olduğu için this query objesini ifade edyr.
    //bizde review objesine ulaşmak için query execute ettik

    next();

});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.r.constructor.calcAverageRatings(this.r.tour);

});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;