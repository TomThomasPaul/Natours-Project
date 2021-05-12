import axios from "axios";
import { showAlert } from "./alerts";


export const updateSettings = async (data,type)=>{  //type is data or password

    const url = type==='password'?'/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe'

    try{
       let result = await axios({
            method: 'PATCH',
            url,
            data
            
            
            });


            if(result.data.status.toUpperCase()==='SUCCESS'){

              showAlert('success', `${type} Updated Successfully`);

            }

    }catch(err){

             showAlert('error', err);

    }


};