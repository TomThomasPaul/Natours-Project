const Tour = require(`../models/tourModel`);
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
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
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