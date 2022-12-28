import Preferences from '../types/preferences';
import Subscription from '../types/subscription';
import ScheduleDataArray from '../types/scheduleDataArray';

type User = {
    subject: string;
    preferences: Preferences;
    name?: string;
    refreshToken?: string;
    scheduleDataArray?: ScheduleDataArray;
    subscription?: Subscription;
};

export default User;
