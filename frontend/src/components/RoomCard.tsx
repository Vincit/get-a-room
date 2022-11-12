import * as React from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Room, Booking, Preferences } from '../types';
import { updatePreferences } from '../services/preferencesService';

import TimeLeft from './util/TimeLeft';

import Group from '@mui/icons-material/People';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import {
    Card,
    CardActionArea,
    CircularProgress,
    styled,
    IconButton
} from '@mui/material';
import { getTimeLeftMinutes } from './util/TimeLeft';
import { minutesToSimpleString } from './BookingDrawer';
import { DateTime } from 'luxon';
import { roomFreeIn } from './BusyRoomList';
import useCreateNotification from '../hooks/useCreateNotification';
import { sendNotification } from '../services/NotificationManager';

function getName(room: Room) {
    return room.name;
}

function getCapacity(room: Room) {
    return room.capacity;
}

function getNextCalendarEvent(room: Room) {
    return room.nextCalendarEvent;
}

function isFavorited(room: Room, pref?: Preferences) {
    if (pref === undefined) {
        return false;
    }
    const favoriteRooms = pref.fav_rooms;
    if (Array.isArray(favoriteRooms)) {
        return favoriteRooms.includes(room.id);
    }
    return false;
}

function getFeatures(room: Room) {
    let features = room.features;
    let featuresDisplay = [];

    // Format room features
    if (features) {
        for (let i = 0; i < features.length; i++) {
            featuresDisplay.push(features[i]);
            if (i !== features.length - 1) {
                featuresDisplay.push(', ');
            }
        }
    }
    return featuresDisplay;
}

export function getBookingTimeLeft(booking: Booking | undefined) {
    if (booking === undefined) {
        return 0;
    }
    return Math.ceil(getTimeLeftMinutes(booking.endTime)) + 2;
}

export function getTimeAvailableMinutes(booking: Booking | undefined) {
    if (booking === undefined) {
        return 0;
    }
    let timeLeft = getTimeLeftMinutes(booking.endTime);
    let availableFor = getTimeLeftMinutes(getNextCalendarEvent(booking.room));

    return Math.ceil(availableFor - timeLeft);
}

function busyAvailableFor(room: Room) {
    let end = DateTime.now().endOf('day');
    let start = DateTime.now();

    if (Array.isArray(room.busy) && room.busy.length > 0) {
        start = DateTime.fromISO(room.busy[0].end as string);
        if (room.busy.length > 1) {
            end = DateTime.fromISO(room.busy[1].start as string);
        }
    }
    const minutes = end.diff(start, 'minutes').minutes;
    return Math.round(minutes);
}

export const GridContainer = styled(Box)(({ theme }) => ({
    container: true,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px'
}));

export const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    margin: '8px'
}));

const EndBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
}));

const StartBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: '8px'
}));

export const CustomCard = styled(Card)({
    margin: '8px  0 24px 0',
    borderRadius: '10px',
    boxShadow:
        '-2px -2px 4px rgba(255, 255, 255, 0.6), 4px 4px 4px rgba(205, 197, 197, 0.25)',
    border: 'var(--border)'
});

const defaultVars = {
    '--border': 'none'
} as React.CSSProperties;

const selectedVars = {
    '--border': '1px solid #443938'
} as React.CSSProperties;

const selectedReservedVars = {
    '--border': '2px solid #219653'
} as React.CSSProperties;

type RoomCardProps = {
    room: Room;
    booking?: Booking;
    onClick: (room: Room, booking?: Booking) => void;
    preferences?: Preferences;
    setPreferences: (pref: Preferences) => void;
    bookingLoading: string;
    disableBooking: boolean;
    isReserved?: boolean;
    isSelected: boolean;
    expandFeatures: boolean;
    isBusy?: boolean;
};

