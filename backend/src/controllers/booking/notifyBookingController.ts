import { Request, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import * as calendar from '../googleAPI/calendarAPI';
import * as responses from '../../utils/responses';
import { OAuth2Client } from 'google-auth-library';
import schedule from 'node-schedule';
import Subscription from '../../types/subscription';
import ScheduleData from '../../types/scheduleData';
import webpush from 'web-push';
import {
    updateSubscription,
    updateScheduleData,
    getUserWithSubject
} from '../userController';
import _ from 'lodash';
import scheduleDataArray from '../../types/scheduleDataArray';

// PublicKey adn privateKey

const publicKey: string =
    'BEvPpDPDB543o1VH8QsnHJC2BW2znZqip3KJ4kxtFR98zetTY4TSozQIWllDfV8bnyZoQP_XCfuYC1G0C5WUNgU';
const privateKey: string = '2sy8ts8Z7yXDnB2E5EZhwfx3Y7nXcJRnhgT12SgDVOA';

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
export const updateScheduleDataToDatabse = () => {
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
        const minute: String = '00';
        const hour: String = '15';
        const scheduleTime = '*' + minute + hour + '***';
        try {
            const job = schedule.scheduleJob(scheduleTime, () => {
                const subscription = res.locals.subscription;
                const payload = JSON.stringify({
                    title: 'Meeting End Notification',
                    body: 'Your current meeting is going to an end in 5 minutes!'
                });
                webpush.sendNotification(subscription, payload);
            });

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
