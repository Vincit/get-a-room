// @ts-nocheck
import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { DateTime } from 'luxon';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookingDrawer from './BookingDrawer';

const fakeRoom = {
    id: '123',
    name: 'Amor',
    building: 'Hermia 5',
    capacity: 15,
    features: ['TV', 'Whiteboard'],
    nextCalendarEvent: DateTime.now().plus({ minutes: 30 }).toUTC().toISO(),
    email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
};
let container = null;

describe('BookingDrawer', () => {
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

    it('Books a room', async () => {
        const bookMock = jest.fn();
        render(
            <BookingDrawer
                open={true}
                toggle={jest.fn()}
                bookRoom={bookMock}
                room={fakeRoom}
                duration={15}
                additionalDuration={0}
                availableMinutes={30}
                onAddTime={jest.fn()}
                startingTime={'Now'}
            />,
            container
        );

        const bookButton = screen.queryByTestId('BookNowButton');
        await waitFor(() => expect(bookButton).toBeTruthy());

        fireEvent.click(bookButton);
        expect(bookMock).toBeCalledTimes(1);
    });

    it('Disable subtract time at duration <=15 min', async () => {
        let extraTime = 0;
        const additionalTime = jest.fn((minutes) => {
            extraTime = extraTime + minutes;
        });

        render(
            <BookingDrawer
                open={true}
                toggle={jest.fn()}
                bookRoom={jest.fn()}
                room={fakeRoom}
                duration={15}
                additionalDuration={extraTime}
                availableMinutes={30}
                onAddTime={additionalTime}
                startingTime={'Now'}
            />,
            container
        );

        const subtractTime = screen.queryByTestId('subtract15');
        await waitFor(() => expect(subtractTime).toBeTruthy());

        fireEvent.click(subtractTime);
        expect(subtractTime).toBeDisabled();
        expect(additionalTime).toBeCalledTimes(0);
        expect(extraTime).toBe(0);
    });

    it('disable add time at max duration', async () => {
        let extraTime = 0;
        const additionalTime = jest.fn((minutes) => {
            extraTime = extraTime + minutes;
        });

        render(
            <BookingDrawer
                open={true}
                toggle={jest.fn()}
                bookRoom={jest.fn()}
                room={fakeRoom}
                duration={30}
                additionalDuration={extraTime}
                availableMinutes={31}
                onAddTime={additionalTime}
                startingTime={'Now'}
            />,
            container
        );

        const addTime = screen.queryByTestId('add15');
        await waitFor(() => expect(addTime).toBeTruthy());

        fireEvent.click(addTime);

        expect(addTime).toBeDisabled();
        expect(additionalTime).toBeCalledTimes(0);
        expect(extraTime).toBe(0);
    });

    it('Subtract 15 min', async () => {
        let extraTime = 0;
        const additionalTime = jest.fn((minutes) => {
            extraTime = extraTime + minutes;
        });

        render(
            <BookingDrawer
                open={true}
                toggle={jest.fn()}
                bookRoom={jest.fn()}
                room={fakeRoom}
                duration={30}
                additionalDuration={extraTime}
                availableMinutes={31}
                onAddTime={additionalTime}
                startingTime={'Now'}
            />,
            container
        );

        const subtractTime = screen.queryByTestId('subtract15');
        fireEvent.click(subtractTime);

        expect(additionalTime).toBeCalledTimes(1);
        expect(extraTime).toBe(-15);
    });

    it('Add 15 minutes to booking', async () => {
        let extraTime = 0;
        const additionalTime = jest.fn((minutes) => {
            extraTime = extraTime + minutes;
        });

        render(
            <BookingDrawer
                open={true}
                toggle={jest.fn()}
                bookRoom={jest.fn()}
                room={fakeRoom}
                duration={15}
                additionalDuration={extraTime}
                availableMinutes={30}
                onAddTime={additionalTime}
                startingTime={'Now'}
            />,
            container
        );

        const addTime = screen.queryByTestId('add15');
        fireEvent.click(addTime);

        expect(additionalTime).toBeCalledTimes(1);
        expect(extraTime).toBe(15);
    });
});
