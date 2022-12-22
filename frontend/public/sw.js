if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/serviceworker.js')
            .then((reg) => {
                console.log(
                    'Service worker registration was successfull with scope: ',
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
                    'BEvPpDPDB543o1VH8QsnHJC2BW2znZqip3KJ4kxtFR98zetTY4TSozQIWllDfV8bnyZoQP_XCfuYC1G0C5WUNgU'
                )
            });
        })
        .then((pushSubscription) => {
            sendSubscriptionToBackEnd(pushSubscription);
            return pushSubscription;
        });
}

function sendSubscriptionToBackEnd(subscriptionData) {
    const subscription = {
        subscription: subscriptionData
    };

    return fetch('/api/booking/notification/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: 'TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDg2MDc0NTA3NDgwOTM2NTkyMTMiLCJuYW1lIjoic3VwZXIgYWRtaW4iLCJlbWFpbCI6InN1cGVyLmFkbWluQG9pc3BhaHVvbmUuY29tIiwiYWNjZXNzVG9rZW4iOiJ5YTI5LmEwQWE0eHJYUDJTbV92NG02eF9MaDhGUUU4cF9VQ0lqd1FfZ3NqV2N4VTNGZzcyVWNqU0lqdjdDbHBmSGVTWERYR1R6MHFWZGthZnFQbGJLVkNVV0NjTlVPMVdoTVpoY2ZucWQzYmVGcGp0RGpZSks4RVNYQUNZLWxCbVgwdEVZcXZuZnNhb09qcHBsVUYxaF9oaU1sRnJmcF9CSWttYUNnWUtBVEFTQVJBU0ZRRWpEdkw5aUxEY3BOZEFjRlNGa0RPZkl6SEwzZzAxNjMiLCJyZWZyZXNoVG9rZW4iOiIxLy8wY0JPb0lGVWtOUnBLQ2dZSUFSQUFHQXdTTndGLUw5SXJXOU8xQWJrNWdlR0tLWmw2cWJmM2NxN2dXUDJkN05IZDdIWFEtYzd6aXJiLW5BSXZPbGxHQ0V6aGE2ZlRvZlRqSmlvIiwiaWF0IjoxNjY1NTk5MDA4LCJleHAiOjE2OTcxMzUwMDgsImlzcyI6Im9pc3BhaHVvbmUuY29tIn0.XZsSUew82mt1XMJ-hDjeeTWqIUP-EM_L1dX5U1cZ5Gw'
        },
        body: JSON.stringify(subscription)
    }).then(function (response) {
        if (response?.status !== 200) {
            throw new Error('Bad status code from server.');
        }

        return response.json();
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
