import React from 'react';
import { Router, Route, Link, History, withRouter } from 'react-router';
import pubsub from 'pubsub-js';
import { Collapse } from 'react-bootstrap';
import SidebarRun from './Sidebar.run';
import api from '../API/api';
import UtilService from '../Common/UtilService';
import Config from '../Common/Config';

class Sidebar extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            userBlockCollapse: true,
            collapse: {
                dashboard: this.routeActive('dashboard'),
                management: false,
                trips: false
            }
        };
        this.pubsub_token = pubsub.subscribe('toggleUserblock', () => {
            this.setState({
                userBlockCollapse: !this.state.userBlockCollapse
            });
        });
        this.currentUser = api.getCurrentUser();
    };

    componentDidMount() {
        // pass navigator to access router api
        SidebarRun(this.navigator.bind(this));
    }

    navigator(route) {
        this.props.router.push(route)
    }

    componentWillUnmount() {
        // React removed me from the DOM, I have to unsubscribe from the pubsub using my token
        pubsub.unsubscribe(this.pubsub_token);
    }

    routeActive(paths) {
        paths = Array.isArray(paths) ? paths : [paths];
        for (let p in paths) {
            if (this.props.router.isActive(paths[p]) === true)
                return true;
        }
        return false;
    }

    toggleItemCollapse(stateName) {
        var newCollapseState = {};
        for (let c in this.state.collapse) {
            if (this.state.collapse[c] === true && c !== stateName)
                this.state.collapse[c] = false;
        }
        this.setState({
            collapse: {
                [stateName]: !this.state.collapse[stateName]
            }
        });
    }

    isAllowedURL(url) {
        // if (api.getCurrentUser().role.code == 100) {
        //     return true;
        // }
        // // console.log("isAllowedURL", Config.urls)
        // if (Config.urls.indexOf(url) == -1) {
        //     return false;
        // }
        return true;
    }

    render() {
        return (
            <aside className='aside'>
                { /* START Sidebar (left) */}
                <div className="aside-inner">
                    <nav data-sidebar-anyclick-close="" className="sidebar">
                        { /* START sidebar nav */}
                        <ul className="nav">
                            { /* START user info */}
                            <li className="has-user-block">
                                <Collapse id="user-block" in={this.state.userBlockCollapse}>
                                    <div>
                                        <div className="item user-block">
                                            { /* User picture */}
                                            <div className="user-block-picture">
                                                <div className="user-block-status">
                                                    <img src={UtilService.getProfileFromPath(this.currentUser.avatar)} alt="Avatar" width="60" height="60" className="img-thumbnail img-circle" />
                                                    {this.currentUser.isVerify ? <div className=" circle circle-success circle-lg"></div> : <div className=" circle circle-danger circle-lg"></div>}
                                                </div>
                                            </div>
                                            { /* Name and Job */}
                                            <div className="user-block-info">
                                                <span className="user-block-name"><span data-localize="sidebar.HI">Hello,</span> {this.currentUser.firstname}</span>
                                                <span className="user-block-role">{this.currentUser.role ? this.currentUser.role.name : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Collapse>
                            </li>
                            { /* END user info */}
                            { /* Iterates over all sidebar items */}
                            {/*<li className="nav-heading ">
                                <span data-localize="sidebar.heading.HEADER">Main Navigation</span>
                            </li>*/}
                            <li className={this.routeActive('dashboard') ? 'active' : ''} style={{ display: this.isAllowedURL('/dashboard') ? 'block' : 'none' }}>
                                <Link to="dashboard" title="Dashboard">
                                    <em className="icon-speedometer"></em>
                                    <span data-localize="sidebar.nav.DASHBOARD">Dashboard</span>
                                </Link>
                            </li>
                            <li>
                                <div className="nav-item" title="Management" onClick={this.toggleItemCollapse.bind(this, 'management')}>
                                    <em className="icon-layers"></em>
                                    <span data-localize="sidebar.nav.MANAGEMENT">Management</span>
                                </div>
                                <Collapse in={this.state.collapse.management}>
                                    <ul id="#" className="nav sidebar-subnav">
                                        <li className="sidebar-subnav-header">Management</li>

                                        <li className={this.routeActive('admins') ? 'active' : ''} style={{ display: this.isAllowedURL('/admins') ? 'block' : 'none' }}>
                                            <Link to="admins">
                                                <span data-localize="sidebar.nav.managements.ADMINISTRATORS">Administrators</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('businesses') ? 'active' : ''} style={{ display: this.isAllowedURL('/businesses') ? 'block' : 'none' }}>
                                            <Link to="businesses">
                                                <span data-localize="sidebar.nav.managements.BUSINESSESS">Businesses</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('users') ? 'active' : ''} style={{ display: this.isAllowedURL('/users') ? 'block' : 'none' }}>
                                            <Link to="users" title="Users">
                                                <span data-localize="sidebar.nav.managements.USERS">Users</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('drivers') ? 'active' : ''} style={{ display: this.isAllowedURL('/drivers') ? 'block' : 'none' }}>
                                            <Link to="drivers" title="Drivers">
                                                <span data-localize="sidebar.nav.managements.DRIVERS">Drivers</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('locations') ? 'active' : ''} style={{ display: this.isAllowedURL('/locations') ? 'block' : 'none' }}>
                                            <Link to="locations" title="Locations">
                                                <span data-localize="sidebar.nav.managements.LOCATIONS">Locations</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('vehicles') ? 'active' : ''} style={{ display: this.isAllowedURL('/vehicles') ? 'block' : 'none' }}>
                                            <Link to="vehicles" title="Vehicles">
                                                <span data-localize="sidebar.nav.managements.VEHICLES">Vehicles</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </Collapse>
                            </li>
                            <li>
                                <div className="nav-item" title="Trips" onClick={this.toggleItemCollapse.bind(this, 'trips')}>
                                    <em className="icon-graph"></em>
                                    <span data-localize="sidebar.nav.orders.ORDERS">Trips</span>
                                </div>
                                <Collapse in={this.state.collapse.trips}>
                                    <ul id="#" className="nav sidebar-subnav">
                                        <li className={this.routeActive('orders') ? 'active' : ''} style={{ display: this.isAllowedURL('/orders') ? 'block' : 'none' }}>
                                            <Link to="orders" title="Orders">
                                                <span data-localize="sidebar.nav.orders.ORDERS">Orders</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('trips') ? 'active' : ''} style={{ display: this.isAllowedURL('/trips') ? 'block' : 'none' }}>
                                            <Link to="trips" title="Trips">
                                                <span data-localize="sidebar.nav.orders.ORDERS">Trips</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('payments') ? 'active' : ''} style={{ display: this.isAllowedURL('/payments') ? 'block' : 'none' }}>
                                            <Link to="payments" title="Payment Transaction">
                                                <span data-localize="sidebar.nav.orders.TRANSACTION">Payment Transaction</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('problems') ? 'active' : ''} style={{ display: this.isAllowedURL('/problems') ? 'block' : 'none' }}>
                                            <Link to="problems" title="Problems">
                                                <span data-localize="sidebar.nav.orders.PROBLEMS">Problems</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </Collapse>
                            </li>
                            <li>
                                <div className="nav-item" title="Services" onClick={this.toggleItemCollapse.bind(this, 'services')}>
                                    <em className="icon-energy"></em>
                                    <span>Services</span>
                                </div>
                                <Collapse in={this.state.collapse.services}>
                                    <ul id="#" className="nav sidebar-subnav">
                                        <li className={this.routeActive('notifications') ? 'active' : ''} style={{ display: this.isAllowedURL('/notifications') ? 'block' : 'none' }}>
                                            <Link to="notifications" title="Notifications">
                                                <span>Notifications</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('referrals') ? 'active' : ''} style={{ display: this.isAllowedURL('/referrals') ? 'block' : 'none' }}>
                                            <Link to="referrals" title="Referrals">
                                                <span>Referrals</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('emails') ? 'active' : ''} style={{ display: this.isAllowedURL('/emails') ? 'block' : 'none' }}>
                                            <Link to="emails" title="Emails">
                                                <span>Emails</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </Collapse>
                            </li>
                            <li>
                                <div className="nav-item" title="Settings" onClick={this.toggleItemCollapse.bind(this, 'settings')}>
                                    <em className="icon-settings"></em>
                                    <span>Settings</span>
                                </div>
                                <Collapse in={this.state.collapse.settings}>
                                    <ul id="#" className="nav sidebar-subnav">
                                        <li className={this.routeActive('urls') ? 'active' : ''} style={{ display: this.isAllowedURL('/urls') ? 'block' : 'none' }}>
                                            <Link to="urls" title="Urls">
                                                <span>Urls</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('roles') ? 'active' : ''} style={{ display: this.isAllowedURL('/roles') ? 'block' : 'none' }}>
                                            <Link to="roles" title="Roles">
                                                <span>Roles</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('documents') ? 'active' : ''} style={{ display: this.isAllowedURL('/documents') ? 'block' : 'none' }}>
                                            <Link to="documents" title="Documents">
                                                <span>Documents</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('brands') ? 'active' : ''} style={{ display: this.isAllowedURL('/brands') ? 'block' : 'none' }}>
                                            <Link to="brands" title="Brands">
                                                <span>Brands</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('colors') ? 'active' : ''} style={{ display: this.isAllowedURL('/colors') ? 'block' : 'none' }}>
                                            <Link to="colors" title="Colors">
                                                <span>Colors</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('dietaries') ? 'active' : ''} style={{ display: this.isAllowedURL('/dietaries') ? 'block' : 'none' }}>
                                            <Link to="dietaries" title="Dietaries">
                                                <span>Dietaries</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('mealKinds') ? 'active' : ''} style={{ display: this.isAllowedURL('/mealKinds') ? 'block' : 'none' }}>
                                            <Link to="mealKinds" title="MealKinds">
                                                <span>Meal Kinds</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('reasons') ? 'active' : ''} style={{ display: this.isAllowedURL('/reasons') ? 'block' : 'none' }}>
                                            <Link to="reasons" title="Reasons">
                                                <span>Reasons</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('profile') ? 'active' : ''} style={{ display: this.isAllowedURL('/profile') ? 'block' : 'none' }}>
                                            <Link to="profile" title="Profile">
                                                <span>Profile</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('ads') ? 'active' : ''} style={{ display: this.isAllowedURL('/ads') ? 'block' : 'none' }}>
                                            <Link to="ads" title="Ads">
                                                <span>Ads</span>
                                            </Link>
                                        </li>
                                        <li className={this.routeActive('configuration') ? 'active' : ''} style={{ display: this.isAllowedURL('/configuration') ? 'block' : 'none' }}>
                                            <Link to="configuration" title="Configuration">
                                                <span>Configuration</span>
                                            </Link>
                                        </li>
                                    </ul>
                                </Collapse>
                            </li>
                        </ul>
                        { /* END sidebar nav */}
                    </nav>
                </div>
                { /* END Sidebar (left) */}
            </aside>
        );
    }

}

export default withRouter(Sidebar);
