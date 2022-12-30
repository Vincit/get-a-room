import { Request, Response } from 'express';
import { mocked } from 'ts-jest/utils';
import { badRequest } from '../../utils/responses';
import {
    getSubscription,
    updateSubscriptionToDatabase,
    unsubscribeFromNotification,
    scheduleNotification,
    pushNotification,
    cancelNotification,
    removePendingNotifications
} from './notifyBookingController';
import {
    addScheduleData,
    getUserWithSubject,
    removeScheduleData,
    removeScheduleDataArray,
    removeSubscription,
    updateSubscription
} from '../userController';
import Subscription from '../../types/subscription';
import User from '../../types/user';
import { DateTime } from 'luxon';
import { Types } from 'mongoose';
import schedule from 'node-schedule';
import webpush from 'web-push';

jest.mock('node-schedule');
jest.mock('web-push');
jest.mock('../../utils/responses');
jest.mock('../userController');

const mockUpdateSubscription = mocked(updateSubscription, false);
const mockRemoveSubscription = mocked(removeSubscription, false);
const mockGetUserWithSubject = mocked(getUserWithSubject, false);
const mockAddScheduleData = mocked(addScheduleData, false);
const mockRemoveScheduleData = mocked(removeScheduleData, false);
const mockRemoveScheduleDataArray = mocked(removeScheduleDataArray, false);
const mockScheduleJob = mocked(schedule.scheduleJob, false);
const mockSendNotification = mocked(webpush.sendNotification, false);

const mockedBadRequest = mocked(badRequest, false);

const mockSub = 'mockedSub';
const mockSubscription: Subscription = {
    endpoint: 'mockEndPoint',
    expirationTime: undefined,
    keys: {
        p256dh: 'mockP256dh',
        auth: 'mockAuth'
    }
};

const getMockedUser = (havePermission: boolean): User => {
    return {
        subject: mockSub,
        preferences: {},
        scheduleDataArray: [],
        notificationPermission: havePermission
    };
};

