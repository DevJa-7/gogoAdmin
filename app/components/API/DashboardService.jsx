import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var DashboardService = {
    
    readGeneral(success, fail) {
        api.shared().get('/dashboard/general')
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

    readApproved(success, fail) {
        api.shared().get('/foods/require/approved')
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

    readProblems(success, fail) {
        api.shared().get('/problems/resolved')
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

module.exports = DashboardService;