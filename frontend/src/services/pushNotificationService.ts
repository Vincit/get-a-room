import axios from './axiosConfigurer';

export const subscribeToPushNotifications = async (
    subscription: PushSubscription
) => {
    await axios.post('notification', { subscription: subscription });
};

export const unsubscribeFromPushNotifications = async () => {
    await axios.delete('notification');
};
