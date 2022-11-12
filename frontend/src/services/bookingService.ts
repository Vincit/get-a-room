import { Booking, BookingDetails, AddTimeDetails } from '../types';
import { DateTime } from 'luxon';
import axios from './axiosConfigurer';

export const sendNotificationSubscription = async (subscription: Object) => {
    //const urlParams = new URLSearchParams();
    const stringifySubscripton = JSON.stringify(subscription);
    const response = await axios.post('notification', stringifySubscripton);
    return response.data;
};

export const makeBooking = async (
    bookingDetails: BookingDetails,
    noConfirmation?: boolean
) => {
    const urlParams = new URLSearchParams();
    if (noConfirmation) {
        urlParams.append('noConfirmation', noConfirmation.toString());
    }
    const response = await axios.post('booking', bookingDetails, {
        params: urlParams
    });
    return response.data;
};

export const getBookings = async (): Promise<Booking[]> => {
    const urlParams = new URLSearchParams();

    // Add local end of day as end time for room availability lookup
    // Should this be moved somewhere else?
    let endTime = DateTime.local().endOf('day').toUTC();

    // If under 60 minutes left of a day, set end to next days end of day
    // as backend doesn't return rooms with less than 30 minutes of availability
    if (endTime.diffNow(['minutes']).minutes <= 60) {
        endTime = endTime.plus({ days: 1 }).toUTC();
    }

    urlParams.append('until', endTime.toISO());

    const response = await axios.get('booking/current', { params: urlParams });
    return response.data;
};

export const updateBooking = async (
    addTimeDetails: AddTimeDetails,
    bookingId: string,
    noConfirmation?: boolean
) => {
    const urlParams = new URLSearchParams();
    if (noConfirmation) {
        urlParams.append('noConfirmation', noConfirmation.toString());
    }
    const response = await axios.patch(
        'booking/' + bookingId + '/addTime',
        addTimeDetails,
        { params: urlParams }
    );
    return response.data;
};

export const deleteBooking = async (bookingId: string) => {
    const response = await axios.delete('booking/' + bookingId);
    return response.data;
};

export const endBooking = async (bookingId: string) => {
    const response = await axios.patch('booking/' + bookingId + '/endNow');
    return response.data;
};
