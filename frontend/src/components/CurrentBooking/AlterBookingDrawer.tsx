import * as React from 'react';
import { Box, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShareIcon from '@mui/icons-material/Share';
import { DateTime } from 'luxon';

import SwipeableEdgeDrawer, {
    DrawerContent
} from '../SwipeableEdgeDrawer/SwipeableEdgeDrawer';
import { Booking, Room } from '../../types';
import {
    AvailableText,
    DrawerButtonPrimary,
    DrawerButtonSecondary,
    minutesToSimpleString,
    RowCentered,
    SmallText,
    Spacer,
    TimeTextBold
} from '../BookingDrawer/BookingDrawer';

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

const PreBookBoldRed = styled(TimeTextBold)(({ theme }) => ({
    color: theme.palette.error.main,
    fontSize: '16px'
}));

const AvailableTextGreen = styled(AvailableText)(({ theme }) => ({
    color: theme.palette.success.main
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
    endBooking: (booking: Booking) => void;
    cancelBooking: (booking: Booking) => void;
    duration: number;
    onAlterTime: (booking: Booking, minutes: number) => void;
    availableMinutes: number;
    booking?: Booking;
    bookingStared?: boolean | null;
}

const AlterBookingDrawer = (props: Props) => {
    const {
        open,
        toggle,
        endBooking,
        cancelBooking,
        booking,
        duration,
        onAlterTime,
        availableMinutes,
        bookingStared
    } = props;

    //For share button
    const title: string = 'My Web Share Adventures';
    const text: string = 'Hello World! I shared this content via Web Share';
    const url: string | undefined = booking?.meetingLink;

    const handleAdditionalTime = (minutes: number) => {
        if (booking === undefined) {
            return;
        }
        onAlterTime(booking, minutes);
    };

    const checkStartingTime = () => {
        if (booking) {
            const start = DateTime.fromISO(booking.startTime);
            if (start > DateTime.now()) {
                return start;
            } else {
                return DateTime.now();
            }
        }
        return DateTime.now();
    };

    const handleNextHalfHour = () => {
        const timeNow = checkStartingTime();
        const minutes = Math.floor(
            nextHalfHour().diff(timeNow, 'minute').minutes
        );
        handleAdditionalTime(minutes - duration);
    };

    const nextHalfHour = () => {
        const newEndTime = checkStartingTime().toObject();
        if (newEndTime.minute >= 30) {
            newEndTime.hour = newEndTime.hour + 1;
        }
        newEndTime.minute = 30;
        newEndTime.second = 0;
        newEndTime.millisecond = 0;

        return DateTime.fromObject(newEndTime);
    };

    const nextFullHour = () => {
        const newEndTime = checkStartingTime().toObject();
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
        const timeNow = checkStartingTime();
        const endTime = DateTime.fromISO(booking.endTime);
        const nextHalf = nextHalfHour();
        if (nextHalf <= endTime) {
            return false;
        }

        const minutes = Math.ceil(nextHalf.diff(timeNow, 'minute').minutes);
        return minutes > availableMinutes;
    };

    const handleNextFullHour = () => {
        const timeNow = checkStartingTime();
        const minutes = Math.floor(
            nextFullHour().diff(timeNow, 'minute').minutes
        );
        handleAdditionalTime(minutes - duration);
    };

    const disableNextFullHour = () => {
        if (booking === undefined) {
            return true;
        }
        const timeNow = checkStartingTime();
        const endTime = DateTime.fromISO(booking.room.nextCalendarEvent);
        const nextFull = nextFullHour();
        if (nextFull <= endTime) {
            return false;
        }

        const minutes = Math.ceil(nextFull.diff(timeNow, 'minute').minutes);

        return minutes > availableMinutes;
    };

    const disableSubtractTime = () => {
        return duration < MIN_DURATION;
    };

    const disableAddTime = () => {
        return availableMinutes < 15;
    };

    const handleUntilNextMeeting = () => {
        const timeNow = checkStartingTime();
        if (booking === undefined) {
            return;
        }
        if (timeNow.hour >= LAST_HOUR) {
            handleAdditionalTime(availableMinutes - 1);
        } else {
            const time1700 = DateTime.fromObject({ hour: LAST_HOUR });
            const endTime = checkStartingTime().plus({
                minutes: availableMinutes
            });
            if (endTime < time1700) {
                return handleAdditionalTime(availableMinutes);
            }
            const minutes = time1700.diff(
                DateTime.fromISO(booking?.endTime),
                'minutes'
            ).minutes;
            handleAdditionalTime(Math.floor(minutes));
        }
    };

    const handleEndBooking = () => {
        if (booking === undefined) {
            return;
        }
        endBooking(booking);
    };

    const handleCancelBooking = () => {
        if (booking === undefined) {
            return;
        }
        cancelBooking(booking);
    };

    const handleOnClick = (shareDetails: any) => {
        if (navigator.share) {
            navigator
                .share(shareDetails)
                .then(() => {
                    console.log('Successfully shared');
                })
                .catch((error) => {
                    console.error(
                        'Something went wrong sharing the link',
                        error
                    );
                });
        }
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
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <DrawerContent>
                    {!bookingStared && (
                        <RowCentered>
                            <PreBookBoldRed>
                                You have pre-booked the room
                            </PreBookBoldRed>
                        </RowCentered>
                    )}
                    <RowCentered>
                        <TimeTextBoldGreen>
                            {duration} min remaning
                        </TimeTextBoldGreen>
                    </RowCentered>
                    <RowCentered>
                        <AvailableTextGreen>
                            Room booked for you until{' '}
                            {getSimpleEndTime(booking)}
                        </AvailableTextGreen>
                    </RowCentered>
                    <RowCentered>
                        <AvailableText>
                            {minutesToSimpleString(availableMinutes)} more
                            available
                        </AvailableText>
                    </RowCentered>
                    <Row>
                        <DrawerButtonSecondary
                            onClick={() =>
                                handleOnClick({
                                    url,
                                    title,
                                    text
                                })
                            }
                        >
                            <ShareIcon /> <Spacer /> Share meeting
                        </DrawerButtonSecondary>
                    </Row>

                    <Row>
                        <SmallText>
                            alter booking (rounded to next 5 min)
                        </SmallText>
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
                            {nextHalfHour().toLocaleString(
                                DateTime.TIME_24_SIMPLE
                            )}
                        </DrawerButtonSecondary>
                        <Spacer />
                        <DrawerButtonSecondary
                            aria-label="next full hour"
                            onClick={handleNextFullHour}
                            disabled={disableNextFullHour()}
                        >
                            {nextFullHour().toLocaleString(
                                DateTime.TIME_24_SIMPLE
                            )}
                        </DrawerButtonSecondary>
                    </Row>
                    <Row>
                        <DrawerButtonSecondary
                            aria-label="until next meeting"
                            onClick={handleUntilNextMeeting}
                        >
                            Until next meeting
                        </DrawerButtonSecondary>
                    </Row>
                    {booking &&
                    DateTime.fromISO(booking.startTime) <= DateTime.now() ? (
                        <Row>
                            <DrawerButtonPrimary
                                aria-label="End booking"
                                data-testid="EndBookingButton"
                                onClick={handleEndBooking}
                            >
                                End Booking
                            </DrawerButtonPrimary>
                        </Row>
                    ) : (
                        <Row>
                            <DrawerButtonPrimary
                                aria-label="Cancel booking"
                                data-testid="CancelBookingButton"
                                onClick={handleCancelBooking}
                            >
                                Cancel Booking
                            </DrawerButtonPrimary>
                        </Row>
                    )}
                </DrawerContent>
            </Box>
        </SwipeableEdgeDrawer>
    );
};

export default AlterBookingDrawer;
