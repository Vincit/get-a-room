import { Request, Response, NextFunction } from 'express';
import * as admin from '../googleAPI/adminAPI';
import * as schema from '../../utils/googleSchema';
import * as responses from '../../utils/responses';
import { simplifySingleRoomData } from '../roomController';
import { DateTime } from 'luxon';

/**
 * Simplify the event data to defined type
 * @returns
 */
export const simplifyEventData = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const event: schema.EventData = res.locals.event;
            const roomId: string = res.locals.roomId;
            const freeBusyResult = res.locals.freeBusyResult;

            if (!roomId) {
                return responses.internalServerError(req, res);
            }

            const roomResource = await admin.getSingleRoomData(
                res.locals.oAuthClient,
                roomId
            );
            const roomData = simplifySingleRoomData(roomResource);
            roomData.nextCalendarEvent = freeBusyResult;

            const start = DateTime.fromISO(event.start?.dateTime as string)
                .toUTC()
                .toISO();
            const end = DateTime.fromISO(event.end?.dateTime as string)
                .toUTC()
                .toISO();

            const htmlLink: string = event.htmlLink as string;

            const simpleEvent = {
                id: event.id,
                startTime: start,
                endTime: end,
                room: roomData,
                link: htmlLink
            };

            // Check if any of the properties are undefined
            if (
                !simpleEvent.id ||
                !simpleEvent.startTime ||
                !simpleEvent.endTime ||
                !simpleEvent.room ||
                !simpleEvent.link
            ) {
                return responses.internalServerError(req, res);
            }

            res.locals.event = simpleEvent;
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
