import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var DietaryService = {
    // createDietary creates dietary with data
    createDietary(dietary, success, fail) {
        api.shared().post('/dietaries', dietary)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateDietary(dietary, success, fail) {
        api.shared().put('/dietaries/' + dietary.id, dietary)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteDietary deletes dietary with id
    deleteDietary(id, success, fail) {
        api.shared().delete('/dietaries/' + id)
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

    // readDietaries reads all dietaries with query
    readDietaries(query, success, fail) {
        api.shared().get('/dietaries?query=' + query)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },
}

module.exports = DietaryService;