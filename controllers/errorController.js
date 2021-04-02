
const AppError = require("../utils/appError");

const handleCastErrorDB=(error)=>{
console.log(error);
const message = `Invalid path ${error.path}: ${error.value}`;

return new AppError(message,400);

}

const handleDuplicateFieldsDB=(error)=>{
 // console.log(error.message);
  const value = error.message.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate entry found for  ${value}`;
  
 return new AppError(message,400);
  
  }

  
const handleValidationErrorsDB=(error)=>{
  // console.log(error.message);
   
   const validationErrorList = Object.values(error.errors).map(el=>el.message);

   const validationErrorListMessage=validationErrorList.join(". ");

  return new AppError(validationErrorListMessage,400);
   
   }

   const handleJsonWebTokenError =()=>{

    return new AppError("Invalid Token. Please login again",401);
   }

   const handleTokenExpiredError =()=>{

    return new AppError(`Token expired after ${process.env.JWT_EXPIRES_IN} milliseconds. Please login again`,401);
   }


const sendErrorDev = (err,res)=>{
  console.log("entered dev handler");
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack : err.stack
  });


}

const sendErrorProd = (err,res)=>{
console.log("Inside production error handler");
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }else{

    res.status(err.statusCode).json({
      status: "Error",
      message: "Something went wrong"
    });



  }
  
    



}



module.exports = (err, req, res, next) => {
  console.log("entered global error handler");
  //console.log(err);
 console.log(`${process.env.NODE_ENV}`);
  //console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
 if(process.env.NODE_ENV.startsWith("development")){
  //console.log(`${process.env.NODE_ENV}`);
 // sendErrorDev(err,res);
sendErrorDev(err,res);
 }else if(process.env.NODE_ENV.startsWith("production")){
  //console.log(err);
  let error = {...err, name : err.name, message : err.message}; //destructuring name  and message as it is not avaiable in error message or err. it seems to be part of Error class from which err inherits
  //console.log(error);
  if(error.name=="CastError"){
    error = handleCastErrorDB(error);
  
  }else if(error.code == 11000){
     error = handleDuplicateFieldsDB(error);
   }else if(error.name=="ValidationError"){

    error = handleValidationErrorsDB(error);
   } else if(error.name =="JsonWebTokenError"){
    error = handleJsonWebTokenError();
   }else if(error.name =="TokenExpiredError"){
    error = handleTokenExpiredError();
   }
   sendErrorProd(error,res);   

  

 }
  
};
