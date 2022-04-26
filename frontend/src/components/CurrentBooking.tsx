import React, { useState } from 'react';
import { Box, List, Typography } from '@mui/material';
import { Booking, AddTimeDetails, Room } from '../types';
import {
    updateBooking,
    endBooking,
    deleteBooking
} from '../services/bookingService';
import useCreateNotification from '../hooks/useCreateNotification';
import RoomCard from './RoomCard';
import AlterBookingDrawer from './AlterBookingDrawer';
import { getTimeAvailableMinutes, getBookingTimeLeft } from './RoomCard';

const NO_CONFIRMATION = true;

function areBookingsFetched(bookings: Booking[]) {
    return Array.isArray(bookings) && bookings.length > 0;
}

type CurrentBookingProps = {
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    updateRooms: () => void;
    updateBookings: () => void;
};

const CurrentBooking = (props: CurrentBookingProps) => {
    const { bookings, updateBookings, setBookings, updateRooms } = props;

    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    const [selectedId, setSelectedId] = useState('false');
    const [bookingProcessing, setBookingProcessing] = useState('false');
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(
        undefined
    );
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);

    const toggleDrawer = (open: boolean) => {
        if (open === false) {
            setSelectedId('false');
        }
        setIsOpenDrawer(open);
    };

    const handleCardClick = (room: Room, booking?: Booking) => {
        setSelectedBooking(booking);
        setSelectedId(room.id);
        toggleDrawer(true);
    };

    // Add extra time for the reserved room
    const handleAddExtraTime = (booking: Booking, minutes: number) => {
        let addTimeDetails: AddTimeDetails = {
            timeToAdd: minutes
        };

        setBookingProcessing(booking.room.id);
        toggleDrawer(false);

        updateBooking(addTimeDetails, booking.id, NO_CONFIRMATION)
            .then((updatedBooking) => {
                setBookings([updatedBooking]);
                setBookingProcessing('false');
                // replace updated booking
                updateBookings();
                createSuccessNotification('Time added to booking');
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setBookingProcessing('false');
                createErrorNotification('Could not add time to booking');
            });
    };

    // End booking by changing the endtime to now
    const handleEndBooking = (booking: Booking) => {
        setBookingProcessing(booking.room.id);
        toggleDrawer(false);

        endBooking(booking.id)
            .then((endBooking) => {
                setBookingProcessing('false');
                // replace updated booking
                updateBookings();
                updateRooms();
                createSuccessNotification('Booking ended');
                window.scrollTo(0, 0);
            })
            .catch(() => {
                setBookingProcessing('false');
                createErrorNotification('Could not end booking');
            });
    };

    if (!areBookingsFetched(bookings)) {
        return null;
    }

    return (
        <Box id="current booking" marginTop={'24px'}>
            <div id="drawer-container">
                <AlterBookingDrawer
                    open={isOpenDrawer}
                    toggle={toggleDrawer}
                    duration={getBookingTimeLeft(selectedBooking)}
                    onAlterTime={handleAddExtraTime}
                    availableMinutes={getTimeAvailableMinutes(selectedBooking)}
                    booking={selectedBooking}
                    endBooking={handleEndBooking}
                />
            </div>

            <Typography variant="subtitle1" textAlign="left">
                booked to you
            </Typography>
            <List>
                {bookings.map((booking) => (
                    <li key={booking.id}>
                        <RoomCard
                            data-testid={'CurrentBookingCard'}
                            room={booking.room}
                            booking={booking}
                            onClick={handleCardClick}
                            bookingLoading={bookingProcessing}
                            disableBooking={false}
                            isSelected={booking.room.id === selectedId}
                            isReserved={true}
                            expandFeatures={true}
                        />
                    </li>
                ))}
            </List>
        </Box>
    );
};

export default CurrentBooking;
