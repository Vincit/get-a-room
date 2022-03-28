import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Room, Booking } from '../types';
import TimeLeft from './util/TimeLeft';

import Group from '@mui/icons-material/People';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    CardActionArea,
    CircularProgress,
    getAlertUtilityClass,
    IconButton,
    styled
} from '@mui/material';
import { getTimeLeftMinutes } from './util/TimeLeft';
import { minutesToSimpleString } from './BookingDrawer';

function getName(room: Room) {
    return room.name;
}

function getCapacity(room: Room) {
    return room.capacity;
}

function getNextCalendarEvent(room: Room) {
    return room.nextCalendarEvent;
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
    return Math.floor(getTimeLeftMinutes(booking.endTime));
}

export function getTimeAvailableMinutes(booking: Booking | undefined) {
    if (booking === undefined) {
        return 0;
    }
    let timeLeft = getTimeLeftMinutes(booking.endTime);
    let availableFor = getTimeLeftMinutes(getNextCalendarEvent(booking.room));

    return Math.ceil(availableFor - timeLeft);
}

const GridContainer = styled(Box)(({ theme }) => ({
    container: true,
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '16px'
}));

const Row = styled(Box)(({ theme }) => ({
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

const CustomCard = styled(Card)({
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
    bookingLoading: string;
    disableBooking: boolean;
    isReserved?: boolean;
    isSelected: boolean;
    expandFeatures: boolean;
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
        expandFeatures
    } = props;

    const handleClick = () => {
        if (disableBooking) {
            return;
        }
        onClick(room, booking);
    };

    const handleFavoriteClick = () => {
        alert('clicked favorite \n' + room.id);
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

    return (
        <CustomCard data-testid="AvailableRoomListCard" style={cardStyle()}>
            <CardActionArea data-testid="CardActiveArea" onClick={handleClick}>
                <GridContainer>
                    <Row>
                        <Typography
                            data-testid="BookingRoomTitle"
                            variant="h3"
                            color="text.main"
                        >
                            {getName(room)}
                        </Typography>
                        <EndBox>
                            <Group />
                            <Typography fontWeight="bold">
                                {getCapacity(room)}
                            </Typography>
                        </EndBox>
                    </Row>

                    {isReserved ? (
                        <StartBox>
                            <CheckCircleIcon color="success" fontSize="small" />
                            <Typography
                                variant="subtitle1"
                                color="success.main"
                                margin={'0 0 0 5px'}
                            >
                                Booked to you for {getBookingTimeLeft(booking)}{' '}
                                minutes.
                            </Typography>
                        </StartBox>
                    ) : null}

                    <Row>
                        {isReserved ? (
                            <Typography>
                                Available for another{' '}
                                {minutesToSimpleString(
                                    getTimeAvailableMinutes(booking)
                                )}
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

                        <IconButton onClick={handleFavoriteClick}>
                            <FavoriteBorderIcon />
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
