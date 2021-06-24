import React from 'react';
import PropTypes from 'prop-types';
import pubsub from 'pubsub-js';
import { NavDropdown, MenuItem, ListGroup, ListGroupItem } from 'react-bootstrap';
import { Router, Route, Link, History } from 'react-router';

import HeaderRun from './Header.run'
import api from '../API/api';

// Necessary to create listGroup inside navigation items
class CustomListGroup extends React.Component {
    render() {
        return (
            <ul className="list-group">
                {this.props.children}
            </ul>
        );
    }
}

class Header extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            user: {}
        };
        this.userId = $.localStorage.get("user").id;
        this.onSelectUserMenu = this.onSelectUserMenu.bind(this);
    }

    componentDidMount() {
        HeaderRun();
    }

    toggleUserblock(e) {
        e.preventDefault();
        pubsub.publish('toggleUserblock');
    }

    onSelectUserMenu(eventKey) {
        if (eventKey == 4.1) { //go profile

        } else {
            //logout
            api.logout();
            this.context.router.push('login')
        }
    }

    render() {
        const ddAlertTitle = (
            <span>
                <em className="icon-bell"></em>
                <span className="label label-danger">11</span>

            </span>
        )
        const ddLogoutTitle = (
            <span>
                <em className="icon-logout"></em>
            </span>
        )
        return (
            <header className="topnavbar-wrapper">
                { /* START Top Navbar */}
                <nav role="navigation" className="navbar topnavbar">
                    { /* START navbar header */}
                    <div className="navbar-header">
                        <a href="#/" className="navbar-brand">
                            <div className="brand-logo">
                                <img src="img/logo_white.png" alt="gogo" className="img-responsive logo_gogo_dash" />
                            </div>
                            <div className="brand-logo-collapsed">
                                <img src="img/logo_white.png" alt="gogo" className="img-responsive img-coll"/>
                            </div>
                        </a>
                    </div>
                    { /* END navbar header */}
                    { /* START Nav wrapper */}
                    <div className="nav-wrapper">
                        { /* START Left navbar */}
                        <ul className="nav navbar-nav">
                            <li>
                                { /* Button used to collapse the left sidebar. Only visible on tablet and desktops */}
                                <a href="#" data-trigger-resize="" data-toggle-state="aside-collapsed" className="hidden-xs">
                                    <em className="fa fa-navicon"></em>
                                </a>
                                { /* Button to show/hide the sidebar on mobile. Visible on mobile only. */}
                                <a href="#" data-toggle-state="aside-toggled" data-no-persist="true" className="visible-xs sidebar-toggle">
                                    <em className="fa fa-navicon"></em>
                                </a>
                            </li>
                        </ul>
                        { /* END Left navbar */}
                        { /* START Right Navbar */}
                        <ul className="nav navbar-nav navbar-right">
                            { /* Fullscreen (only desktops) */}
                            <li className="visible-lg">
                                <a href="#" data-toggle-fullscreen="">
                                    <em className="fa fa-expand"></em>
                                </a>
                            </li>
                            { /* START Alert menu */}
                            { /*
                            <NavDropdown noCaret eventKey={3} title={ddAlertTitle} className="dropdown-list" id="basic-nav-dropdown" >
                                <CustomListGroup>
                                    <ListGroupItem href="javascript:void(0)">
                                        <div className="media-box">
                                            <div className="pull-left">
                                                <em className="fa fa-twitter fa-2x text-info"></em>
                                            </div>
                                            <div className="media-box-body clearfix">
                                                <p className="m0">New followers</p>
                                                <p className="m0 text-muted">
                                                    <small>1 new follower</small>
                                                </p>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                    <ListGroupItem href="javascript:void(0)">
                                        <div className="media-box">
                                            <div className="pull-left">
                                                <em className="fa fa-envelope fa-2x text-warning"></em>
                                            </div>
                                            <div className="media-box-body clearfix">
                                                <p className="m0">New e-mails</p>
                                                <p className="m0 text-muted">
                                                    <small>You have 10 new emails</small>
                                                </p>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                    <ListGroupItem href="javascript:void(0)">
                                        <div className="media-box">
                                            <div className="pull-left">
                                                <em className="fa fa-tasks fa-2x text-success"></em>
                                            </div>
                                            <div className="media-box-body clearfix">
                                                <p className="m0">Pending Tasks</p>
                                                <p className="m0 text-muted">
                                                    <small>11 pending task</small>
                                                </p>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                    <ListGroupItem href="javascript:void(0)">
                                        <small>More notifications</small>
                                        <span className="label label-danger pull-right">14</span>
                                    </ListGroupItem>

                                </CustomListGroup>
                            </NavDropdown>
                            */ }
                            { /* END Alert menu */}
                            { /* START Logout menu */}
                            <NavDropdown noCaret eventKey={4} title={ddLogoutTitle} id="basic-nav-dropdown" >
                                <MenuItem className="animated flipInX" eventKey={4.3} onSelect={this.onSelectUserMenu}>Logout</MenuItem>
                            </NavDropdown>
                            { /* END Alert menu */}
                            <li>
                                <a href="#" data-toggle-state="offsidebar-open" data-no-persist="true">
                                    <em className="icon-notebook"></em>
                                </a>
                            </li>

                            { /* END Offsidebar menu */}
                        </ul>
                        { /* END Right Navbar */}
                    </div>
                    { /* END Nav wrapper */}

                </nav>
                { /* END Top Navbar */}
            </header>
        );
    }

}

Header.contextTypes = {
    router: PropTypes.object.isRequired
}

export default Header;
