const mongoose = require('mongoose');

const Tour = require(`./tourModel`);
const reviewSchema = new mongoose.Schema({
review:{
type: String,
required: [true, 'Review cannot be empty']


},
rating :{

    type : Number,
    min:1,
    max:5
},

createdAt : {
type : Date,
default: Date.now


},
tour :{

    type: mongoose.Schema.ObjectId,             //parent referencing
    ref : 'Tour',
    required :[true, 'Review should belong to a tour']


},

user : {
    type: mongoose.Schema.ObjectId,                           //child referencing
    ref : 'User',
    required :[true, 'Review should belong to a user']

    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}




);

reviewSchema.index({tour :1 , user: 1},{unique : true}); //to avoid duplicate reviews for a tour..one user can have one review only per tour..index dint still get reflected


reviewSchema.pre(/^find/, function(next){
this.populate({

    path : 'user',
    select : 'name photo'

})


next();
});

reviewSchema.statics.calcAverageRatings = async (tourId)=>{

    const stats = await Review.aggregate([
     {
         $match :{tour : tourId}

     },

     {  $group : {
            _id : '$tour',
            nRating : {$sum:1},
            avgRating : {$avg: '$rating'}


           }

     }







    ]);
    console.log(stats);

    if(stats.length>0){
        await Tour.findByIdAndUpdate(tourId, {

            ratingsQuantity : stats[0].nRating,
            ratingsAverage : stats[0].avgRating
            
            
            });
        
    }else{


        await Tour.findByIdAndUpdate(tourId, {

            ratingsQuantity : 0,
            ratingsAverage : 4.5
            
            
            });
    }



}

reviewSchema.post('save', function(){

    this.constructor.calcAverageRatings(this.tour);
   // Review.calcAverageRatings(this.tour);//this doesnt workas Review model is not yet defined
});


//findbyIdandupdate and findbyidanddelete

reviewSchema.pre(/^findOneAnd/, async function(next){

this.r = await this.findOne();
console.log(this.r);

next();

})


reviewSchema.post(/^findOneAnd/, async function(){
   // await this.findOne(); will not work since query is already executed in a post method
   await this.r.constructor.calcAverageRatings(this.r.tour);
//the below also works..
//    reviewSchema.post(/^findOneAnd/, async function (docs) {
//     await docs.constructor.calcAverageRatings(docs.tour);
//   });
    
    
    
    })
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;