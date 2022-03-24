import { useCallback, useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import BookingView from './BookingView';
import ChooseOfficeView from './ChooseOfficeView';
import { Building, Preferences } from '../types';
import {
    getPreferences,
    getPreferencesWithGPS
} from '../services/preferencesService';
import {
    getBuildings,
    getBuildingsWithPosition
} from '../services/buildingService';
import { Box } from '@mui/material';
import NavBar from './NavBar';
import { getName } from '../services/nameService';
import { useHistory } from 'react-router-dom';
import useCreateNotification from '../hooks/useCreateNotification';

const MainView = () => {
    const [preferences, setPreferences] = useState<Preferences | undefined>();

    const [buildings, setBuildings] = useState<Building[]>([]);

    const [name, setName] = useState<String>();

    const [expandBookingDrawer, setexpandBookingDrawer] = useState(false);

    const history = useHistory();

    const { createSuccessNotification } = useCreateNotification();

    useEffect(() => {
        getPreferences()
            .then(setPreferences)
            .catch((e) => {
                // Redirected to login
                console.log(e);
            });
    }, []);

    useEffect(() => {
        getPreferencesWithGPS()
            .then((preference) => {
                setPreferences(preference);
                //createSuccessNotification(preference.building?.name + ' was selected as your office based on your GPS location');
                toggleDrawn(true);
            })
            .catch((e) => {
                // Redirected to login
                console.log(e);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        getBuildings()
            .then(setBuildings)
            .catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        getBuildingsWithPosition()
            .then(setBuildings)
            .catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        getName().then(setName);
    }, []);

    const goToMainView = useCallback(() => {
        // Use replace in place of push because it's a temporary page and wouln't work if navigated back to
        history.replace('/');
    }, [history]);

    useEffect(() => {
        if (preferences?.building?.id) {
            // Preferences already set
            goToMainView();
        }
    }, [preferences, goToMainView]);

    const toggleDrawn = (newOpen: boolean) => {
        setexpandBookingDrawer(newOpen);
    };

    return (
        <Box
            id="main-view"
            display="flex"
            flexDirection="column"
            height="100vh"
        >
            <Box
                id="main-view-content"
                sx={{ flexGrow: 1, overflowY: 'scroll' }}
            >
                <Switch>
                    <Route path="/(preferences|auth/success)/">
                        <ChooseOfficeView
                            preferences={preferences}
                            setPreferences={setPreferences}
                            buildings={buildings}
                            name={name}
                            setBuildings={setBuildings}
                        />
                    </Route>
                    <Route path="/">
                        <BookingView
                            preferences={preferences}
                            open={expandBookingDrawer}
                            toggle={toggleDrawn}
                        />
                    </Route>
                </Switch>
            </Box>
            <NavBar />
        </Box>
    );
};

export default MainView;
