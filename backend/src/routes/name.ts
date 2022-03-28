import express from 'express';
import * as controller from '../controllers/nameController';

export const router = express.Router();

router.get('/', controller.getName(), (req, res) => {
    res.status(200).json({
        name: res.locals.name || {}
    });
});
