import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import DriverService from '../../API/DriverService';
import UploadService from '../../API/UploadService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Drivers extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            driverList: {
                total: 0,
                items: []
            },
            selectedDriver: {
                verify: {
                    isVerifed: false,
                }
            },
            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            formTitle: "New Driver",
            editOption: false, //false-create, true-edit
        }
        this._closeEditForm = this._closeEditForm.bind(this);
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this._searchDrivers(1);

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();
        document.title = 'Drivers List';
    }

    // _searchUser searches users by query
    _searchDrivers(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get drivers from webservic via api
        DriverService.readDrivers(query, (res) => {
            this.ifMounted && this.setState({
                driverList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _closeEditForm(e) {
        e.preventDefault();
        $(document.body).removeClass("editsidebar-open");
    }

    _createDriver(e) {
        // initialize user data and variable
        this.ifMounted && this.setState({
            selectedDriver: {
                firstname: "",
                lastname: "",
                email: "",
                phone: "",
                status: false,
                verify: {
                    isVerifed: false,
                }
            },
            editOption: false,
            formTitle: "New Driver"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_status').prop('checked', false);
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editDriver(driver, e) {
        // get user and update state
        this.setState((old) => {
            if (!driver.verify) {
                driver.verify = { isVerified: false }
            }
            old.selectedDriver = $.extend(true, {}, driver)
            old.editOption = true
            old.formTitle = "Edit Driver"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
        setTimeout(() => {
            $('#switch_verify').prop('checked', this.state.selectedDriver.verify.isVerified);
            $('#switch_status').prop('checked', this.state.selectedDriver.status);
        }, 100)
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

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedDriver = this.state.selectedDriver;
            if (field == 'isVerify') {
                if (!selectedDriver.verify) {
                    selectedDriver.verify = {}
                }
                selectedDriver.verify.isVerified = UtilService.changeSwitchValue($('#switch_verify'))
            } else if (field == 'status') {
                selectedDriver.status = UtilService.changeSwitchValue($('#switch_status'))
            }
            this.ifMounted && this.setState({ selectedDriver })
        }, 100)
    }

    _deleteDriver(e) {
        // delete user
        DriverService.deleteDriver(this.state.selectedDriver.id, (res) => {
            this._searchDrivers(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("User is deleted correctly.", "success");
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        });
    }

    _changeField(field, e) {
        e.preventDefault();

        // search when change text
        // if (field == 'search') {
        //     this._searchUsers(this.state.activePage);
        //     return;
        // }

        // update all fields when change content
        var selectedDriver = this.state.selectedDriver;
        selectedDriver[field] = e.target.value;

        if (field == 'avatar') {
            this._uploadFile(field, this.refs.avatar.files[0]);
            return;
        }

        // update selected user state
        this.setState({
            selectedDriver: selectedDriver
        });
    }

    _uploadFile(field, file) {
        var selectedDriver = this.state.selectedDriver;

        const data = new FormData();
        data.append('path', 'drivers');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log("upload:", res)
            $.notify("File is uploaded successfully", "success");
            selectedDriver[field] = res.path;
            // reset state
            this.setState({
                selectedDriver: selectedDriver
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    // _searchUser searches users by query
    _searchDrivers(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from webservic via api
        DriverService.readDrivers(query, (res) => {
            // console.log("users", res);
            this.ifMounted && this.setState({
                driverList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.selectedDriver.status == false) this.state.selectedDriver.status = null;
            if (this.state.editOption) {
                // update driver
                DriverService.updateDriver(this.state.selectedDriver, (res) => {
                    // console.log(res);
                    this._searchDrivers(this.state.activePage);

                    $.notify("Driver is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err);
                    $.notify(err.message, "danger");
                })
            } else {
                // create driver
                DriverService.createDriver(this.state.selectedDriver, (res) => {
                    // console.log("create:", res);
                    this._searchDrivers(this.state.activePage);

                    // show notifiy
                    $.notify("Driver is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid driver data", "warning");
        }
    }

    _handlePageSelect(eventKey) {
        this._searchDrivers(eventKey);
    }

    _viewDriver(driver, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/driver/profile?driverId=' + driver.id);
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Drivers
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name, email and phone etc" className="form-control" style={{ width: '190px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-new">
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn" onClick={this._createDriver.bind(this)}>New Driver</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }} className="text-center">#</th>
                                    <th style={{ width: "48px" }} className="text-center">Avatar</th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Name'}
                                            sortField="firstname"
                                            sortIndex={0}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Email'}
                                            sortField="email"
                                            sortIndex={1}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Phone'}
                                            sortField="phone"
                                            sortIndex={2}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Verify'}
                                            sortField="verify.isVerified"
                                            sortIndex={7}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Status'}
                                            sortField="status"
                                            sortIndex={4}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Rating'}
                                            sortField="rating"
                                            sortIndex={5}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        Vehicle
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Created at'}
                                            sortField="createdAt"
                                            sortIndex={6}
                                            activeIndex={this.state.activeIndex}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">{'View'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.driverList.items.map((item, i) => {
                                        return (
                                            <tr key={'driverTr' + i} className="tr-hover text-center" onClick={this._editDriver.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>
                                                    <div className="user-block-picture thumb48 text-center">
                                                        <div className="user-block-status">
                                                            {<img src={UtilService.getProfileFromPath(item.avatar)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.firstname}  {item.lastname}</td>
                                                <td>{item.email}</td>
                                                <td>{UtilService.getPhoneNumber(item.phoneCode, item.phone)}</td>
                                                <td>{item.verify && item.verify.isVerified ? <div className="badge p-sm bg-success">Verified</div> : <div className="badge p-sm bg-danger">No</div>}</td>
                                                <td>{item.status ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-warning">Pending</div>}</td>
                                                <td><span className="fa fa-star fa-lg text-warning" style={{ marginRight: '8px' }}></span> {item.rating.toFixed(1)}</td>
                                                <td></td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td className="text-center">
                                                    <button type="button" className="btn btn-sm btn-default" onClick={this._viewDriver.bind(this, item)}>
                                                        <em className="fa fa-search"></em>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.driverList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={11}>
                                                    <p className="text-center">There is no any data.</p>
                                                </td>
                                            </tr>
                                        )
                                    }
                                })()}
                            </tbody>
                        </Table>
                    </Panel>
                    <div className="text-center">
                        <Pagination
                            className={this.state.driverList.total === 0 ? 'hidden' : 'shown'}
                            prev
                            next
                            first
                            last
                            ellipsis
                            maxButtons={5}
                            items={this.state.numOfPages}
                            activePage={this.state.activePage}
                            onSelect={this._handlePageSelect.bind(this)}>
                        </Pagination>
                    </div>
                </div>
                <aside className="editsidebar">
                    <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                    <form id="editForm" className="form" data-parsley-validate="">
                        <div className="form-group">
                            <label className="control-label">First Name</label>
                            <input type="text" value={this.state.selectedDriver.firstname || ''} placeholder="First Name" required="required" onChange={this._changeField.bind(this, 'firstname')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Last Name</label>
                            <input type="text" value={this.state.selectedDriver.lastname || ''} placeholder="Last Name" required="required" onChange={this._changeField.bind(this, 'lastname')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <input type="text" value={this.state.selectedDriver.email || ''} placeholder="Email" required="required" data-parsley-type="email" onChange={this._changeField.bind(this, 'email')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Phone</label>
                            <input type="text" value={this.state.selectedDriver.phone || ''} placeholder="Phone" onChange={this._changeField.bind(this, 'phone')} className="form-control" />
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Is Verify</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_verify" onClick={this._changeSwitch.bind(this, 'isVerify')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Status</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'status')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <div className="form-group">
                            <label className="control-label" style={{ marginTop: '6px' }}>Avatar</label>
                            <Col md={12} className="padding">
                                <input
                                    type="file"
                                    ref="avatar"
                                    data-classbutton="btn btn-default"
                                    data-classinput="form-control inline"
                                    className="form-control filestyle"
                                    onChange={this._changeField.bind(this, 'avatar')} />
                            </Col>
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm.bind(this)}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmDriver.bind(this)} >
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper>
        )
    }

}

Drivers.contextTypes = {
    router: PropTypes.object.isRequired
}

export default Drivers;
