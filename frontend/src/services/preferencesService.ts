import { Building, Preferences } from '../types';
import axios from './axiosConfigurer';
import { getBuildings } from './buildingService';
import { getDistanceFromLatLonInKm } from './gpsService';

export const getPreferences = async () => {
    const result = await axios.get('preferences');
    if (!navigator.geolocation) {
        return result.data;
    }
    const buildings = await getBuildings();
    if (buildings.length === 0) {
        return result.data;
    }
    return new Promise((resolve, reject) => {
        var closest = Number.MAX_SAFE_INTEGER;
        var currentClosestBuilding: Building;
        function success(position: any) {
            var crd = position.coords;
            for (var building of buildings) {
                var dist = getDistanceFromLatLonInKm(
                    crd.latitude,
                    crd.longitude,
                    building.latitude,
                    building.longitude
                );
                building.distance = dist;
                if (dist < closest) {
                    closest = dist;
                    currentClosestBuilding = building;
                }
            }
            result.data.building.id = currentClosestBuilding.id;
            result.data.building.name = currentClosestBuilding.name;
            return resolve(result.data);
        }
        function error(err: any) {
            resolve(result.data);
        }
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(success, error, options);
    });
};

export const updatePreferences = async (preferences: Preferences) => {
    const result = await axios.put('preferences', preferences);
    return result.data;
};
