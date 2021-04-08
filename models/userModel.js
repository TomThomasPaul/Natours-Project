const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
name : {
    type : String,
    required : [true, "Please tell us your name"]
},
email : {
    type :String,
    required: [true, "Please provide your email"],
    unique : true,
    lowercase : true,
    validate: [validator.isEmail, "Please provide a valid email"]
},
photo : String,
role :{
    type : String,
    enum: ['user', 'guide','lead-guide','admin'],
    default : 'user'
},
password :{

    type: String,
    required: [true, "Please provide a password"],
    select:false //this ensures that password is not visible in the response when doing a find() or findOne()...it is visble after creating a document though in the response of signup
},
passwordConfirm :{

    type: String,
    required: [true, "Please confirm your password"],
    validate:{// works on create and save only
    validator : function(el){
        return el===this.password;
    },
    message : "Passwords are not same"
    },
    select:false //this ensures that password is not visible in the response when doing a find() or findOne()
},

passwordChangedAt : Date,
passwordResetToken : String,
passwordResetExpires : Date,
active : {
type : Boolean,
default : true,
select :false

}


})

userSchema.pre(`save`, async function(next){

    if(!this.isModified('password')){// trigger this function only if the password is changed
        return next();
    }

    this.password = await bcrypt.hash(this.password, 12); //password gets encrypted
    this.passwordConfirm =undefined; // we dont need to store this in database
})

userSchema.pre('save', function(next){

if(!this.isModified('password') || this.isNew){
    next();
    return;
}

this.passwordChangedAt = Date.now() -1000; // subtract 1 sec from pass changed at bcz at times, saving to database is slower than token generation. so it affects jwt timestamp and passwrdchanged timestamp
next();
});

userSchema.methods.correctPassword = async function(passwordFromRequest, passwordDB){ //this instance method will be available in all docs

  return await  bcrypt.compare(passwordFromRequest,passwordDB); // return true/false
  //we could have just passed in passwordFromRequest and used this.password to compare. But this.password has select= false in schema, so we cant retrieve it in the controller when we call this method

}

userSchema.pre(/^find/, function(next){

  this.find({active : {$ne : false}});
  next();
})

userSchema.methods.changedPassword = function(jwtTimeStamp){
    console.log("entered changed password 1")
    console.log(this);
if(this.passwordChangedAt){
    console.log("entered changed password 2")
    const formatPasswordChangedAt = parseInt(this.passwordChangedAt.getTime()/1000, 10);


console.log(formatPasswordChangedAt, jwtTimeStamp);
console.log(jwtTimeStamp<formatPasswordChangedAt);

return  jwtTimeStamp < formatPasswordChangedAt ;

  

}
  //default to false assuming user never changed password
    
  return false;

}

userSchema.methods.createPasswordResetToken = function(){

const resetToken = crypto.randomBytes(32).toString('hex');

this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

return resetToken;

}
const User = mongoose.model("User",userSchema);

module.exports = User;