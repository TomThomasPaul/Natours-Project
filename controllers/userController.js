//Create user route handler
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
console.log('UserController');

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
