// @ts-nocheck
import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AvailableRoomList from './AvailableRoomList';
import { makeBooking } from '../services/bookingService';
import userEvent from '@testing-library/user-event';

const fakeRooms = [
    {
        id: '123',
        name: 'Amor',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: '2021-10-21T17:32:28Z',
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    }
];

jest.mock('../hooks/useCreateNotification', () => () => {
    return {
        createSuccessNotification: jest.fn(),
        createErrorNotification: jest.fn()
    };
});

jest.mock('../services/bookingService');

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
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const items = screen.queryByTestId('AvailableRoomListCard');
        await waitFor(() =>
            expect(items).toBeTruthy()
        );

        const title = screen.queryByTestId('BookingRoomTitle');
        await waitFor(() => expect(title).toHaveTextContent('Amor'));
    });

    it('renders duration picker', async () => {
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const items = screen.queryByTestId('DurationPicker');
        await waitFor(() =>
            expect(items).toBeTruthy()
        );
    });

    it('renders booking drawer', async () => {
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const card = screen.queryByTestId('CardActiveArea');
        await waitFor(() =>
            expect(card).toBeTruthy()
        );

        fireEvent.click(card)

        
        const drawer = screen.queryByTestId('BookingDrawer');
        await waitFor(() =>
            expect(drawer).toBeTruthy()
        );
    });

    it('default books for a room for 15 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 15,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });
        
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const card = screen.queryByTestId('CardActiveArea');
        fireEvent.click(card)
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton)
        
        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith({
                duration: 15,
                roomId: fakeRooms[0].id,
                title: 'Reservation from Get a Room!'
            })
        );
    });

    it('books for a room for 30 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });
        
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const durationButton30 = screen.queryByTestId('DurationPicker30');
        fireEvent.click(durationButton30);
        const card = screen.queryByTestId('CardActiveArea');
        fireEvent.click(card);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);
        
        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith({
                duration: 30,
                roomId: fakeRooms[0].id,
                title: 'Reservation from Get a Room!'
            })
        );
    });

    it('books for a room for 60 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });
        
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const durationButton60 = screen.queryByTestId('DurationPicker60');
        fireEvent.click(durationButton60);
        const card = screen.queryByTestId('CardActiveArea');
        fireEvent.click(card);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);
        
        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith({
                duration: 60,
                roomId: fakeRooms[0].id,
                title: 'Reservation from Get a Room!'
            })
        );
    });

    it('books for a room for 120 minutes', async () => {
        (makeBooking as jest.Mock).mockResolvedValueOnce({
            duration: 30,
            roomId: fakeRooms[0].id,
            title: 'Reservation from Get a Room!'
        });
        
        render(
            <AvailableRoomList rooms={fakeRooms} bookings={fakeBookings} />,
            container
        );

        const durationButton120 = screen.queryByTestId('DurationPicker120');
        fireEvent.click(durationButton120);
        const card = screen.queryByTestId('CardActiveArea');
        fireEvent.click(card);
        const bookButton = screen.queryByTestId('BookNowButton');
        fireEvent.click(bookButton);
        
        await waitFor(() =>
            expect(makeBooking as jest.Mock).toHaveBeenCalledWith({
                duration: 120,
                roomId: fakeRooms[0].id,
                title: 'Reservation from Get a Room!'
            })
        );
    });
});
