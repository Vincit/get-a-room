import React from 'react';
import { List, Typography, Box } from '@mui/material';
import { DateTime } from 'luxon';
import RoomCard from './RoomCard';
import { Booking, Room } from '../types';

export function roomFreeIn(room: Room) {
    let end;
    const start = DateTime.now();
    if (Array.isArray(room.busy) && room.busy.length > 0) {
        end = DateTime.fromISO(room.busy[0].end as string);
        return Math.ceil(end.diff(start, 'minutes').minutes);
    }
    return 0;
}

function filterBusyRoom(room: Room, bookings: Booking[]): boolean {
    // filter if room booked for the user
    for (let i = 0; i < bookings.length; i++) {
        const booking = bookings[i];
        if (booking.room.id === room.id) {
            return false;
        }
    }
    if (Array.isArray(room.busy) && roomFreeIn(room) <= 30) {
        return true;
    }
    return false;
}

type BusyRoomListProps = {
    rooms: Room[];
    bookings: Booking[];
};

const BusyRoomList = (props: BusyRoomListProps) => {
    const { rooms, bookings } = props;

    return (
        <Box id="available-in-30-min-room-list">
            {rooms.filter((room) => filterBusyRoom(room, bookings)).length >
            0 ? (
                <Typography variant="subtitle1" textAlign="left">
                    rooms available in the next 30 min
                </Typography>
            ) : null}

            <List>
                {rooms
                    .sort((a, b) => (a.name < b.name ? -1 : 1))
                    .filter((room) => filterBusyRoom(room, bookings))
                    .map((room) => (
                        <li key={room.id}>
                            <RoomCard
                                room={room}
                                onClick={function (
                                    room: Room,
                                    booking?: Booking
                                ): void {
                                    throw new Error(
                                        'Function not implemented.'
                                    );
                                }}
                                bookingLoading={''}
                                disableBooking={true}
                                isSelected={false}
                                isBusy={true}
                                expandFeatures={false}
                            />
                        </li>
                    ))}
            </List>
        </Box>
    );
};

export default BusyRoomList;
