import { Schema } from 'mongoose';
import subcription from '../types/subscription';
import scheduleData from '../types/scheduleData';
import { type } from 'os';

export const subcriptionSchema = new Schema<subcription>(
    {
        endpoint: { required: true, type: String },
        expirationTime: { required: true, type: String },
        keys: { required: true, type: Object }
    },
    { _id: false }
);
