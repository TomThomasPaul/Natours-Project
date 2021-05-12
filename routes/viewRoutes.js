const express = require('express');
const router = express.Router();
const viewController = require(`../controllers/viewController`);
const authController = require(`../controllers/authController`);
const bookingController = require(`../controllers/bookingController`);

//router.use(authController.isLoggedIn);

router
.route('/')
.get(bookingController.createBookingAtCheckout, authController.isLoggedIn,viewController.getOverview);

router
.route('/tour/:slug')
.get(authController.isLoggedIn,viewController.getTour);

router.route('/login').get(authController.isLoggedIn,viewController.getLoginForm);
router.route('/me').get(authController.protect,viewController.getAccount);
router.route('/submit-user-data').post(authController.protect, viewController.updateUserData);
router.route('/my-tours').get(authController.protect, viewController.getMyTours);


module.exports = router ;