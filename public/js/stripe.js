//import Stripe from 'stripe';
import axios from 'axios';
import { showAlert } from './alerts';





export const bookTour = async tourId=>{

    try{
        const stripe = Stripe('pk_test_51IBv45C9XRtO3ONSjEvMcYX8MlNzYg8qdjGMI9uGuJd2NSUQHdjvILH9XJcNYos2srmJkl6paILrmLJJsaRxffwS00byVgcmRJ'); //publishable key  
        //get checkout session from API
        
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        
        console.log(session);

        //CREATE CHECKOUT FORM AND CHARGE CARD
        stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

    }catch(err){
     showAlert('error', err);

    }



}