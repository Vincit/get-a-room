import { Building } from "../types";
import { getBuildings } from "./buildingService";
import { updatePreferences } from "./preferencesService";

export const setGPSLocationPreference = async () => {

    if (!("geolocation" in navigator)) {
        console.log("Geolocation not available");
        return
    }

    const buildings = await getBuildings();
    if (buildings.length === 0) {
        console.log('Could not find buildings');
        return
    }

    var closest = 999999999999999;
    var currentClosestBuilding: Building;
    function success (position: any) {
        var crd = position.coords;
        for (var building of buildings) {
            var dist = getDistanceFromLatLonInKm(crd.latitude, crd.longitude, building.latitude, building.longitude);
            //console.log(`distance: ${dist}, office ${building.name}`)
            if (dist < closest) {
                closest = dist;
                currentClosestBuilding = building;
            }
        }
        updatePreferences({ building: currentClosestBuilding });
        console.log('Location preference updated!');
        return
    }
    function error (err: any) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
    }
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
    navigator.geolocation.getCurrentPosition(success, error, options);
}

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
        function success (position: any) {
            var crd = position.coords;
            for (var building of buildings) {
                var dist = getDistanceFromLatLonInKm(crd.latitude, crd.longitude, building.latitude, building.longitude);
                //console.log(`distance: ${dist}, office ${building.name}`)
                if (dist < closest) {
                    closest = dist;
                    currentClosestBuilding = building;
                }
            }
            resolve(currentClosestBuilding);
        }
        function error (err: any) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            Promise.reject('Could not find closest office')
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    });

};

export const getGPSlocation = async (): Promise<Building> => {
    if ("geolocation" in navigator) {
        console.log("Available");

        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(function(position) {
            var crd = position.coords;

/*             console.log('Your current position is:');
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            console.log(`More or less ${crd.accuracy} meters.`); */
            
            getBuildings().then(function(buildings){
                var closest = 999999999999999;
                var currentClosestBuilding = null;
                for (var building of buildings) {
                    var dist = getDistanceFromLatLonInKm(crd.latitude, crd.longitude, building.latitude, building.longitude);
                    //console.log(`distance: ${dist}, office ${building.name}`)
                    if (dist < closest) {
                        closest = dist;
                        currentClosestBuilding = building;
                    }
                }
                if (currentClosestBuilding != null) {
                    console.log(currentClosestBuilding);
                    updatePreferences({ building: currentClosestBuilding });


                    return currentClosestBuilding;
                } else {
                    return Promise.reject('error1');
                }
                
            });
        }, 
        function(error) {
            console.warn(`ERROR(${error.code}): ${error.message}`);
            return Promise.reject('error2');
        }, 
        options);

    } else {
        console.log("Not Available");
        return Promise.reject('error4');
    }

    return Promise.reject('error3');
};

/**
 * 
 * @param lat1 latitude1
 * @param lon1 longitude1
 * @param lat2 latitude2
 * @param lon2 longitude2
 * @returns Distance between two geographical points
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg: number) {
    return deg * (Math.PI/180)
  }