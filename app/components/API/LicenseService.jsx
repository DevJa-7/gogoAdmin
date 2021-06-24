import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var LicenseService = {
    // uploadFile uploads file and get reponse for fileinfo
    uploadFile(data, success, fail) {
        api.setFormRequest();

        api.shared().post('/uploads',
                data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
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

        api.setJSONRequest();
    },

    // createLicense creates license
    createLicense(license, success, fail) {
        api.shared().post('/licenses', {
                customer: license.customer,
                email: license.email,
                limit: license.limit,
                started_at: license.startedAt + "T00:00:00Z",
                period: license.period,
                machine_key: license.previous, // history of machine_key
                is_send: license.willSend
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
    },

    updateLicense(license, success, fail) {
        api.shared().put('/licenses/' + license.id, {
                customer: license.customer,
                email: license.email,
                limit: license.limit,
                started_at: license.startedAt + "T00:00:00Z",
                period: license.period,
                machine_key: license.previous, // history of machine_key
                is_send: license.willSend
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
    },

    // deleteLicense deletes license with id
    deleteLicense(id, success, fail) {
        api.shared().delete('/licenses/' + id)
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    // downloadLicense download license file
    downloadLicense(id, success, fail) {
        api.shared().get('/licenses/download/' + id)
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

    // readLicenses reads all licenses with query
    readLicenses(query, offset, count, success, fail) {
        api.shared().get('/licenses', {
                params: {
                    query: query,
                    offset: offset,
                    count: count
                }
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

module.exports = LicenseService;