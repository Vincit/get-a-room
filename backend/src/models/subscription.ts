import { Schema } from 'mongoose';
import subscription from '../types/subscription';

export const subscriptionSchema = new Schema<subscription>(
    {
        endpoint: { required: false, type: String },
        expirationTime: { required: false, type: String },
        keys: { required: false, type: Object }
    },
    { _id: false }
);