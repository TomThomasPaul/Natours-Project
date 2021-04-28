
const Review = require('../models/reviewModel');
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const factory = require('./factoryHandler');



exports.setTourAndUserIds = (req,res,next)=>{
  if(!req.body.tour) {req.body.tour = req.params.tourId;}
  if(!req.body.user) {req.body.user = req.user.id;}


  next();
}

//create review
// exports.createReview = catchAsync(async (req, res, next) => {
//   //allow nested routes here
//     if(!req.body.tour) {req.body.tour = req.params.tourId;}
//     if(!req.body.user) {req.body.user = req.user.id;}

//     let newReview = await Review.create(req.body);


//     res.status(201).json({
//         status: 'Success',
//         data: {
//           review: newReview,
//         },
//       });
// });

//get all reviews
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review);
