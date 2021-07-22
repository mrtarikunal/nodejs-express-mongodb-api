const path = require('path');

const express = require('express');
//express dahil ettik

const morgan = require('morgan');
//middleware dahil ettik

const rateLimit = require('express-rate-limit');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const cookieParser = require('cookie-parser');

const compression = require('compression');

const AppError = require('./utils/appError');
//yazdığımız error class nı dahil ettik

const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
//app değişkennine express metodlarını atadık

app.set('view engine', 'pug');
//pug template engine kullanacağımızı söyledik
app.set('views', path.join(__dirname, 'views'));
//view dosyalarının yolunu gösterdik


//app.use(express.static(`${__dirname}/public`));
//public dosyasını erişime açtık ve app içinde kullanblrz
//statik dosyaları erişime açtık
app.use(express.static(path.join(__dirname, 'public')));


app.use(helmet());
//http securty headers ları olştrr

 app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'https:', 'http:', 'data:'],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
    },
  })
);

if(process.env.NODE_ENV === 'development') {
app.use(morgan('dev'));
//request detaylarını dönen middleware. log için kullanblr
}

//global middleware, rate limiting
const limiter = rateLimit({
    max:100,
    windowMs: 60 * 60 * 1000,
    // 1 saate max 100 istek atablr
    message: 'Too many request from this IP, please try again in an hour'

});
app.use('/api', limiter);
//sadece rate limit olayını /api ile başlayan url lere uyguladık





app.use(express.json({
    limit: '500kb'
}));
//middleware req ve res arasındaki her şey aslında
//middleware dahil ettik. clienttan gelen datayı req bodysine eklyr
//req.body de en fazla 500kb data ya izin verdik


app.use(express.urlencoded({ extended: true, limit: '100kb'}));
//formdan gelen datayı parse edyr

app.use(cookieParser());

//data sanitizaiton against nosql injection
app.use(mongoSanitize());

//data sanitizaiton against xss
app.use(xss());

//preventing parameter polution
app.use(hpp({
    whitelist: [
        'duration', 
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));
//duplicate olan parametreleri temzler. sadece sonuncuyu alır. whitelist ile exclude etmek istedğmz parametreleri gireblyrz



app.use(compression());

app.use((req,res,next) => {
    req.requestTime = new Date().toISOString();
    next();
    //mutlaka next kullanmlyz. bir sonraki adıma geçmesi için

});




app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);



app.all('*', (req, res, next) => {
    /*
    res.status(404).json({
        status: 'fail',
        message: `cannot find ${req.originalUrl} on this server!`
    });
    */
   /*
   const err = new Error(`cannot find ${req.originalUrl} on this server!`);
   err.status = 'fail';
   err.statusCode = 404;

   next(err);

   //next te verdiğimiz değişken her zaman error olarak algılanr. ve diğer tüm middleware ler atlanıp
   //global error handling çalışır
    */

   next(new AppError(`cannot find ${req.originalUrl} on this server!`, 404));


   
});


app.use(globalErrorHandler);


/*
app.use((err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({

        status: err.status,
        message: err.message
    });

});
//error handling middleware
*/


module.exports = app;



