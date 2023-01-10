import { TokenPayload } from 'google-auth-library';
import { Types } from 'mongoose';
import UserModel from '../models/user';
import Preferences from '../types/preferences';
import Subscription from '../types/subscription';
import ScheduleData from '../types/scheduleData';
import User from '../types/user';

export function createUserFromTokenPayload(
    payload: TokenPayload,
    refreshToken?: string
) {
    const userBase = {
        subject: payload.sub,
        name: payload.name,
        refreshToken: refreshToken,
        preferences: {},
        scheduleDataArray: [],
        subscription: undefined,
        notificationPermission: false
    };
    const user = new UserModel(userBase);
    return user.save();
}

export function getUserWithSubject(subject: string): Promise<User | null> {
    return UserModel.findOne({ subject }).exec();
}

export function updateRefreshToken(
    subject: string,
    refreshToken: string
): Promise<User | null> {
    return UserModel.findOneAndUpdate({ subject }, { refreshToken }).exec();
}

export function updatePreferences(
    subject: string,
    preferences: Preferences
): Promise<User | null> {
    return UserModel.findOneAndUpdate({ subject }, { preferences }).exec();
}

export function updateSubscription(
    subject: string,
    subscription: Subscription
): Promise<User | null> {
    return UserModel.findOneAndUpdate(
        { subject },
        { subscription, notificationPermission: true }
    ).exec();
}

export function removeSubscription(subject: string): Promise<User | null> {
    return UserModel.findOneAndUpdate(
        { subject },
        { $unset: { subscription: null }, notificationPermission: false }
    ).exec();
}

export function addScheduleData(
    subject: string,
    scheduleData: ScheduleData
): Promise<User | null> {
    return UserModel.findOneAndUpdate(
        { subject },
        { $push: { scheduleDataArray: scheduleData } },
        // return the updated document, see: https://mongoosejs.com/docs/tutorials/findoneandupdate.html
        { new: true }
    ).exec();
}

export function removeScheduleData(
    subject: string,
    id: Types.ObjectId
): Promise<User | null> {
    return UserModel.findOneAndUpdate(
        { subject },
        { $pull: { scheduleDataArray: { _id: id } } }
    ).exec();
}

export function removeScheduleDataArray(subject: string): Promise<User | null> {
    return UserModel.findOneAndUpdate(
        { subject },
        { $set: { scheduleDataArray: [] } }
    ).exec();
}
