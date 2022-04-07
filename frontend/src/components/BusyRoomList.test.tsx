// @ts-nocheck
import React from 'react';
import ReactDOM, { unmountComponentAtNode } from 'react-dom';
import { DateTime } from 'luxon';
import { render, screen } from '@testing-library/react';
import BusyRoomList from './BusyRoomList';

const fakeRooms = [
    {
        id: '125',
        name: 'room1',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 31 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com'
    },
    {
        id: '126',
        name: 'room2',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 16 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com',
        busy: [
            {
                start: DateTime.now().toISO(),
                end: DateTime.now().plus({ minutes: 31 }).toUTC().toISO()
            }
        ]
    },
    {
        id: '127',
        name: 'room3',
        building: 'Hermia 5',
        capacity: 15,
        features: ['TV', 'Whiteboard'],
        nextCalendarEvent: DateTime.now().plus({ minutes: 1 }).toUTC().toISO(),
        email: 'c_188fib500s84uis7kcpb6dfm93v25@resource.calendar.google.com',
        busy: [
            {
                start: DateTime.now().toISO(),
                end: DateTime.now().plus({ minutes: 30 }).toUTC().toISO()
            }
        ]
    }
];

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

    it('renders rooms available in 30 minutes', async () => {
        render(<BusyRoomList rooms={fakeRooms} />, container);

        const items = screen.queryAllByTestId('AvailableRoomListCard');
        expect(items).toBeTruthy();
        expect(items).toHaveLength(1);
    });

    it('renders correct room title', async () => {
        render(<BusyRoomList rooms={fakeRooms} />, container);

        const titles = screen.queryAllByTestId('BookingRoomTitle');
        expect(titles).toHaveLength(1);
        expect(titles[0]).toHaveTextContent('room3');
    });
});
