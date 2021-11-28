import express from 'express';

import * as controller from './auth/google';
import { createToken } from './auth/token';
import { createUserMiddleware } from './userMiddleware';

export const router = express.Router();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/', controller.redirectUrl(), (req, res) => {
    if (res.locals.authUrl) {
        return res.redirect(res.locals.authUrl);
    }

    res.clearCookie('TOKEN');
    return res.redirect(`${frontendUrl}/login`);
});

router.get(
    '/callback',
    controller.verifyCode(),
    controller.unpackPayload(),
    createUserMiddleware(),
    createToken(),
    (req, res) => {
        res.cookie('TOKEN', res.locals.token, {
            maxAge: 31556952000, // 1 year
            httpOnly: true
        });

        res.redirect(`${frontendUrl}/auth/success`);
    }
);