describe('notifyBookingController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        mockRequest = { body: {} };
        mockResponse = { locals: { sub: mockSub } };
        mockNext = jest.fn();
        jest.resetAllMocks();
    });

    describe('getSubscription', () => {
        beforeEach(() => {
            mockRequest = { body: {} };
            mockResponse = { locals: {} };
            mockNext = jest.fn();
            jest.resetAllMocks();
        });

        test('Should set value to res.locals', async () => {
            mockRequest.body.subscription = mockSubscription;

            await getSubscription()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            const locals = mockResponse.locals;
            expect(mockNext).toBeCalledWith();
            expect(locals?.subscription).toEqual(mockSubscription);
        });

        test('Should return badRequest when subscription is missing', async () => {
            await getSubscription()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).not.toBeCalledWith();
            expect(mockedBadRequest).toBeCalledWith(mockRequest, mockResponse);
        });
    });

    describe('updateSubscriptionToDatabase', () => {
        test('Should update subscription to database', async () => {
            mockResponse = {
                locals: {
                    sub: mockSub,
                    subscription: mockSubscription
                }
            };

            mockUpdateSubscription.mockResolvedValueOnce(getMockedUser(true));

            await updateSubscriptionToDatabase()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockUpdateSubscription).toBeCalledWith(
                mockSub,
                mockSubscription
            );
        });
    });

    describe('unsubscribeFromNotification', () => {
        test('Should clear subscription from database', async () => {
            mockResponse = { locals: { sub: mockSub } };

            mockRemoveSubscription.mockResolvedValueOnce(null);

            await unsubscribeFromNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockRemoveSubscription).toBeCalledTimes(1);
        });
    });

    describe('scheduleNotification', () => {
        const roomId = 'mockedRoomId';
        const endTime = DateTime.now().toUTC();

        beforeEach(() => {
            mockResponse = {
                locals: {
                    sub: mockSub,
                    roomId,
                    event: {
                        end: {
                            dateTime: endTime.toISO()
                        }
                    }
                }
            };
            mockNext = jest.fn();
            jest.resetAllMocks();
        });

        test('Should return early when no permission is set', async () => {
            mockGetUserWithSubject.mockResolvedValueOnce(getMockedUser(false));

            await scheduleNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockAddScheduleData).not.toBeCalled();
        });

        test('Should schedule notification', async () => {
            const id = new Types.ObjectId(42);
            const user: User = {
                ...getMockedUser(true),
                subscription: mockSubscription,
                scheduleDataArray: [
                    {
                        roomId: roomId,
                        endTime: endTime.toISO(),
                        _id: id
                    }
                ]
            };
            mockGetUserWithSubject.mockResolvedValueOnce(user);
            mockAddScheduleData.mockResolvedValueOnce(user);
            mockScheduleJob.mockResolvedValueOnce(true);

            await scheduleNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();

            expect(mockScheduleJob).toBeCalledWith(
                id.toString(),
                endTime.minus({ minutes: 5 }).toJSDate(),
                expect.any(Function)
            );
        });
    });

    describe('cancelNotification', () => {
        const roomId = 'mockedRoomId';
        const endTime = DateTime.now().toUTC();

        beforeEach(() => {
            mockResponse = {
                locals: {
                    sub: mockSub,
                    roomId,
                    event: {
                        end: {
                            dateTime: endTime.toISO()
                        }
                    }
                }
            };
            mockNext = jest.fn();
            jest.resetAllMocks();
        });

        test('Should return early when no schedule job is found', async () => {
            mockGetUserWithSubject.mockResolvedValueOnce(getMockedUser(false));

            await cancelNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockRemoveScheduleData).not.toBeCalled();
        });

        test('Should cancel the scheduled notification', async () => {
            const id = new Types.ObjectId(42);
            const user: User = {
                ...getMockedUser(true),
                subscription: mockSubscription,
                scheduleDataArray: [
                    {
                        roomId: roomId,
                        endTime: endTime.toISO(),
                        _id: id
                    }
                ]
            };
            mockGetUserWithSubject.mockResolvedValueOnce(user);

            await cancelNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockRemoveScheduleData).toBeCalledTimes(1);
        });
    });

    describe('removePendingNotifications', () => {
        test('Should remove all pending notifications', async () => {
            const roomId = 'mockedRoomId';
            const endTime = DateTime.now().toUTC();
            const id = new Types.ObjectId(42);
            const user: User = {
                ...getMockedUser(true),
                subscription: mockSubscription,
                scheduleDataArray: [
                    {
                        roomId: roomId,
                        endTime: endTime.toISO(),
                        _id: id
                    }
                ]
            };

            const mockCancelFn = jest.fn();
            schedule.scheduledJobs[id.toString()] = { cancel: mockCancelFn };
            mockGetUserWithSubject.mockResolvedValueOnce(user);

            await removePendingNotifications()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockCancelFn).toBeCalledTimes(1);
            expect(mockRemoveScheduleDataArray).toBeCalledTimes(1);
        });
    });

    describe('pushNotification', () => {
        const roomId = 'mockedRoomId';
        const endTime = DateTime.now().toUTC();

        beforeEach(() => {
            mockResponse = {
                locals: {
                    sub: mockSub,
                    roomId,
                    event: {
                        end: {
                            dateTime: endTime.toISO()
                        }
                    }
                }
            };
            mockNext = jest.fn();
            jest.resetAllMocks();
        });

        test('Should return early when no permission is set', async () => {
            mockGetUserWithSubject.mockResolvedValueOnce(getMockedUser(false));

            await pushNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockSendNotification).not.toBeCalled();
        });

        test('Should sent immediate notifications', async () => {
            const id = new Types.ObjectId(42);
            const user: User = {
                ...getMockedUser(true),
                subscription: mockSubscription,
                scheduleDataArray: [
                    {
                        roomId: roomId,
                        endTime: endTime.toISO(),
                        _id: id
                    }
                ]
            };

            mockGetUserWithSubject.mockResolvedValueOnce(user);

            await pushNotification()(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toBeCalledWith();
            expect(mockSendNotification).toBeCalledTimes(1);
        });
    });
});
