
const multer =require('multer');
const sharp = require('sharp');
//Create user route handler
const AppError=require(`${__dirname}/../utils/appError`);
const User = require(`${__dirname}/../models/userModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const factory = require('./factoryHandler');
console.log('UserController');


exports.getMe = (req,res,next)=>{

req.params.id = req.user.id;
next();
};


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

//own way..not using filter object described in the chapter
 let obj = {};
 if(name){
  obj.name=name;
 }
 if(email){
  obj.email=email;
 }

 if(req.file){

  obj.photo = req.file.filename;
 }
 const updatedUser = await User.findByIdAndUpdate(req.user.id, obj, {new : true, runValidators:false}); //dont use .save..see explanation chap 138
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

exports.getUser = factory.getOne(User);


exports.getAllUsers = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User); 
exports.updateUser = factory.updateOne(User); 
exports.createUser = factory.createOne(User);

//commenting out to create another way to store in memory buffer below for image resizing
// const multerStorage = multer.diskStorage({
// destination:(req,file,cb) =>{

// cb(null, 'public/img/users');
// },

// filename: (req, file,cb) =>{
//    const ext =file.mimetype.split('/')[1];//extension
//    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
// }


// });

const multerStorage = multer.memoryStorage();

const multerFilter =(req,file,cb)=>{

if(file.mimetype.startsWith('image')){
  cb(null, true);
}else{

cb(new AppError('Not an image! Please upload only images', 400), false);

}

};
const upload = multer({storage : multerStorage, fileFilter : multerFilter});

exports.uploadPhoto = upload.single('photo');


exports.resizeImages = catchAsync(async (req,res,next)=>{

  if(!req.file){return next();}

   req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;
   await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);

   next();
  
});

//exports.createUser = factory.createOne(User); we have signup functionality already

// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This route has not yet been handled',
//   });
// };

// exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This route has not yet been handled',
//   });
// };
//****************
