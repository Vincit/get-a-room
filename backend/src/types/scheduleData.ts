import { Types } from 'mongoose';

type ScheduleData = {
    endTime: string;
    roomId: string;
    _id?: Types.ObjectId;
};

export default ScheduleData;
