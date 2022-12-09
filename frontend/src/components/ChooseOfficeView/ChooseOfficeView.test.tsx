import {
    render,
    cleanup,
    screen,
    fireEvent,
    act,
    waitFor
} from '@testing-library/react';

import { updatePreferences } from '../../services/preferencesService';

import ChooseOfficeView from './ChooseOfficeView';

const mockedHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockedHistoryPush
    })
}));

jest.mock('../../hooks/useCreateNotification', () => () => {
    return {
        createSuccessNotification: jest.fn(),
        createErrorNotification: jest.fn()
    };
});

jest.mock('../../services/preferencesService');

const TEST_BUILDINGS = [
    { id: 'b1Id', name: 'b1Name', latitude: 61.4957056, longitude: 23.7993984 },
    { id: 'b2Id', name: 'b2Name', latitude: 61.4957056, longitude: 23.7993984 }
];

describe('ChooseOfficeView', () => {
    beforeEach(() => {
        cleanup();
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('renders progressbar when gps gives location (goes straight to room choosing page', () => {
        render(
            <ChooseOfficeView
                buildings={[]}
                setPreferences={jest.fn()}
                name="testname"
                setBuildings={jest.fn()}
            />
        );

        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('sets building according to preferences when valid', () => {
        act(() => {
            render(
                <ChooseOfficeView
                    preferences={{ building: TEST_BUILDINGS[0] }}
                    buildings={TEST_BUILDINGS}
                    setPreferences={jest.fn()}
                    name="testname"
                    setBuildings={jest.fn()}
                />
            );
        });

        expect(screen.getByText(TEST_BUILDINGS[0].name)).toBeTruthy();
    });

    it('does not set building when building is not valid', () => {
        render(
            <ChooseOfficeView
                preferences={{
                    building: {
                        id: 'notFound',
                        name: 'notFound',
                        latitude: 61.4957056,
                        longitude: 23.7993984
                    }
                }}
                buildings={TEST_BUILDINGS}
                setPreferences={jest.fn()}
                name="testname"
                setBuildings={jest.fn()}
            />
        );

        expect(screen.queryByText('notFound')).not.toBeTruthy();
    });

    it('user name (testname) is found from the screen', () => {
        act(() => {
            render(
                <ChooseOfficeView
                    preferences={{ building: TEST_BUILDINGS[0] }}
                    buildings={TEST_BUILDINGS}
                    setPreferences={jest.fn()}
                    name="testname"
                    setBuildings={jest.fn()}
                />
            );
        });

        expect(screen.getByText('Welcome, testname')).toBeTruthy();
    });

    it('updates preferences when clicking a building name', async () => {
        const mockedSetPreferences = jest.fn();
        (updatePreferences as jest.Mock).mockResolvedValueOnce({
            building: TEST_BUILDINGS[1]
        });
        render(
            <ChooseOfficeView
                preferences={{}}
                buildings={TEST_BUILDINGS}
                setPreferences={mockedSetPreferences}
                name="testname"
                setBuildings={jest.fn()}
            />
        );

        fireEvent.click(screen.getByText(TEST_BUILDINGS[1].name));

        expect(updatePreferences as jest.Mock).toHaveBeenCalledWith({
            building: TEST_BUILDINGS[1]
        });
        await waitFor(() => {
            expect(mockedSetPreferences).toHaveBeenCalledWith({
                building: TEST_BUILDINGS[1]
            });
        });
        await waitFor(() => {
            expect(mockedHistoryPush).toHaveBeenCalledWith('/');
        });
    });
});
