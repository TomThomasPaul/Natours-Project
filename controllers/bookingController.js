const AppError=require(`${__dirname}/../utils/appError`);
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const factory = require('./factoryHandler');
const Tour = require(`${__dirname}/../models/tourModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const stripe =require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.getCheckoutSession = catchAsync(async (req,res,next)=>{

const tour = await Tour.findById(req.params.tourId); //get current booked tour

//CREATE STRIPE CHECKOUT SESSION

const session= await stripe.checkout.sessions.create({
payment_method_types: ['card'],
//success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
customer_email: req.user.email,
client_reference_id: req.params.tourId,
line_items:[
   
    {
      name: `${tour.name} Tour`,
      description: tour.summary,
      images:[`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
      amount: tour.price * 100,
      currency: 'usd',
      quantity: 1




    }]

// line_items: [
//       {
//         quantity: 1,
//         price_data: {
//           currency: 'usd',
//           unit_amount: tour.price * 100,
//           product_data: {
//             name: `${tour.name} Tour`,
//             description: tour.summary,
//             images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
//           },
//         },
//       },
//     ]

});

//send session

res.status(200).json({
    status: "Success",
    session
});

});

// exports.createBookingAtCheckout = catchAsync(async (req,res,next)=>{
// //temporary as it is unsecure
//    const {tour,user,price}  = req.query;

//    if(!tour && !user && !price){

//     return next();
//    }

//    await Booking.create({tour,user,price});

//    res.redirect(req.originalUrl.split('?')[0]);

// })

const createBookingAtCheckout = async session=>{

  console.log("inside bookingatcheckout");
const tour = session.client_reference_id;
const user =(await User.findOne({email : session.customer_email})).id;
//const user =(await User.findOne({email : session.customer_details.email})).id;

//const price = session.display_items[0].amount/100; //changed to display items as per video..stripe shows display items in stripe response
const price = session.amount_total/100;
await Booking.create({tour,user,price});

};

exports.webHookCheckout = (req,res,next)=>{
  console.log("inside webhookcheckout");
  console.log(req.headers);
const signature = req.headers['stripe-signature'];
//console.log("inside webhookcheckout after signature");

let event;
try{
  console.log("try inside webhookcheckout");
event = stripe.webhooks.constructEvent(req.body,signature, process.env.STRIPE_WEBHOOK_SECRET);


}catch(err){
return res.status(400).send(`Webhook error: ${err}`);

}

if(event.type === "checkout.session.completed"){
  console.log("inside checkout session completed");
  createBookingAtCheckout(event.data.object);
  res.status(200).json({received: true});
}
next();
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);