import * as CONST from '../Common/constants'
import axios from 'axios'
import api from './api'
import Config from '../Common/Config'

var AdminService = {
  // createUser creates user with data
  createAdmin(admin, success, fail) {
    api.shared().post('/admins', admin)
      .then(function (response) {
        success(response.data)
      })
      .catch(function (error) {
        console.log(error.response)
        fail(error.response.data)
      })
  },

  updateAdmin(admin, success, fail) {
    api.shared().put('/admins/' + admin.id, admin)
      .then(function (response) {
        success(response.data)
      })
      .catch(function (error) {
        console.log(error)
        console.log(error.response)
        if (error.response != undefined) {
          fail(error.response.data)
        }
      })
  },

  // deleteUser deletes user with id
  deleteAdmin(id, success, fail) {
    api.shared().delete('/admins/' + id)
      .then(function (response) {
        success(response.data)
      })
      .catch(function (error) {
        console.log(error.response)
        fail(error.response.data)
      })
  },

  // readUsers reads all users with query
  readAdmins(query, success, fail) {
    api.shared().get('/admins?query=' + query, {

    })
      .then(function (response) {
        success(response.data)
      })
      .catch(function (error) {
        console.log(error.response)
        fail(error.response.data)
      })
  },

  setPassword(user, success, fail) {
    api.shared().post('/admins/setPassword', {
      oldPassword: user.password,
      newPassword: user.newPassword
    })
      .then(function (response) {
        success(response.data)
      })
      .catch(function (error) {
        console.log(error.response)
        fail(error.response.data)
      })
  },

  readAdminURLGroups(success, fail) {
    api.shared().get('/admins/url/groups')
      .then(function (response) {
        Config.urls = response.data
        success(response.data)
      })
      .catch(function (error) {
        console.log(error.response)
        fail(error)
      })
  }
}

module.exports = AdminService
