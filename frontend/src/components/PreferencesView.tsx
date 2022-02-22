import * as React from 'react';

import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useCreateNotification from '../hooks/useCreateNotification';
import { updatePreferences } from '../services/preferencesService';
import { Building, Preferences } from '../types';
import BuildingSelect from './BuildingSelect';
import CenteredProgress from './util/CenteredProgress';
import FormButtons from './util/FormButtons';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormGroup from '@mui/material/FormGroup';


import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import { userInfo } from 'os';


//Listaus

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';



type PreferencesViewProps = {
    buildings: Building[];
    preferences?: Preferences;
    setPreferences: (preferences?: Preferences) => any;
};

const PreferencesView = (props: PreferencesViewProps) => {
    const { buildings, preferences, setPreferences } = props;

    const [selectedBuildingId, setSelecedBuildingId] = useState('');
    const [alignment, setAlignment] = React.useState('proximity');
    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    // If current building found, show it in building select
    useEffect(() => {
        const preferencesBuildingId = preferences?.building?.id;
        const isValidBuilding = buildings.some(
            (building) => building.id === preferencesBuildingId
        );
        if (preferencesBuildingId && isValidBuilding) {
            setSelecedBuildingId(preferencesBuildingId);
        }
    }, [preferences, buildings]);

    const history = useHistory();

    const goToMainView = () => {
        history.push('/');
    };

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string | null,
      ) => {
        if (newAlignment !== null) {
            setAlignment(newAlignment);
          }
      };

    const handlePreferencesSubmit = () => {
        const foundBuilding = buildings.find(
            (building) => building.id === selectedBuildingId
        );
        if (foundBuilding) {
            updatePreferences({ building: foundBuilding })
                .then((savedPreferences) => {
                    setPreferences(savedPreferences);
                    createSuccessNotification(
                        'Preferences updated successfully'
                    );
                    goToMainView();
                })
                .catch(() => {
                    createErrorNotification('Could not update preferences');
                });
        }
    };

    if (!preferences) return <CenteredProgress />;
    return (
        <Stack
            id="preferences-view"
            height="100%"
            justifyContent="space-around"
            >
            <FormGroup>
                <Typography textAlign="center" variant="h6">Welcome, asasdfasdfasdf</Typography>
                <Typography textAlign="center" variant="h3">Choose office</Typography>
            </FormGroup>

            <ToggleButtonGroup
            color="primary"
            value={alignment}
            exclusive
            onChange={handleChange}
            style={{alignSelf: "center"}}
            >
                
                <ToggleButton style={{minWidth: '150px'}} value="proximity">
                    <GpsFixedIcon style={{minWidth: '40px'}} fontSize='small'></GpsFixedIcon>
                    Proximity
                </ToggleButton>

                <ToggleButton style={{minWidth: '150px'}} value="names">
                    <SortByAlphaIcon style={{minWidth: '40px'}} fontSize='small'></SortByAlphaIcon>
                    Names
                </ToggleButton>
            </ToggleButtonGroup>

            


            <BuildingSelect
                buildings={buildings}
                selectedBuildingId={selectedBuildingId}
                setSelectedBuildingId={setSelecedBuildingId}
            />
            <FormButtons
                submitText="Save"
                handleSubmit={handlePreferencesSubmit}
                cancelText="Cancel"
                handleCancel={goToMainView}
            />
        </Stack>
    );
};

export default PreferencesView;
