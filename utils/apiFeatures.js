class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {

         
        const queryObj = {...this.queryString};
     //burda req query den gelen değerleri değiştirmemek için sonraki kullanımda 
     //ondan yeni bir obje olştrdk. yani onun değerlerini aldık ve yeni bir objeye atadık

     const excludedFields = ['page', 'sort', 'limit', 'fields'];
     //query den gelen excluded etmek istedğmz parametreleri tanımladk. diğer db query verrsek query patlar

     excludedFields.forEach(el => delete queryObj[el]);
     //req.query den gelen parametrelerde yukarda tanımladığmz exclude etmek itedklerimizi sildik

     let queryStr = JSON.stringify(queryObj);
     //queryObj sini stringe çevrdk
     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
     //query de gelen gte,gt,lte,lt nin önüne $ ekledik

      this.query = this.query.find(JSON.parse(queryStr));

      return this;

    }


    sort() {
         if(this.queryString.sort) {

        const sortBy = this.queryString.sort.split(',').join(' ');
      //127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage url de böyle yollyrz
      //sort(price ratinsAverage) mongo da sorttda ikili sort böyle olyr
      //urlden gelen , ü boşluk ile değiştrdk
        this.query = this.query.sort(sortBy);
      } else {
          this.query = this.query.sort('-createdAt');
      }
      //query de sort varsa sort ettik
      //urldeki query sort öününe - koyarsak desc sort eder.

      return this;
    }

    limitFields() {
         if(this.queryString.fields) {
          const fields = this.queryString.fields.split(',').join(' ');
          this.query = this.query.select(fields);
      } else {
          this.query = this.query.select('-__v');
      }
      //127.0.0.1:3000/api/v1/tours?fields=name,duration,difficulty,price
      //query.select('name duration price') buna projecting diyrz sadece istedğmz fieldları çekyrz
      //mongo kendisi __v field olştrr onu excluded etmek için -__v kullandk

      return this;
            //return this yaparak objenin tümünü döndürdk ki diğer metpdlarıda chain yprk kullanabileleim

    } 

    paginate() {
         //127.0.0.1:3000/api/v1/tours?page=2&limit=10
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      //query den gelen değer varsa onu alır yoksa default değerler belirledik.(1 ilk sayfa, 100 toplam result sayısı)

      const skip = (page - 1 ) * limit ;
      this.query = this.query.skip(skip).limit(limit);

      return this;
      //return this yaparak objenin tümünü döndürdk ki diğer metpdlarıda chain yprk kullanabileleim
    }

}

module.exports = APIFeatures;