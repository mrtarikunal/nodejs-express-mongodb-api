const mongoose = require('mongoose');
//mongoose dahil ettik
const dotenv = require('dotenv');

//uncaught exceptionları yakalyrz(sekron func lardan dönen)
process.on('uncaughtException', err => {
        process.exit(1);
    //programı sonlandırdk
    
});


dotenv.config({path: './config.env'});
//config.env dan tüm tanımlanmş env variable alır ve nodejs uygulamsına env olarak tanımlar


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
//config içindeki db stirngni aldık orda <PASSWORD> ü password değişkeni ile değiştrdk



mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    //console.log(con.connections);
    console.log('db connection is succesful');
});

//atlas db ye bağlanma

/*
mongoose.connect(process.env.DATABASE_LOCAL,  {
    useNewUrlParser: true,
    useCreateIndex:true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log(con.connections);
    console.log('db connection is succesful');
});
//local db ye bağlandık
*/

/*
const tourSchema = new mongoose.Schema({

    name: {
        type:String,
        required: [true, 'tour must have a name'],
        unique: true
    },
    //schema type optionları tanımladık
    //rating: Number,
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'tour must have a price']
    }
});
//schema yı model olştrmak için kuallnyrz.
//verdiğimz optionlar db connectionda genel kullanılan seçenekler


const Tour = mongoose.model('Tour', tourSchema);
//modeli olştrdk. mongoose tours diye document ı otomatik olştrr ilk kayıt ekledğmzde.
*/


/*
const testTour = new Tour({

    name: 'The Forest Hiker',
    rating: 4.7,
    price:497
});
//modelle birlikte db ye yeni bir kayıt eklyrz.

testTour.save().then(doc => {
    console.log(doc);
}).catch(err => {
    console.log('Error:', err);
});
//db ye kaydedip sonucu yakalyrz
*/

const app = require('./app');




console.log(process.env);
//nodejs in olştrduğu env variable görmek için

const port = process.env.PORT;
//port tanımladık
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
//server port numarasından dinlyrz


//unhandled promise rejection hatalarını yaklyrz
process.on('unhandledRejection', err => {

    server.close(() => {

        process.exit(1);
    //programı sonlandırdk(mesla db ye bağlanamadı)
    });
    
});









//mongodb
//mongod exe komutu db server çalştyr. mongo db shell gryrz.
//use natours-test use ile db yoksa olştrr ve ona geçer varsa direk ona geçer
//db.tours.insertOne() tours collection nı olşştr ve içine bir document kaydı girer
//db.tours.find() tours collection daki tüm document ları getrr
//db.tours.find({ price: {$lte: 500}})   500 den az olanları getrr price $lte = less than or equal
//db.tours.find({ $or: [ { price: {$lt: 500}},{ rating: {$gte: 4.8}} ] }) or lu conditions
//db.tours.find({ $or: [ { price: {$gt: 500}},{ rating: {$gte: 4.8}} ] }, {name: 1}) çıktı olarak sadece name leri göstrr
//db.tours.updateOne({name: "The Snow Adventurer"}, { $set: {price:1000} }) ilk parametre hangi kaydı update edicez. ikinci data
//db.tours.updateMany(  {price: {$gte: 400}, rating: {$gte: 4.8}}, { $set: {premium: true}} )
//price 400 eşit ve büyük, rating 4.8 eşit ve büyük olanlara, premium field varsa update eder yoksa olştrr ve değeri atar
//db.tours.replaceOne() ve replacemany() update ile datanın bir bölümünü değştryrz, replace ile datayı komple
//db.tours.deleteMany( {rating: {$lt: 4.8}}) reating 4.8 altında olanları siler
//show dbs mevcut db leri göstrr, show collections mevcut collection ları göstrr
//quit() ile shell den çıkyrz

//command line dan olştruma
//NODE_ENV=development node server.js
//nodejs uygulaması için env variable tanımladık. development ta olduğmzu
//NODE_ENV=development x=23 node server.js

//npm i dotenv congig.env yi nodejs tanıtmak için kullanılan paket