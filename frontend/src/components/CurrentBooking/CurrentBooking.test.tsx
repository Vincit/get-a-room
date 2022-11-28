// @ts-nocheck
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CurrentBooking from './CurrentBooking';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import { updateBooking, endBooking } from '../../services/bookingService';

jest.mock('../../hooks/useCreateNotification', () => () => {
    return {
        createSuccessNotification: jest.fn(),
        createErrorNotification: jest.fn()
    };
});

jest.mock('../../services/bookingService');

const fakeBooking = [
    {
        id: '123',
        startTime: '2021-10-21T17:32:28Z',
        endTime: '2021-10-21T19:32:28Z',
        room: {
            id: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com',
            name: 'Amor',
            capacity: 4,
            features: ['Jabra', 'TV', 'Webcam'],
            nextCalendarEvent: '2021-10-21T19:52:28Z'
        }
    }
];

let container = null;
describe('CurrentBooking', () => {
    beforeEach(() => {
        // setup a DOM element as a render target
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        // cleanup on exiting
        jest.clearAllMocks();
        unmountComponentAtNode(container);
        container.remove();
        container = null;
    });

    it('renders booking data with correct name', async () => {
        render(<CurrentBooking bookings={fakeBooking} />, container);

        const title = await screen.queryByTestId('BookingRoomTitle');
        await waitFor(() => expect(title).toHaveTextContent('Amor'));
    });

    it('renders alter booking drawer', async () => {
        (updateBooking as jest.Mock).mockResolvedValueOnce({
            timeToAdd: 15
        });

        render(<CurrentBooking bookings={fakeBooking} />), container;

        const bookingCard = await screen.queryByTestId('CardActiveArea');
        userEvent.click(bookingCard);

        const drawer = screen.queryByTestId('BookingDrawer');
        await waitFor(() => expect(drawer).toBeTruthy());
    });

    it('extend booking by 15 min', async () => {
        (updateBooking as jest.Mock).mockResolvedValueOnce({
            timeToAdd: 15,
            bookingId: fakeBooking[0].id
        });

        render(<CurrentBooking bookings={fakeBooking} />), container;

        const bookingCard = await screen.queryByTestId('CardActiveArea');
        userEvent.click(bookingCard);

        const alterButton = await screen.queryByTestId('add15');
        userEvent.click(alterButton);

        await waitFor(() =>
            expect(updateBooking as jest.Mock).toHaveBeenCalledWith(
                { timeToAdd: 15 },
                fakeBooking[0].id,
                true
            )
        );
    });

    it('ends booking', async () => {
        (endBooking as jest.Mock).mockResolvedValueOnce({
            bookingId: fakeBooking[0].id
        });

        render(<CurrentBooking bookings={fakeBooking} />), container;

        const bookingCard = await screen.queryByTestId('CardActiveArea');
        userEvent.click(bookingCard);

        const endBookingButton = await screen.queryByTestId('EndBookingButton');
        userEvent.click(endBookingButton);

        await waitFor(() =>
            expect(endBooking as jest.Mock).toHaveBeenCalledWith(
                fakeBooking[0].id
            )
        );
    });
});
