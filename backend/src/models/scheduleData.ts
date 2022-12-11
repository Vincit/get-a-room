import { Schema } from 'mongoose';
import ScheduleDataArray from '../types/scheduleDataArray';

export const scheduleDataSchema = new Schema<ScheduleDataArray>([
    {
        endTime: { required: false, type: String },
        roomId: { required: false, type: String }
    }
]);
