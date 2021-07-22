module.exports = fn => {
    return (req, res, next) => {
   
        fn(req,res,next).catch(next);

    };

};

//try catch kullanmak yerine her yerde bir function yazdık. tüm htaları burda yakalayıp
//global error handling ne yolladık.