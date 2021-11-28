describe('authMiddleware', () => {
    describe('authFilter', () => {
        test.todo('Should return true when path is "/api"');
        test.todo('Should return true when path is "/api/auth"');
        test.todo('Should return true when path is "/api/favicon.ico"');
        test.todo('Should return false when path is something else');
    });

    describe('parseToken', () => {
        test.todo(
            'Should return with Invalid Token when TOKEN is not in cookies'
        );
        test.todo(
            'Should return with Invalid Token when refresh token is not in TOKEN payload'
        );
        test.todo('Should set TOKEN payload to locals');
    });

    describe('validateAccessToken', () => {
        test.todo(
            'Should return with Invalid Token when client returns no access token'
        );
        test.todo(
            'Should set new token to cookie when old access token is invalid/expired'
        );
    });
});
