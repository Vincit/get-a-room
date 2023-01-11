import { Schema } from 'mongoose';
import ScheduleData from '../types/scheduleData';

export const scheduleDataSchema = new Schema<ScheduleData>({
    endTime: { required: true, type: String },
    roomId: { required: true, type: String }
});
