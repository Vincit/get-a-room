import Preferences from '../types/preferences';
import ScheduleData from '../types/scheduleData';
import Subcription from '../types/subscription';
import ScheduleDataArray from '../types/scheduleDataArray';

type User = {
    subject: string;
    preferences: Preferences;
    name?: string;
    refreshToken?: string;
    scheduleDataArray?: ScheduleDataArray;
    subscription?: Subcription;
};

export default User;
