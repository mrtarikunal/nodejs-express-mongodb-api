//const fs = require('fs');
const multer = require('multer');
//image upload için
const sharp = require('sharp');
//resize için

const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const factory = require('./handlerFactory');
//tekrar eden fonksiyonları buna aldık





//not: Model.prototype.save() demek Model objesinden olştrulan instance da save metodunun kullanılması
//Model metodları quesry objesini dönerler.


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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount:3}
]);   

//upload.single('imageCover'); (req.file)
//upload.array('images',3); (req.files)

exports.resizeTourImages = catchAsync(async (req, res, next) => {

    if(!req.files.imageCover || !req.files.images) return next();


    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`);

    req.body.images = [];
    await Promise.all(req.files.images.map( async(file, i) => {
        const filename= `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }));


    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
} 
//alias için olştrdğmz middleware. query stringleri kendimiz doldrdk



exports.getAllTours = factory.getAll(Tour);

/*
exports.getAllTours = catchAsync(async (req, res, next) => {

//req.query urlk deki quesry stringleri obje olarak döner
      const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
      //yeni bir class olştrdk orda yaptık tüm filtrelemeleri
      const tours = await features.query;

     //const tours = await Tour.find(queryObj);
        //const tours = await Tour.find(req.query);


    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
        
    });
        
    

});
*/

exports.getTour = factory.getOne(Tour, { path: 'reviews'});

/*
exports.getTour = catchAsync(async (req, res, next) => {

        //const tour = await Tour.findById(req.params.id).populate('guides');
        //const tour = await Tour.findById(req.params.id).populate({
         //   path: 'guides',
         //   select: '-__v -passwordChangedAt'
            //populte ettiğinde göstermek istemedğmz fieldları - ile belrtyrz
       // });
        //guide lar user documentttan child reference olarak ekli onların datasını populate ile çağryrz
        //tourModel query middleware içine taşıdık

        const tour = await Tour.findById(req.params.id).populate('reviews');
        //reviewları virtual populate ettik.


        //const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id: req.params.id}) yukardaki ile aynı çalşr
        


        if(!tour) {
            return next(new AppError('No tour found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }

        res.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
        
         });
          

});
*/

exports.createTour = factory.createOne(Tour);
/*
exports.createTour = catchAsync(async (req, res, next) => {

   const newTour = await Tour.create(req.body);
    res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    
});
*/


exports.updateTour = factory.updateOne(Tour);

/*
exports.updateTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            //uodate ettikten sonra update edilen datayı geri döner
            runValidators: true
            //validation aktif hale getrr. modelde tanımladğmz
        });

        if(!tour) {
            return next(new AppError('No tour found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }


        res.status(200).json({
        status: 'success',
        data: {
             tour
            }
        });
    
});
*/


exports.deleteTour = factory.deleteOne(Tour);

/*
exports.deleteTour = catchAsync(async (req, res, next) => {

        const tour = await Tour.findByIdAndDelete(req.params.id);
       

        if(!tour) {
            return next(new AppError('No tour found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }

        res.status(204).json({
        status: 'success',
        data: null
       });
        
});
*/


exports.getTourStats = catchAsync(async (req, res, next) => {
  
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: { $gte: 4.5 }}
            },
            //ilk stage match ile aslında filter yapmş olduk
            {
                $group: {
                    _id: { $toUpper:'$difficulty'},
                    //_id: '$difficulty',
                    //_id: null, olduğunda herhangi bir fielda göre gruplamaz
                    numTours: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'},
                },

            },
            //ilk phase olarak group kullandk. artık bir sonrakinde group dan dönen değerleri kullanblrz
            {
                $sort: {
                    avgPrice: 1
                    //1 ascending ifade eder.

                }
            },
            {
                $match: { _id: { $ne: 'EASY'}}
                //not eqeal
            }

        ]);

        res.status(200).json({
        status: 'success',
        data: {
             stats
            }
        });

        
});
//aggregation pipeline data belirledğmz steplerden geçirerek manupule etmemize yarar


exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
   
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
                //verien field bir arrayse yani birden fazla farklı değer varsa, unwind bunları açıp her bir değer için aynı itemdan tekrar döndürür
                //mesala startDates bir array olsun içinde üç değer olsun. aslında dbde bu item bir tane ve sadece bu fieldı 3 itema sahipken
                //unwind yaparsak her 3 item için db de yeni bir değer varmış gibi döner. mesala Forrest hiker diyelim ismi
                // 3 tane forest hiker döner her bir startDtaes için
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates'},
                    //aya göre grupladık
                    numTourStarts: { $sum: 1},
                    //aya göre toplam tur sayıları
                    tours: { $push: '$name'}
                    //tur isimleri

                }
            },
            {
                $addFields: { month: '$_id'}
                //motnh diye yeni bir field ekledik
            },
            {
                $project: {
                    _id: 0
                    //o verirsek o field gözükmez, 1 verrrsek gözkr
                }
            },
            {
                $sort: { numTourStarts: -1}
                //-1 descdening sıralama için, numTourStarts field ismi stagede yer alan
            },
            {
                $limit: 12
            }

        ]);

        res.status(200).json({
        status: 'success',
        data: {
             plan
            }
        });
        
   
});


exports.getToursWithin = catchAsync( async (req, res, next) => {

    const { distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError('Please provide a lat and lng in lat,lng format.', 400));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]}}});

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});


