import mongoose, { Schema } from 'mongoose';
import { preferencesSchema } from './preferences';
import { scheduleDataSchema } from './scheduleData';
import { subscriptionSchema } from './subscription';
import User from '../types/user';

export const userSchema = new Schema<User>({
    subject: {
        type: String,
        required: [true, 'googleId is required'],
        unique: true,
        index: true
    },
    name: String,
    refreshToken: String,
    preferences: { required: true, type: preferencesSchema },
    scheduleDataArray: {
        required: false,
        type: [scheduleDataSchema]
    },
    subscription: {
        required: false,
        type: subscriptionSchema,
        default: {}
    },
    notificationPermission: {
        required: true,
        type: Boolean
    }
});

export default mongoose.model<User>('User', userSchema);
