import React, { useState } from 'react';
import { List, Typography, Box, Switch, FormControlLabel } from '@mui/material';
import { makeBooking } from '../services/bookingService';
import { Booking, BookingDetails, Room, Preferences } from '../types';
import { DateTime, Duration } from 'luxon';
import useCreateNotification from '../hooks/useCreateNotification';
import RoomCard from './RoomCard';
import NoRoomsCard from './NoRoomsCard';
import BookingDrawer from './BookingDrawer';

const SKIP_CONFIRMATION = true;

function disableBooking(bookings: Booking[]) {
    return bookings.length === 0 ? false : true;
}

export async function isFavorited(room: Room, pref?: Preferences) {
    try {
        if (pref === undefined || pref.fav_rooms === undefined) {
            return false;
        }
        if (pref.fav_rooms.includes(room.id)) {
            room.favorited = true;
        } else {
            room.favorited = false;
        }
    } catch {
        // add error notification
        room.favorited = false;
    }
}

function noAvailableRooms(rooms: Room[]) {
    return rooms.length === 0;
}

function availableForMinutes(room: Room | undefined) {
    if (room === undefined) {
        return 0;
    }
    let availableUntill = DateTime.fromISO(room.nextCalendarEvent).toUTC();
    let duration = Duration.fromObject(
        availableUntill.diffNow('minutes').toObject()
    );
    return Math.ceil(duration.minutes);
}

function isAvailableFor(minutes: number, room: Room) {
    return minutes <= availableForMinutes(room);
}

type BookingListProps = {
    bookingDuration: number;
    rooms: Room[];
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    updateData: () => void;
    preferences?: Preferences;
    setPreferences: (pref: Preferences) => void;
};

const AvailableRoomList = (props: BookingListProps) => {
    const {
        bookingDuration,
        rooms,
        bookings,
        setBookings,
        updateData,
        preferences,
        setPreferences
    } = props;

    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    const [bookingLoading, setBookingLoading] = useState('false');
    const [expandedFeaturesAll, setExpandedFeaturesAll] = useState(
        false as boolean
    );
    const [expandBookingDrawer, setexpandBookingDrawer] = useState(false);
    const [additionalDuration, setAdditionalDuration] = useState(0);
    const [availableMinutes, setAvailableMinutes] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(
        undefined
    );

    const handleAllFeaturesCollapse = () => {
        setExpandedFeaturesAll(!expandedFeaturesAll);
    };

    const handleAdditionaDurationChange = (additionalMinutes: number) => {
        setAdditionalDuration(additionalDuration + additionalMinutes);
    };

    const handleUntilHalf = () => {
        let halfTime = DateTime.now().toObject();
        if (halfTime.minute >= 30) {
            halfTime.hour = halfTime.hour + 1;
        }
        halfTime.minute = 30;
        halfTime.second = 0;
        halfTime.millisecond = 0;
        let bookUntil = DateTime.fromObject(halfTime);
        let durationToBookUntil = Duration.fromObject(
            bookUntil.diffNow(['minutes']).toObject()
        );
        setAdditionalDuration(
            Math.ceil(durationToBookUntil.minutes) - bookingDuration
        );
    };

    const handleUntilFull = () => {
        let fullTime = DateTime.now().toObject();
        fullTime.hour = fullTime.hour + 1;
        fullTime.minute = 0;
        fullTime.second = 0;
        fullTime.millisecond = 0;
        let bookUntil = DateTime.fromObject(fullTime);
        let durationToBookUntil = Duration.fromObject(
            bookUntil.diffNow(['minutes']).toObject()
        );
        setAdditionalDuration(
            Math.ceil(durationToBookUntil.minutes) - bookingDuration
        );
    };

    const handleUntilNextDurationChange = (additionalMinutes: number) => {
        setAdditionalDuration(additionalMinutes - bookingDuration);
    };

    const handleReservation = () => {
        book(selectedRoom, bookingDuration + additionalDuration);
        setAdditionalDuration(0);
        toggleDrawn(false);
    };

    const handleCardClick = (room: Room) => {
        setexpandBookingDrawer(true);
        setSelectedRoom(room);
        setAvailableMinutes(availableForMinutes(room));
    };

    const toggleDrawn = (newOpen: boolean) => {
        if (newOpen === false) {
            setSelectedRoom(undefined);
            setAdditionalDuration(0);
            setAvailableMinutes(0);
        }
        setexpandBookingDrawer(newOpen);
    };

    const book = (room: Room | undefined, duration: number) => {
        if (room === undefined) {
            return;
        }
        let bookingDetails: BookingDetails = {
            duration: duration,
            title: 'Reservation from Get a Room!',
            roomId: room.id
        };

        setBookingLoading(room.id);

        makeBooking(bookingDetails, SKIP_CONFIRMATION)
            .then((madeBooking) => {
                setBookings([madeBooking]);
                updateData();
                // update data after 2.5s, waits Google Calendar to
                // accept the booking.
                setTimeout(() => {
                    updateData();
                }, 2500);
                createSuccessNotification('Booking was succesful');
                setBookingLoading('false');
                document.getElementById('main-view-content')?.scrollTo(0, 0);
            })
            .catch(() => {
                createErrorNotification('Could not create booking');
                setBookingLoading('false');
            });
    };
    return (
        <Box id="available-room-list">
            <div id="drawer-container">
                <BookingDrawer
                    open={expandBookingDrawer}
                    toggle={toggleDrawn}
                    bookRoom={handleReservation}
                    room={selectedRoom}
                    duration={bookingDuration}
                    additionalDuration={additionalDuration}
                    availableMinutes={availableMinutes}
                    onAddTime={handleAdditionaDurationChange}
                    onAddTimeUntilHalf={handleUntilHalf}
                    onAddTimeUntilFull={handleUntilFull}
                    onAddTimeUntilNext={handleUntilNextDurationChange}
                />
            </div>

            <FormControlLabel
                label={
                    <Typography
                        sx={{
                            fontSize: '18px',
                            fontWeight: 'bold'
                        }}
                    >
                        Expand room features
                    </Typography>
                }
                control={<Switch onChange={handleAllFeaturesCollapse} />}
            />
            <Typography variant="subtitle1" textAlign="left" marginLeft="24px">
                Available rooms
            </Typography>
            <List>
                {noAvailableRooms(rooms) ? (
                    <NoRoomsCard />
                ) : (
                    rooms
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .map((room) =>
                            isAvailableFor(bookingDuration, room)
                                ? (isFavorited(room, preferences),
                                  (
                                      <li key={room.id}>
                                          <RoomCard
                                              room={room}
                                              onClick={handleCardClick}
                                              bookingLoading={bookingLoading}
                                              disableBooking={disableBooking(
                                                  bookings
                                              )}
                                              isSelected={selectedRoom === room}
                                              expandFeatures={
                                                  expandedFeaturesAll
                                              }
                                              preferences={preferences}
                                              setPreferences={setPreferences}
                                          />
                                      </li>
                                  ))
                                : null
                        )
                )}
            </List>
        </Box>
    );
};

export default AvailableRoomList;
