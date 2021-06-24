import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var VehicleService = {
    // createVehicle creates vehicle with data
    createVehicle(vehicle, success, fail) {
        api.shared().post('/vehicles', vehicle)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateVehicle(vehicle, success, fail) {
        api.shared().put('/vehicles/' + vehicle.id, vehicle)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteVehicle deletes vehicle with id
    deleteVehicle(id, success, fail) {
        api.shared().delete('/vehicles/' + id)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // readVehicles reads all vehicles with query
    readVehicles(query, success, fail) {
        api.shared().get('/vehicles?query=' + query, {

            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    readActiveVehicles(success, fail) {
        api.shared().get('/vehicles/active', {

            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    }
}

module.exports = VehicleService;