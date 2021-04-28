console.log('TourRoutes');
const express = require('express');
const fs = require('fs');

const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`./../controllers/authController`);
//const reviewController = require(`./../controllers/reviewController`);
const reviewRouter = require(`./../routes/reviewRoutes`);
const router = express.Router(); //create tour router

//router.param('id', tourController.checkID); //the 'id' name has to be same as the one used in '/:id' in the router param
router.use(`/:tourId/reviews`, reviewRouter); //redirect it to review router//nested routes

router
  .route(`/top-5-cheapest`)
  .get(tourController.aliasTop5, tourController.getAllTours);

router.route(`/tour-stats`).get(tourController.getTourStats);
router.route(`/monthly-plan/:year`).get(authController.protect,authController.restrictTo('admin', 'lead-guide', 'guide'),tourController.getMonthlyPlan);

router.route(`/tours-within/:distance/center/:latlng/unit/:unit`).get(tourController.getToursWithinRadius);

router
  .route(`/`)
  .get(tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createTour);
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route(`/:id`) //same as param middleware parameter 'id'
  .get(tourController.getTour)
  .patch(authController.protect,authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);

  // router
  // .route(`/:tourId/reviews`) 
  // .post(authController.protect,authController.restrictTo('user'), reviewController.createReview);

module.exports = router;
