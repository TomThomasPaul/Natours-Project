module.exports = (fn) => {
  return (req, res, next) => {//this way, catchAsync will return a function that takes req,res,next as params and executes the controller function with these params. If there is any error it is caught and passed to the global error handler function using catch(async)
   console.log("inside catchAsync");
    fn(req,res,next).catch(err=>next(err));
  };
};
