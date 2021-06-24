import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var DocumentService = {
    // createDocument creates document with data
    createDocument(data, success, fail) {
        api.shared().post('/documents', data)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateDocument(data, success, fail) {
        api.shared().put('/documents/' + data.id, data)
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

    // deleteDocument deletes document with id
    deleteDocument(id, success, fail) {
        api.shared().delete('/documents/' + id)
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

    // readDocuments reads all documents with query
    readDocuments(query, success, fail) {
        api.shared().get('/documents?query=' + query, {

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
}

module.exports = DocumentService;