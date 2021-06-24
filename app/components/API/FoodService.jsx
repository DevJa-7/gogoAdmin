import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var FoodService = {
    // createFood creates name, email with data
    createFood(data, success, fail) {
        api.shared().post('/foods', data)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error, error.response)
                fail(error.response.data);
            });
    },

    readFood(id, success, fail) {
        api.shared().get('/foods/' + id)
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

    updateFood(data, success, fail) {
        api.shared().put('/foods/' + data.id, data)
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

    // deleteFood deletes name, email with id
    deleteFood(id, success, fail) {
        api.shared().delete('/foods/' + id)
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

    // readFoods reads all brands with query
    readFoods(query, success, fail) {
        api.shared().get('/foods?query=' + query, {

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
    }
}

module.exports = FoodService;