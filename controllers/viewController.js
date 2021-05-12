const Booking = require("../models/bookingModel");
const Tour = require(`../models/tourModel`);
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require(`${__dirname}/../utils/catchAsync`);



exports.getOverview = catchAsync(async (req,res)=>{

    const tours = await Tour.find();

    res.status(200).render('overview', {
      title : 'Exciting Adventures for all tourists',
      tours
    })
    
    
});

exports.getTour = catchAsync(async (req,res,next)=>{

    const tour = await Tour.findOne({slug : req.params.slug}).populate({
      path :  'reviews',
      fields : 'review rating user'

    });

    if(!tour){

      return next(new AppError('No tour found', 404));
    }
    res.status(200)
    .set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com https://js.stripe.com https://cdnjs.cloudflare.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
    // .set(
    //     'Content-Security-Policy',
    //     "connect-src * 'unsafe-inline' 'unsafe-eval'"
    //   )
    .render('tour', {
        title : `${tour.name} Tour`,
        tour
    })
    
    
});

exports.getLoginForm = (req,res,next)=>{

res.status(200)
.set(
  'Content-Security-Policy',
  "default-src 'self' https://*.cdnjs.cloudflare.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
)
.render('login',{
  title : `Login`


});


};

exports.getAccount = (req,res,next)=>{

  res.status(200).render('account1',{
    title : `Your Account`
  
  
  });
  
  
  };

  exports.updateUserData= catchAsync(async (req,res)=>{
   
    console.log(req.body);

    const updatedUser = await User.findByIdAndUpdate(req.user.id,{
     name: req.body.name,
     email : req.body.email

    },
    
    {

      new : true,
      runValidators:true
    }
    );
    
    res.status(200).render('account1',{
      title : `Your Account`,
      user :updatedUser
    
    
    });

  });

  exports.getMyTours= catchAsync(async(req,res,next)=>{

//find bookings for the user----could use virtual populate but will do manually here

    const bookings =await Booking.find({user: req.user.id});

    //find tours with returned ids in bookings above

    const tourIds =bookings.map(el=>el.tour);
    const tours= await Tour.find({_id:{$in:tourIds}});


    //render booked tours
    res.status(200).render('overview',{
     title : 'My Booked Tours',
     tours


    });

  });