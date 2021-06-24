import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var BusinessService = {
    // createBusiness creates name, email with data
    createBusiness(data, success, fail) {
        api.shared().post('/businesses', data)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    readBusiness(id, success, fail) {
        api.shared().get('/businesses/' + id)
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

    updateBusiness(data, success, fail) {
        api.shared().put('/businesses/' + data.id, data)
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

    // deleteBusiness deletes name, email with id
    deleteBusiness(id, success, fail) {
        api.shared().delete('/businesses/' + id)
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

    // readBusinesses reads all brands with query
    readBusinesses(query, success, fail) {
        api.shared().get('/businesses?query=' + query, {})
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

    readBusinessDietary(id, success, fail) {
        api.shared().get('/businesses/' + id + '/dietary')
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

    readBusinessMealKind(id, success, fail) {
        api.shared().get('/businesses/' + id + '/mealKind')
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

    readBusinessFoodType(id, success, fail) {
        api.shared().get('/businesses/' + id + '/foodType')
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

module.exports = BusinessService;