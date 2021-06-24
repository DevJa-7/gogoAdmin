import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var FoodTypeService = {
    // createFoodType creates foodType with data
    createFoodType(foodType, success, fail) {
        api.shared().post('/foodTypes', foodType)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateFoodType(foodType, success, fail) {
        api.shared().put('/foodTypes/' + foodType.id, foodType)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteFoodType deletes foodType with id
    deleteFoodType(id, success, fail) {
        api.shared().delete('/foodTypes/' + id)
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

    // readFoodTypes reads all foodTypes with query
    readFoodTypes(success, fail) {
        api.shared().get('/foodTypes')
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // readFoodTypesByBusiness reads all foodTypes with business
    readFoodTypesByBusiness(businessId, success, fail) {
        api.shared().get('/foodTypes/by/business/' + businessId)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    createSpec(foodTypeId, spec, success, fail) {
        api.shared().post('/foodTypes/by/spec/' + foodTypeId, spec)
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

    readSpec(foodTypeId, number, success, fail) {
        api.shared().get('/foodTypes/by/spec/' + foodTypeId, +"/" + number)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    updateSpec(foodTypeId, spec, success, fail) {
        api.shared().put('/foodTypes/by/spec/' + foodTypeId + "/" + spec.number, spec)
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

    deleteSpec(foodTypeId, number, success, fail) {
        api.shared().delete('/foodTypes/by/spec/' + foodTypeId +"/" + number)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    readSpecs(foodTypeId, success, fail) {
        api.shared().get('/foodTypes/by/spec/' + foodTypeId)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    }
}

module.exports = FoodTypeService;