import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import mongoose from 'mongoose';

import { authFilter, parseToken, validateAccessToken } from './authMiddleware';
import { checkEnvVariables } from './utils/checkEnvVariables';
import { gaxiosErrorHandler } from './utils/gaxiosErrorHandler';
import { getDatabaseUrl, setupVapidDetails } from './utils/config';

import { router as indexRouter } from './routes/index';
import { router as authRouter } from './routes/auth';
import { router as bookingRouter } from './routes/booking';
import { router as buildingRouter } from './routes/buildings';
import { router as preferenceRouter } from './routes/preferences';
import { router as roomRouter } from './routes/rooms';
import { router as nameRouter } from './routes/name';
import { router as notificationRouter } from './routes/notification';

const app = express();
const port = 8080;

checkEnvVariables();
setupVapidDetails();

mongoose
    .connect(getDatabaseUrl())
    .then(() => console.info('Mongo connection - OK'));

// Options for CORS
const corsOptions: CorsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
};

app.use(morgan('short'));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(parseToken().unless(authFilter));
app.use(validateAccessToken().unless(authFilter));

app.use('/api', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/buildings', buildingRouter);
app.use('/api/preferences', preferenceRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/name', nameRouter);
app.use('/api/notification', notificationRouter);
app.use(gaxiosErrorHandler());

app.listen(port, () => {
    console.log(`Get A Room! API listening at port ${port}`);
});
