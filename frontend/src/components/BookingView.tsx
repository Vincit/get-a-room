import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, styled, IconButton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Person from '@mui/icons-material/Person';

import { getRooms } from '../services/roomService';
import { deleteBooking, getBookings } from '../services/bookingService';
import { Room, Booking, Preferences } from '../types';
import CurrentBooking from './CurrentBooking';
import AvailableRoomList from './AvailableRoomList';
import CenteredProgress from './util/CenteredProgress';
import DurationPicker from './DurationPicker';

import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeableEdgeDrawer, { DrawerContent } from './SwipeableEdgeDrawer';
import UserDrawer from './UserDrawer';
import BusyRoomList from './BusyRoomList';
import useCreateNotification from '../hooks/useCreateNotification';

const UPDATE_FREQUENCY = 30000;
const GET_RESERVED = true;

// Check if rooms are fetched
function areRoomsFetched(rooms: Room[]) {
    return Array.isArray(rooms) && rooms.length > 0;
}

function isActiveBooking(bookings: Booking[]) {
    return bookings.length > 0;
}

export const Row = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'iconLeft',
    padding: '0px',
    width: '100%'
}));

const deleteDeclinedBookings = (
    notification: (message: string) => void,
    bookings: Booking[]
): Booking[] => {
    const bookingsFiltered = bookings.filter((booking) => {
        if (booking.resourceStatus === 'declined') {
            const name = booking.room.name;
            notification('Calendar declined booking: ' + name);
            deleteBooking(booking.id);
            return false;
        }
        return true;
    });
    return bookingsFiltered;
};

const RowCentered = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'left',
    padding: '0px',
    width: '100%'
}));

export const Spacer = styled('div')(() => ({
    padding: '8px'
}));

type BookingViewProps = {
    preferences?: Preferences;
    setPreferences: (pref: Preferences) => void;
    open: boolean;
    toggle: (open: boolean) => void;
    name: String | undefined;
};

function BookingView(props: BookingViewProps) {
    const { preferences, open, toggle, name, setPreferences } = props;

    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingDuration, setBookingDuration] = useState(15);
    const [expandSettingsDrawer, setexpandSettingsDrawer] = useState(
        false as boolean
    );
    const [expandedFeaturesAll, setExpandedFeaturesAll] = useState(
        false as boolean
    );

    const { createErrorNotification } = useCreateNotification();

    const updateRooms = useCallback(() => {
        if (preferences) {
            const buildingPreference = preferences.building?.id;
            getRooms(buildingPreference, GET_RESERVED)
                .then(setRooms)
                .catch((error) => console.log(error));
        }
    }, [preferences]);

    const handleDurationChange = (newDuration: number) => {
        setBookingDuration(newDuration);
    };

    const updateBookings = useCallback(() => {
        getBookings()
            .then((bookings) =>
                deleteDeclinedBookings(createErrorNotification, bookings)
            )
            .then(setBookings)
            .catch((error) => console.log(error));
    }, [createErrorNotification]);

    const history = useHistory();

    const moveToChooseOfficePage = () => {
        history.push('/preferences');
    };

    const openSettingsDrawer = () => {
        setexpandSettingsDrawer(true);
    };

    const toggleDrawers = (newOpen: boolean) => {
        setexpandSettingsDrawer(newOpen);
    };

    const updateData = useCallback(() => {
        updateRooms();
        updateBookings();
    }, [updateRooms, updateBookings]);

    // Update data periodically
    useEffect(() => {
        // Do first update immediately
        updateData();
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                updateData();
            }
        }, UPDATE_FREQUENCY);
        return () => clearInterval(intervalId);
    }, [updateData]);

    // Update data on window focus, hope it works on all platforms
    useEffect(() => {
        window.addEventListener('focus', updateData);
        return () => {
            window.removeEventListener('focus', updateData);
        };
    }, [updateData]);

    return (
        <Box id="current booking" textAlign="center" p={'16px'}>
            <div id="drawer-container">
                <SwipeableEdgeDrawer
                    headerTitle={'GPS has your back!'}
                    iconLeft={'Map'}
                    iconRight={'Close'}
                    isOpen={open}
                    toggle={toggle}
                    disableSwipeToOpen={true}
                >
                    <DrawerContent>
                        <RowCentered>
                            <Typography
                                variant="body1"
                                sx={{ color: '#000000', font: 'Roboto Mono' }}
                            >
                                {preferences?.building?.name} was selected as
                                your office based on your GPS location
                            </Typography>
                        </RowCentered>
                    </DrawerContent>
                </SwipeableEdgeDrawer>
            </div>

            <UserDrawer
                open={expandSettingsDrawer}
                toggle={toggleDrawers}
                name={name}
                expandedFeaturesAll={expandedFeaturesAll}
                setExpandedFeaturesAll={setExpandedFeaturesAll}
            />

            <Typography
                onClick={moveToChooseOfficePage}
                textAlign="left"
                variant="subtitle1"
                color={'#ce3b20'}
                paddingLeft="24px"
                paddingTop="20px"
                style={{ cursor: 'pointer' }}
                display="flex"
            >
                <ArrowBackIcon
                    style={{ width: '20px', height: '20px' }}
                ></ArrowBackIcon>
                <Typography
                    style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    {preferences?.building ? preferences.building.name : 'Back'}
                </Typography>
            </Typography>
            <RowCentered>
                <Typography
                    py={2}
                    variant="h2"
                    textAlign="left"
                    marginLeft="24px"
                    paddingTop="0px"
                    paddingBottom="24px"
                >
                    Available rooms
                    <IconButton
                        aria-label="profile menu"
                        size="small"
                        sx={{
                            bgcolor: 'primary.main',
                            color: '#fff',
                            position: 'absolute',
                            right: 50
                        }}
                        onClick={openSettingsDrawer}
                        style={{ cursor: 'pointer' }}
                    >
                        <Person />
                    </IconButton>
                </Typography>
            </RowCentered>

            {isActiveBooking(bookings) ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        py: 2,
                        px: 3
                    }}
                >
                    <ErrorOutlineIcon />
                    <Typography
                        sx={{
                            fontSize: '18px',
                            textAlign: 'center',
                            px: 1
                        }}
                    >
                        You cannot book a new room unless you remove your
                        current booking
                    </Typography>
                </Box>
            ) : null}

            <DurationPicker onChange={handleDurationChange} title="duration" />

            <CurrentBooking
                bookings={bookings}
                updateRooms={updateRooms}
                updateBookings={updateBookings}
                setBookings={setBookings}
                preferences={preferences}
                setPreferences={setPreferences}
            />

            {!areRoomsFetched(rooms) ? (
                <CenteredProgress />
            ) : (
                <AvailableRoomList
                    bookingDuration={bookingDuration}
                    rooms={rooms}
                    bookings={bookings}
                    setBookings={setBookings}
                    updateData={updateData}
                    expandedFeaturesAll={expandedFeaturesAll}
                    preferences={preferences}
                    setPreferences={setPreferences}
                />
            )}

            {areRoomsFetched(rooms) ? (
                <BusyRoomList
                    rooms={rooms}
                    bookings={bookings}
                    preferences={preferences}
                    setPreferences={setPreferences}
                />
            ) : null}
        </Box>
    );
}

export default BookingView;
