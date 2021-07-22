const fs = require('fs');
const express = require('express');
//express dahil ettik

const morgan = require('morgan');
//middleware dahil ettik

const app = express();
//app değişkennine express metodlarını atadık

app.use(morgan('dev'));
//request detaylarını dönen middleware. log için kullanblr

app.use(express.json());
//middleware req ve res arasındaki her şey aslında
//middleware dahil ettik. clienttan gelen datayı req bodysine eklyr


app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    next();
    //mutlaka next kullanmlyz. bir sonraki adıma geçmesi için

});
//middleware ile req objesini manupule ettik zaman ekledik


//app.get('/', (req, res) => {
    //res.status(200).send('Hello from server');

//        res.status(200).json({message:'Hello from server', app: 'Api'});
        //josn response döndük
//});
//express sunduğu get metodunu kullandk

//app.post('/', (req, res) => {

//    res.send('you can post to this url');
//});

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
    );

/* app.get('/api/v1/tours', (req, res) => {
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            //tours: tours
            tours
        }
    })

}); */

const getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            //tours: tours
            tours
        }
    })

};

//app.get('/api/v1/tours', getAllTours);
//refactor yaptık kodumuzu

//app.route('/api/v1/tours').get(getAllTours);
//yukardaki ile aynı sonucu verir


/* app.get('/api/v1/tours/:id', (req, res) => {
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

}); */


const getTour = (req, res) => {
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


//app.get('/api/v1/tours/:id', getTour);
//refactor yaptık kodumuzu
//app.route('/api/v1/tours/:id').get(getTour);
//yukardaki ile aynı



/* app.post('/api/v1/tours', (req, res) => {
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

}); */

const createTour = (req, res) => {
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

//app.post('/api/v1/tours', createTour);
//refactor yaptık kodumuzu
//app.route('/api/v1/tours').post(createTour);
//yukardaki ile aynı 

/* app.patch('/api/v1/tours/:id', (req, res) => {

    //update yapmadık placeholder response döndk

     if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        data: { tour: 'placeholder'}
    })

}); */

const updateTour = (req, res) => {

    //update yapmadık placeholder response döndk

     if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        data: { tour: 'placeholder'}
    })

};

//app.patch('/api/v1/tours/:id', updateTour);
//refactor yaptık kodumuzu
//app.route('/api/v1/tours/:id').patch(updateTour);
//yukardaki ile aynı


/* app.delete('/api/v1/tours/:id', (req, res) => {

    //delete yapmadık placeholder response döndk

     if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    })

}); */

const deleteTour = (req, res) => {

    //delete yapmadık placeholder response döndk

     if(req.params.id * 1 > tours.length)  {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    res.status(204).json({
        status: 'success',
        data: null
    })

};

//app.delete('/api/v1/tours/:id', deleteTour);
//refactor yaptık kodumuzu
//app.route('/api/v1/tours/:id').delete(deleteTour);
//yukardaki ile aynı


const tourRouter =express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

app.use('/api/v1/tours', tourRouter);
//middleware tanımldk. /api/v1/tours bu route için tourRouter bunu kullan dedik



const getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    });
}

const createUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    });
}

const getUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    });
}

const updateUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    });
}

const deleteUser = (req, res) => {
    res.status(500).json({
        status: 'err',
        message: 'This route is not yet defined'
    });
}


const userRouter =express.Router();
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

app.use('/api/v1/users', userRouter);
//middleware tanımldk. /api/v1/users bu route için userRouter bunu kullan dedik
//router mounting yaptık


const port = 3000;
//port tanımladık
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
//server port numarasından dinlyrz



