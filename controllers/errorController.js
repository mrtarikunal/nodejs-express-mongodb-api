const AppError = require('./../utils/appError');

const handleCastErrorDb = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const handleDuplicateFieldsDb = err => {
    //const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate feild value: ${err.keyValue.name}`;

    return new AppError(message, 400);
}

const handleValidationErrorDb = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJwtError = err => {
    return new AppError('Invalid token', 401);
}

const handleJwtExpiredError = err => {
    return new AppError('Token expired', 401);
}

const sendErrorDev = (err, req, res) => {

    if(req.originalUrl.startsWith('/api')) {

        res.status(err.statusCode).json({
          status: err.status,
          message: err.message,
          stack: err.stack,
          error: err
        });

    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
    }
    
};

const sendErrorProd = (err, req, res) => {

    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
        //çıkan hatanın usera gönderilmesinde sorun olmadığı hatalr

    } else {
        res.status(500).json({
          status: 'error',
          message: 'something went wrong'
        });
    }

    } else {

        if(err.isOperational) {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        });
        //çıkan hatanın usera gönderilmesinde sorun olmadığı hatalr

    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: 'Please try again later'
        });
    }

    }

    
    
};

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req, res);

    } else if (process.env.NODE_ENV === 'production') {
        
        let error = { ...err };
        //default gelen err onjesini değiştirmemek için destruction yaptık
        //onun bir kopyasını olştrdk

        error.message = err.message;


        if(err.name === 'CastError') {
            
         error = handleCastErrorDb(error);
        //db den gelen hataları halletmek için
        }

        if(error.code === 11000) {
            error = handleDuplicateFieldsDb(error);
        }

        
        if(err.name === 'ValidationError') {
            error = handleValidationErrorDb(error);
        }

        if(err.name === 'JsonWebTokenError') {
            error = handleJwtError(error);
        }

        if(err.name === 'TokenExpiredError') {
            error = handleJwtExpiredError(error);
        }


        sendErrorProd(error, req, res);

    }

    

};