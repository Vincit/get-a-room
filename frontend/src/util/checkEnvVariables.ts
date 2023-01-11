export const checkEnvVariables = () => {
    const { REACT_APP_SERVER_KEY } = process.env;

    if (!REACT_APP_SERVER_KEY) {
        throw new Error('Application server key not set');
    }
};
