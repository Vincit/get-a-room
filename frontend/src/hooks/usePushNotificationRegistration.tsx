import { useEffect } from 'react';
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications
} from '../services/pushNotificationService';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function ArraysEqual(
    arrayBuffer: ArrayBuffer,
    otherArray: Uint8Array
): boolean {
    if (!arrayBuffer || !otherArray) {
        return false;
    }

    const thisArray = new Uint8Array(arrayBuffer);
    if (thisArray.length !== otherArray.length) {
        return false;
    }

    return thisArray.every((value, index) => value === otherArray[index]);
}

const usePushNotificationRegistration = () => {
    useEffect(() => {
        async function TryRegisterToPushNotifications() {
            // PushNotifications requires serviceWorker but it's not supported by this browser
            if (!('serviceWorker' in navigator)) {
                // Unsubscribe from push notification in case this user had already subscribed in different browser which has this support
                return await unsubscribeFromPushNotifications();
            }

            // Request / get permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                return await unsubscribeFromPushNotifications();
            }

            const serviceWorker = await navigator.serviceWorker.ready;
            const applicationServerKey = urlBase64ToUint8Array(
                process.env.REACT_APP_SERVER_KEY as string
            );

            // Get existing / old subscription
            const oldSubscription =
                await serviceWorker.pushManager.getSubscription();

            const areSubscriptionsSame = ArraysEqual(
                oldSubscription?.options.applicationServerKey as Uint8Array,
                applicationServerKey
            );

            // Unsubscribe from old subscription
            if (oldSubscription && !areSubscriptionsSame) {
                await oldSubscription.unsubscribe();
            }

            const pushSubscription = await serviceWorker.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            });

            await subscribeToPushNotifications(pushSubscription);
        }

        try {
            TryRegisterToPushNotifications();
        } catch (error) {
            console.error(error);
        }
    }, []);

    return;
};

export default usePushNotificationRegistration;
