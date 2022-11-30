import { Schema } from 'mongoose';
import ScheduleDataArray from '../types/scheduleDataArray';
import ScheduleData from '../types/scheduleData';
import { type } from 'os';

export const scheduleDataSchema = new Schema<ScheduleDataArray>([
    {
        endTime: { required: false, type: String },
        roomId: { required: false, type: String }
    }
]);
