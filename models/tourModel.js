const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name should have a value'],
      unique: true,
      trim: true, //remove white spaces at beginning and end of string
      maxlength: [40, 'The name should not exceed 40 chars'],
      minlength: [5, 'The name should at least have have 5 characters'],
      //validate: [validator.isAlpha, 'Name must contain only letters'], //can use object like used in price discount too below
    },

    slug: String,

    secretTour: {
      type: Boolean,
      default: false,
    },

    duration: {
      type: Number,
      required: [true, 'Durations should have a value'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'maxGroupSize should have a value'],
    },

    difficulty: {
      type: String,
      required: [true, 'Difficulty should have a value'],
      enum: {
        values: ['difficult', 'easy', 'medium'],
        message: 'Difficulty should be only in difficult,easy or medium',
      },
    },

    ratingsAverage: { type: Number, 
      default: 4.5 ,
      set : val=>(Math.round(val*10))/10
    
    },

    ratingsQuantity: { type: Number, default: 0 },

    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rtaings should be minimum of 1'],
      max: [5, 'Rating should be max of 5'],
    },

    price: { type: Number, required: [true, 'price should have a value'] },

    priceDiscount: {
      type: Number,
      //this does not work for update and works only for create
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: `The discount {VALUE} should be less than the price value`,
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'Summary cant be blank'],
    },

    startLocation :{

      type : {
         type : String,
         default : 'Point',
         enum : ['Point']

      },
      coordinates : [Number],
      address : String,
      description : String

    },

    locations : [

      {

        type : {
           type : String,
           default : 'Point',
           enum : ['Point']
  
        },
        coordinates : [Number],
        address : String,
        description : String,
        day : Number
  
      }




    ],

    guides : [
         {type:mongoose.Schema.ObjectId,
          ref : 'User'
        }

    ],

    description: { type: String, trim: true },

    imageCover: {
      type: String,
      required: [true, 'Tour should have image cover'],
    },

    images: [String],
    createdAt: { type: Date, default: Date.now, select: false }, //select is put as false so that createdAt is excluded in the response of api

    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//create indexes
tourSchema.index({price : 1, ratingsAverage : -1});
tourSchema.index({slug :1});
tourSchema.index({startLocation : '2dsphere'});

//Virtual Properties
tourSchema.virtual('durationWeeks').get(function () {
  //arrow function is used because they dont have their own this variable.

  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  
  ref : 'Review',
  foreignField : 'tour',
  localField : '_id'

 
});

//Document middleware
tourSchema.pre('save', function (next) {
  //pre document middleware
  //triggers on .save() or .create() methods

  console.log(this);

  this.slug = slugify(this.name, { lower: true });
  next();
});

//below code embedss user guides in tours
// tourSchema.pre('save', async function(next){
// let guidesTemp = [...this.guides];
// this.guides=[]; //reinitializa guides

// await guidesTemp.forEach(async id=> {
  
  
//   let guide = await User.findById(id);
//   this.guides.push(guide);
  
  

// });


//console.log("This is guides Temp");
//console.log(guidesTemp);

// next();

// });

tourSchema.pre('save', function (next) {
  console.log('Document will be saved');
  next();
});

tourSchema.post('save', function (doc, next) {
  console.log('Post Document middleware triggered');
  console.log(doc);
  next();
});

//Query middleware
tourSchema.pre(/^find/, function (next) {
  this.start = Date.now(); //atatch date to query to calculate elapsed time in post middleware below
  console.log('Pre Query Find hook middleware triggered');
  this.find({ secretTour: { $ne: true } });
  next();
});


tourSchema.pre(/^find/, function (next) {
  this.populate({

    path: 'guides',
    select : '-__v -passwordChangedAt'
    
    
      }); 

      next();
});


tourSchema.post(/^find/, function (docs, next) {
  console.log('Post Query Find hook middleware triggered');
  console.log(docs);
  console.log(`Time elapsed is ${Date.now() - this.start}`);
  next();
});

//Aggregation middleware
// tourSchema.pre('aggregate', function (next) {
//   console.log('Pre Aggregate hook middleware triggered');
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //this points to aggregation object and this.pipeline gives the pipeline gives array of provided aggregate method
//   next();
// }); //commenting out for geospatial query to find all distances

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
