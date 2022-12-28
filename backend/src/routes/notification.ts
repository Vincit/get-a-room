import express, { Request, Response } from 'express';
import * as notifyBookingController from '../controllers/booking/notifyBookingController';

export const router = express.Router();

// Subscribe to notifications
router.post(
    '/',
    notifyBookingController.getSubscription(),
    notifyBookingController.updateSubscriptionToDatabase(),
    (req: Request, res: Response) => {
        res.status(200).json(res.locals.subscription);
    }
);

// Unsubscribe from notifications
router.delete(
    '/',
    // TODO Remove all previous notifications!
    notifyBookingController.unsubscribeFromNotification(),
    (req: Request, res: Response) => {
        res.status(200).json({});
    }
);
