console.log('TourRoutes');
const express = require('express');
const fs = require('fs');

const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`./../controllers/authController`);
const router = express.Router(); //create tour router

//router.param('id', tourController.checkID); //the 'id' name has to be same as the one used in '/:id' in the router param

router
  .route(`/top-5-cheapest`)
  .get(tourController.aliasTop5, tourController.getAllTours);

router.route(`/tour-stats`).get(tourController.getTourStats);
router.route(`/monthly-plan/:year`).get(tourController.getMonthlyPlan);

router
  .route(`/`)
  .get(authController.protect,tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createTour);
  .post(tourController.createTour);

router
  .route(`/:id`) //same as param middleware parameter 'id'
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect,authController.restrictTo(), tourController.deleteTour);

module.exports = router;
