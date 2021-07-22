import axios from 'axios';
import {showAlert} from './alert';

export const updateData = async (data) => {

    try {

        const res = await axios({

        method: 'PATCH',
        url: '/api/v1/users/updateMe',
        data
       });

       if(res.data.status === 'success') {
           showAlert('success', 'Data updated successfully');
       }
        
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};


//burda hem name ve email formundan geleni, hemde password değişikliği için geleni update edyrz
//ama ben bunu sadece password için kullandım
export const updateSettings = async (data, type) => {

    try {

        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
        const res = await axios({

        method: 'PATCH',
        url: url,
        data: data
       });

       if(res.data.status === 'success') {
           showAlert('success', `${type.toUpperCase()} updated successfully`);
       }
        
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};