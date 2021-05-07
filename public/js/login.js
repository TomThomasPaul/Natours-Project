
import {showAlert} from './alerts';
import axios from 'axios';
export const login =async (email,password)=>{


try{
    const result = await axios({

        method : 'POST',
        url : 'http://127.0.0.1:1440/api/v1/users/login',
        data : {
         email,
         password
        
        }
        
        });

        //console.log(result);

        if(result.data.status.toUpperCase() === 'SUCCESS'){

            showAlert("success","Logged in Successfully");
            window.setTimeout(()=>{
            
              location.assign('/');

            },1000);
        }

}catch(err){

    showAlert("error",err.response.data.message);

}    


}

export const logout = async (req, res)=>{

try{

    console.log("inside logout in login.js");

    const res = await axios({

        method : 'GET',
        url : 'http://127.0.0.1:1440/api/v1/users/logout'
        
        });
        // console.log("after ajax logout");
        // console.log(res);
       // console.log(res.data.status);

        if(res.data.status.toUpperCase() === "SUCCESS"){
           // console.log('hey hey');
           window.location.reload(true);
           
        }



}catch(err){

showAlert("error", `Error logging out: ${JSON.stringify(err)}`)

}




}