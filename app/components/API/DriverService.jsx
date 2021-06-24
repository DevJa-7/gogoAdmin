import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var DriverService = {

    // readDriver reads driver with object id
    readDriver(id, success, fail) {
        api.shared().get('/drivers/' + id, {

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

    readDetailDriver(id, success, fail) {
        api.shared().get('/drivers/detail/' + id, {

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

    // readDrivers reads all drivers with query
    readDrivers(query, success, fail) {
        api.shared().get('/drivers?query=' + query, {

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

    createDriver(driver, success, fail) {
        api.shared().post('/drivers', driver)
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

    updateDriver(driver, success, fail) {
        api.shared().put('/drivers/' + driver.id, driver)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    deleteDriver(id, success, fail) {
        api.shared().delete('/drivers/' + id)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateDriverVehicle(id, vehicle, success, fail) {
        api.shared().put('/drivers/vehicle/' + id + '/' + vehicle.number, vehicle)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    deleteDriverVehicle(id, vehicle, success, fail) {
        api.shared().put('/drivers/vehicle/delete/' + id, vehicle)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },
}

module.exports = DriverService;
