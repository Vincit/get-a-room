import { Building } from '../types';
import axios from './axiosConfigurer';
import { getDistanceFromLatLonInKm } from './gpsService';

export const getBuildings = async (): Promise<Building[]> => {
    console.log('get buldings');
    const response = await axios.get('/buildings');
    const buildings = response.data.buildings;
    if (navigator.geolocation) {
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
                resolve(buildings);
            }
            function error(err: any) {
                reject(`ERROR(${err.code}): ${err.message} 1`);
            }
            var options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };
            navigator.geolocation.getCurrentPosition(success, error, options);
        });
    } else {
        console.log('aaa');
        return buildings;
    }
};
