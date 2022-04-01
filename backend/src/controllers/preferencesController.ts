import { Request, Response, NextFunction } from 'express';

import { getUserWithSubject, updatePreferences } from './userController';
import * as responses from '../utils/responses';
import BuildingData from '../types/buildingData';
import Preferences from '../types/preferences';

/**
 * Gets current users preferences from DB
 * @returns
 */
export const getPreferences = () => {
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

            res.locals.preferences = user.preferences;
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Read body of preferences PUT request
 * @returns
 */
export const readPrefenceBody = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const building: BuildingData = req.body.building;
            const favoriteroom: Array<string> = req.body.fav_rooms;

            if (!building || !building.id || !building.name) {
                return responses.badRequest(req, res);
            }

            res.locals.buildingId = building.id;
            res.locals.buildingName = building.name;
            res.locals.fav_rooms = favoriteroom;
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};

/**
 * Updates the preferences to the database
 * @returns
 */
export const updatePreferencesToDatabase = () => {
    const middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const sub = res.locals.sub;
            const preferences: Preferences = {
                building: {
                    id: res.locals.buildingId,
                    name: res.locals.buildingName,
                    latitude: res.locals.latitude,
                    longitude: res.locals.longitude
                },
                fav_rooms: res.locals.favoriteroom
            };

            if (!sub) {
                return responses.badRequest(req, res);
            }

            const user = await updatePreferences(sub, preferences);

            if (!user) {
                return responses.internalServerError(req, res);
            }

            res.locals.preferences = preferences;
            next();
        } catch (err) {
            next(err);
        }
    };

    return middleware;
};
