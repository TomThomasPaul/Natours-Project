const nodemailer = require("nodemailer");
const nodemailerSendgrid = require('nodemailer-sendgrid')
const pug = require("pug");
const htmlToText =require('html-to-text');


module.exports = class Email{

   constructor(user, url){
      this.to = user.email,
      this.firstName = user.name.split(' ')[0];
      this.url =url,
      this.from = `NodeMailer <${process.env.EMAIL_FROM}>`
   }

   newTransport(){
      if(process.env.NODE_ENV.startsWith('p')){
         console.log("in production from email.js");
         return nodemailer.createTransport({
            service : 'SendGrid',
            auth : {
               user : process.env.SENDGRID_USERNAME,
               pass : process.env.SENDGRID_PASSWORD
            
            }
   
   
      });


      // return nodemailer.createTransport(
      //    nodemailerSendgrid({
      //      apiKey: process.env.SENDGRID_PASSWORD
      //    })
      //  )
      }
      return nodemailer.createTransport({
         host : process.env.EMAIL_HOST,
         port : process.env.EMAIL_PORT,
         auth : {
            user : process.env.EMAIL_USERNAME,
            pass : process.env.EMAIL_PASSWORD
         
         }


   })
  }

 async send(template, subject){
//render html based on pug template

const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,
 {firstName : this.firstName,
url : this.url,
subject});

//specify email options
const mailOptions = {

   from : this.from,
   to : this.to,
   subject,
   html,
   text : htmlToText.fromString(html)
   
   }
 //create new transport and send mail
 
 await this.newTransport().sendMail(mailOptions);
}

async sendWelcome(){

   await this.send('welcome', 'Welcome to Natours family');
}


async sendPasswordReset(){

   await this.send('passwordReset', 'Your password reset Token.(Valid for only 10 minutes)');
}


}

// const sendEmail = async (options)=>{
// //1) create a transporter



// });

//define the email options



//send the email




