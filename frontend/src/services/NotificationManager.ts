import { Room } from '../types';

export function sendNotification(room: Room, duration: number) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        dispalyNotification(room, duration);
    }
}

function dispalyNotification(room: Room, duration: number) {
    if (window.Notification && Notification.permission === 'granted') {
        console.log('Displaying Notification!');
        return new Notification('PWA Notification', {
            body: `Booking for ${room.name} ends in ${duration} minutes.`
        });
    } else {
        alert(
            'You denied permissions to notifications. Please go to your browser or phone setting to allow notifications.'
        );
    }
}
