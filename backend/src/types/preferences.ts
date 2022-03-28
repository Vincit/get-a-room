import buildingData from './buildingData';

type Preferences = {
    building?: buildingData;
    fav_rooms?: string | null | undefined; // change to array when works
};

export default Preferences;
