import React, { useCallback, useEffect, useState } from 'react';
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

    const history = useHistory();

    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

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
                createSuccessNotification('Office set according to GPS');
            })
            .catch((e) => {
                // Redirected to login
                console.log(e);
            });
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
                        />
                    </Route>
                    <Route path="/">
                        <BookingView preferences={preferences} />
                    </Route>
                </Switch>
            </Box>
            <NavBar />
        </Box>
    );
};

export default MainView;
