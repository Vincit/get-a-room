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
import { getName } from '../services/nameService';
import { useHistory } from 'react-router-dom';

const MainView = () => {
    const [preferences, setPreferences] = useState<Preferences | undefined>();

    const [buildings, setBuildings] = useState<Building[]>([]);

    const [name, setName] = useState<String>();

    const [expandBookingDrawer, setexpandBookingDrawer] = useState(false);

    const history = useHistory();

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
                //toggleDrawn(true);
                console.log(preference);
                buildingFromLocalStorage(preference);
            })
            .catch((e) => {
                // Redirected to login
                console.log(e);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const buildingFromLocalStorage = (preference: {
        building: { name: string };
    }) => {
        if (
            localStorage.getItem('preferedBuildingName') ===
            preference.building.name
        ) {
            toggleDrawn(false);
        } else {
            localStorage.setItem(
                'preferedBuildingName',
                preference.building.name
            );
            toggleDrawn(true);
        }
    };

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
                            setPreferences={setPreferences}
                            open={expandBookingDrawer}
                            toggle={toggleDrawn}
                            name={name}
                        />
                    </Route>
                </Switch>
            </Box>
        </Box>
    );
};

export default MainView;
