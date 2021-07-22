const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({

    name: {
        type:String,
        required: [true, 'tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour name must have less or equal then 40 charc'],
        minlength: [10, 'A tour name must have more or equal then 10 charc'],
        //validate: [validator.isAlpha, 'Name must only contain charcters']
        //validator paketinin func kullandık
    },
    //schema type optionları tanımladık
    //rating: Number,

    slug: String,

    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a diffuculty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        } 
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10 ) / 100
        //4.6777777 geleni 4.7 round etmek için
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'tour must have a price']
    },
    priceDiscount:  {
        type: Number,
        validate: {
            validator: function(val) {
                //this only points to current doc on new document creation
            return val < this.price;
            //val burda priceDiscount idafe eder.

        },
            message: 'Discoun price ({VALUE}) should be nelow regular price'
        }
        
        
        //custom validation yapyrz
    },
    summary: {
        type: String,
        trim: true,
        //string ifade başındaki ve sonundaki boşlukları alır
        required: [true, 'tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'tour must have a cover image']
    },
    images: [String],
    //type string ama array alyr
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
        //bu field ın deafult olarak sonuçta gözükmesini engelledik
    },
    startDates: [Date],
    // type Date ama array alyr
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            //pointten başka line poligon gibi farklı şekillerde verblyrz
            enum: ['Point']
            //sadece Point seçeneğini seçmesini istedğmz için bunu girdk
        },
        coordinates: [Number],
        //ilk long sonra lattitude,
        address: String,
        description: String
    },
    //geoospatial data type
    //diğer fieldlar gibi schema type değil aslında kendi has bir obje eklyrz
    locations: [
        {
            type: {
                type: String,
            default: 'Point',
            enum: ['Point']
            },
            coordinates: [Number],
            //ilk long sonra lattitude,
            address: String,
            description: String,
            day: Number
        }
    ],
    //array olarak bir onje ekledğimzde mongodb onun için bir document olştryr aslında


    //guides: Array
    //embeding için kullandık

    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ],
    //tour guide larını refernce gösterdk User documentından(child referencing)

    


}, {
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
    //tanımladğmz virtual fielddan sonuçta gösterilmesi için
});
//schema yı model olştrmak için kuallnyrz.
//verdiğimz optionlar db connectionda genel kullanılan seçenekler



//tourSchema.index( { price: 1});
//price field için index olştrdk
//single index

tourSchema.index( { price: 1, ratingsAverage: -1});
//price için asecding orderda, ratingsAverage için desc orderda index olştrdk
//compound index

tourSchema.index( { slug: 1});

tourSchema.index( { startLocation: '2dsphere'});


tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7; 
});
//virtual property tanımladık. duration fieldından durationWeeks diye sanal bir field tanımladık
//query de kullanamyrz


tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
//virtual population
//tour reviewları için parent refeence uyguladk. burda virtual populate ile tour datasını çekerkn 
//reviewlarınıda çekmiş olucaz


tourSchema.pre('save', function(next) {

    this.slug = slugify(this.name, {lower:true});
    //this db de oluşturulacak olan objeyi verr
    //name den slug olştrdk
    next();
});
//document middleware. pre = save() ve create() yani bir kayıt kaydedilmeden veya olştrlmadan önce çalışır
//birden fazla pre tanımlayablrz
// pre save hook diyede adlandırılır




/*
tourSchema.pre('save', async function(next) {

    const guidesPromises = this.guides.map(async id => await User.findById(id));
    //async kullandğmz için sonuçlar promise döndü
    this.guides = await Promise.all(guidesPromises);
    next();
    
});
//guide ları embed etmek için kullandık
*/




/*
tourSchema.post('save', function(doc, next) {

    console.log(doc);
    next();

});
//db ye kayıt eklendikten sonra uygulnr. burda this e ulaşamayz. onun yerine oluştrlan documenta doc ile ulaşrz
//birden fazla post tanımlayablrz
*/


//query middleware
//tourSchema.pre('find', function(next) {
    tourSchema.pre(/^find/, function(next) {
        //regular exp kulladık. find ile başlayan, find ve fidnOne da çalşsn diye

    this.find({secretTour: {$ne: true}});
    //this query object ni ifade eder.

    this.start = Date.now();

    next();
});

/*
tourSchema.pre('findOne', function(next) {

    this.find({secretTour: {$ne: true}});
    //this query object ni ifade eder.

    next();
});
*/


 tourSchema.pre(/^find/, function(next) {
     this.populate({
            path: 'guides',
            select: '-__v -passwordChangedAt'
            //populte ettiğinde göstermek istemedğmz fieldları - ile belrtyrz
        });

        next();
 });


    tourSchema.post(/^find/, function(docs, next) {
        //regular exp kulladık. find ile başlayan, find ve fidnOne da çalşsn diye

    //console.log(docs);
    //docs find sonucunda dönen sonuçlar

    console.log(`Query took ${Date.now() - this.start} milliseconds`);

    next();
});



/*
//aggregation middleware
tourSchema.pre('aggregate', function(next) {

    this.pipeline().unshift({ $match: {secretTour: { $ne: true}}});
    //aggregation pipelşne nına yeni bir filtre ekledik, secretTour exclude ettik

    //console.log(this.pipeline());
    //this aggregation obj sini ifade eder.
    next();
});
*/


const Tour = mongoose.model('Tour', tourSchema);
//modeli olştrdk. mongoose tours diye document ı otomatik olştrr ilk kayıt ekledğmzde.

module.exports = Tour;