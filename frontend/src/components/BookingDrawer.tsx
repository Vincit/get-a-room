import * as React from 'react';
import { Box, Button, styled, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DateTime } from 'luxon';

import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import { Room } from '../types';
import { getTimeLeft } from './util/TimeLeft';

const MIN_DURATION = 15;

function getName(room: Room | undefined) {
    return room === undefined ? '' : room.name;
}

function getNextCalendarEvent(room: Room | undefined) {
    return room === undefined ? '' : room.nextCalendarEvent;
}

function getTimeAvailable(room: Room | undefined) {
    return room === undefined ? '' : getTimeLeft(getNextCalendarEvent(room));
}

/**
 * Returns minutes as hours and minutes string.
 *
 * @param minutes
 * @returns Example "1 h 15 min"
 */
function minutesToSimpleString(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const min = minutes % 60;
    if (hours === 0) {
        return min + ' min';
    }
    if (min === 0) {
        return hours + ' h';
    }
    return hours + ' h ' + min + ' min';
}

/**
 *
 * @param minutes
 * @returns Example "(15.15 - 15.30)"
 */
function getBookingRangeText(minutes: number) {
    let startTime = DateTime.local();
    let endTime = startTime.plus({ minutes: minutes });
    return (
        '(' +
        startTime.toLocaleString(DateTime.TIME_24_SIMPLE) +
        ' - ' +
        endTime.toLocaleString(DateTime.TIME_24_SIMPLE) +
        ')'
    );
}

const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: '0px',
    width: '100%'
}));

const RowCentered = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '0px',
    width: '100%'
}));

const DrawerButton = styled(Button)(({ theme }) => ({
    textTransform: 'none',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50px',
    width: '100%',
    margin: '8px 0px'
}));

const DrawerButtonPrimary = styled(DrawerButton)(({ theme }) => ({
    color: theme.palette.background.default,
    background: theme.palette.text.primary,
    '&.Mui-disabled': {
        color: '#7d6b6a',
        background: theme.palette.background.default
    },
    '&:hover': {
        backgroundColor: theme.palette.text.primary
    }
}));

const DrawerButtonSecondary = styled(DrawerButton)(({ theme }) => ({
    color: theme.palette.text.primary,
    border: '1px solid',
    borderColor: theme.palette.text.primary,
    '&.Mui-disabled': {
        color: theme.palette.text.disabled,
        borderColor: theme.palette.text.disabled
    }
}));

const TimeText = styled(Typography)(() => ({
    fontSize: '24px',
    padding: '8px'
}));

const TimeTextBold = styled(TimeText)(() => ({
    fontWeight: 'bold'
}));

const AvailableText = styled(Typography)(() => ({
    fontSize: '16px',
    color: '#82716F'
}));

const SmallText = styled(Typography)(() => ({
    textTransform: 'uppercase',
    fontSize: '12px',
    lineHeight: '12px',
    fontWeight: 'bold',
    fontStyle: 'normal',
    margin: '24px 8px 0 0'
}));

const Spacer = styled('div')(() => ({
    padding: '8px'
}));

interface Props {
    open: boolean;
    toggle: (open: boolean) => void;
    bookRoom: () => void;
    duration: number;
    additionalDuration: number;
    onAddTime: (minutes: number) => void;
    availableMinutes: number;
    room?: Room;
}

const BookingDrawer = (props: Props) => {
    const {
        open,
        toggle,
        bookRoom,
        room,
        duration,
        additionalDuration,
        onAddTime,
        availableMinutes
    } = props;

    const handleAdditionalTime = (minutes: number) => {
        onAddTime(minutes);
    };

    const disableSubtractTime = () => {
        return duration + additionalDuration <= MIN_DURATION;
    };

    const disableAddTime = () => {
        return duration + additionalDuration + 15 > availableMinutes;
    };

    return (
        <SwipeableEdgeDrawer
            headerTitle={getName(room)}
            iconLeft={'AccessTime'}
            iconRight={'Close'}
            isOpen={open}
            toggle={toggle}
            disableSwipeToOpen={true}
        >
            <DrawerContent>
                <RowCentered>
                    <TimeTextBold>
                        {minutesToSimpleString(duration + additionalDuration)}
                    </TimeTextBold>
                    <TimeText>
                        {getBookingRangeText(duration + additionalDuration)}
                    </TimeText>
                </RowCentered>
                <RowCentered>
                    <AvailableText>
                        Available for {getTimeAvailable(room)}
                    </AvailableText>
                </RowCentered>
                <Row>
                    <SmallText>booking (rounded to next 5 min)</SmallText>
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
                    <DrawerButtonSecondary disabled>
                        Spaceholder
                    </DrawerButtonSecondary>
                    <Spacer />
                    <DrawerButtonSecondary disabled>
                        Spaceholder
                    </DrawerButtonSecondary>
                </Row>
                <Row>
                    <DrawerButtonSecondary disabled>
                        Spaceholder
                    </DrawerButtonSecondary>
                </Row>
                <Row>
                    <DrawerButtonPrimary
                        aria-label="book now"
                        data-testid="BookNowButton"
                        onClick={bookRoom}
                    >
                        Book now
                    </DrawerButtonPrimary>
                </Row>
            </DrawerContent>
        </SwipeableEdgeDrawer>
    );
};

export default BookingDrawer;