const RoomCard = (props: RoomCardProps) => {
    const {
        room,
        booking,
        onClick,
        bookingLoading,
        disableBooking,
        isReserved,
        isSelected,
        expandFeatures,
        preferences,
        setPreferences,
        isBusy
    } = props;

    const handleClick = () => {
        if (disableBooking) {
            return;
        }
        onClick(room, booking);
    };

    const handleFavoriteClick = (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
        event.stopPropagation();
        event.preventDefault();

        if (preferences === undefined) {
            console.log('undefined');
            return;
        }
        let fav_rooms_now = preferences.fav_rooms as Array<string>;
        const newPrefs = preferences;

        if (isFavorited(room, preferences)) {
            fav_rooms_now = fav_rooms_now.filter(
                (roomId) => roomId !== room.id
            );
            newPrefs.fav_rooms = fav_rooms_now;

            updatePreferences(newPrefs)
                .then((savedPreferences) => {
                    setPreferences(savedPreferences);
                })
                .catch((err) => {
                    console.log(err);
                });
        } else {
            fav_rooms_now.push(room.id);
            newPrefs.fav_rooms = fav_rooms_now;
            updatePreferences(newPrefs)
                .then((savedPreferences) => {
                    setPreferences(savedPreferences);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };

    const cardStyle = () => {
        if (isSelected && isReserved) {
            return selectedReservedVars;
        }
        if (isSelected) {
            return selectedVars;
        }

        return defaultVars;
    };

    //a variable to store how much time is left on the booking.
    const duration = React.useMemo(() => {
        return getBookingTimeLeft(booking);
    }, [Date.now(), booking]); //eslint-disable-line

    const { createNotificationWithType } = useCreateNotification();

    //send notification when there is 5 minutes left on the booking.
    useEffect(() => {
        if (duration === 15 || duration === 14) {
            sendNotification(room, duration);
        }
    }, [duration]); //eslint-disable-line

    return (
        <CustomCard data-testid="AvailableRoomListCard" style={cardStyle()}>
            <CardActionArea
                data-testid="CardActiveArea"
                onClick={handleClick}
                component={'div'}
            >
                <GridContainer>
                    <Row>
                        <Typography
                            data-testid="BookingRoomTitle"
                            variant="h3"
                            color={isBusy ? 'text.disabled' : 'text.main'}
                        >
                            {getName(room)}
                        </Typography>
                        <EndBox>
                            <Group color={isBusy ? 'disabled' : 'inherit'} />
                            <Typography
                                fontWeight="bold"
                                color={isBusy ? 'text.disabled' : 'text.main'}
                            >
                                {getCapacity(room)}
                            </Typography>
                        </EndBox>
                    </Row>

                    {isReserved ? (
                        booking?.resourceStatus === 'accepted' ? (
                            <StartBox>
                                <CheckCircleIcon
                                    color="success"
                                    fontSize="small"
                                />
                                <Typography
                                    variant="subtitle1"
                                    color="success.main"
                                    margin={'0 0 0 5px'}
                                >
                                    Booked to you for {duration} minutes.
                                </Typography>
                            </StartBox>
                        ) : (
                            <StartBox>
                                <PendingIcon color="warning" fontSize="small" />
                                <Typography
                                    variant="subtitle1"
                                    color="warning.main"
                                    margin={'0 0 0 5px'}
                                >
                                    Waiting Google calendar confirmation.
                                </Typography>
                            </StartBox>
                        )
                    ) : null}

                    <Row>
                        {isReserved ? (
                            <Typography>
                                Available for another{' '}
                                {minutesToSimpleString(
                                    getTimeAvailableMinutes(booking)
                                )}
                            </Typography>
                        ) : isBusy ? (
                            <Typography
                                variant="body1"
                                color="text.disabled"
                                align="left"
                            >
                                Available in <b>{roomFreeIn(room)} minutes</b>{' '}
                                for{' '}
                                {minutesToSimpleString(busyAvailableFor(room))}
                            </Typography>
                        ) : (
                            <TimeLeft
                                timeLeftText="Available for "
                                endTime={getNextCalendarEvent(room)}
                            />
                        )}
                        {bookingLoading === room.id ? (
                            <CircularProgress color="primary" />
                        ) : null}

                        <IconButton
                            aria-label="favorite room"
                            onClick={handleFavoriteClick}
                        >
                            {isFavorited(room, preferences) ? (
                                <Favorite sx={{ color: '#F04E30' }} />
                            ) : (
                                <FavoriteBorderIcon
                                    color={isBusy ? 'disabled' : 'inherit'}
                                />
                            )}
                        </IconButton>
                    </Row>

                    {expandFeatures ? (
                        <Row>
                            <Typography variant="body1" color="text.disabled">
                                {getFeatures(room)}
                            </Typography>
                        </Row>
                    ) : null}
                </GridContainer>
            </CardActionArea>
        </CustomCard>
    );
};

export default RoomCard;
