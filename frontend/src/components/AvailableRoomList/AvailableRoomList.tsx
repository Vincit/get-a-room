import React, { useState } from 'react';
import { List, Typography, Box, styled, ToggleButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { makeBooking } from '../../services/bookingService';
import { Booking, BookingDetails, Room, Preferences } from '../../types';
import { DateTime, Duration } from 'luxon';
import useCreateNotification from '../../hooks/useCreateNotification';
import RoomCard from '../RoomCard/RoomCard';
import NoRoomsCard from '../RoomCard/NoRoomsCard';
import BookingDrawer from '../BookingDrawer/BookingDrawer';
import TimePickerDrawer from '../TimePickerDrawer/TimePickerDrawer';
const SKIP_CONFIRMATION = true;

const TimePickerButton = styled(ToggleButton)(() => ({
    padding: '8px 16px',
    backgroundColor: '#ce3b20',
    color: 'white',

    '&:hover': {
        backgroundColor: '#ce3b20',
        opacity: '90%'
    }
}));

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

function availableForMinutes(room: Room | undefined, startingTime: String) {
    if (room === undefined) {
        return 0;
    }

    let availableUntil = DateTime.fromISO(room.nextCalendarEvent).toUTC();
    let duration;

    if (startingTime === 'Now') {
        duration = Duration.fromObject(
            availableUntil.diffNow('minutes').toObject()
        );
    } else {
        const h = Number(startingTime.split(':')[0]);
        const m = Number(startingTime.split(':')[1]);
        const dt = DateTime.now().set({ hour: h, minute: m });
        duration = Duration.fromObject(
            availableUntil.diff(dt, 'minutes').toObject()
        );
    }
    return Math.ceil(duration.minutes);
}

function isAvailableFor(minutes: number, room: Room, startingTime: String) {
    return minutes <= availableForMinutes(room, startingTime);
}

type BookingListProps = {
    bookingDuration: number;
    rooms: Room[];
    bookings: Booking[];
    setBookings: (bookings: Booking[]) => void;
    updateData: () => void;
    expandedFeaturesAll: boolean;
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
        expandedFeaturesAll,
        preferences,
        setPreferences
    } = props;
    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    const [bookingLoading, setBookingLoading] = useState('false');

    const [expandBookingDrawer, setexpandBookingDrawer] = useState(false);
    const [additionalDuration, setAdditionalDuration] = useState(0);
    const [availableMinutes, setAvailableMinutes] = useState(0);
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(
        undefined
    );

    const [expandTimePickerDrawer, setExpandTimePickerDrawer] = useState(false);
    const [startingTime, setStartingTime] = useState<string>('Now');

    const handleAdditionaDurationChange = (additionalMinutes: number) => {
        setAdditionalDuration(additionalDuration + additionalMinutes);
    };

    const handleUntilHalf = () => {
        let halfTime =
            startingTime === 'Now'
                ? DateTime.now().toObject()
                : DateTime.fromObject({
                      hour: Number(startingTime.split(':')[0]),
                      minute: Number(startingTime.split(':')[1]),
                      second: 0
                  })
                      .plus({ minutes: bookingDuration })
                      .toObject();
        if (halfTime.minute >= 30) {
            halfTime.hour = halfTime.hour + 1;
        }
        halfTime.minute = 30;
        halfTime.second = 0;
        halfTime.millisecond = 0;
        let bookUntil = DateTime.fromObject(halfTime);
        let durationToBookUntil =
            startingTime === 'Now'
                ? Duration.fromObject(bookUntil.diffNow(['minutes']).toObject())
                : Duration.fromObject(
                      bookUntil
                          .diff(
                              DateTime.fromObject({
                                  hour: Number(startingTime.split(':')[0]),
                                  minute: Number(startingTime.split(':')[1]),
                                  second: 0
                              }),
                              ['minutes']
                          )
                          .toObject()
                  );
        setAdditionalDuration(
            Math.ceil(durationToBookUntil.minutes) - bookingDuration
        );
    };

    const handleUntilFull = () => {
        let fullTime =
            startingTime === 'Now'
                ? DateTime.now().toObject()
                : DateTime.fromObject({
                      hour: Number(startingTime.split(':')[0]),
                      minute: Number(startingTime.split(':')[1]),
                      second: 0
                  })
                      .plus({ minutes: bookingDuration })
                      .toObject();
        fullTime.hour = fullTime.hour + 1;
        fullTime.minute = 0;
        fullTime.second = 0;
        fullTime.millisecond = 0;
        let bookUntil = DateTime.fromObject(fullTime);
        let durationToBookUntil =
            startingTime === 'Now'
                ? Duration.fromObject(bookUntil.diffNow(['minutes']).toObject())
                : Duration.fromObject(
                      bookUntil
                          .diff(
                              DateTime.fromObject({
                                  hour: Number(startingTime.split(':')[0]),
                                  minute: Number(startingTime.split(':')[1]),
                                  second: 0
                              }),
                              ['minutes']
                          )
                          .toObject()
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
        setAvailableMinutes(availableForMinutes(room, startingTime));
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
        const currentTime = DateTime.now();
        const h =
            currentTime.hour < 10
                ? `0${currentTime.hour}`
                : `${currentTime.hour}`;
        const m =
            currentTime.minute < 10
                ? `0${currentTime.minute}`
                : `${currentTime.minute}`;
        let bookingDetails: BookingDetails = {
            duration: duration,
            title: 'Reservation from Get a Room!',
            roomId: room.id,
            startTime: startingTime === 'Now' ? `${h}:${m}` : startingTime
        };

        setBookingLoading(room.id);

        makeBooking(bookingDetails, SKIP_CONFIRMATION)
            .then((madeBooking) => {
                setBookings([...bookings, madeBooking]);
                updateData();
                // update data after 2.5s, waits Google Calendar to
                // accept the booking.
                setTimeout(() => {
                    updateData();
                }, 2500);
                createSuccessNotification(`Booking was succesful!`);
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
                    startingTime={startingTime}
                />
                <TimePickerDrawer
                    open={expandTimePickerDrawer}
                    toggle={(newOpen: any) =>
                        setExpandTimePickerDrawer(newOpen)
                    }
                    startingTime={startingTime}
                    setStartingTime={setStartingTime}
                    setExpandTimePickerDrawer={setExpandTimePickerDrawer}
                />
            </div>
            <div
                id="available-booking-typography"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}
            >
                <Typography
                    variant="subtitle1"
                    textAlign="left"
                    marginLeft="24px"
                >
                    Available rooms:
                </Typography>
                <TimePickerButton
                    aria-label="starting-booking-time"
                    onClick={() => setExpandTimePickerDrawer(true)}
                    value={startingTime}
                >
                    {startingTime} <ArrowDropDownIcon />
                </TimePickerButton>
            </div>
            <List>
                {noAvailableRooms(rooms) ? (
                    <NoRoomsCard />
                ) : (
                    rooms
                        .sort((a, b) => (a.name < b.name ? -1 : 1))
                        .map((room) =>
                            isAvailableFor(bookingDuration, room, startingTime)
                                ? (isFavorited(room, preferences),
                                  (
                                      <li key={room.id}>
                                          <RoomCard
                                              room={room}
                                              onClick={handleCardClick}
                                              bookingLoading={bookingLoading}
                                              disableBooking={false}
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
