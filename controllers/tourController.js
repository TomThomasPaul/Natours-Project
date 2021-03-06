const { query } = require('express');

const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);

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

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(`Inside get All tours`);
  // const tours = await Tour.find();

  //Different ways of using query string...query string is different from parameters. Usage of parameter is api/id
  //where id is parameter . api?id=4 ..here ?id=4 is queryString
  // 1st way----const tours = await Tour.find({
  //   $or: [{ difficulty: 'easy' }, { price: { $gt: 1000 } }],
  //   duration: 10,
  // });

  //2nd way ---const tours = await Tour.find(req.query); //req.query returns a query object with all key values in the query

  // 3rd way---const tours = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');

  //const queryObj = {...req.query};

  //console.log('Before instantiation');
  const features = new APIFeatures(Tour.find(), req.query);
  // console.log('Before filter');
  features.filter().sorting().limiting().paginate();
  // console.log(features.queryObject);
  // console.log(features.query);
  const tours = await features.query;
  //console.log(tours);

  res.status(200).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });

  // res.status(200).json({
  //   status: 'Success',
  //   requestTime: req.requestTime,
  //   results: tours.length,
  //   data: {
  //     tours: tours,
  //   },
  // });
});
exports.getTour = catchAsync(async (req, res, next) => {
  console.log(`Inside get tour`);
  const tour = await Tour.findById(req.params.id); //same as Tour.findOne({_id : req.params.id})

  res.status(200).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });

  //console.log(req.params);
  // const id = req.params.id * 1;
  // const tour = tours.find((el) => el.id === id);
  // res.status(200).json({
  //   status: 'Success',
  //   //results: tours.length,
  //   data: {
  //     tour,
  //   },
  // });
});
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    data: {
      tour: tour,
    },
  });

  // res.status(200).json({
  //   status: 'Success',
  //   data: {
  //     tour: 'updated tour here',
  //   },
  // });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});
exports.createTour = catchAsync(async (req, res, next) => {
  console.log(req.body);

  //another method to create document

  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'Success',
    data: {
      tour: newTour,
    },
  });
});

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
