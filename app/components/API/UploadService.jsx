import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var UploadService = {
    uploadImage(data, success, fail) {
        api.setFormRequest();

        api.shared().post('/uploads/image',
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
}

module.exports = UploadService;