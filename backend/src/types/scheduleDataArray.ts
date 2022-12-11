/* type scheduleDataArray = Array<{
    scheduleData?: ScheduleData | undefined;
}>; */

type scheduleDataArray = [
    {
        endTime: string;
        roomId?: string | undefined;
        _id?: string | undefined;
    }
];

export default scheduleDataArray;
