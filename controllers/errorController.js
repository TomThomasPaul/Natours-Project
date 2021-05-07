
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


const sendErrorDev = (err,req,res)=>{
  console.log("entered dev handler");
  //console.log(req.originalUrl);
  if(req.originalUrl.startsWith('/api')){
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack : err.stack
    });

  }else{
    //console.log(res);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    });
  }
  



}

const sendErrorProd = (err,req,res)=>{
console.log("Inside production error handler");
if(req.originalUrl.startsWith('/api')){

  if(err.isOperational){
    res.status(err.statusCode).json({
     
      status: err.status,
      message: err.message
    });
  }else{

    res.status(err.statusCode).json( {
      status: 'error',
      message: 'Something went wrong'
    });



  }


}else{

  if(err.isOperational){
    res.status(err.statusCode).render('error',{
      title: 'Something went wrong',
      msg: err.message
    });
  }else{

    res.status(err.statusCode).render('error',{
      status: "Something went wrong",
      message: "Please try again later"
    });



  }



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
sendErrorDev(err,req,res);
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
   sendErrorProd(error,req,res);   

  

 }
  
};
