import keys from '../types/keys';

type subscription = {
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    keys?: keys | undefined;
};

export default subscription;