exports.getDistances = catchAsync( async (req, res, next) => {

    const { latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

     const multipier = unit === 'mi' ? 0.000621371 : 0.001;


    if(!lat || !lng) {
        next(new AppError('Please provide a lat and lng in lat,lng format.', 400));
    }

    const distances = await Tour.aggregate([{
        $geoNear: {
            near: {
                type: 'Point',
                coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multipier
            //distance metre cinsnden dönyr. onu mile veya kilometreye çevrdk
        }
        //geoNear aggreate pipeline da her zaman ilk parameter olması gerkyr
        //ayrıca çalışması için en az bir tane geospatial index olması gerkyr
    },
    {
        $project: {
            distance: 1,
            name: 1
        }
    }
    //resultta sadece burda yazdğmz fieldlar döner
]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});
















/*
exports.getAllTours = async (req, res) => {

//req.query urlk deki quesry stringleri obje olarak döner
    try {

      const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
      //yeni bir class olştrdk orda yaptık tüm filtrelemeleri
      const tours = await features.query;

     //const tours = await Tour.find(queryObj);
        //const tours = await Tour.find(req.query);


    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
        
    });
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    

};




exports.getTour = async (req, res) => {

    try {

        const tour = await Tour.findById(req.params.id);
        //Tour.findOne({_id: req.params.id}) yukardaki ile aynı çalşr
        res.status(200).json({
        status: 'success',
        data: {
            tour
        }
        
    });
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    
    
    

};


/*
const catchAsync = fn => {
    return (req, res, next) => {
   
        fn(req,res,next).catch(next);

    };

};

//try catch kullanmak yerine her yerde bir function yazdık. tüm htaları burda yakalayıp
//global error handling ne yolladık.


exports.createTour = catchAsync(async (req, res, next) => {

   const newTour = await Tour.create(req.body);
    res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    
});


/*
exports.createTour = async (req, res) => {

    try {
        
        //const newTour = new Tour({});
   // newTour.save();
   //Tour modelinden önce instance alıp save metodunuda kullanblrz

   //Tour.create({}).then();
   //bu şekilde promise de then ve catch kullanblrz

   const newTour = await Tour.create(req.body);
   //async await kulladk, create metodu ile Tour modelinde record olştrdk

    res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });

    } catch (err){
        res.status(400).json({
            status: 'fail',
            message: err
        });

    }
       

};



exports.updateTour = async (req, res) => {

    try {

        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            //uodate ettikten sonra update edilen datayı geri döner
            runValidators: true
            //validation aktif hale getrr. modelde tanımladğmz
        });
        res.status(200).json({
        status: 'success',
        data: {
             tour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
  

};


exports.deleteTour = async (req, res) => {

    try {

        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
        status: 'success',
        data: null
    });
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }

    

};


exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: { $gte: 4.5 }}
            },
            //ilk stage match ile aslında filter yapmş olduk
            {
                $group: {
                    _id: { $toUpper:'$difficulty'},
                    //_id: '$difficulty',
                    //_id: null, olduğunda herhangi bir fielda göre gruplamaz
                    numTours: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$price'},
                    minPrice: { $min: '$price'},
                    maxPrice: { $max: '$price'},
                },

            },
            //ilk phase olarak group kullandk. artık bir sonrakinde group dan dönen değerleri kullanblrz
            {
                $sort: {
                    avgPrice: 1
                    //1 ascending ifade eder.

                }
            },
            {
                $match: { _id: { $ne: 'EASY'}}
                //not eqeal
            }

        ]);

        res.status(200).json({
        status: 'success',
        data: {
             stats
            }
        });

        /* 
        {
    "status": "success",
    "data": {
        "stats": [
            {
                "_id": null,
                "numTours": 9,
                "numRatings": 270,
                "avgRating": 4.699999999999999,
                "avgPrice": 1563.6666666666667,
                "minPrice": 397,
                "maxPrice": 2997
            }
        ]
    }
} dönecek response örneği gruplama olmadığında
        
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}
//aggregation pipeline data belirledğmz steplerden geçirerek manupule etmemize yarar


exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
                //verien field bir arrayse yani birden fazla farklı değer varsa, unwind bunları açıp her bir değer için aynı itemdan tekrar döndürür
                //mesala startDates bir array olsun içinde üç değer olsun. aslında dbde bu item bir tane ve sadece bu fieldı 3 itema sahipken
                //unwind yaparsak her 3 item için db de yeni bir değer varmış gibi döner. mesala Forrest hiker diyelim ismi
                // 3 tane forest hiker döner her bir startDtaes için
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates'},
                    //aya göre grupladık
                    numTourStarts: { $sum: 1},
                    //aya göre toplam tur sayıları
                    tours: { $push: '$name'}
                    //tur isimleri

                }
            },
            {
                $addFields: { month: '$_id'}
                //motnh diye yeni bir field ekledik
            },
            {
                $project: {
                    _id: 0
                    //o verirsek o field gözükmez, 1 verrrsek gözkr
                }
            },
            {
                $sort: { numTourStarts: -1}
                //-1 descdening sıralama için, numTourStarts field ismi stagede yer alan
            },
            {
                $limit: 12
            }

        ]);

        res.status(200).json({
        status: 'success',
        data: {
             plan
            }
        });
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}
*/



















/*
exports.getAllTours = async (req, res) => {

//req.query urlk deki quesry stringleri obje olarak döner
    try {

        //const tours = await Tour.find();

       /* const tours = await Tour.find({
            duation: 5,
            difficulty: 'easy'
        });*/

       /* const tours = await Tour.find()
        .where('duration')
        .equals(5)
        .where('difficulty')
        .equals('easy');*/

        /*
        //{difficulty: 'easy', duration: {$gte: 5}}
        //db de where sorgusunu normalde böyle yapyrz
        ///api/v1/tours?difficulty=easy&duration[gte]=5
        //{difficulty: 'easy', duration: {gte: '5'}} yukrdaki url querysi bu obj döner req.query ile

    
        const queryObj = {...req.query};
     //burda req query den gelen değerleri değiştirmemek için sonraki kullanımda 
     //ondan yeni bir obje olştrdk. yani onun değerlerini aldık ve yeni bir objeye atadık

     const excludedFields = ['page', 'sort', 'limit', 'fields'];
     //query den gelen excluded etmek istedğmz parametreleri tanımladk. diğer db query verrsek query patlar

     excludedFields.forEach(el => delete queryObj[el]);
     //req.query den gelen parametrelerde yukarda tanımladığmz exclude etmek itedklerimizi sildik


     //1 where sorguları
     let queryStr = JSON.stringify(queryObj);
     //queryObj sini stringe çevrdk
     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
     //query de gelen gte,gt,lte,lt nin önüne $ ekledik

      let query = Tour.find(JSON.parse(queryStr));
      //find metodu query objesi dönyr. sort limit gibi filtreleri yapmak için await kaldrdk aşağı aldık


      //2 sorting

      if(req.query.sort) {

        const sortBy = req.query.sort.split(',').join(' ');
      //127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage url de böyle yollyrz
      //sort(price ratinsAverage) mongo da sorttda ikili sort böyle olyr
      //urlden gelen , ü boşluk ile değiştrdk
        query = query.sort(sortBy);
      } else {
          query = query.sort('-createdAt');
      }
      //query de sort varsa sort ettik
      //urldeki query sort öününe - koyarsak desc sort eder.


      //3. field limiting
      if(req.query.fields) {
          const fields = req.query.fields.split(',').join(' ');
          query = query.select(fields);
      } else {
          query = query.select('-__v');
      }
      //127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
      //query.select('name duration price') buna projecting diyrz sadece istedğmz fieldları çekyrz
      //mongo kendisi __v field olştrr onu excluded etmek için -__v kullandk



      //4 pagination
      //127.0.0.1:3000/api/v1/tours?page=2&limit=10
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 100;
      //query den gelen değer varsa onu alır yoksa default değerler belirledik.(1 ilk sayfa, 100 toplam result sayısı)

      const skip = (page - 1 ) * limit ;
      query = query.skip(skip).limit(limit);

      if(req.query.page) {
          const numTours = await Tour.countDocuments();
          if(skip >= numTours) throw new Error('This page doesnt exist');
      }


      const tours = await query;

     //const tours = await Tour.find(queryObj);
        //const tours = await Tour.find(req.query);


    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
        
    });
        
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    

};


*/







//fs ile json data okuyup yaptğmzda bunları kullandık


/*
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
    );


    exports.checkID = (req, res, next, value) => {
         if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    next();
    }

    exports.checkBody = (req, res, next) => {
        if(!req.body.name || !req.body.price) {
            return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price'
        });
        }
        next();
    }


exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        //results: tours.length,
        //data: {
            //tours: tours
         //   tours
       // }
    })

};




exports.getTour = (req, res) => {
    //:id ile id değişkeni olştrdk urlde gelecek
    //:id? parameter optional olur
    //req.params ile ulşyrz. obje dönyr {id:'5'}

    const id = req.params.id * 1;
    //req.params.id string dönyr 1 ile çarparak integer çevyrz

    const tour = tours.find(el => el.id === id);

    //if(id > tours.length) {
        if(!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            //tours: tours
            tour: tour
        }
    })

};



exports.createTour = (req, res) => {
    //console.log(req.body);
    const newId = tours[tours.length - 1].id + 1;
    //id olştrdk. db kullanmadğmz için kendmz olştrdk


    const newTour = Object.assign({id:newId}, req.body);
    //yeni bir obje olştrdk tour objesi

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })

    });
    //event loop içindeyz. sync kullanma sakın

};



exports.updateTour = (req, res) => {

    //update yapmadık placeholder response döndk

    

    res.status(200).json({
        status: 'success',
        data: { tour: 'placeholder'}
    })

};


exports.deleteTour = (req, res) => {

    //delete yapmadık placeholder response döndk

    

    res.status(204).json({
        status: 'success',
        data: null
    })

};

*/