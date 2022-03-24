import * as React from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DateTime, Duration } from 'luxon';

import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import { Booking, Room } from '../types';
import { getTimeLeft } from './util/TimeLeft';
import {
    AvailableText,
    DrawerButtonPrimary,
    DrawerButtonSecondary,
    minutesToSimpleString,
    RowCentered,
    SmallText,
    Spacer,
    TimeTextBold
} from './BookingDrawer';

const MIN_DURATION = 15;
const LAST_HOUR = 17;

function getName(room: Room | undefined) {
    return room === undefined ? '' : room.name;
}

function getSimpleEndTime(booking: Booking | undefined) {
    if (booking === undefined) {
        return;
    }
    let time = DateTime.fromISO(booking.endTime);
    return time.toLocaleString(DateTime.TIME_24_SIMPLE);
}

const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    width: '100%'
}));

const TimeTextBoldGreen = styled(TimeTextBold)(({ theme }) => ({
    color: theme.palette.success.main
}));

const AvailableTextGreen = styled(AvailableText)(({ theme }) => ({
    color: theme.palette.success.main
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
    endBooking: (booking: Booking) => void;
    duration: number;
    onAlterTime: (booking: Booking, minutes: number) => void;
    availableMinutes: number;
    booking?: Booking;
}

const AlterBookingDrawer = (props: Props) => {
    const {
        open,
        toggle,
        endBooking,
        booking,
        duration,
        onAlterTime,
        availableMinutes
    } = props;

    const handleAdditionalTime = (minutes: number) => {
        if (booking === undefined) {
            return;
        }
        onAlterTime(booking, minutes);
    };

    const handleNextHalfHour = () => {
        const timeNow = DateTime.now();
        const minutes = Math.floor(
            nextHalfHour().diff(timeNow, 'minute').minutes
        );
        handleAdditionalTime(minutes - duration);
    };

    const nextHalfHour = () => {
        const newEndTime = DateTime.now().toObject();
        if (newEndTime.minute >= 30) {
            newEndTime.hour = newEndTime.hour + 1;
        }
        newEndTime.minute = 30;
        newEndTime.second = 0;
        newEndTime.millisecond = 0;

        return DateTime.fromObject(newEndTime);
    };

    const nextFullHour = () => {
        const newEndTime = DateTime.now().toObject();
        newEndTime.hour = newEndTime.hour + 1;
        newEndTime.minute = 0;
        newEndTime.second = 0;
        newEndTime.millisecond = 0;

        return DateTime.fromObject(newEndTime);
    };

    const disableNextHalfHour = () => {
        if (booking === undefined) {
            return true;
        }
        const timeNow = DateTime.now();
        const endTime = DateTime.fromISO(booking.endTime);
        const nextHalf = nextHalfHour();
        if (nextHalf < endTime) {
            return false;
        }

        const minutes = Math.floor(nextHalf.diff(timeNow, 'minute').minutes);
        return minutes > availableMinutes;
    };

    const handleNextFullHour = () => {
        const timeNow = DateTime.now();
        const minutes = Math.floor(
            nextFullHour().diff(timeNow, 'minute').minutes
        );
        handleAdditionalTime(minutes - duration);
    };

    const disableNextFullHour = () => {
        if (booking === undefined) {
            return true;
        }
        const timeNow = DateTime.now();
        const endTime = DateTime.fromISO(booking.endTime);
        const nextFull = nextFullHour();
        if (nextFull < endTime) {
            return false;
        }

        const minutes = Math.floor(nextFull.diff(timeNow, 'minute').minutes);

        return minutes > availableMinutes;
    };

    const disableSubtractTime = () => {
        return duration < MIN_DURATION;
    };

    const disableAddTime = () => {
        return availableMinutes < 15;
    };

    const handleUntillNextMeeting = () => {
        const timeNow = DateTime.now();
        if (timeNow.hour >= LAST_HOUR) {
            handleAdditionalTime(availableMinutes - 1);
        } else {
            const time1700 = DateTime.fromObject({ hour: LAST_HOUR });
            const minutes = time1700.diff(timeNow, 'minutes').minutes;
            handleAdditionalTime(Math.floor(minutes - duration));
        }
    };

    const handleEndBooking = () => {
        if (booking === undefined) {
            return;
        }
        endBooking(booking);
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={getName(
                booking === undefined ? undefined : booking.room
            )}
            iconLeft={'AccessTime'}
            iconRight={'Close'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <DrawerContent>
                <RowCentered>
                    <TimeTextBoldGreen>
                        {duration} min remaning
                    </TimeTextBoldGreen>
                </RowCentered>
                <RowCentered>
                    <AvailableTextGreen>
                        Room booked for you untill {getSimpleEndTime(booking)}
                    </AvailableTextGreen>
                </RowCentered>
                <RowCentered>
                    <AvailableText>
                        {minutesToSimpleString(availableMinutes)} more available
                    </AvailableText>
                </RowCentered>

                <Row>
                    <SmallText>alter booking (rounded to next 5 min)</SmallText>
                </Row>
                <Row>
                    <DrawerButtonPrimary
                        aria-label="subtract 15 minutes"
                        data-testid="subtract15"
                        onClick={(e) => handleAdditionalTime(-15)}
                        disabled={disableSubtractTime()}
                    >
                        <RemoveIcon /> 15 min
                    </DrawerButtonPrimary>
                    <Spacer />
                    <DrawerButtonPrimary
                        aria-label="add 15 minutes"
                        data-testid="add15"
                        onClick={(e) => handleAdditionalTime(15)}
                        disabled={disableAddTime()}
                    >
                        <AddIcon /> 15 min
                    </DrawerButtonPrimary>
                </Row>
                <Row>
                    <DrawerButtonSecondary
                        aria-label="next half hour"
                        onClick={handleNextHalfHour}
                        disabled={disableNextHalfHour()}
                    >
                        {nextHalfHour().toLocaleString(DateTime.TIME_24_SIMPLE)}
                    </DrawerButtonSecondary>
                    <Spacer />
                    <DrawerButtonSecondary
                        aria-label="next full hour"
                        onClick={handleNextFullHour}
                        disabled={disableNextFullHour()}
                    >
                        {nextFullHour().toLocaleString(DateTime.TIME_24_SIMPLE)}
                    </DrawerButtonSecondary>
                </Row>
                <Row>
                    <DrawerButtonSecondary
                        aria-label="untill next meeting"
                        onClick={handleUntillNextMeeting}
                    >
                        Untill next meeting
                    </DrawerButtonSecondary>
                </Row>
                <Row>
                    <DrawerButtonPrimary
                        aria-label="End booking"
                        data-testid="EndBookingButton"
                        onClick={handleEndBooking}
                    >
                        End Booking
                    </DrawerButtonPrimary>
                </Row>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
};

export default AlterBookingDrawer;
