import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var ReasonService = {
    // createReason creates reason with data
    createReason(reason, success, fail) {
        api.shared().post('/reasons', reason)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateReason(reason, success, fail) {
        api.shared().put('/reasons/' + reason.id, reason)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {

                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteReason deletes reason with id
    deleteReason(id, success, fail) {
        api.shared().delete('/reasons/' + id)
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

    // readReasons reads all reasons with query
    readReasons(query, success, fail) {
        api.shared().get('/reasons?query=' + query)
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

module.exports = ReasonService;