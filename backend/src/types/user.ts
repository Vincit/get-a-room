import { Types } from 'mongoose';
import Preferences from '../types/preferences';
import Subscription from '../types/subscription';
import ScheduleData from './scheduleData';

type User = {
    subject: string;
    preferences: Preferences;
    name?: string;
    refreshToken?: string;
    scheduleDataArray: Types.DocumentArray<ScheduleData>;
    subscription?: Subscription;
    notificationPermission: boolean;
};

export default User;
