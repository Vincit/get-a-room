import { Schema } from 'mongoose';
import Subscription from '../types/subscription';

export const subscriptionSchema = new Schema<Subscription>(
    {
        endpoint: { required: false, type: String },
        expirationTime: { required: false, type: String },
        keys: { required: false, type: Object }
    },
    { _id: false }
);
