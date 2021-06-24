import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var RoleService = {
    // createRole
    createRole(role, success, fail) {
        api.shared().post('/roles', {
                name: role.name,
                urlGroup: role.urlGroup
            })
            .then(function(response) {
                success(response.data);
            })
            .catch(function(error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateRole(role, success, fail) {
        api.shared().put('/roles/' + role.id, {
                name: role.name,
                urlGroup: role.urlGroup
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
    deleteRole(id, success, fail) {
        api.shared().delete('/roles/' + id)
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

    readRoles(query, success, fail) {
        api.shared().get('/roles?query=' + query)
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

module.exports = RoleService;