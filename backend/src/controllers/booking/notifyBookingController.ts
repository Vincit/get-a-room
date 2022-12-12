import { Request, Response, NextFunction } from 'express';
import * as responses from '../../utils/responses';
import schedule from 'node-schedule';
import Subscription from '../../types/subscription';
import ScheduleData from '../../types/scheduleData';
import webpush from 'web-push';
import {
    updateSubscription,
    updateScheduleData,
    getUserWithSubject
} from '../userController';

// PublicKey adn privateKey

const publicKey =
    'BEvPpDPDB543o1VH8QsnHJC2BW2znZqip3KJ4kxtFR98zetTY4TSozQIWllDfV8bnyZoQP_XCfuYC1G0C5WUNgU';
const privateKey = '2sy8ts8Z7yXDnB2E5EZhwfx3Y7nXcJRnhgT12SgDVOA';

webpush.setVapidDetails('mailto:test@test.com', publicKey, privateKey);

/**
 * Receive and store the subscription
 * @returns
 */

export const getSubscription = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userSubcription: Subscription = req.body.subscription;

            if (!userSubcription) {
                return responses.badRequest(req, res);
            }

            res.locals.subscription = userSubcription;
            res.locals.endpoint = userSubcription.endpoint;
            res.locals.expirationTime = userSubcription.expirationTime;
            res.locals.keys = userSubcription.keys;

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Create the user subscription to the database
 * @returns
 */
export const updateSubscriptionToDatabse = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const subscription: Subscription = {
                endpoint: res.locals.endpoint,
                expirationTime: res.locals.expirationTime,
                keys: res.locals.keys
            };

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await updateSubscription(sub, subscription);

            if (!user) {
                return responses.internalServerError(req, res);
            } else {
                res.locals.subscription = subscription;
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Create the user subscription to the database
 * @returns
 */
export const updateScheduleDataToDatabase = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const scheduleData: ScheduleData = {
                endTime: res.locals.endTime,
                roomId: res.locals.roomId
            };

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await updateScheduleData(sub, scheduleData);

            if (!user) {
                return responses.internalServerError(req, res);
            } else {
                res.locals.scheduleData = scheduleData;
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

export const updateNewScheduleDataToDatabase = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const scheduleData: ScheduleData = res.locals.scheduleData;

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await updateScheduleData(sub, scheduleData);

            if (!user) {
                return responses.internalServerError(req, res);
            } else {
                res.locals.scheduleData = scheduleData;
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Schedule to push notification
 * @returns
 */
export const scheduleNotification = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // Time setting problem
            // Check the hours
            const minute: string = res.locals.endMinute;
            const hour: string = res.locals.endHour;

            const hourN: number = Number(hour) + 2;
            const minuteN: number = Number(minute) - 5;

            const scheduleTime = minuteN + ' ' + hourN + ' * * *';

            const sub = res.locals.sub;
            const user = await getUserWithSubject(sub);
            if (!user) {
                return responses.internalServerError(req, res);
            }

            const scheduleData: ScheduleData = res.locals.scheduleData;
            const options = {
                vapidDetails: {
                    subject: 'mailto:test@test.com',
                    publicKey: publicKey,
                    privateKey: privateKey
                },
                TTL: 60
            };

            const requestedRoomId = scheduleData.roomId;
            const requestedEndTime = scheduleData.endTime;

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const uniqueId: string | undefined = user.scheduleDataArray?.find(
                (data) =>
                    data.roomId === requestedRoomId &&
                    data.endTime === requestedEndTime
            )?._id;

            if (!uniqueId) {
                return responses.internalServerError(req, res);
            }
            // eslint-disable-next-line
            const subscription: any = user?.subscription;
            if (!subscription) {
                return responses.internalServerError(req, res);
            }

            const subscriptionToPush = {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                keys: subscription.keys
            };

            const payload = JSON.stringify({
                title: 'Your current meeting is going to end in 5 minutes!',
                body: 'Meeting End Notification'
            });

            const job = schedule.scheduleJob(
                `${uniqueId}`,
                scheduleTime,
                () => {
                    webpush.sendNotification(
                        subscriptionToPush,
                        payload,
                        options
                    );
                }
            );

            if (!job) {
                return responses.internalServerError(req, res);
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

export const updateEndTime = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            let scheduleData: ScheduleData = res.locals.scheduleData;

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await getUserWithSubject(sub);
            if (!user) {
                return responses.internalServerError(req, res);
            }

            const requestedRoomId = scheduleData.roomId;
            const requestedEndTime = scheduleData.endTime;
            const re2 = requestedEndTime.split(':');
            const re3 = re2[0] + ':' + re2[1] + ':' + '00.000Z';

            const uniqueId = user.scheduleDataArray?.find(
                (data) =>
                    data.roomId === requestedRoomId && data.endTime === re3
            )?._id;

            if (!uniqueId) {
                return responses.internalServerError(req, res);
            }
            const scheduleJob = schedule.scheduledJobs[uniqueId];
            scheduleJob.cancel();

            const reEndTime = res.locals.newEndTime.split(':');
            const reEndTime2 =
                reEndTime[0] + ':' + reEndTime[1] + ':' + '00.000Z';
            scheduleData = { endTime: reEndTime2, roomId: requestedRoomId };

            res.locals.scheduleData = scheduleData;

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Cancel a scedule job if user cancel a meeting
 * @returns
 */
export const cancelSceduleJob = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const scheduleData: ScheduleData = res.locals.scheduleData;

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await getUserWithSubject(sub);
            if (!user) {
                return responses.internalServerError(req, res);
            }

            const requestedRoomId = scheduleData.roomId;
            const requestedEndTime = scheduleData.endTime;
            const re2 = requestedEndTime.split(':');
            const re3 = re2[0] + ':' + re2[1] + ':' + '00.000Z';

            const uniqueId = user.scheduleDataArray?.find(
                (data) =>
                    data.roomId === requestedRoomId && data.endTime === re3
            )?._id;

            if (!uniqueId) {
                return responses.internalServerError(req, res);
            }
            const scheduleJob = schedule.scheduledJobs[uniqueId];
            scheduleJob.cancel();

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Send an immediate notification
 * @returns
 */
export const pushNotification = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await getUserWithSubject(sub);
            if (!user) {
                return responses.internalServerError(req, res);
            }
            // eslint-disable-next-line
            const subscription: any = user?.subscription;
            if (!subscription) {
                return responses.internalServerError(req, res);
            }

            const options = {
                vapidDetails: {
                    subject: 'mailto:test@test.com',
                    publicKey: publicKey,
                    privateKey: privateKey
                },
                TTL: 60
            };

            const subscriptionToPush = {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                keys: subscription.keys
            };

            const payload = JSON.stringify({
                title: 'Your current meeting ends now!',
                body: 'Meeting End Notification'
            });

            webpush.sendNotification(subscriptionToPush, payload, options);

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
