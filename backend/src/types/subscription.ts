import keys from '../types/keys';

type Subscription = {
    endpoint: string | undefined;
    expirationTime?: number | undefined;
    keys: keys | undefined;
};

export default Subscription;
