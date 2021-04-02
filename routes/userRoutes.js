console.log('UserRoutes');
const express = require('express');

const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`./../controllers/authController`);
const router = express.Router(); //create user router


router.post(`/signup`, authController.signUp);
router.post(`/login`, authController.login);

router.post(`/forgotPassword`, authController.forgotPassword);//will receive the email address to which a link with token has to be sent
router.patch(`/resetPassword/:token`, authController.resetPassword); // will receive the new password and token to reset password
router
  .route(`/`)
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);

router
  .route(`/:id`)
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
