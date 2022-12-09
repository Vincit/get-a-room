import ScheduleData from '../types/scheduleData';

/* type scheduleDataArray = Array<{
    scheduleData?: ScheduleData | undefined;
}>; */

type scheduleDataArray = [
    {
        endTime?: string | null | undefined;
        roomId?: string | undefined;
        _id?: string | undefined;
    }
];

export default scheduleDataArray;
