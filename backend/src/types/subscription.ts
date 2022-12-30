import keys from '../types/keys';

type Subscription = {
    endpoint: string;
    expirationTime?: number | undefined;
    keys: keys;
};

export default Subscription;
