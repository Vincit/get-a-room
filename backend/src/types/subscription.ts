import keys from '../types/keys';

type Subscription = {
    endpoint?: string | undefined;
    expirationTime?: string | undefined;
    keys?: keys | undefined;
};

export default Subscription;
