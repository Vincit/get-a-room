import { Schema } from 'mongoose';
import ScheduleDataArray from '../types/scheduleDataArray';
import ScheduleData from '../types/scheduleData';
import { type } from 'os';

export const scheduleDataSchema = new Schema<ScheduleDataArray>([
    {
        scheduleData: { required: false }
    }
]);
