import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var UserService = {
    // createUser creates user with data
    createUser(user, success, fail) {
        api.shared().post('/users', user)
            .then(function (response) {
                success(response.data);
            })
            .catch(function (error) {
                console.log(error.response)
                fail(error.response.data);
            });
    },

    updateUser(user, success, fail) {
        api.shared().put('/users/' + user.id, user)
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

    updateUserProfile(user, success, fail) {
        api.shared().put('/users/profile/' + user.id, user)
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

    // deleteUser deletes user with id
    deleteUser(id, success, fail) {
        api.shared().delete('/users/' + id)
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

    // readUsers reads all users with query
    readUsers(query, success, fail) {
        api.shared().get('/users?query=' + query, {

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

module.exports = UserService;