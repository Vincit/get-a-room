import { getBuildings } from "./buildingService";



export const getGPSlocation = async (): Promise<string> => {
    if ("geolocation" in navigator) {
        console.log("Available");

        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        navigator.geolocation.getCurrentPosition(function(position) {
            var crd = position.coords;

            console.log('Your current position is:');
            console.log(`Latitude : ${crd.latitude}`);
            console.log(`Longitude: ${crd.longitude}`);
            console.log(`More or less ${crd.accuracy} meters.`);
            
            getBuildings().then(function(buildings){
                console.log(buildings);
                var closest = null;
                for (var building of buildings) {
                    var dist = getDistanceFromLatLonInKm(crd.latitude, crd.longitude, building.latitude, building.longitude);
                    console.log(dist)
                }
            });
        }, 
        function(error) {
            console.warn(`ERROR(${error.code}): ${error.message}`);
        }, 
        options);

    } else {
        console.log("Not Available");
    }

    return 'response';
};

/**
 * 
 * @param lat1 latitude1
 * @param lon1 longitude1
 * @param lat2 latitude2
 * @param lon2 longitude2
 * @returns Distance between two geogrpahical points
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