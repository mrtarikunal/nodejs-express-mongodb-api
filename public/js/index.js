import '@babel/polyfill';
import { login, logout } from './login';
import {displayMap} from './mapbox';
import {updateData, updateSettings} from './updateSettings';
import { bookTour } from './stripe';


const bookBtn = document.getElementById('book-tour');

if(bookBtn) {
    bookBtn.addEventListener('click', e => {

    e.target.textContent = 'Processing...';
    //e.target tıklanan butonu ifade eder
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
   });
}

const mapBox = document.getElementById('map');

if(mapBox) {

    const locations = JSON.parse(mapBox.dataset.locations);
    
    displayMap(locations);
}


const loginForm = document.querySelector('.form--login');

if(loginForm) {

    loginForm.addEventListener('submit', e => {

    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
   });
}

const logOutBtn = document.querySelector('.nav__el--logout');

if(logOutBtn) {

    logOutBtn.addEventListener('click', logout);
}

const userdataForm = document.querySelector('.form-user-data');

if(userdataForm) {

    userdataForm.addEventListener('submit', e => {

    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateData(form);
   });
}

const userPasswordForm = document.querySelector('.form-user-password');

if(userPasswordForm) {

    userPasswordForm.addEventListener('submit', async e => {

    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

    document.querySelector('.btn--save-password').textContent = 'Save Password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

   });
}
