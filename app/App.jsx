/*!
 *
 * Angle - Bootstrap Admin App + ReactJS
 *
 * Version: 3.5.5
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link, hashHistory, useRouterHistory, IndexRoute } from 'react-router'
import { createHistory } from 'history'

import initTranslation from './components/Common/localize'
import initLoadThemes from './components/Common/load-themes'
import api from './components/API/api'
import Config from './components/Common/Config'
import AdminService from './components/API/AdminService'

import Base from './components/Layout/Base'
import BasePage from './components/Layout/BasePage'
import BaseHorizontal from './components/Layout/BaseHorizontal'

{
    /******************* Login View ********************/
}
import Login from './components/View/Login'

{
    /******************* Dashboard Views ********************/
}
import DashboardV2 from './components/View/Dashboard/DashboardV2'

{
    /******************* Management Views ********************/
}
import Admins from './components/View/Admin/Admins'
import Businesses from './components/View/Business/Businesses'
import BusinessProfile from './components/View/Business/BusinessProfile'
import BusinessFoodTypes from './components/View/Business/BusinessFoodTypes'
import Foods from './components/View/Food/Foods'
import FoodDetail from './components/View/Food/FoodDetail'
import Users from './components/View/User/Users'
import Drivers from './components/View/Driver/Drivers'
import DriverProfile from './components/View/Driver/DriverProfile'
import Locations from './components/View/Location/Locations'
import Vehicles from './components/View/Vehicle/Vehicles'

{
    /******************* Trips Views ********************/
}
import Orders from './components/View/Order/Orders'
import OrderDetails from './components/View/Order/OrderDetails'
import Trips from './components/View/Trip/Trips'
import TripDetails from './components/View/Trip/TripDetails'
import PaymentTransactions from './components/View/PaymentTransaction/PaymentTransactions'
import Problems from './components/View/Problem/Problems'

{
    /******************* Services Views ********************/
}
import Notifications from './components/View/Notification/Notifications'
import Referrals from './components/View/Referral/Referrals'
import Emails from './components/View/Email/Emails'

{
    /******************* Settings Views ********************/
}
import Urls from './components/View/Url/Urls'
import Roles from './components/View/Role/Roles'
import Documents from './components/View/Document/Documents'
import Brands from './components/View/Brand/Brands'
import Colors from './components/View/Color/Colors'
import Dietaries from './components/View/Dietary/Dietaries'
import MealKinds from './components/View/MealKind/MealKinds'
import Profile from './components/View/Profile/Profile'
import Configuration from './components/View/Configuration/Configuration'
import Reasons from './components/View/Reason/Reasons'
import Ads from './components/View/Ads/Ads'

import NotFound from './components/Pages/NotFound'

// Application Styles
import './styles/bootstrap.scss'
import './styles/app.scss'

var loadingPage = false
var initialized = false

$(function () {
    // Init translation system
    initTranslation()
    // Init css loader (for themes)
    initLoadThemes()


    // AdminService.readAdminURLGroups((res) => {
    renderRouter()
    initialized = true
    if (!loadingPage) {
        $('.loading-landing-panel').remove()
    }
    // }, (err) => {
    //   console.log("url err",err)
    // if (err) {
    //   api.logout()
    //   location.href = '/login'
    // }
    // })

    setTimeout(() => {
        if (initialized) {
            $('.loading-landing-panel').remove()
        } else {
            loadingPage = false
        }
    }, 4000)
})

// Disable warning "Synchronous XMLHttpRequest on the main thread is deprecated.."
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    options.async = true
})

// specify basename below if running in a subdirectory or set as "/" if app runs in root
const appHistory = useRouterHistory(createHistory)({
    basename: WP_BASE_HREF
})

function requireAuth(nextState, replace) {
    if (!api.loggedIn()) {
        replace({
            pathname: '/login',
            state: {
                nextPathname: nextState.location.pathname
            }
        })
    } else {
        var requestUrl = nextState.location.basename + nextState.location.pathname
        if (requestUrl == '/' || requestUrl == '//' || requestUrl == '/dashboard')
            return
    }
}

function renderRouter() {
    ReactDOM.render(
        <Router history={appHistory}>
            {/* Landing */}
            <Route path='/' component={Base}>
                {/* Default route*/}
                <IndexRoute component={DashboardV2} onEnter={requireAuth} />
            </Route>
            {/* Login */}
            <Route path='/' component={BasePage}>
                <Route path='login' component={Login} />
            </Route>
            {/* Views */}
            <Route path='/' component={Base} onEnter={requireAuth}>
                {/* Dashboard */}
                <Route path='dashboard' component={DashboardV2} />
                {/* Management */}
                <Route path='admins' component={Admins} />
                <Route path='businesses' component={Businesses} />
                <Route path='business/profile' component={BusinessProfile} />
                <Route path='business/foodType' component={BusinessFoodTypes} />
                <Route path='foods' component={Foods} />
                <Route path='foodDetail' component={FoodDetail} />
                <Route path='users' component={Users} />
                <Route path='drivers' component={Drivers} />
                <Route path='driver/profile' component={DriverProfile} />
                <Route path='locations' component={Locations} />
                <Route path='vehicles' component={Vehicles} />
                {/* Trips */}
                <Roles path='orders' component={Orders} />
                <Route path='order/details' component={OrderDetails} />
                <Route path='trips' component={Trips} />
                <Route path='trip/details' component={TripDetails} />
                <Route path='payments' component={PaymentTransactions} />
                <Route path='problems' component={Problems} />
                {/* Services */}
                <Route path='notifications' component={Notifications} />
                <Route path='referrals' component={Referrals} />
                <Route path='emails' component={Emails} />
                {/* Settings */}
                <Route path='urls' component={Urls} />
                <Route path='roles' component={Roles} />
                <Route path='documents' component={Documents} />
                <Route path='brands' component={Brands} />
                <Route path='colors' component={Colors} />
                <Route path='dietaries' component={Dietaries} />
                <Route path='mealKinds' component={MealKinds} />
                <Route path='reasons' component={Reasons} />
                <Route path='profile' component={Profile} />
                <Route path='configuration' component={Configuration} />
                <Route path='ads' component={Ads} />
            </Route>
            {/* Not found handler */}
            <Route path='*' component={NotFound} />
        </Router>,
        document.getElementById('app')
    )
}

// Auto close sidebar on route changes
appHistory.listen(function (ev) {
    $('body').removeClass('aside-toggled')
})
