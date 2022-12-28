if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/serviceworker.js')
            .then((reg) => {
                console.log(
                    'Service worker registration was successful with scope: ',
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
