
const catchAsync = require(`${__dirname}/../utils/catchAsync`);
const AppError=require(`${__dirname}/../utils/appError`);
const APIFeatures = require(`${__dirname}/../utils/apiFeatures`);

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
   const doc = await Model.findByIdAndDelete(req.params.id);
   console.log(doc);

   if(!doc){
       return next(new AppError('No document found to delete', 404));
   }
    res.status(204).json({
      status: 'Success',
      data: null
    });
  });

  exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if(!doc){
        return next(new AppError('No document found to update', 404));
    }
     res.status(200).json({
       status: 'Success',
       data: doc
     });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    console.log(req.body);
  
    //another method to create document
  
    const doc = await Model.create(req.body);  /*,(err)=>{
  
      next(new AppError(`No Tour created for this request. Error description : ${err}`, 400))
    });*/
  
    res.status(201).json({
      status: 'Success',
      data: {
        data: doc
      }
    });
  });

  exports.getOne = (Model,populateOptions) => catchAsync(async (req, res, next) => {
 
    let query =  Model.findById(req.params.id);
    if(populateOptions){

      query =  Model.findById(req.params.id).populate(populateOptions);
    }
    
    const doc =await query;
    if(!doc){
        return next(new AppError('No document found', 404));
    }
    
    /* , ()=>{
  
      next(new AppError(`No Tour found for ID ${req.params.id}`, 404))
    }*/          //same as Tour.findOne({_id : req.params.id})
    
  
  
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  
  
});

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter ={};
    if(req.params.tourId){ filter = {tour : req.params.tourId} ;}
    const features = new APIFeatures(Model.find(filter), req.query);
  
    features.filter().sorting().limiting().paginate();
  
    //const docs = await features.query.explain();
    const docs = await features.query;
  
  
    res.status(200).json({
      status: 'Success',
      results: docs.length,
      data: {
        data: docs,
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