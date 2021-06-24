import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var MealKindService = {
    // createMealKind creates mealKind with data
    createMealKind(mealKind, success, fail) {
        api.shared().post('/mealKinds', mealKind)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateMealKind(mealKind, success, fail) {
        api.shared().put('/mealKinds/' + data.id, mealKind)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteMealKind deletes mealKind with id
    deleteMealKind(id, success, fail) {
        api.shared().delete('/mealKinds/' + id)
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

    // readMealKinds reads all mealKinds with query
    readMealKinds(success, fail) {
        api.shared().get('/mealKinds')
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

module.exports = MealKindService;