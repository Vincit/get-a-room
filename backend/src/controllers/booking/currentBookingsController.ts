import { DateTime } from 'luxon';
import _ from 'lodash';

import { Request, Response, NextFunction } from 'express';
import CurrentBookingData from '../../types/currentBookingData';
import * as schema from '../../utils/googleSchema';
import * as admin from '../googleAPI/adminAPI';
import * as calendar from '../googleAPI/calendarAPI';
import * as responses from '../../utils/responses';
import { OAuth2Client } from 'google-auth-library';
import { simplifyRoomData } from '../roomController';
import RoomData from '../../types/roomData';

/**
 * Gets all the users currently active bookings
 * @returns
 */

export const getCurrentBookingsMiddleware = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const client: OAuth2Client = res.locals.oAuthClient;

            const allCurrentAndFutureBookings: schema.EventsData =
                await calendar.getCurrentBookings(client);

            res.locals.currentBookings = allCurrentAndFutureBookings;

            if (!allCurrentAndFutureBookings.items) {
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
 * Simplifies and filters current bookings
 * @returns
 */
export const simplifyAndFilterCurrentBookingsMiddleware = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const allBookings: schema.Event[] =
                res.locals.currentBookings.items;

            const rooms: schema.CalendarResource[] = await admin.getRoomData(
                res.locals.oAuthClient
            );

            const simplifiedBookings = simplifyBookings(allBookings, rooms);

            res.locals.currentBookings = filterCurrentBookings(
                simplifiedBookings,
                res.locals.email
            );

            if (
                (res.locals.email as string)
                    .toLowerCase()
                    .includes('kimi.heinonen')
            ) {
                // TODO - DELETE ME this is only temporary
                const myBookings = allBookings.filter((n) =>
                    n?.organizer?.email?.toLowerCase().includes('kimi.heinonen')
                );
                // const roomsSimplified: RoomData[] = simplifyRoomData(rooms);
                const interestingRooms = rooms.filter(
                    (room) =>
                        room.buildingId?.toLowerCase().includes('turku') ||
                        room.buildingId?.toLowerCase().includes('ruoho') ||
                        room.resourceName?.toLowerCase().includes('turku') ||
                        room.resourceName?.toLowerCase().includes('ruoho')
                );
                console.log(JSON.stringify({ userBookings: myBookings }));
                console.log(JSON.stringify({ rooms: rooms }));
                console.log(
                    JSON.stringify({ interestingRooms: interestingRooms })
                );
                // console.log(
                //     JSON.stringify({ roomsSimplified: roomsSimplified })
                // );
                console.log(
                    JSON.stringify({
                        currentBookings: res.locals.currentBookings
                    })
                );
                // const logEntry = {
                //     severity: 'DEBUG',
                //     data: {
                //         userEmail: res.locals.email,
                //         allBookings: allBookings,
                //         rooms: rooms,
                //         simplifyBookings: simplifiedBookings,
                //         currentBookings: res.locals.currentBookings
                //     }
                // };
                // console.log(JSON.stringify(logEntry));
            }

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Adds nextCalendarEvent to current bookings
 * @returns
 */
export const addNextCalendarEventMiddleware = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const client = res.locals.oAuthClient;

            const currentBookings: CurrentBookingData[] =
                res.locals.currentBookings;

            let end: string;

            for (const currentBooking of currentBookings) {
                const currentBookingRoomId = [{ id: currentBooking.room?.id }];

                if (req.query.until) {
                    const startDt = DateTime.now().toUTC();
                    const endDt = DateTime.fromISO(
                        req.query.until as string
                    ).toUTC();
                    end = endDt.toISO();

                    if (endDt <= startDt) {
                        return responses.badRequest(req, res);
                    }
                } else {
                    end = DateTime.now().toUTC().endOf('day').toISO();
                }

                if (currentBooking.endTime) {
                    const result = await calendar.freeBusyQuery(
                        client,
                        currentBookingRoomId,
                        currentBooking.endTime,
                        end
                    );

                    currentBooking.room.nextCalendarEvent =
                        result[currentBooking.room.id as string];
                }
            }

            res.locals.currentBookings = currentBookings;

            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Simlpifies bookings
 * @returns simplified bookings
 * @param allBookings
 * @param rooms
 */
export const simplifyBookings = (
    allBookings: schema.Event[],
    rooms: schema.CalendarResource[]
): CurrentBookingData[] => {
    // Filters away all bookings that aren't running at the moment
    const roomsSimplified: RoomData[] = simplifyRoomData(rooms);

    const simplifiedBookings = allBookings.map((booking: schema.EventData) => {
        const attendees = booking.attendees;
        // TODO: Remove me
        const simpleEvent: CurrentBookingData = {
            id: booking.id,
            startTime: booking.start?.dateTime,
            endTime: booking.end?.dateTime,
            organizerEmail: booking?.organizer?.email,
            resourceStatus: '',
            room: {
                id: '',
                name: null,
                capacity: null,
                building: null,
                floor: null,
                features: null,
                nextCalendarEvent: null,
                location: null
            }
        };
        const bookingResource = attendees?.find(
            (attendee) => attendee.resource
        );
        simpleEvent.resourceStatus = bookingResource?.responseStatus;

        // Finds the room information and includes it inside the simpleEvent
        const room = roomsSimplified.find((room: RoomData) => {
            return room.location === bookingResource?.displayName;
        });

        if (room) {
            simpleEvent.room = room;
        }

        return simpleEvent;
    });

    return simplifiedBookings;
};

/**
 * Filters away every booking that is not currently running
 * @param simplifiedBookings List of simplified bookings
 * @param userEmail email of the user
 * @returns filtered bookings
 */
export const filterCurrentBookings = (
    simplifiedBookings: CurrentBookingData[],
    userEmail: string
): CurrentBookingData[] => {
    const now: string = getNowDateTime();

    // Filters away all bookings that aren't running at the moment
    const onlyCurrentlyRunningBookings: CurrentBookingData[] =
        simplifiedBookings.filter((booking: CurrentBookingData) => {
            if (!booking.startTime || !booking.endTime) {
                return false;
            }

            // Checks that the event has a room or other resource
            if (
                _.isEmpty(booking.room) ||
                booking.room.id === '' ||
                booking.room.name === ''
            ) {
                return false;
            }

            if (booking.organizerEmail !== userEmail) {
                return false;
            }
            return booking.startTime <= now && booking.endTime >= now;
        });

    return onlyCurrentlyRunningBookings;
};

export const getNowDateTime = (): string => {
    return DateTime.now().toUTC().toISO();
};
