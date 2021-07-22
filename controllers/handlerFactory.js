const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {

        const doc = await Model.findByIdAndDelete(req.params.id);
       


        if(!doc) {
            return next(new AppError('No record found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }

        res.status(204).json({
        status: 'success',
        data: null
       });
        
});

//handler factory geriye aslında bir fonksiyon döyr.
//controllerda sürekli aynı kullandığımız metod fonksiyonlarını genel bir hale çevrp
//duplicate kod yazmaktan kurtlyrz


exports.updateOne = Model => catchAsync(async (req, res, next) => {

        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            //uodate ettikten sonra update edilen datayı geri döner
            runValidators: true
            //validation aktif hale getrr. modelde tanımladğmz
        });

        if(!doc) {
            return next(new AppError('No record found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }


        res.status(200).json({
        status: 'success',
        data: {
             data: doc
            }
        });
    
});

exports.createOne = Model => catchAsync(async (req, res, next) => {

   const doc = await Model.create(req.body);
    res.status(201).json({
            status: 'success',
            data: {
                data: doc
            }
        });
    
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);
    if(popOptions) {
        query = query.populate(popOptions);
    }
        const doc = await query;
        

        if(!doc) {
            return next(new AppError('No record found with that id', 404));
            //next de bir error throw edersek onu global error handlinge aktrr
        }

        res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
        
         });
          

});

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};

    if(req.params.tourId) {
        filter = { tour: req.params.tourId };
    }

//req.query urlk deki quesry stringleri obje olarak döner
      const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
      //yeni bir class olştrdk orda yaptık tüm filtrelemeleri
      const doc = await features.query;

      //const doc = await features.query.explain();
      //const doc = await features.query.setOptions({ explain: 'executionStats' });
      //setOptions ile db ya atılan query ile ilgili istatistikleri göstrr.


    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
        
    });
        
    

});

