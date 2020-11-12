class APIFeatures {
  constructor(query, queryObject) {
    this.query = query;
    this.queryObject = queryObject;
  }

  filter() {
    //filtering and advanced filtering
    const excludeFieldsObj = {
      sort: 'sort',
      limit: 'limit',
      page: 'page',
      fields: 'fields',
    };
    let queryObj = {};
    for (let key in this.queryObject) {
      excludeFieldsObj[key] ? null : (queryObj[key] = this.queryObject[key]);
    }
    // console.log('check1');
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/, ///advanced filtering
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr)); //returns query object to which methods like sorting can be added since it is available in iots prototype.
    //sorting
    return this; //to return the object to facilitate chaining of features object
  }

  sorting() {
    if (this.queryObject.sort) {
      let sortby = this.queryObject.sort.split(',').join(' ');
      this.query = this.query.sort(sortby);
      //sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limiting() {
    // //fields limiting

    if (this.queryObject.fields) {
      const fields = this.queryObject.fields.split(',').join(' ');
      console.log(fields);
      this.query = this.query.select(fields); //projjections of select fields
      // console.log(query);
    } else {
      this.query.select('-__v'); //exclude __v from all tours
    }

    return this;
  }

  paginate() {
    if (this.queryObject.page || this.queryObject.limit) {
      const page = this.queryObject.page * 1 || 1;
      const limit = this.queryObject.limit * 1 || 3;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

module.exports = APIFeatures;
