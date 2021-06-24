import React from 'react';
import _ from 'underscore';
import swal from 'sweetalert';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import api from '../../../API/api';
import DriverService from '../../../API/DriverService';
import UserService from '../../../API/UserService';
import UtilService from '../../../Common/UtilService';
import * as CONST from '../../../Common/constants';

class ProfileTab extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            driver: {},
            documents: []
        };
    }

    componentDidMount() {
        this.ifMounted = true;
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        // console.log("driver:", nextProps.driver.id, nextProps.driver)
        this.ifMounted && this.setState({
            driver: nextProps.driver,
        });

        $('#switch_status').prop('checked', nextProps.driver.status);
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var driver = this.state.driver;
            driver.status = UtilService.changeSwitchValue($('#switch_status'))
            this.ifMounted && this.setState({
                driver: driver
            })
        }, 100)
    }

    _updateDriverStatus() {
        DriverService.updateDriver(this.state.driver, (res) => {
            $.notify("Profile is updated successfully.", "success");
            $(document.body).removeClass("editsidebar-open");
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _updateProfile(e) {
        e.preventDefault();
        var user = {
            id: this.state.driver.user_id,
            user_name: this.state.driver.user_name,
            email: this.state.driver.email,
            phone_number: this.state.driver.phone_number,
            image: this.state.driver.image
        }
        UserService.updateUserProfile(user, (res) => {
            this._updateDriverStatus();
            // update profile of parent
            this.props.updateDriver(this.state.driver);
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _deleteConfirmDriver(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this user!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteDriver();
        });
    }

    _deleteDriver() {
        DriverService.deleteDriver(this.state.driver.id, (res) => {
            this.props.backPage();
            $.notify("Driver is deleted correctly.", "success");
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _changeField(field, e) {
        e.preventDefault();

        // update all fields when change content
        var driver = this.state.driver;
        driver[field] = e.target.value;

        // update selected user state
        this.ifMounted && this.setState(driver);
    }

    render() {
        return (
            <div>
                <Row className="pv-lg">
                    <Col lg={12}>
                        <form className="form-horizontal">
                            <div className="form-group">
                                <label htmlFor="inputContact1" className="col-sm-2 control-label">Name:</label>
                                <div className="col-sm-10">
                                    <input id="inputContact1" type="text" placeholder="Name" value={this.state.driver.user_name || ''} onChange={this._changeField.bind(this, 'user_name')} className="form-control" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputContact1" className="col-sm-2 control-label">Email:</label>
                                <div className="col-sm-10">
                                    <input id="inputContact1" type="text" placeholder="Email" value={this.state.driver.email || ''} onChange={this._changeField.bind(this, 'email')} className="form-control" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputContact1" className="col-sm-2 control-label">Phone:</label>
                                <div className="col-sm-10">
                                    <input id="inputContact1" type="text" placeholder="+86 12345678" value={this.state.driver.phone_number || ''} onChange={this._changeField.bind(this, 'phone_number')} className="form-control" />
                                </div>
                            </div>
                            <fieldset>
                                <div className="form-group">
                                    <label htmlFor="inputContact1" className="col-sm-2 control-label pv0">Status:</label>
                                    <div className="col-sm-10">
                                        <label className="switch switch">
                                            <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'status')} />
                                            <em></em>
                                        </label>
                                    </div>
                                </div>
                            </fieldset>
                            <div className="form-group">
                                <div className="col-sm-offset-2 col-sm-10">
                                    <Button bsStyle="info" onClick={this._updateProfile.bind(this)}>Update</Button>
                                </div>
                            </div>
                        </form>
                        <div className="text-right">
                            <a href="#" className="text-muted text-danger" onClick={this._deleteConfirmDriver.bind(this)}>Delete this driver?</a>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ProfileTab;
