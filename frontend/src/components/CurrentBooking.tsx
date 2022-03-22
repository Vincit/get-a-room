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
import TimeLeft, { getTimeLeft } from './util/TimeLeft';
import useCreateNotification from '../hooks/useCreateNotification';
import RoomCard from './RoomCard';

function getBookingRoomName(booking: Booking) {
    return booking.room.name;
}

function getEndTime(booking: Booking) {
    return booking.endTime;
}

function convertH2M(time: string) {
    time = time.replace(' h ', ':');
    let timeParts = time.split(':');
    return Number(timeParts[0]) * 60 + Number(timeParts[1]);
}

function getBookingTimeLeft(booking: Booking) {
    let timeLeft = getTimeLeft(getEndTime(booking));
    let availableFor = getTimeLeft(getNextCalendarEvent(booking.room));

    // Slice min string away
    timeLeft = timeLeft.slice(0, -3);
    availableFor = availableFor.slice(0, -3);

    let timeLeftMin: number;
    let availableForMin: number;

    // Convert to h:mm or mm
    if (timeLeft.includes(' h ')) {
        timeLeftMin = convertH2M(timeLeft);
    } else {
        timeLeftMin = +timeLeft;
    }

    // Convert to h:mm or mm
    if (availableFor.includes(' h ')) {
        availableForMin = convertH2M(availableFor);
    } else {
        availableForMin = +availableFor;
    }

    return availableForMin - timeLeftMin;
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

    const handleFeaturesCollapse = (booking: Booking) => {
        setExpandedFeatures(
            expandedFeatures === booking.id ? 'false' : booking.id
        );
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

        setBookingProcessing(booking.id);

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
        setBookingProcessing(booking.id);

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
            <Typography py={2} textAlign="center" variant="h4">
                Your Booking
            </Typography>
            <List>
                {bookings.map((booking) => (
                    <li key={booking.id}>
                        <RoomCard
                            room={booking.room}
                            booking={booking}
                            onClick={function (room: Room): void {
                                throw new Error('Function not implemented.');
                            }}
                            bookingLoading={'false'}
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
