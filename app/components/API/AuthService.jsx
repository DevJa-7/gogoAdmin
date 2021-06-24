import axios from 'axios'
import api from './api'
import Config from '../Common/Config';

var AuthService = {
    login(_email, _password, success, fail) {
        api
            .shared()
            .post('admin/login', {
                email: _email,
                password: _password
            })
            .then(function (response) {
                api.setToken(response.data.token);
                api.setCurrentUser(response.data.user);
                success();
            })
            .catch(function (error) {
                fail(error.response.data);
            });
    }
}

module.exports = AuthService;