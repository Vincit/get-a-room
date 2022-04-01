import buildingData from './buildingData';

type Preferences = {
    building?: buildingData;
    fav_rooms?: Array<string> | null | undefined;
};

export default Preferences;
