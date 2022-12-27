import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { deleteBooking } from '../controllers/booking/deleteBookingController';
import { getBooking } from '../controllers/booking/getBookingController';
import { simplifyEventData } from '../controllers/booking/bookingUtils';
import * as currentBookingsController from '../controllers/booking/currentBookingsController';
import * as makeBookingController from '../controllers/booking/makeBookingController';
import * as updateBookingController from '../controllers/booking/updateBookingController';
import * as notifyBookingController from '../controllers/booking/notifyBookingController';
import * as responses from '../utils/responses';

export const router = express.Router();

// Make a booking
router.post(
    '/',
    query('noConfirmation').toBoolean(true),
    makeBookingController.validateInput(),
    makeBookingController.checkRoomIsFree(),
    makeBookingController.makeBooking(),
    makeBookingController.checkRoomAccepted(), // This middleware slows things down :(
    makeBookingController.removeDeclinedEvent(),
    notifyBookingController.scheduleNotification(),
    simplifyEventData(),
    (req: Request, res: Response) => {
        res.status(201).json(res.locals.event);
    }
);

// Get the status of the current booking of the user
router.get(
    '/current',
    query('until').trim().escape().isISO8601().optional({ nullable: true }),
    (req, res, next) => {
        if (!validationResult(req).isEmpty()) {
            return responses.badRequest(req, res);
        }
        next();
    },
    currentBookingsController.getCurrentBookingsMiddleware(),
    currentBookingsController.simplifyAndFilterCurrentBookingsMiddleware(),
    currentBookingsController.addNextCalendarEventMiddleware(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.currentBookings);
    }
);

// Get details of a booking
router.get(
    '/:bookingId',
    getBooking(),
    simplifyEventData(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.event);
    }
);

// Delete a booking
router.delete(
    '/:bookingId',
    // Fetch original booking for notification cancellation
    getBooking(),
    deleteBooking(),
    notifyBookingController.cancelNotification(),
    (req: Request, res: Response) => {
        res.status(204).send('No Content');
    }
);

// Add time to a booking
router.patch(
    '/:bookingId/addTime',
    query('noConfirmation').toBoolean(true),
    body('timeToAdd').trim().escape().isNumeric(),
    getBooking(),
    updateBookingController.checkRoomIsFree(),
    notifyBookingController.cancelNotification(),
    updateBookingController.addTimeToBooking(),
    makeBookingController.checkRoomAccepted(),
    updateBookingController.rollBackDeclinedUpdate(),
    notifyBookingController.scheduleNotification(),
    simplifyEventData(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.event);
    }
);

// Change booking endTime to now
router.patch(
    '/:bookingId/endNow',
    getBooking(),
    notifyBookingController.cancelNotification(),
    updateBookingController.endBookingNow(),
    notifyBookingController.pushNotification(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.event);
    }
);

// Get the user subscription
router.post(
    '/notification',
    notifyBookingController.getSubscription(),
    notifyBookingController.updateSubscriptionToDatabase(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.subscription);
    }
);
