console.log('AppJs');
//const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter =require(`${__dirname}/routes/viewRoutes`);
const bookingRouter = require(`${__dirname}/routes/bookingRoutes`);
const bookingController = require(`${__dirname}/controllers/bookingController`);
const cors = require('cors');


const AppError = require(`${__dirname}/utils/appError`);
const globalErrorHandler = require(`${__dirname}/controllers/errorController`);
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require('cookie-parser');
//const bodyParser = require('body-parser');

const app = express(); //express is a function that will return a bunch of methods to app variable
app.enable('trust proxy'); //enable proxy servers ..eg heroku uses proxy when sending request to app.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); //this is to serve static files which cant be served through route

// app.use((req, res, next) => { //allow  react app in react course to get data from this node js server
//   res.header('Access-Control-Allow-Origin', '*');
//   next();
// });
app.use(cors()); //same as above code
app.options('*', cors()); //allow patch ,delete requests for cross origin requests..patch,delete aare not simple requests so add this line

app.post('/webhook-checkout', express.raw({type: '*/*'}), bookingController.webHookCheckout);  //request from stripe is in readablestream..so placing it before body parser

app.use(express.json({limit : '10kb'})); //middleware needed when using POST..body parser..to facilitate req.body......
app.use(cookieParser()); //enable cookies from browser to the app
app.use(express.urlencoded({extended:true, limit:'10kb'})); //allow urlencoded data when submitting forms
//Data sanitization 
//against nosql query injection

app.use(mongoSanitize());

//sanitize against xss

app.use(xssClean());

//prevent parameter pollution

app.use(hpp({
whitelist :["duration","ratingsQuantity","ratingsAverage", "maxGroupSize", "difficulty", "price"] //manually choosing some fields



}));

app.use(compression());

app.use((req, res, next) => {
  //order of middleware functions matter ..it impacts the request response cycle
  //console.log('Hello from the middleware');
  req.requestTime = new Date().toISOString();
  console.log(req.cookies); // this line will throw error only when there is an incoming request since middlewares are part of request response cycle.
  next();
});

app.use(helmet());
//console.log(`This is from appJs ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
max : 100,
windowMs : 60*60*1000,
message : "Too many requests from this IP. Please try after an hour"


});


app.use('/api',limiter);

/*app.get('/', (req, res) => {
  //res.status(200).send('Response from the Server using Express');
  res
    .status(200)
    .json({ message: `Response from Express server`, app: `Natours` });
});

app.post('/', (req, res) => {
  //res.status(200).send('Response from the Server using Express');
  res
    .status(200)
    .json({ message: `You can post to this endpoint`, app: `Natours` });
});
*/


app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//Handing error for unhandled routes ...put this after all routes so that it is caught only if the valid routes are not picked up

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Fail',
  //   message: `No route handler defined for ${req.originalUrl}`,
  // });

  //***test gloabal error handler thats defined below this function */
  // const err = new Error(`No route handler defined for ${req.originalUrl}`);
  // err.status = 'FAIL';
  // err.statusCode = 404;

  next(new AppError(`No route handler defined for ${req.originalUrl}`, 404)); // err passed here will get passed to the error global handler below this function
});

//Use global error handler

app.use(globalErrorHandler);

module.exports = app;
