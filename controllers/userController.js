const { findByIdAndUpdate } = require("../models/userModel");

//Create user route handler
const AppError=require(`${__dirname}/../utils/appError`);
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
console.log('UserController');



exports.deleteMe = catchAsync(async(req,res,next)=>{

  await User.findByIdAndUpdate(req.user.id, {active : false});

  res.status(204).json({
    status : "success",
   data : null

})

});

exports.updateMe = catchAsync(async (req,res,next)=>{
if(req.body.password || req.body.passwordConfirm){
next(new AppError("This route is not defined for password resets",401));
return;

}

//update user details---name,email

 const {name , email} = req.body;

 let obj = {name,email}; //own way..not using filter object described in the chapter

 const updatedUser = await User.findByIdAndUpdate(req.user.id, obj, {new : true, runValidators:true}); //dont use .save..see explanation chap 138
res.status(200).json({
status : "success",
user : updatedUser


});
})

exports.getAllUsers = catchAsync(async (req, res, next) => {
  console.log(`Inside get All Users`);

  const users = await User.find();
 

  res.status(200).json({
    status: 'Success',
    results: users.length,
    data: {
      users
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

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route has not yet been handled',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route has not yet been handled',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route has not yet been handled',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route has not yet been handled',
  });
};
//****************
