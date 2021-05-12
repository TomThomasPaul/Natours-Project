const AppError=require(`${__dirname}/../utils/appError`);
const Booking = require('../models/bookingModel');
const factory = require('./factoryHandler');
const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const stripe =require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.getCheckoutSession = catchAsync(async (req,res,next)=>{

const tour = await Tour.findById(req.params.tourId); //get current booked tour

//CREATE STRIPE CHECKOUT SESSION

const session= await stripe.checkout.sessions.create({
payment_method_types: ['card'],
success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
customer_email: req.user.email,
client_reference_id: req.params.tourId,
line_items:[
   
    {
      name: `${tour.name} Tour`,
      description: tour.summary,
      images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
      amount: tour.price * 100,
      currency: 'usd',
      quantity: 1




    }]

});

//send session

res.status(200).json({
    status: "Success",
    session
});

});

exports.createBookingAtCheckout = catchAsync(async (req,res,next)=>{
//temporary as it is unsecure
   const {tour,user,price}  = req.query;

   if(!tour && !user && !price){

    return next();
   }

   await Booking.create({tour,user,price});

   res.redirect(req.originalUrl.split('?')[0]);

})

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);