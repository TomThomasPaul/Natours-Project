import {login, logout} from './login';
import {displayMap} from './mapBox';
import "babel-core/register";
import "babel-polyfill";

//import '@babel/polyfill';
//import "regenerator-runtime/runtime.js";

const mapBox = document.getElementById('map');
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

}
const form =document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');

        


if(form){

    form.addEventListener('submit', e=>{

        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email,password); 
        
        })
}

if(logoutBtn){
    logoutBtn.addEventListener('click', logout);
}