import { Request, Response, NextFunction } from 'express';
import { DateTime } from 'luxon';
import { OAuth2Client } from 'google-auth-library';
import * as calendar from '../googleAPI/calendarAPI';
import * as responses from '../../utils/responses';
import * as schema from '../../utils/googleSchema';

/**
 * Add time to current booking
 * @returns
 */
export const addTimeToBooking = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const bookingId: string = req.params.bookingId;
            const client: OAuth2Client = res.locals.oAuthClient;
            const eventData: schema.EventData = res.locals.event;
            const timeToAdd: number = req.body.timeToAdd;

            if (!bookingId || bookingId.length !== 26) {
                return responses.badRequest(req, res);
            }

            // New end time
            const endTime = DateTime.fromISO(eventData.end?.dateTime as string)
                .plus({ minutes: timeToAdd })
                .toUTC()
                .toISO();

            // Keep responseStatus as accepted, because in case of
            // conflicts in Google calendar, adding time to the existing
            // booking should win over new bookings.
            const attendeeList: schema.EventAttendee[] = [
                {
                    email: res.locals.roomId,
                    resource: true,
                    responseStatus: 'accepted'
                },
                { email: res.locals.email, responseStatus: 'accepted' }
            ];

            const result = await calendar.updateEndTime(
                client,
                bookingId,
                endTime,
                attendeeList
            );
            res.locals.event = result;

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
/**
 * Change the booking end time to now
 */
export const endBookingNow = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const bookingId: string = req.params.bookingId;
            const client: OAuth2Client = res.locals.oAuthClient;

            if (!bookingId || bookingId.length !== 26) {
                return responses.badRequest(req, res);
            }

            // New end time
            const endTime = DateTime.now().toUTC().toISO();

            // Pretty hacky and there probably is a better way to do this
            const attendeeList: schema.EventAttendee[] = [
                {
                    email: res.locals.roomId,
                    resource: true,
                    responseStatus: 'needsAction'
                },
                { email: res.locals.email, responseStatus: 'accepted' }
            ];

            const result = await calendar.updateEndTime(
                client,
                bookingId,
                endTime,
                attendeeList
            );
            res.locals.event = result;

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Checks if the rooms if free before making a change
 */
export const checkRoomIsFree = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const client: OAuth2Client = res.locals.oAuthClient;
            const roomId: string = res.locals.roomId;
            const event: schema.EventData = res.locals.event;
            const timeToAdd: number = req.body.timeToAdd;

            // New end time
            const endTime = DateTime.fromISO(event.end?.dateTime as string)
                .plus({ minutes: timeToAdd })
                .toUTC();

            const freeBusyResult = (
                await calendar.freeBusyQuery(
                    client,
                    [{ id: roomId }],
                    event.end?.dateTime as string,
                    DateTime.now().endOf('day').toUTC().toISO()
                )
            )[roomId];

            if (!freeBusyResult) {
                return responses.internalServerError(req, res);
            }

            res.locals.freeBusyResult = freeBusyResult;
            const diff = DateTime.fromISO(freeBusyResult)
                .toUTC()
                .diff(endTime, 'seconds');

            // Allow difference of +- 15 seconds for conflict cases
            if (diff.seconds < 0) {
                return responses.custom(req, res, 409, 'Conflict');
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Roll back the update if required
 * @returns
 */
export const rollBackDeclinedUpdate = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        if (req.query?.noConfirmation || req.body.timeToAdd < 0) {
            return next();
        }

        try {
            const bookingId: string = req.params.bookingId;
            const client: OAuth2Client = res.locals.oAuthClient;
            const eventData: schema.EventData = res.locals.event;
            const timeToAdd: number = req.body.timeToAdd;
            const roomAccepted: boolean = res.locals.roomAccepted;

            if (roomAccepted) {
                return next();
            }

            // Original end time
            const endTime = DateTime.fromISO(eventData.end?.dateTime as string)
                .minus({ minutes: timeToAdd })
                .toUTC()
                .toISO();

            // Pretty hacky and there probably is a better way to do this
            const attendeeList: schema.EventAttendee[] = [
                {
                    email: res.locals.roomId,
                    resource: true,
                    responseStatus: 'needsAction'
                },
                { email: res.locals.email, responseStatus: 'accepted' }
            ];

            await calendar.updateEndTime(
                client,
                bookingId,
                endTime,
                attendeeList
            );

            return responses.custom(req, res, 409, 'Conflict');
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
