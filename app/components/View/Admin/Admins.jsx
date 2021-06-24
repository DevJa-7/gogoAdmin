import React from 'react';
import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import AdminService from '../../API/AdminService';
import UploadService from '../../API/UploadService';
import RoleService from '../../API/RoleService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Admin extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            adminList: {
                total: 0,
                items: []
            },
            roles: [],
            selectedAdmin: {
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

            formTitle: "New Administrator",
            editOption: false //false-create, true-edit
        };

        // reset editForm
        this.editForm = null;
        this.currentUser = api.getCurrentUser();
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchAdmins(1);
        this._searchRoles();

        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchAdmins(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from backend servic via service api
        AdminService.readAdmins(query, (res) => {
            // console.log("Data Admin", res);
            this.ifMounted && this.setState({
                adminList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _searchRoles(e) {
        if (e)
            e.preventDefault();

        RoleService.readRoles("", (res) => {
            this.ifMounted && this.setState({
                roles: res.items
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createAdmin(e) {
        // initialize user data and variable
        this.setState({
            selectedAdmin: {
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                confirmPassword: "",
                roleCode: CONST.MIN_ROLE_CODE,
                verify: {
                    isVerified: false,
                },
                status: false,
            },
            editOption: false,
            formTitle: "New Administrator"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_verify').prop('checked', false);
        $('#switch_status').prop('checked', false);
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editAdmin(admin, e) {
        this.setState((old) => {
            if (!admin.verify) {
                admin.verify = { isVerified: false }
            }
            old.selectedAdmin = $.extend(true, {}, admin)//_.clone(admin)//$.extend([], admin)//
            old.editOption = true
            old.formTitle = "Edit Administrator"
        });

        console.log("selected admin:", admin)
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
        setTimeout(() => {
            $('#switch_verify').prop('checked', admin.verify.isVerified);
            $('#switch_status').prop('checked', admin.status);
        }, 100)
    }

    _submitForm(e) {
        if (e)
            e.preventDefault();
        console.log("admin", this.state.selectedAdmin);
        this.editForm.validate();
        if (this.editForm.isValid()) {
            if (this.state.editOption) {
                AdminService.updateAdmin(this.state.selectedAdmin, (res) => {
                    this._searchAdmins(this.state.activePage);

                    $.notify("Administrator is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    //console.log(err.message);
                    $.notify(err.message, "danger");
                })
            } else {
                //create user
                AdminService.createAdmin(this.state.selectedAdmin, (res) => {
                    //console.log("create", res);
                    this._searchAdmins(this.state.activePage);

                    // show notifiy
                    $.notify("Administrator is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    //console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("invalid user data");
            $.notify("Input data is invalid admin data", "warning");
        }
    }

    _deleteConfirmAdmin(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this administrator!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteAdmin();
        });
    }

    _deleteAdmin(e) {
        AdminService.deleteAdmin(this.state.selectedAdmin.id, (res) => {
            this._searchAdmins(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Administrator is deleted correctly.", "success");
        }, (err) => {
            //console.log(err.message);
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
        if (field == 'search') {
            this._searchAdmins(this.state.activePage);
            return;
        }

        // update all fields when change content
        var selectedAdmin = this.state.selectedAdmin;
        if (field == 'avatar') {
            this._uploadFile(field, this.refs.avatar.files[0]);
            return;
        } else if (field == 'roleCode') {
            // this case is that for option select
            selectedAdmin[field] = Number(e.target.value);
        } else {
            selectedAdmin[field] = e.target.value;
        }
        // update selected user state
        this.setState({ selectedAdmin });
    }

    _uploadFile(field, file) {
        var selectedAdmin = this.state.selectedAdmin;

        const data = new FormData();
        data.append('path', 'admins');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedAdmin[field] = res.path;
            // reset state
            this.setState({
                selectedAdmin: selectedAdmin
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedAdmin = this.state.selectedAdmin;
            if (field == 'isVerify') {
                if (!selectedAdmin.verify) {
                    selectedAdmin.verify = {}
                }
                selectedAdmin.verify.isVerified = UtilService.changeSwitchValue($('#switch_verify'))
            } else if (field == 'status') {
                selectedAdmin.status = UtilService.changeSwitchValue($('#switch_status'))
            }
            this.ifMounted && this.setState({ selectedAdmin })
        }, 100)
    }

    _handlePageSelect(eventKey) {
        this._searchAdmins(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchAdmins(this.state.activePage);
    }

    render() {
        const hiddenPassword = function (self, hidden) {
            if (!hidden) {
                return (
                    <div>
                        <FormGroup>
                            <p>Password</p>
                            <input type="text" id="password" value={self.state.selectedAdmin.password || ''} required="required" onChange={self._changeField.bind(self, 'password')} type="password" placeholder="Password" className="form-control" pattern={CONST.REGEXP_PASSWORD} />
                        </FormGroup>
                        <FormGroup>
                            <p>Confirm Password</p>
                            <input type="text" value={self.state.selectedAdmin.confirmPassword || ''} required="required" data-parsley-equalto="#password" onChange={self._changeField.bind(self, 'confirmPassword')} type="password" placeholder="Confirm Password" className="form-control" />
                        </FormGroup>
                    </div>
                )
            }
        };

        const isCurrentUser = function (self) {
            return (self.state.editOption && self.currentUser.id == self.state.selectedAdmin.id)
        };

        return (
            <ContentWrapper>
                <div className="content-heading">
                    <span data-localize="sidebar.nav.managements.ADMINISTRATORS">Administrators</span>
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" onClick={this._createAdmin.bind(this)}>Add New</button>
                    </div>
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name and email" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-new" onClick={this._searchAdmins.bind(this, 1)}>
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn" onClick={this._createAdmin.bind(this)}>New Administrator</button>
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
                                            sortField="user_name"
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
                                            label={'Role'}
                                            action={this._sortList.bind(this)}
                                            sortField="role_code"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Verify'}
                                            action={this._sortList.bind(this)}
                                            sortField="verify.isVerified"
                                            sortIndex={3}
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
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={5}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Updated at'}
                                            action={this._sortList.bind(this)}
                                            sortField="updatedAt"
                                            sortIndex={6}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.adminList.items.map((item, i) => {
                                        return (
                                            <tr key={'adminTr' + i} className="tr-hover text-center" onClick={this._editAdmin.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>
                                                    <div className="user-block-picture thumb48 text-center">
                                                        {<img src={UtilService.getProfileFromPath(item.avatar)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                    </div>
                                                </td>
                                                <td>{item.firstname}  {item.lastname}</td>
                                                <td>{item.email}</td>
                                                <td>{item.role != undefined ? item.role.name : "-"}</td>
                                                <td>{item.verify && item.verify.isVerified ? <div className="badge p-sm bg-success">Verified</div> : <div className="badge p-sm bg-danger">No</div>}</td>
                                                <td>{item.status ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-danger">Deactive</div>}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.adminList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={8}>
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
                            className={this.state.adminList.total === 0 ? 'hidden' : 'shown'}
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
                            <input type="text" value={this.state.selectedAdmin.firstname || ''} placeholder="First Name" required="required" onChange={this._changeField.bind(this, 'firstname')} className="form-control" disabled={isCurrentUser(this)} />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Last Name</label>
                            <input type="text" value={this.state.selectedAdmin.lastname || ''} placeholder="Last Name" required="required" onChange={this._changeField.bind(this, 'lastname')} className="form-control" disabled={isCurrentUser(this)} />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <input type="text" value={this.state.selectedAdmin.email || ''} placeholder="Email" required="required" data-parsley-type="email" onChange={this._changeField.bind(this, 'email')} className="form-control" disabled={isCurrentUser(this)} />
                        </div>
                        {
                            hiddenPassword(this, this.state.editOption)
                        }

                        <div className="form-group">
                            <label className="control-label">Role</label>
                            <select className="form-control" required="required" value={this.state.selectedAdmin.roleCode || ''} onChange={this._changeField.bind(this, 'roleCode')} disabled={isCurrentUser(this)} >
                                <option key="" value="">Select role</option>
                                {
                                    this.state.roles.map((item, i) => {
                                        return (
                                            <option key={item.id} value={item.code}>{item.name}</option>
                                        );
                                    })
                                }
                            </select>
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
                                    onChange={this._changeField.bind(this, 'avatar')}
                                    disabled={isCurrentUser(this)} />
                            </Col>
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Is Verify</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_verify" onClick={this._changeSwitch.bind(this, 'isVerify')} disabled={isCurrentUser(this)} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Status</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'status')} disabled={isCurrentUser(this)} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', display: (this.currentUser.roleCode == CONST.ADMIN_ROLE_CODE && this.currentUser.id != this.state.selectedAdmin.id) ? 'block' : 'none' }} onClick={this._submitForm.bind(this)} >
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: (this.currentUser.roleCode == CONST.ADMIN_ROLE_CODE && this.state.editOption && this.currentUser.id != this.state.selectedAdmin.id) ? 'block' : 'none' }} onClick={this._deleteConfirmAdmin.bind(this)}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper>
        )
    }
}

export default Admin;
