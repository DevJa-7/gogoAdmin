import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var AdsService = {
    // createAds creates ads with data
    createAds(ads, success, fail) {
        api.shared().post('/ads', ads)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateAds(ads, success, fail) {
        api.shared().put('/ads/' + ads.id, ads)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {

                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteAds deletes ads with id
    deleteAds(id, success, fail) {
        api.shared().delete('/ads/' + id)
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

    // readAllAds reads all ads with query
    readAllAds(query, success, fail) {
        api.shared().get('/ads?' + query)
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

module.exports = AdsService;