class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        //extend ettiğimiz için super çağrdk ve extend ettiğimiz class message parametre olrk alyr
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        this.isOperational = true;
        //hatanın third party kod veya bizim hatalı yazmamızdan kaynakladınğı durumları elimine etmek için


        Error.captureStackTrace(this, this.constructor);
        //stack trace hatanın nerede olduğunu gösterir
    }
}

module.exports = AppError;