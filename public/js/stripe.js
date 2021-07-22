import axios from "axios";
import {showAlert} from './alert';

const stripe = Stripe('sdsds');


export const bookTour = async tourId => {

    try {
        
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });
        
    } catch (err) {
        showAlert('error', err);
    }



};