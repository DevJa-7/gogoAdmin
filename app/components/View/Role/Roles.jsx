import React from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import RoleService from '../../API/RoleService'
import UrlService from '../../API/UrlService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

class Roles extends React.Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            roleList: {
                total: 0,
                items: []
            },
            selectedRole: {},

            urls: [],
            selectedUrls: [],
            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            formTitle: "New Role",
            editOption: false
        }

        // reset editForm
        this.editForm = null;

        this._createRole = this._createRole.bind(this);
        this._submitForm = this._submitForm.bind(this);
        this._deleteConfirmRole = this._deleteConfirmRole.bind(this);
        this._closeEditForm = this._closeEditForm.bind(this);
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchRoles(1);
        this._searchUrls();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchUrls(e) {
        if (e)
            e.preventDefault();

        UrlService.readUrls("", (res) => {
            console.log("urls55", res);
            this.setState({
                urls: res.items
            })
        }, (err) => {
        });
    }

    _searchRoles(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        RoleService.readRoles(query, (res) => {
            this.ifMounted && this.setState({
                roleList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _createRole(e) {
        this.ifMounted && this.setState({
            selectedRole: {
                name: "",
                urlGroup: []
            },
            selectedUrls: [],
            editOption: false,
            formTitle: "New Role"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _editRole(role, e) {
        console.log("role.urlGroup", role)
        this.setState({
            selectedRole: _.clone(role),
            selectedUrls: $.extend([], role.urlGroup),
            editOption: true,
            formTitle: "Edit Role"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();


        $(document.body).addClass("editsidebar-open");
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // update url groups
            this.state.selectedRole.urlGroup = this.state.selectedUrls;
            console.log("this.state.selectedUrls", this.state.selectedUrls)
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.editOption) {
                // update group case
                RoleService.updateRole(this.state.selectedRole, (res) => {
                    // console.log(res);
                    this._searchRoles(this.state.activePage);

                    $.notify("Role is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })

            } else {
                RoleService.createRole(this.state.selectedRole, (res) => {
                    // console.log("create:", res);
                    this._searchRoles(this.state.activePage);

                    // show notifiy
                    $.notify("Role is created successfully.", "success");
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

    _deleteConfirmRole(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this role!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteRole();
        });
    }

    _deleteRole(e) {
        RoleService.deleteRole(this.state.selectedRole.id, (res) => {
            this._searchRoles(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Role is deleted correctly.", "success");
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

        var selectedRole = this.state.selectedRole;
        selectedRole[field] = e.target.value;

        this.setState({
            selectedRole: selectedRole
        });
    }

    _handlePageSelect(eventKey) {
        this._searchRoles(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchRoles(this.state.activePage);
    }

    _changeValue(id, field, e) {
        e.preventDefault();
        //console.log("Field: " + field + "ID: " + id);
        setTimeout(() => {
            var selectedRole = this.state.selectedRole;

            if ($('#switch_' + field).prop('checked') == true) {
                $('#switch_' + field).prop('checked', false);
                selectedRole.urlGroup.splice(0, 1);
            } else if ($('#switch_' + field).prop('checked') == false) {
                $('#switch_' + field).prop('checked', true);
                selectedRole.urlGroup.push(id);
            }

            this.ifMounted && this.setState({
                selectedRole: selectedRole
            })

            console.log(JSON.stringify(selectedRole));
        }, 100)
    }

    _changeURLField(id) {
        var urls = this.state.selectedUrls;
        if (urls.indexOf(String(id)) == -1) {
            urls.push(String(id));
        } else {
            urls.splice(urls.indexOf(String(id)), 1);
        }

        this.ifMounted && this.setState({
            selectedUrls: urls
        })
    }

    _isSelectedURL(id) {
        var ret = false;
        if (this.state.selectedUrls.indexOf(String(id)) != -1)
            ret = true;
        return ret;
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Roles
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search title" className="form-control" style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-primary">
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-primary pull-right" onClick={this._createRole}>New Role</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }}>#</th>
                                    <th>
                                        <SortHeader
                                            label={'Title'}
                                            action={this._sortList.bind(this)}
                                            sortField="name"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Level'}
                                            action={this._sortList.bind(this)}
                                            sortField="code"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Update at'}
                                            action={this._sortList.bind(this)}
                                            sortField="updateAt"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.roleList.items.map((item, i) => {
                                        return (
                                            <tr key={'roleTr' + i} className="tr-hover" onClick={this._editRole.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.code}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.roleList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={13}>
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
                            className={this.state.roleList.total === 0 ? 'hidden' : 'shown'}
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
                            <label className="control-label">Title</label>
                            <input type="text" value={this.state.selectedRole.name || ''} placeholder="Role title" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" disabled={this.state.editOption && this.state.selectedRole.code < CONST.MIN_ROLE_CODE} />
                        </div>
                        <div className="form-group" >
                            <label className="control-label">Page privilege</label>
                            {
                                this.state.urls.map((item, i) => {
                                    return (
                                        <div key={'url' + i} className="form-control" style={{ border: '0px', borderRadius: '0px', marginLeft: '15px' }}>
                                            <div className="c-checkbox">
                                                <label>
                                                    <input id={'url' + i} name={'url' + i} type="checkbox" checked={this._isSelectedURL(item.id)} onChange={this._changeURLField.bind(this, item.id)} />
                                                    <em className="fa fa-check"></em>{item.name}</label>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: (this.state.editOption && this.state.selectedRole.code >= CONST.MIN_ROLE_CODE) ? 'block' : 'none' }} onClick={this._deleteConfirmRole}>
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

export default Roles;