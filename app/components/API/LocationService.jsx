import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var LocationService = {
    // createLocation creates location with data
    createLocation(location, success, fail) {
        api.shared().post('/locations', location)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateLocation(location, success, fail) {
        console.log(location)
        api.shared().put('/locations/' + location.id, location)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteLocation deletes location with id
    deleteLocation(id, success, fail) {
        api.shared().delete('/locations/' + id)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // readLocations reads all loactions with query
    readLocations(query, success, fail) {
        api.shared().get('/locations?query=' + query, {

        })
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // readLocations reads location with id
    readLocation(id, success, fail) {
        api.shared().get('/locations/' + id)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    updateVehicleInfo(id, infos, success, fail) {
        api.shared().put('/locations/update/vehicleInfo/' + id, {
            vehicleInfos: infos
        })
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },
}

module.exports = LocationService;