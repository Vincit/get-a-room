import { Schema } from 'mongoose';
import Subscription from '../types/subscription';

export const subscriptionSchema = new Schema<Subscription>(
    {
        endpoint: { required: true, type: String },
        expirationTime: { required: false, type: String },
        keys: {
            required: true,
            type: {
                p256dh: String,
                auth: String
            }
        }
    },
    { _id: false }
);
