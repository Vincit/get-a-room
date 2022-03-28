import { Request, Response, NextFunction } from 'express';
import * as responses from '../utils/responses';
import { getUserWithSubject } from './userController';

export const getName = () => {
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
            res.locals.name = user.name;
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
