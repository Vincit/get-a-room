import { Schema } from 'mongoose';
import subcription from '../types/subscription';
import scheduleData from '../types/scheduleData';
import { type } from 'os';

export const scheduleDataSchema = new Schema<scheduleData>({
    endTime: { required: true, type: String },
    notification: { required: true, type: Object }
});
