import { Building } from '../types';
import { getBuildings } from './buildingService';
import { updatePreferences } from './preferencesService';

/**
 * Sets the building preference to the closest building
 * relative to users GPS position
 * @returns
 */
export const setGPSLocationPreference = async () => {
    if (!('geolocation' in navigator)) {
        console.log('Geolocation not available');
        return;
    }

    const buildings = await getBuildings();
    if (buildings.length === 0) {
        console.log('Could not find buildings');
        return;
    }

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
            if (dist < closest) {
                closest = dist;
                currentClosestBuilding = building;
            }
        }
        updatePreferences({ building: currentClosestBuilding });
        return;
    }
    function error(err: any) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
};

/**
 *
 * @returns Array of buildings where distance to user has been added
 * sorted in ascending order.
 */
export const getBuildingsWithDistance = async (): Promise<Building[]> => {
    if (!('geolocation' in navigator)) {
        console.log('Geolocation not available');
        return Promise.reject('Geolocation not available');
    }

    const buildings = await getBuildings();
    if (buildings.length === 0) {
        console.log('Could not find buildings');
        return Promise.reject('Could not find buildings');
    }

    return new Promise((resolve, reject) => {
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
            }
            buildings.sort((a, b) => {
                if (a.distance && b.distance) {
                    return a.distance - b.distance;
                } else {
                    return 999999;
                }
            });
            resolve(buildings);
        }
        function error(err: any) {
            reject(`ERROR(${err.code}): ${err.message}`);
        }
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(success, error, options);
    });
};

/**
 *
 * @param lat1 latitude1
 * @param lon1 longitude1
 * @param lat2 latitude2
 * @param lon2 longitude2
 * @returns Distance between two geographical points
 */
function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
            Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}
