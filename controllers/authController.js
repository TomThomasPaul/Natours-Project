const User = require("./../models/userModel");
const {promisify} = require("util");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError=require(`${__dirname}/../utils/appError`);
//const sendEmail=require(`${__dirname}/../utils/email`);
const Email=require(`${__dirname}/../utils/email`);
const jwt =require("jsonwebtoken");
const crypto = require("crypto");

const signToken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });


}

const createSendToken =(user, statusCode,req,res)=>{

    const token = signToken(user._id);
   

   

    res.cookie("jwt", token, { 
        expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24*60*60*1000),
        httpOnly : true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'


    });
    user.password = undefined; //just to remove the password from the response
    
    console.log("inside create token send");
    res.status(statusCode).json({
        status:"Success",
        token,
        data : {
            user : user
        }
    });



};

exports.logout = async(req,res)=>{

res.cookie('jwt', 'loggedout', {

expires : new Date(Date.now() + 10 *1000),
httpOnly :true


})
console.log("inside logout backend");

res.status(200).json({status : 'success'});

};
exports.signUp = catchAsync(async (req,res,next)=>{

    const newUser =  await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser,url).sendWelcome();
    //create jwt and send it back to user is response when they signs up
    createSendToken(newUser, 201, req,res);

});


exports.login =catchAsync(async  (req,res,next)=>{

    const {email,password} = req.body;
    
    //check email and password if input by user
    
    if(!email || !password){
         next(new AppError(`Please enter both email and password`, 400));
         return ; //exit from function as we dont want further action in this method
        }
    
    //check if email is valid and user exists and password is correct
    
    const userFound =await User.findOne({email}).select(`+password`); //returns user for the input email and also return password in the userFound object. select is done since password has select as false in the schema
    
    if(!userFound || !(await userFound.correctPassword(password, userFound.password))){
        next(new AppError(`Email or password is wrong`, 401)); //Unauthorized
        return ; //exit from function as we dont want further action in this method
    
    }
    //send token if all OK
    
    createSendToken(userFound, 200,req, res);
    
    }


) 


exports.protect = catchAsync (async (req,res,next)=>{

//get token and check if its present

let token;

if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    
    token = req.headers.authorization.split(" ")[1];
    
}else if(req.cookies.jwt){

    token = req.cookies.jwt;
}

if(!token){

    next(new AppError("You are not logged in. Please login to continue", 401));
    return; //exit if no valid token
}

//verify token

// jwt.verify(token,process.env.JWT_SECRET, ()=>{

//     console.log(arguments);
// })  //use promisify below

const decode =await promisify(jwt.verify)(token,process.env.JWT_SECRET);
console.log(decode);

//even if token is present, verify if the user is deleted from the system.

const existingUser = await User.findById(decode.id);

if(!existingUser){
    next(new AppError("User belonging to this token do not exist",401));
    return;//exit
}

//check if user changed password or not using an instance method
console.log(existingUser);
const isPasswordChanged = await existingUser.changedPassword(decode.iat);

if(isPasswordChanged){
    next(new AppError("Password changed. Please login again",401));
    return;//exit

}

//GRANT ACCESS TO THE USER BY CALLING NEXT()----Calls the route handler/controller

req.user=existingUser;
res.locals.user=existingUser;
next(); // call the controller if all OK

} )

//only for rendered pages
exports.isLoggedIn = async (req,res,next)=>{

    //get token and check if its present
    if(req.cookies.jwt){
 
        try{

            console.log('inside logged in..jwt cookie token is : ' + req.cookies.jwt);
    const decode =await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
    console.log(decode);
    
    //even if token is present, verify if the user is deleted from the system.
    
    const existingUser = await User.findById(decode.id);
    
    if(!existingUser){
        
        return next();
    }
    
    //check if user changed password or not using an instance method
    
    const isPasswordChanged = await existingUser.changedPassword(decode.iat);
    
    if(isPasswordChanged){
        return next();
    
    }
    
    //GRANT ACCESS TO THE USER BY CALLING NEXT()----Calls the route handler/controller
    //at this point there is  alogged in user.
    res.locals.user = existingUser;  //pug templates have access to res.locals
    //req.user=existingUser;
        
        }catch(err){
        return next();

        }

  
}
     next(); 
    } 


exports.restrictTo = (...roles)=>{

    return (req,res,next)=>{
     // let  roles = ['admin', 'lead-guide'];
        if(!roles.includes(req.user.role)){

        next(new AppError("You do not have permission for this action", 403));
        return;
        }

        next();
    }


}


exports.forgotPassword = catchAsync(async (req,res,next)=>{
console.log("entered forgot");
    //get user based on email
    const user = await User.findOne({email: req.body.email});

    if(!user){
        next(new AppError("No user for this email", 400));
        return;
    }
    
    //generate token
    
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave : false});

  console.log(resetToken);
    
    //send email to user
    
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetUrl}.\n If you did not forget your password, please ignore this email`;
    try{
     
        

        await new Email(user, resetUrl).sendPasswordReset();
       
           res.status(200).json({
               status : "success",
               message : "Token sent to email"
               
           })
       
          
       



    }catch(err){

user.createPasswordResetToken =undefined;
user.passwordExpires = undefined;
await user.save({validateBeforeSave : false});
console.log(err);
return next(new AppError(`There was an error sending the email. Try again Later. ERROR : ${err}`,500));


    }

});
exports.resetPassword = catchAsync(async (req,res,next)=>{
//Get the user based on token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires : { $gte: Date.now()}
    });
    
//Set new password if token has not expired
if (!user){
    next(new AppError("Token is invalid or expired for password reset",400))
}     console.log("Incoming password");
      console.log(req.body.password);
      console.log(req.body.passwordConfirm);
      user.password = req.body.password;
      user.passwordConfirm =req.body.passwordConfirm;
      user.passwordResetToken=undefined;
      user.passwordResetExpires=undefined;
      await user.save();

      //update changedPasswordAt property for the user
      //login the user and return JWT
      createSendToken(user, 200,req, res);

    });

    exports.updatePassword = async (req,res,next)=>{
      //get user for which paswword has to be updated

      const user = await User.findById(req.user.id).select('+password') ;

      //check if password is correct

      if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){

        new AppError("Current Password you provided is wrong", 401);

      }



   //update passsword

     user.password = req.body.password;
     user.passwordConfirm = req.body.passwordConfirm;
     await user.save();  //findbyIdandUpdate will not work ..refer chap 137 for details

      
     createSendToken(user, 200, req,res);


    }