import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var UrlService = {
    // createUser creates user with data
    createUrl(url, success, fail) {
        api.shared().post('/urls', {
                name: url.name,
                url: url.url
            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateUrl(url, success, fail) {
        api.shared().put('/urls/' + url.id, {
                name: url.name,
                url: url.url
            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    },

    // deleteUser deletes user with id
    deleteUrl(id, success, fail) {
        api.shared().delete('/urls/' + id)
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

    readUrls(query, success, fail) {
        api.shared().get('/urls?query=' + query, {

            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                if (error.response != undefined) {
                    fail(error.response.data);
                }
            });
    }
}

module.exports = UrlService;