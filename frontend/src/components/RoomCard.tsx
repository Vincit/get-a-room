import * as React from 'react';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Room, Booking } from '../types';
import TimeLeft from './util/TimeLeft';

import Group from '@mui/icons-material/People';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CardActionArea, CircularProgress, styled } from '@mui/material';
import { getTimeLeft } from './util/TimeLeft';

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

type RoomCardProps = {
    room: Room;
    booking?: Booking;
    onClick: (room: Room) => void;
    bookingLoading: string;
    disableBooking: boolean;
    isReserved?: boolean;
    isSelected: boolean;
    expandFeatures: boolean;
};

const RoomCard = (props: RoomCardProps) => {
    const {
        room,
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
        onClick(room);
    };

    return (
        <CustomCard
            data-testid="AvailableRoomListCard"
            style={isSelected ? selectedVars : defaultVars}
        >
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
                                Booked to you for{' '}
                                {getTimeLeft(getNextCalendarEvent(room))}
                            </Typography>
                        </StartBox>
                    ) : null}

                    <Row>
                        <TimeLeft
                            timeLeftText="Available for "
                            endTime={getNextCalendarEvent(room)}
                        />
                        {bookingLoading === room.id ? (
                            <CircularProgress color="primary" />
                        ) : null}
                        <FavoriteBorderIcon />
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
