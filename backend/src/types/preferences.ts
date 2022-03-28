import buildingData from './buildingData';

type Preferences = {
    building?: buildingData;
    fav_rooms?: String | null | undefined; // change to array when works
};

export default Preferences;
