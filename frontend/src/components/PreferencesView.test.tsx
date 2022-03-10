import {
    render,
    cleanup,
    screen,
    fireEvent,
    act,
    waitFor
} from '@testing-library/react';
import { updatePreferences } from '../services/preferencesService';

import PreferencesView from './PreferencesView';

const mockedHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockedHistoryPush
    })
}));

jest.mock('../hooks/useCreateNotification', () => () => {
    return {
        createSuccessNotification: jest.fn(),
        createErrorNotification: jest.fn()
    };
});

jest.mock('../services/preferencesService');

const TEST_BUILDINGS = [
    { id: 'b1Id', name: 'b1Name', latitude: 61.4957056, longitude: 23.7993984 },
    { id: 'b2Id', name: 'b2Name', latitude: 61.4957056, longitude: 23.7993984 }
];

describe('PreferencesView', () => {
    beforeEach(() => {
        cleanup();
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('renders progressbar when no preferences given', () => {
        render(
            <PreferencesView
                buildings={[]}
                setPreferences={jest.fn()}
                name="test"
            />
        );

        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('sets building according to preferences when valid', () => {
        act(() => {
            render(
                <PreferencesView
                    preferences={{ building: TEST_BUILDINGS[0] }}
                    buildings={TEST_BUILDINGS}
                    setPreferences={jest.fn()}
                    name="test"
                />
            );
        });

        expect(screen.getByText(TEST_BUILDINGS[0].name)).toBeTruthy();
    });

    it('does not set building when building is not valid', () => {
        render(
            <PreferencesView
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
                name="test"
            />
        );

        expect(screen.queryByText('notFound')).not.toBeTruthy();
    });

    it('updates preferences when clicking confirm', async () => {
        const mockedSetPreferences = jest.fn();
        (updatePreferences as jest.Mock).mockResolvedValueOnce({
            building: TEST_BUILDINGS[1]
        });
        render(
            <PreferencesView
                preferences={{}}
                buildings={TEST_BUILDINGS}
                setPreferences={mockedSetPreferences}
                name="test"
            />
        );

        fireEvent.mouseDown(screen.getByLabelText('Office location'));
        fireEvent.click(screen.getByText(TEST_BUILDINGS[1].name));

        fireEvent.click(screen.getByText('Save'));

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
