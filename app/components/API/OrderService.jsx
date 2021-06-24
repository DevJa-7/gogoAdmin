import * as CONST from "../Common/constants"
import axios from 'axios'
import api from './api'

var OrderService = {
    // readOrders reads all loactions with query

    readOrder(id, success, fail) {
        api.shared().get('/orders/' + id)
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

    readOrders(query, success, fail) {
        api.shared().get('/orders?query=' + query, {
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

    // readOrdersReview reads all loactions with query
    readOrdersReview(id, query, success, fail) {
        api.shared().get('/orders/review/' + id + '?query=' + query, {
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
};

module.exports = OrderService;