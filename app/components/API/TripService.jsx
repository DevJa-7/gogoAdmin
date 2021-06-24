import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var TripService = {
    // readTrips reads all loactions with query
    readTrips(query, success, fail) {
        api.shared().get('/trips?query=' + query, {
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

    // readTripsReview reads all loactions with query
    readTripsReview(id, query, success, fail) {
        api.shared().get('/trips/review/' + id + '?query=' + query, {
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
};

module.exports = TripService;