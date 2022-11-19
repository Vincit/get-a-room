import Preferences from '../types/preferences';
import ScheduleData from '../types/scheduleData';
import Subcription from '../types/subscription';

type User = {
    subject: string;
    preferences: Preferences;
    name?: string;
    refreshToken?: string;
    notification?: ScheduleData;
    subscription?: Subcription;
};

export default User;
