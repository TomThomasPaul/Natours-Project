console.log('UserRoutes');
const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`./../controllers/authController`);
const router = express.Router(); //create user router



router.post(`/signup`, authController.signUp);
router.post(`/login`, authController.login);
router.get(`/logout`, authController.logout);

router.post(`/forgotPassword`, authController.forgotPassword);//will receive the email address to which a link with token has to be sent
router.patch(`/resetPassword/:token`, authController.resetPassword); // will receive the new password and token to reset password

router.use(authController.protect); //use protect as middleware to protect all routes below this point.

router.patch(`/updateMyPassword`, authController.updatePassword); 
router.patch(`/updateMe`, userController.updateMe); 
router.patch(`/deleteMe`, userController.deleteMe); 
router.get(`/me`, userController.getMe, userController.getUser);

router.use(authController.restrictTo('admin')); //only admins can have access to the routes below this point

router
  .route(`/`)
  .get( userController.getAllUsers)
  .post(userController.createUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
