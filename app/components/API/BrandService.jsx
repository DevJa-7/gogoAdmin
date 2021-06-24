import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var BrandService = {
    // createBrand creates brand with data
    createBrand(data, success, fail) {
        api.shared().post('/brands', {
            title: data.title,
        })
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateBrand(data, success, fail) {
        api.shared().put('/brands/' + data.id, {
            title: data.title,
        })
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

    // deleteBrand deletes brand with id
    deleteBrand(id, success, fail) {
        api.shared().delete('/brands/' + id)
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

    // readBrands reads all brands with query
    readBrands(success, fail) {
        api.shared().get('/brands')
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

    updateModels(id, models, success, fail) {
        api.shared().put('/brands/update/model/' + id, {
            models: models,
        })
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    }
}

module.exports = BrandService;