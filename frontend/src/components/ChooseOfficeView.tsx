import BuildingList from './BuildingList';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import useCreateNotification from '../hooks/useCreateNotification';
import { updatePreferences } from '../services/preferencesService';
import { Building, Preferences } from '../types';
import CenteredProgress from './util/CenteredProgress';
import { getBuildingsWithPosition } from '../services/buildingService';

type ChooseOfficeViewProps = {
    buildings: Building[];
    preferences?: Preferences;
    setPreferences: (preferences?: Preferences) => any;
    name: String | undefined;
    setBuildings: (buildings: Building[]) => any;
};

const ChooseOfficeView = (props: ChooseOfficeViewProps) => {
    const { buildings, preferences, setPreferences, name, setBuildings } =
        props;

    const [selectedBuildingId, setSelecedBuildingId] = useState('');

    const { createSuccessNotification, createErrorNotification } =
        useCreateNotification();

    // Updates distances every time user goes to the choose office page. Also fixes a bug with
    // mozilla browser where distances were not updating the first time loading the application
    // eslint disabled as parameter dependency setBuildings never changes during run time. Can
    // be also solved with useRef and isDeepEqual but that would require an extra library.
    useEffect(() => {
        getBuildingsWithPosition()
            .then(setBuildings)
            .catch((e) => console.log(e));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handlePreferencesSubmit = (buildingId: string) => {
        const foundBuilding = buildings.find(
            (building) => building.id === buildingId
        );
        if (foundBuilding) {
            let newPrefs = preferences as Preferences;
            newPrefs.building = foundBuilding;
            updatePreferences(newPrefs)
                .then((savedPreferences) => {
                    setPreferences(savedPreferences);
                    createSuccessNotification('Chose building ' + buildingId);
                    goToMainView();
                })
                .catch(() => {
                    createErrorNotification('Could not choose building');
                });
        }
    };

    if (!preferences) return <CenteredProgress />;
    return (
        <BuildingList
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            setSelectedBuildingId={setSelecedBuildingId}
            handlePreferencesSubmit={handlePreferencesSubmit}
            name={name}
        />
    );
};

export default ChooseOfficeView;
