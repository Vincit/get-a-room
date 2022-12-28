export const checkEnvVariables = () => {
    const {
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_CUSTOMER_ID,
        JWT_SECRET,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY
    } = process.env;

    if (!GOOGLE_CLIENT_ID) {
        throw new Error('Client id not set');
    }

    if (!GOOGLE_CLIENT_SECRET) {
        throw new Error('Client secret not set');
    }

    if (!GOOGLE_CUSTOMER_ID) {
        throw new Error('Workspace customer id not set');
    }

    if (!JWT_SECRET) {
        throw new Error('JWT secret not set');
    }

    if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key not set');
    }

    if (!VAPID_PRIVATE_KEY) {
        throw new Error('VAPID private key not set');
    }

    // Remove double quotes if there are any
    process.env.GOOGLE_CLIENT_ID = GOOGLE_CLIENT_ID.replace(/^"|"$/g, '');
    process.env.GOOGLE_CUSTOMER_ID = GOOGLE_CUSTOMER_ID.replace(/^"|"$/g, '');
    process.env.GOOGLE_CLIENT_SECRET = GOOGLE_CLIENT_SECRET.replace(
        /^"|"$/g,
        ''
    );

    console.info('Environment variables - OK');
};
