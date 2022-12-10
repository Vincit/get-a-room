import ScheduleData from '../types/scheduleData';

/* type scheduleDataArray = Array<{
    scheduleData?: ScheduleData | undefined;
}>; */

type scheduleDataArray = [
    {
        endTime: string;
        roomId?: string | undefined;
    }
];

export default scheduleDataArray;
