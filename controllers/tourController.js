//const { query } = require('express');
const multer =require('multer');
const sharp = require('sharp');

const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);
const AppError=require(`${__dirname}/../utils/appError`);
const factory = require('./factoryHandler');

console.log('TourController');
//const fs = require('fs');

const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

/*  We dont need the below tours object as now we will be using MONGO DB
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);*/

/* Not needed as checking of ID will happen from MOngo DB 
exports.checkID = (req, res, next, val) => {
  if (val * 1 > tours.length - 1) {
    return res.status(404).json({
      status: 'Fail',
      message: `Invalid ID ${val * 1}`,
    });
  }

  next();
}; */
//noi need chevckbody since we have mongoose
// exports.checkBody = (req, res, next) => {
//   console.log(`This is body of the request ${JSON.stringify(req.body)}`);
//   if (!(req.body.name && req.body.difficulty)) {
//     return res.status(404).json({
//       status: 'Fail',
//       message: 'The body of the incoming request is invalid',
//     });
//   }

//   next();
// };

exports.aliasTop5 = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,duration,ratingsAverage';

  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path : 'reviews'});


exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   }/*,()=>{

//     next(new AppError(`No Tour found for ID ${req.params.id}`, 404))
//   }*/);

//   res.status(200).json({
//     status: 'Success',
//     data: {
//       tour: tour,
//     },
//   });

//   // res.status(200).json({
//   //   status: 'Success',
//   //   data: {
//   //     tour: 'updated tour here',
//   //   },
//   // });
// });


exports.deleteTour =factory.deleteOne(Tour);
exports.createTour =factory.createOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id);
//   res.status(204).json({
//     status: 'Success',
//     data: null,
//   });
// });
// exports.createTour = catchAsync(async (req, res, next) => {
//   console.log(req.body);

//   //another method to create document

//   const newTour = await Tour.create(req.body);  /*,(err)=>{

//     next(new AppError(`No Tour created for this request. Error description : ${err}`, 400))
//   });*/

//   res.status(201).json({
//     status: 'Success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);
// tours.push(newTour);
// fs.writeFile(
//   `${__dirname}/../dev-data/data/tours-simple.json}`,
//   JSON.stringify(tours),
//   (err) => {
//     if (err) {
//       console.log(err);
//     }
//     res.status(201).json({
//       status: 'Success',
//       data: {
//         tour: newTour,
//       },
//     });
//   }
// );
//res.send('DONE');

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },

    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //this is the field by which group by happens
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },

    {
      $sort: { avgPrice: -1 },
    },

    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //convert string to number

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', //creates a document for each of the start date present
    },

    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        //group by month of start date
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },

    {
      $addFields: { month: '$_id' }, //add month key with value of _id
    },

    {
      $project: { _id: 0 }, //delete _id from document
    },

    {
      $sort: { numTourStarts: -1 }, //sort in descending order
    },

    // {
    //   $limit: 6, //just to limit to only 6 documents.
    // },
  ]);

  res.status(200).json({
    status: 'Success',
    data: {
      plan,
    },
  });
});

exports.getToursWithinRadius = catchAsync(async (req, res, next) => {
 
const {distance, latlng, unit} = req.params;

const [lat,lng] = latlng.split(',');

if(!lat || !lng){

  return next(new AppError("Please enter latitude and longitude appropriately"), 400);
}

const radius = unit=='mi'? distance/3963.2 : distance/6378.1 ;

const tours = await Tour.find({startLocation : {$geoWithin : { $centerSphere : [[lng,lat],radius]}}}); //also set index for start location in model tours

  res.status(200).json({
    status: 'Success',
    results :tours.length,
    data: {
      data : tours
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
 
  const {latlng, unit} = req.params;
  
  const [lat,lng] = latlng.split(',');
  
  if(!lat || !lng){
  
    return next(new AppError("Please enter latitude and longitude appropriately"), 400);
  }
  
  const multiplier = unit=='mi'? 0.000621371 : 0.001 ;
  
  const distances = await Tour.aggregate([{


$geoNear : {
        
  near: { //ORIGIN frpm which distances are calculated to all start locations

    type: 'Point',
    coordinates: [lng * 1,lat * 1]
  },
  distanceField : 'distance', //name of field where all distances to tours from origin location is stored
  distanceMultiplier : multiplier

    },

   




  },

  {
    $project : {

      distance : 1,
      name : 1
    }


  }


]);
  
    res.status(200).json({
      status: 'Success',
      data: {
        data : distances
      },
    });
  });
  
  const multerStorage = multer.memoryStorage();

const multerFilter =(req,file,cb)=>{

if(file.mimetype.startsWith('image')){
  cb(null, true);
}else{

cb(new AppError('Not an image! Please upload only images', 400), false);

}

};
const upload = multer({storage : multerStorage, fileFilter : multerFilter});

exports.uploadTourImages = upload.fields([{
  name : 'imageCover', maxCount:1   //the name: 'imageCover' has to be the same name when sending the request in multipart/form-data
},
{ 
  name : 'images', maxCount:3

}]);

//upload.array('images', 3) also works if we dint have imageCover

exports.resizeTourImages = catchAsync(async(req,res,next)=>{
console.log(req.files); //since there are multiple files

if(!req.files.imageCover || !req.files.images){   return next();}

//imageCover
req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);

//images

req.body.images=[];

await Promise.all(req.files.images.map(async (file,i)=>{

const fileName = `tour-${req.params.id}-${Date.now()}-${i+1}.jpg`;
await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${fileName}`);

req.body.images.push(fileName);

}));

 next(); //will implement later
  
});