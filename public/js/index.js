import {login, logout} from './login';
import {displayMap} from './mapBox';
import "babel-core/register";
import "babel-polyfill";
import { updateSettings } from './updateSettings';
import {bookTour} from './stripe';
import { showAlert } from './alerts';

//import '@babel/polyfill';
//import "regenerator-runtime/runtime.js";

const mapBox = document.getElementById('map');
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

}
const form =document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const saveSettingsBtn =document.querySelector('.form-user-data');
const savePasswordBtn =document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

        


if(form){

    form.addEventListener('submit', e=>{

        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password); 
        console.log("clicked login");
        
        })
}

if(logoutBtn){
    logoutBtn.addEventListener('click', logout);
}

if(saveSettingsBtn){
    
    saveSettingsBtn.addEventListener('submit', e=>{


        e.preventDefault();
        //imitate multipart/form-data to be used in ajax function used in update settings
        const form= new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
      
        updateSettings(form,'data');
        console.log("clicked save settings");
    })

}

if(savePasswordBtn){
    
    savePasswordBtn.addEventListener('submit', async e=>{


        e.preventDefault();
        document.querySelector('.btn-save-password').textContent='Updating...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateSettings({passwordCurrent,password,passwordConfirm},'password');
        console.log("clicked save Password");


        //clear password fields in the form
        document.getElementById('password-current').value = '';
        document.getElementById('password').value ='';
        document.getElementById('password-confirm').value ='';
        document.querySelector('.btn-save-password').textContent='SAVE PASSWORD';
    })

}

if(bookTourBtn){

bookTourBtn.addEventListener('click', e=>{
e.target.textContent= 'Processing...';

const {tourId} = e.target.dataset;

bookTour(tourId);


})


}


const alertMessage = document.querySelector('body').dataset.alert;
if(alertMessage){
    console.log(alertMessage);
    showAlert('success', alertMessage);
}