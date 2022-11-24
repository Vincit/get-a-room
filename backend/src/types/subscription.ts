import keys from '../types/keys';

type subscription = {
    endpoint?: string | null | undefined;
    expirationTime?: string | null | undefined;
    keys?: keys | undefined;
};

export default subscription;
