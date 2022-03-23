import React, { useState } from 'react';
import {
    Box,
    Card,
    CardActions,
    CardContent,
    Collapse,
    IconButton,
    List,
    Typography,
    Button,
    CircularProgress
} from '@mui/material';
import { Booking, AddTimeDetails, Room } from '../types';
import { ExpandLess, ExpandMore, Group } from '@mui/icons-material';
import {
    updateBooking,
    deleteBooking,
    endBooking
} from '../services/bookingService';
import TimeLeft, { getTimeLeftMinutes } from './util/TimeLeft';
import useCreateNotification from '../hooks/useCreateNotification';
import RoomCard from './RoomCard';
import AlterBookingDrawer from './AlterBookingDrawer';
import { getTimeAvailableMinutes } from './RoomCard';

function getBookingRoomName(booking: Booking) {
    return booking.room.name;
}

function getNextCalendarEvent(room: Room) {
    return room.nextCalendarEvent;
}

function areBookingsFetched(bookings: Booking[]) {
    return Array.isArray(bookings) && bookings.length > 0;
}

function getCapacity(booking: Booking) {
    return booking.room.capacity;
}

function getFeatures(booking: Booking) {
    let featureArray = booking.room.features;
    let featuresDisplay = [];

    // Format booking.room features
    if (featureArray) {
        for (let feature = 0; feature < featureArray.length; feature++) {
            featuresDisplay.push(featureArray[feature]);
            if (feature !== featureArray.length - 1) {
                featuresDisplay.push(', ');
            }
        }
    }

    return featuresDisplay;
}

function getBookingTimeLeft(booking: Booking | undefined) {
    if (booking === undefined) {
        return 0;
    }
    return Math.floor(getTimeLeftMinutes(booking.endTime));
}

type CurrentBookingProps = {
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    updateRooms: () => void;
    updateBookings: () => void;
};

const CurrentBooking = (props: CurrentBookingProps) => {
    const { bookings, setBookings, updateRooms, updateBookings } = props;

    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    const [expandedFeatures, setExpandedFeatures] = useState('false');
    const [bookingProcessing, setBookingProcessing] = useState('false');
    const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(
        undefined
    );
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);

    const handleFeaturesCollapse = (booking: Booking) => {
        setExpandedFeatures(
            expandedFeatures === booking.id ? 'false' : booking.id
        );
    };

    const toggleDrawer = (open: boolean) => {
        setIsOpenDrawer(open);
    };

    const handleCardClick = (room: Room, booking?: Booking) => {
        setSelectedBooking(booking);
        toggleDrawer(true);
    };

    // Get the next booking time in the reserved room
    const getNextCalendarEvent = (booking: Booking) => {
        return booking.room.nextCalendarEvent;
    };

    // Add extra time for the reserved room
    const handleAddExtraTime = (booking: Booking, minutes: number) => {
        let addTimeDetails: AddTimeDetails = {
            timeToAdd: minutes
        };

        setBookingProcessing(booking.room.id);
        setIsOpenDrawer(false);

        updateBooking(addTimeDetails, booking.id)
            .then((updatedBooking) => {
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

    // Delete booking and add the room back to the available rooms list LEGACY new end booking
    const handleDeleteBooking = (booking: Booking) => {
        setBookingProcessing(booking.id);

        deleteBooking(booking.id)
            .then(() => {
                setBookingProcessing('false');
                setBookings(bookings.filter((b) => b.id !== booking.id));
                createSuccessNotification('Booking deleted succesfully');

                updateRooms();
            })
            .catch(() => {
                setBookingProcessing('false');
                createErrorNotification('Could not delete booking');
            });
    };

    // End booking by changing the endtime to now
    const handleEndBooking = (booking: Booking) => {
        setBookingProcessing(booking.room.id);
        setIsOpenDrawer(false);

        endBooking(booking.id)
            .then((endBooking) => {
                setBookingProcessing('false');
                // replace updated booking
                updateBookings();
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
        <div id="current-booking">
            <AlterBookingDrawer
                open={isOpenDrawer}
                toggle={toggleDrawer}
                duration={getBookingTimeLeft(selectedBooking)}
                onAlterTime={handleAddExtraTime}
                availableMinutes={getTimeAvailableMinutes(selectedBooking)}
                booking={selectedBooking}
                endBooking={handleEndBooking}
            />

            <Typography variant="subtitle1" textAlign="left">
                booked to you
            </Typography>
            <List>
                {bookings.map((booking) => (
                    <li key={booking.id}>
                        <RoomCard
                            room={booking.room}
                            booking={booking}
                            onClick={handleCardClick}
                            bookingLoading={bookingProcessing}
                            disableBooking={false}
                            isSelected={false}
                            isReserved={true}
                            expandFeatures={true}
                        />
                    </li>
                ))}
            </List>
        </div>
    );
};

export default CurrentBooking;
