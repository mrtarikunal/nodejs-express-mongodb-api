const fs = require('fs');

const mongoose = require('mongoose');
//mongoose dahil ettik
const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

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


//const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));

const importData = async() => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false});
        await Review.create(reviews);
        console.log('data loaded');
    } catch (err) {
        console.log(err);
        
    }
};

const deleteData = async() => {
     try {
        await Tour.deleteMany();
        await Review.deleteMany();
        await User.deleteMany();
        console.log('data deleted');
        process.exit();
        //bu işlemi yapıp app durdurur
    } catch (err) {
        console.log(err);
        
    }
}


if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}
//node ./dev-data/data/import-dev-data.js --import argv array ddöner ona command line da kullanabilmk için import ekledik
//node ./dev-data/data/import-dev-data.js --delete argv array ddöner ona command line da kullanabilmk için delete ekledik


console.log(process.argv);

