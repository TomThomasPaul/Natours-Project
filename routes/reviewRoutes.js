const express = require('express');

const reviewController = require(`../controllers/reviewController`);
const authController = require(`./../controllers/authController`);
const router = express.Router({mergeParams:true}); //create review router

router.use(authController.protect);//only authenticated users can access routes below



router
.route('/')
.get(reviewController.getAllReviews)
.post(authController.restrictTo('user'), reviewController.setTourAndUserIds, reviewController.createReview);

router
.route(`/:id`)
.get(reviewController.getReview)
.delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview)
.patch(authController.restrictTo('user', 'admin'),reviewController.updateReview);

module.exports =router;