import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, styled, IconButton } from '@mui/material';
import Person from '@mui/icons-material/Person';

import { getRooms } from '../../services/roomService';
import { deleteBooking, getBookings } from '../../services/bookingService';
import { Room, Booking, Preferences } from '../../types';
import CurrentBooking from '../CurrentBooking/CurrentBooking';
import AvailableRoomList from '../AvailableRoomList/AvailableRoomList';
import CenteredProgress from '../util/CenteredProgress';
import DurationPicker from './DurationPicker';
import FilteringDrawer from './FilteringDrawer';

import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwipeableEdgeDrawer, {
    DrawerContent
} from '../SwipeableEdgeDrawer/SwipeableEdgeDrawer';
import UserDrawer from '../UserDrawer/UserDrawer';
import BusyRoomList from '../BusyRoomList/BusyRoomList';
import useCreateNotification from '../../hooks/useCreateNotification';

const UPDATE_FREQUENCY = 30000;
const GET_RESERVED = true;

// Check if rooms are fetched
function areRoomsFetched(rooms: Room[]) {
    return Array.isArray(rooms) && rooms.length > 0;
}

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
    const [displayRooms, setDisplayRooms] = useState<Room[]>(rooms);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [bookingDuration, setBookingDuration] = useState(15);
    const [expandSettingsDrawer, setexpandSettingsDrawer] = useState(
        false as boolean
    );
    const [expandedFeaturesAll, setExpandedFeaturesAll] = useState(
        false as boolean
    );
    const [expandFilteringDrawer, setexpandFilteringDrawer] = useState(false);

    // Filtering states
    const [roomSize, setRoomSize] = useState<string[]>([]);
    const [resources, setResources] = useState<string[]>([]);
    const [customFilter, setCustomFilter] = useState('');
    const [onlyFavourites, setOnlyFavourites] = useState(false);
    const [filterCount, setFilterCount] = useState(0);
    const [allFeatures, setAllfeatures] = useState<string[]>([]);

    const { createErrorNotification } = useCreateNotification();

    const updateRooms = useCallback(() => {
        if (preferences) {
            const buildingPreference = preferences.building?.id;
            getRooms(buildingPreference, GET_RESERVED)
                .then((allRooms) => {
                    setRooms(allRooms);
                })
                .catch((error) => console.log(error));
        }
    }, [preferences]);

    /**
     * Filters rooms and sets displayRooms to include matching rooms only
     * Also collects all the different features in currently shown rooms
     * so that the buttons for them can be updated.
     */
    const filterRooms = useCallback(
        (
            roomSize,
            resources,
            rooms,
            customFilter,
            onlyFavourites,
            fav_rooms
        ) => {
            // These filtering functions could be combined into one where the rooms array
            // is iterated through only once. The already small rooms array gets shaved down each pass
            // so iterating through it multiple times should not matter performance wise.
            let filteredRooms: Room[] = filterByFavourites(
                rooms,
                onlyFavourites,
                fav_rooms
            );
            filteredRooms = filterByResources(filteredRooms, resources);
            filteredRooms = filterByCustomString(filteredRooms, customFilter);
            filteredRooms = filterByRoomSize(filteredRooms, roomSize);
            setDisplayRooms(filteredRooms);

            // Collect all features in the current displayed rooms to a set to force uniqueness.
            var allFeaturesSet = new Set<string>();
            for (var room of filteredRooms) {
                if (room.features) {
                    for (var feature of room.features) {
                        allFeaturesSet.add(feature);
                    }
                }
            }
            setAllfeatures(Array.from(allFeaturesSet));
        },
        []
    );

    /**
     * Exracts the upper and lower bound values for room capacity from button
     * states. Removes rooms that dont fit between min and max capacity.
     * @param rooms Rooms to be filtered
     * @returns filtered array of rooms
     */
    const filterByRoomSize = (rooms: Room[], roomSize: string[]) => {
        if (roomSize.length === 0) {
            return rooms;
        }

        let rangeNumbers: number[] = [];
        for (var range of roomSize) {
            for (var value of range.split('-')) {
                var asNumber = parseInt(value);
                if (isNaN(asNumber)) {
                    continue;
                } else {
                    rangeNumbers.push(asNumber);
                }
            }
        }
        let minRoomSize: number = Math.min.apply(null, rangeNumbers);
        let maxRoomSize: number = Math.max.apply(null, rangeNumbers);
        let newRooms: Room[] = [];
        for (var room of rooms) {
            if (!room.capacity) {
                continue;
            }
            if (room.capacity >= minRoomSize && room.capacity <= maxRoomSize) {
                newRooms.push(room);
            }
        }
        return newRooms;
    };

    /**
     * Matches resource filters to those in rooms
     * @param rooms Rooms to be filtered
     * @returns filtered array of rooms
     */
    const filterByResources = (rooms: Room[], resources: string[]) => {
        if (resources.length === 0) {
            return rooms;
        }
        let newRooms: Room[] = [];
        for (var room of rooms) {
            if (!room.features) {
                continue;
            }
            let addToRooms = false;
            for (var resource of resources) {
                if (!room.features.includes(resource)) {
                    addToRooms = false;
                    break;
                }
                addToRooms = true;
            }
            if (addToRooms) {
                newRooms.push(room);
                addToRooms = false;
            }
        }
        return newRooms;
    };

    /**
     * Does substring matching to filter out rooms that dont match the custom
     * text filter.
     */
    const filterByCustomString = (rooms: Room[], customFilter: string) => {
        if (customFilter === '') {
            return rooms;
        }
        let newRooms: Room[] = [];
        for (var room of rooms) {
            var data = `${room.features?.toString()},${
                room.name
            },${room.capacity?.toString()}`;
            data = data?.toLowerCase();
            // Custom search string is split by ' ' and each of them is
            // treated as its own search criteria. All substrings need to be found for the room
            // to be shown.
            var customFilterArray = customFilter.split(' ');
            let addToRooms = false;
            for (var filter of customFilterArray) {
                if (!data?.includes(filter.toLowerCase())) {
                    addToRooms = false;
                    break;
                }
                addToRooms = true;
            }
            if (addToRooms) {
                newRooms.push(room);
                addToRooms = false;
            }
        }
        return newRooms;
    };

    /**
     * Filters to only include rooms that have been favourited by the user
     * @param rooms
     * @param onlyFavourites Whether the 'only favourites' button is clicked or not
     * @returns
     */
    const filterByFavourites = (
        rooms: Room[],
        onlyFavourites: boolean,
        fav_rooms: string[]
    ) => {
        if (!onlyFavourites) {
            return rooms;
        }
        let newRooms: Room[] = [];
        for (var room of rooms) {
            if (fav_rooms.includes(room.id)) {
                newRooms.push(room);
            }
        }
        return newRooms;
    };

    // Update displayed rooms when filters or rooms change
    useEffect(() => {
        filterRooms(
            roomSize,
            resources,
            rooms,
            customFilter,
            onlyFavourites,
            preferences?.fav_rooms
        );
    }, [
        roomSize,
        resources,
        rooms,
        customFilter,
        onlyFavourites,
        preferences?.fav_rooms,
        filterRooms
    ]);

    useEffect(() => {
        var roomSizeFiltersCount = roomSize.length;
        var resourcesFiltersCount = resources.length;
        var customFilterCount;
        var onlyFavouritesCount;
        if (customFilter === '') {
            customFilterCount = 0;
        } else {
            customFilterCount = 1;
        }
        if (onlyFavourites === false) {
            onlyFavouritesCount = 0;
        } else {
            onlyFavouritesCount = 1;
        }

        setFilterCount(
            roomSizeFiltersCount +
                resourcesFiltersCount +
                customFilterCount +
                onlyFavouritesCount
        );
    }, [roomSize, resources, customFilter, onlyFavourites]);

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

    const toggleDrawn = (newOpen: boolean) => {
        setexpandFilteringDrawer(newOpen);
    };

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

    const openFiltering = () => {
        if (expandFilteringDrawer === false) {
            setexpandFilteringDrawer(true);
        }
    };

    const [duration, setDuration] = React.useState(15);

    return (
        <Box id="current booking" textAlign="center" px={'16px'} pb={'120px'}>
            <div id="gps-container">
                <SwipeableEdgeDrawer
                    headerTitle={'GPS has your back!'}
                    iconLeft={'Map'}
                    iconRight={'Close'}
                    isOpen={open}
                    toggle={toggle}
                    disableSwipeToOpen={true}
                >
                    <Box
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <DrawerContent>
                            <RowCentered>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#000000',
                                        font: 'Roboto Mono'
                                    }}
                                >
                                    {preferences?.building?.name} was selected
                                    as your office based on your GPS location
                                </Typography>
                            </RowCentered>
                        </DrawerContent>
                    </Box>
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

            <DurationPicker
                duration={duration}
                setDuration={setDuration}
                onChange={handleDurationChange}
                title="duration"
            />

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
                    rooms={displayRooms}
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

            <div id="filtering-container" onClick={openFiltering}>
                <FilteringDrawer
                    open={expandFilteringDrawer}
                    toggle={toggleDrawn}
                    roomSize={roomSize}
                    setRoomSize={setRoomSize}
                    resources={resources}
                    setResources={setResources}
                    customFilter={customFilter}
                    setCustomFilter={setCustomFilter}
                    onlyFavourites={onlyFavourites}
                    setOnlyFavourites={setOnlyFavourites}
                    filterCount={filterCount}
                    allFeatures={allFeatures}
                    duration={duration}
                    setDuration={setDuration}
                    onChange={handleDurationChange}
                />
            </div>
        </Box>
    );
}

export default BookingView;
