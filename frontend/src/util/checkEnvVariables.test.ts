import { checkEnvVariables } from './checkEnvVariables';

describe('checkEnvVariables', () => {
    beforeEach(() => {
        process.env = {
            ...process.env,
            REACT_APP_SERVER_KEY: 'Test server key'
        };
    });

    test('Should fail without application server key', () => {
        process.env.REACT_APP_SERVER_KEY = undefined;
        expect(() => {
            checkEnvVariables();
        }).toThrow('Application server key not set');
    });

    test('Should fail with empty application server key', () => {
        process.env.REACT_APP_SERVER_KEY = '';
        expect(() => {
            checkEnvVariables();
        }).toThrow('Application server key not set');
    });
});
