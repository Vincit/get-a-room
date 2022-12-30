import { Request, Response, NextFunction } from 'express';
import * as responses from '../../utils/responses';
import * as schema from '../../utils/googleSchema';
import schedule from 'node-schedule';
import Subscription from '../../types/subscription';
import ScheduleData from '../../types/scheduleData';
import webpush from 'web-push';
import {
    updateSubscription,
    addScheduleData,
    getUserWithSubject,
    removeScheduleData,
    removeSubscription,
    removeScheduleDataArray
} from '../userController';
import { DateTime } from 'luxon';
import keys from '../../types/keys';

// PublicKey and privateKey
const publicKey = process.env.VAPID_PUBLIC_KEY as string;
const privateKey = process.env.VAPID_PRIVATE_KEY as string;
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
            const userSubscription: Subscription = req.body.subscription;

            if (!userSubscription) {
                return responses.badRequest(req, res);
            }

            res.locals.subscription = userSubscription;

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
export const updateSubscriptionToDatabase = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const subscription: Subscription = res.locals.subscription;

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

export const unsubscribeFromNotification = () => {
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

            await removeSubscription(sub);

            next();
        } catch (error) {
            next(error);
        }
    };
    return middleware;
};

/**
 * Schedule to push notification based on EventData
 * @returns
 */
export const scheduleNotification = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const eventData: schema.EventData = res.locals.event;
            const roomId: string = res.locals.roomId;
            const endTime = DateTime.fromISO(
                eventData.end?.dateTime as string
            ).toUTC();
            const endTimeISO = endTime.toISO();
            const scheduleData: ScheduleData = {
                endTime: endTimeISO,
                roomId: roomId
            };

            if (!sub) {
                return responses.badRequest(req, res);
            }

            let user = await getUserWithSubject(sub);
            // No permission for notifications - don't schedule one
            if (!user?.notificationPermission) {
                return next();
            }

            user = await addScheduleData(sub, scheduleData);
            if (!user) {
                return responses.internalServerError(req, res);
            }

            const subscription: Subscription | undefined = user?.subscription;
            if (!subscription) {
                return responses.internalServerError(req, res);
            }

            const uniqueId: string | undefined = user.scheduleDataArray
                .find(
                    (data) =>
                        data.roomId === roomId && data.endTime === endTimeISO
                )
                ?._id?.toString();

            if (!uniqueId) {
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
                endpoint: subscription.endpoint as string,
                expirationTime: subscription.expirationTime as number,
                keys: subscription.keys as keys
            };

            const payload = JSON.stringify({
                title: 'Your current meeting is going to end in 5 minutes!',
                body: 'Meeting End Notification'
            });

            const scheduleTime = endTime.minus({ minutes: 5 }).toJSDate();
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

/**
 * Cancels notification job that is associated with EventData
 * @returns
 */
export const cancelNotification = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const eventData: schema.EventData = res.locals.event;
            const roomId: string = res.locals.roomId;
            const sub = res.locals.sub;

            if (!eventData) {
                return responses.badRequest(req, res);
            }

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await getUserWithSubject(sub);
            if (!user) {
                return responses.internalServerError(req, res);
            }

            const endTime = DateTime.fromISO(eventData.end?.dateTime as string)
                .toUTC()
                .toISO();

            const jobId = user.scheduleDataArray.find(
                (data) => data.roomId === roomId && data.endTime === endTime
            )?._id;

            if (!jobId) {
                // User might have created the event without notification permission
                // which means there's no scheduleJob to be cancelled
                return next();
            }

            // Cancel the job
            const scheduleJob = schedule.scheduledJobs[jobId.toString()];
            // ScheduleJob is undefined when the notification job is already run.
            scheduleJob?.cancel();

            // Remove the job from database
            await removeScheduleData(sub, jobId);

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Cancels all pending notifications for the user
 * @returns
 */
export const removePendingNotifications = () => {
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
                return responses.badRequest(req, res);
            }

            user.scheduleDataArray.forEach((data) => {
                const scheduleJob =
                    schedule.scheduledJobs[data._id?.toString() ?? ''];
                scheduleJob?.cancel();
            });

            await removeScheduleDataArray(sub);

            next();
        } catch (error) {
            next(error);
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

            // No permission for notifications
            if (!user.notificationPermission) {
                return next();
            }

            const subscription: Subscription | undefined = user?.subscription;
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
                endpoint: subscription.endpoint as string,
                expirationTime: subscription.expirationTime as number,
                keys: subscription.keys as keys
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
