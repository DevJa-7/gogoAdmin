import React from 'react';
import Flag from "react-flags";
import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination, Modal, ModalBody, ModalHeader } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UserService from '../../API/UserService';
import LocationService from '../../API/LocationService';
import UploadService from '../../API/UploadService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Users extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params
        this.state = {
            userList: {
                total: 0,
                items: []
            },
            selectedUser: {
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

            locationsList: {
                locations: []
            },
            formTitle: "New User",
            showModal: false,
            editOption: false //false-create, true-edit
        };

        // reset editForm
        this.editForm = null;
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchUsers(1);
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    // _searchUser searches users by query
    _searchUsers(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from webservic via api
        UserService.readUsers(query, (res) => {
            // console.log("users", res);
            this.ifMounted && this.setState({
                userList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _createUser(e) {
        // initialize user data and variable
        this.ifMounted && this.setState({
            selectedUser: {
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                phone: "",
                verify: {
                    isVerifed: false,
                },
                status: false
            },
            editOption: false,
            formTitle: "New User"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_status').prop('checked', false);
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editUser(user, e) {
        // get user and update state
        this.setState((old) => {
            if (!user.verify) {
                user.verify = { isVerified: false }
            }
            old.selectedUser = $.extend(true, {}, user)
            old.editOption = true
            old.formTitle = "Edit User"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
        setTimeout(() => {
            console.log(this.state.selectedUser)
            $('#switch_verify').prop('checked', this.state.selectedUser.verify.isVerified);
            $('#switch_status').prop('checked', this.state.selectedUser.status);
        }, 100)
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.editOption) {
                console.log(this.state.selectedUser);
                // update user
                UserService.updateUser(this.state.selectedUser, (res) => {
                    this._searchUsers(this.state.activePage);

                    $.notify("User is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })

            } else {
                // create user
                UserService.createUser(this.state.selectedUser, (res) => {
                    // console.log("create:", res);
                    this._searchUsers(this.state.activePage);

                    // show notifiy
                    $.notify("User is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid user data", "warning");
        }
    }

    _deleteConfirmUser(e) {
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
            $this._deleteUser();
        });
    }

    _deleteUser(e) {
        // delete user
        UserService.deleteUser(this.state.selectedUser.id, (res) => {
            this._searchUsers(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("User is deleted correctly.", "success");
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        });
    }

    _closeEditForm(e) {
        e.preventDefault();
        $(document.body).removeClass("editsidebar-open");
    }

    _changeField(field, e) {
        e.preventDefault();

        // search when change text
        // if (field == 'search') {
        //     this._searchUsers(this.state.activePage);
        //     return;
        // }

        // update all fields when change content
        var selectedUser = this.state.selectedUser;
        selectedUser[field] = e.target.value;

        if (field == 'avatar') {
            this._uploadFile(field, this.refs.avatar.files[0]);
            return;
        }

        // update selected user state
        this.setState({ selectedUser });
    }

    _uploadFile(field, file) {
        var selectedUser = this.state.selectedUser;

        const data = new FormData();
        data.append('path', 'users');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log("upload:", res)
            $.notify("File is uploaded successfully", "success");
            selectedUser[field] = res.path;
            // reset state
            this.setState({
                selectedUser: selectedUser
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _handlePageSelect(eventKey) {
        this._searchUsers(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchUsers(this.state.activePage);
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedUser = this.state.selectedUser;
            if (field == 'isVerify') {
                if (!selectedUser.verify) {
                    selectedUser.verify = {}
                }
                selectedUser.verify.isVerified = UtilService.changeSwitchValue($('#switch_verify'))
            } else if (field == 'status') {
                selectedUser.status = UtilService.changeSwitchValue($('#switch_status'))
            }
            this.ifMounted && this.setState({ selectedUser })
        }, 100)
    }

    _changeInfoField(field, e) {
        e.preventDefault();

        var selectedUser = this.state.selectedUser;

        if (field == "location_id") {
            selectedUser[field] = e.target.value;
        }

        // update selected user state
        this.setState({
            selectedUser: selectedUser
        });

    }

    render() {
        const hiddenPassword = ((self, hidden) => {
            if (!hidden) {
                return (
                    <div>
                        <FormGroup>
                            <p>Password</p>
                            <input type="text" id="password" value={self.state.selectedUser.password || ''} required="required" onChange={self._changeField.bind(self, 'password')} type="password" placeholder="Password" className="form-control" pattern={CONST.REGEXP_PASSWORD} />
                        </FormGroup>
                        <FormGroup>
                            <p>Confirm Password</p>
                            <input type="text" value={self.state.selectedUser.confirmPassword || ''} required="required" data-parsley-equalto="#password" onChange={self._changeField.bind(self, 'confirmPassword')} type="password" placeholder="Confirm Password" className="form-control" />
                        </FormGroup>
                    </div>
                )
            }
        })
        const getPlatform = ((p) => {
            if (p == 'ios') {
                return <span className="fa fa-apple fa-lg text-muted"></span>
            } else if (p == 'android') {
                return <span className="fa fa-android fa-lg text-success"></span>
            }
        })

        return (
            <ContentWrapper>
                <div className="content-heading">
                    Users
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" onClick={this._createUser.bind(this)}>Add New</button>
                    </div>
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name, email and phone etc" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-new" onClick={this._searchUsers.bind(this, 1)}>
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn" onClick={this._createUser.bind(this)}>New User</button>
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
                                            action={this._sortList.bind(this)}
                                            sortField="firstname"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Email'}
                                            action={this._sortList.bind(this)}
                                            sortField="email"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Country'}
                                            action={this._sortList.bind(this)}
                                            sortField="countryCode"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Phone'}
                                            action={this._sortList.bind(this)}
                                            sortField="phone"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Promo code'}
                                            action={this._sortList.bind(this)}
                                            sortField="promoCode"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Verify'}
                                            action={this._sortList.bind(this)}
                                            sortField="verify.isVerified"
                                            sortIndex={10}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Status'}
                                            action={this._sortList.bind(this)}
                                            sortField="status"
                                            sortIndex={4}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Rating'}
                                            action={this._sortList.bind(this)}
                                            sortField="rating"
                                            sortIndex={5}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={6}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Last login'}
                                            action={this._sortList.bind(this)}
                                            sortField="lastLogin.date"
                                            sortIndex={7}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Login IP'}
                                            action={this._sortList.bind(this)}
                                            sortField="lastLogin.ip"
                                            sortIndex={8}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Platform'}
                                            action={this._sortList.bind(this)}
                                            sortField="platform"
                                            sortIndex={9}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.userList.items.map((item, i) => {
                                        return (
                                            <tr key={'userTr' + i} className="tr-hover text-center" onClick={this._editUser.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>
                                                    <div className="user-block-picture thumb48 text-center">
                                                        {<img src={UtilService.getProfileFromPath(item.avatar)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                    </div>
                                                </td>
                                                <td>{item.firstname}  {item.lastname}</td>
                                                <td>{item.email}</td>
                                                <td>
                                                    <Flag
                                                        name={item.countryCode}
                                                        format="png"
                                                        pngSize={32}
                                                        shiny={true}
                                                    />
                                                </td>
                                                <td>{UtilService.getPhoneNumber(item.phoneCode, item.phone)}</td>
                                                <td>{item.promoCode}</td>
                                                <td>{item.verify && item.verify.isVerified ? <div className="badge p-sm bg-success">Verified</div> : <div className="badge p-sm bg-danger">No</div>}</td>
                                                <td>{item.status ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-danger">Deactive</div>}</td>
                                                <td><span className="fa fa-star fa-lg text-warning" style={{ marginRight: '8px' }}></span> {item.rating.toFixed(1)}</td>
                                                <td>{UtilService.getDate(item.createdAt)}</td>
                                                <td>{item.lastLogin && UtilService.getDateTime(item.lastLogin.date)}</td>
                                                <td>{item.lastLogin && item.lastLogin.ip}</td>
                                                <td>{getPlatform(item.platform)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.userList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={14}>
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
                            className={this.state.userList.total === 0 ? 'hidden' : 'shown'}
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
                            <input type="text" value={this.state.selectedUser.firstname || ''} placeholder="First Name" required="required" onChange={this._changeField.bind(this, 'firstname')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Last Name</label>
                            <input type="text" value={this.state.selectedUser.lastname || ''} placeholder="Last Name" required="required" onChange={this._changeField.bind(this, 'lastname')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <input type="text" value={this.state.selectedUser.email || ''} placeholder="Email" required="required" data-parsley-type="email" onChange={this._changeField.bind(this, 'email')} className="form-control" />
                        </div>
                        {
                            hiddenPassword(this, this.state.editOption)
                        }
                        <div className="form-group">
                            <label className="control-label">Phone</label>
                            <input type="text" value={this.state.selectedUser.phone || ''} placeholder="Phone" onChange={this._changeField.bind(this, 'phone')} className="form-control" />
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
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmUser.bind(this)}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper>
        );
    }

}

export default Users;