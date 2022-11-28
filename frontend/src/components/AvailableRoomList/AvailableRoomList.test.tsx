// @ts-nocheck
import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { DateTime } from 'luxon';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AvailableRoomList from './AvailableRoomList';
import { makeBooking } from '../../services/bookingService';

const fakeRooms = [
    {
        id: '123',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now()
            .plus({ minutes: 121 })
            .toUTC()
            .toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    },
    {
        id: '124',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 61 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    },
    {
        id: '125',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 31 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    },
    {
        id: '126',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 16 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    },
    {
        id: '127',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 1 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    }
];

jest.mock('../../hooks/useCreateNotification', () => () => {
    return {
        createSuccessNotification: jest.fn(),
        createErrorNotification: jest.fn()
    };
});

jest.mock('../../services/bookingService');

const fakeBookings = [];

let container = null;

describe('AvailableRoomList', () => {
    beforeEach(() => {
        // Setup a DOM element as a render target
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Cleanup on exiting
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('renders room data', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={15}
            />,
            container
        );

        const items = screen.queryAllByTestId('AvailableRoomListCard');
        await waitFor(() => expect(items).toBeTruthy());

        const title = screen.queryAllByTestId('BookingRoomTitle')[0];
        await waitFor(() => expect(title).toHaveTextContent('Amor'));
    });

    it('filters rooms available for less than 15 min', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={15}
            />,
            container
        );
        const items = screen.queryAllByTestId('AvailableRoomListCard');
        await waitFor(() => expect(items).toHaveLength(4));
    });

    it('filters rooms available less than 30 min', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={30}
            />,
            container
        );

        const items = screen.queryAllByTestId('AvailableRoomListCard');
        await waitFor(() => expect(items).toHaveLength(3));
    });

    it('filters rooms available for less than 60 min', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={60}
            />,
            container
        );

        const items = screen.queryAllByTestId('AvailableRoomListCard');
        await waitFor(() => expect(items).toHaveLength(2));
    });

    it('filters rooms available for less than 120 min', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={120}
            />,
            container
        );

        const items = screen.queryAllByTestId('AvailableRoomListCard');
        await waitFor(() => expect(items).toHaveLength(1));
    });

    it('renders booking drawer', async () => {
        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={15}
            />,
            container
        );

        const card = screen.queryAllByTestId('CardActiveArea')[0];
        await waitFor(() => expect(card).toBeTruthy());

        fireEvent.click(card);

        const drawer = screen.queryByTestId('BookingDrawer');
        await waitFor(() => expect(drawer).toBeTruthy());
    });

    it('default books for a room for 15 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 15,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });

        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={15}
            />,
            container
        );

        const card = screen.queryAllByTestId('CardActiveArea');
        fireEvent.click(card[0]);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);

        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith(
                {
                    duration: 15,
                    roomId: fakeRooms[0].id,
                    title: 'Reservation from Get a Room!'
                },
                true
            )
        );
    });

    it('books for a room for 30 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });

        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={30}
            />,
            container
        );

        const card = screen.queryAllByTestId('CardActiveArea');
        fireEvent.click(card[0]);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);

        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith(
                {
                    duration: 30,
                    roomId: fakeRooms[0].id,
                    title: 'Reservation from Get a Room!'
                },
                true
            )
        );
    });

    it('books for a room for 60 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });

        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={60}
            />,
            container
        );

        const card = screen.queryAllByTestId('CardActiveArea');
        fireEvent.click(card[0]);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);

        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith(
                {
                    duration: 60,
                    roomId: fakeRooms[0].id,
                    title: 'Reservation from Get a Room!'
                },
                true
            )
        );
    });

    it('books for a room for 120 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });

        render(
            <AvailableRoomList
                rooms={fakeRooms}
                bookings={fakeBookings}
                bookingDuration={120}
            />,
            container
        );

        const card = screen.queryAllByTestId('CardActiveArea');
        fireEvent.click(card[0]);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);

        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith(
                {
                    duration: 120,
                    roomId: fakeRooms[0].id,
                    title: 'Reservation from Get a Room!'
                },
                true
            )
        );
    });
});
