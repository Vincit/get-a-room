import { Request, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import * as calendar from '../googleAPI/calendarAPI';
import * as responses from '../../utils/responses';
import { OAuth2Client } from 'google-auth-library';
import scheduleLib from 'node-schedule';
import _ from 'lodash';

// PublicKey adn privateKey

const publicKey: string =
    'BEvPpDPDB543o1VH8QsnHJC2BW2znZqip3KJ4kxtFR98zetTY4TSozQIWllDfV8bnyZoQP_XCfuYC1G0C5WUNgU';
const privateKey: string = '2sy8ts8Z7yXDnB2E5EZhwfx3Y7nXcJRnhgT12SgDVOA';

/**
 * Receive and store the subscription
 * @returns
 */

export const saveSubscription = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const userSubcription: object = req.body.subscription;

            if (!userSubcription) {
                return responses.badRequest(req, res);
            }

            res.locals.subscription = userSubcription;

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
export const pushNotification = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
