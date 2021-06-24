import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var ColorService = {
    // createColor creates color with data
    createColor(color, success, fail) {
        api.shared().post('/colors', color)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateColor(color, success, fail) {
        api.shared().put('/colors/' + color.id, color)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {

                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteColor deletes color with id
    deleteColor(id, success, fail) {
        api.shared().delete('/colors/' + id)
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

    // readColors reads all colors with query
    readColors(success, fail) {
        api.shared().get('/colors')
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },
}

module.exports = ColorService;