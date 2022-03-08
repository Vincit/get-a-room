import { Building } from '../types';
import { getBuildings } from './buildingService';
import { updatePreferences } from './preferencesService';

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

    var closest = 999999999999999;
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
            console.log(`distance: ${dist}, office ${building.name}`);
            if (dist < closest) {
                closest = dist;
                currentClosestBuilding = building;
            }
        }
        updatePreferences({ building: currentClosestBuilding });
        console.log('Location preference updated!');
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

export const getClosestBuilding = async (): Promise<Building> => {
    return new Promise(async (resolve, reject) => {
        const buildings = await getBuildings();
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        var closest = 999999999999999;
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
                //console.log(`distance: ${dist}, office ${building.name}`)
                if (dist < closest) {
                    closest = dist;
                    currentClosestBuilding = building;
                }
            }
            resolve(currentClosestBuilding);
        }
        function error(err: any) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            Promise.reject('Could not find closest office');
        }
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
