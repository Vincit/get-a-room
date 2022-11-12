if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/serviceworker.js')
            .then((reg) => {
                console.log(
                    'Service workker registration was successfull with scope: ',
                    reg.scope
                );
            })
            .catch((err) =>
                console.log(
                    'Service worker registration failed with error: ',
                    err
                )
            );
    });
}

if ('PushManager' in window) {
    askPermission();
}

function askPermission() {
    return new Promise((resolve, reject) => {
        const permission = Notification.requestPermission((result) => {
            resolve(result);
        });
        if (permission) {
            permission.then(resolve, reject);
        }
    }).then((permission) => {
        if (permission !== 'granted') {
            throw new Error('Notification permission not granted.');
        }
        subscribingToPush();
    });
}

function subscribingToPush() {
    return navigator.serviceWorker
        .register('/serviceworker.js')
        .then((reg) => {
            return reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    'BNPLRAuoDSM68hSIqKMxS6LAPyQSANXgnCf2dRvXvJU66ShNSWJd8CMe_X2AAVYiWt9wDIIjAG0jOlhIw_bLrHY'
                )
            });
        })
        .then((pushSubscription) => {
            console.log(
                'Received PushSubscription: ',
                JSON.stringify(pushSubscription)
            );
            sendSubscriptionToBackEnd(pushSubscription);
            return pushSubscription;
        });
}

function sendSubscriptionToBackEnd(subscriptionData) {
    return fetch('/api/notifcation/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Bad status code from server.');
            }

            return response.json();
        })
        .then(function (responseData) {
            if (!(responseData.data && responseData.data.success)) {
                throw new Error('Bad response from server.');
            }
        });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
