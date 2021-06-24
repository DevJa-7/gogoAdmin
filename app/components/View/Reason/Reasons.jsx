import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import ReasonService from '../../API/ReasonService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Reasons extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            reasonList: {
                total: 0,
                items: []
            },
            selectedReason: {},

            formTitle: "New Reason",
            editOption: true, //false-create, true-edit
            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            reasonTypes: [
                { "code": 1, "title": "User Cancel Reason" },
                { "code": 2, "title": "Order Cancel Reason" },
                { "code": 3, "title": "Trip Cancel Reason" }],
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchReasons(0);
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchReasons(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        // query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES
        query += "&type=" + this.refs.type.value;

        ReasonService.readReasons(query, (res) => {
            this.ifMounted && this.setState({
                reasonList: res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createReason(e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedReason: {
                type: 1,
                message: "",
                status: true,
            },
            editOption: false,
            formTitle: "New Reason"
        })
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_status').prop('checked', true);

        $(document.body).addClass("editsidebar-open");
    }

    _editReason(reason, e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedReason: _.clone(reason),
            editOption: true,
            formTitle: "Edit Reason"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
        setTimeout(() => {
            $('#switch_status').prop('checked', reason.status);
        }, 100)
    }

    _deleteReason() {
        // delete reason
        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonReason: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            ReasonService.deleteReason($this.state.selectedReason.id, (res) => {
                $this._searchReasons(0);

                $(document.body).removeClass("editsidebar-open");
                $.notify("Reason is deleted correctly.", "success");
            }, (err) => {
                // console.log(err.message);
                $.notify(err.message, "danger");
            });
        });
    }

    _closeEditForm(e) {
        e.preventDefault();
        $(document.body).removeClass("editsidebar-open");
    }

    _changeField(field, e) {
        e.preventDefault();
        // update all fields when change content
        var selectedReason = this.state.selectedReason;
        selectedReason[field] = e.target.value;

        // update selected reason state
        this.setState({ selectedReason });
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.ifMounted && this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchReasons(this.state.activePage);
    }


    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedReason = this.state.selectedReason;
            if (field == 'status') {
                selectedReason.status = UtilService.changeSwitchValue($('#switch_status'))
            }
            this.ifMounted && this.setState({ selectedReason })
        }, 100)
    }


    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            this.state.selectedReason.type = Number(this.refs.type.value)
            if (this.state.editOption) {
                // update reason
                ReasonService.updateReason(this.state.selectedReason, (res) => {
                    this._searchReasons(0);

                    $.notify("Reason is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })

            } else {
                // create reason
                ReasonService.createReason(this.state.selectedReason, (res) => {
                    this._searchReasons(0);

                    // show notifiy
                    $.notify("Reason is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid reason data", "warning");
        }
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Reasons
                </div>
                <div>
                    <Row>
                        <Col md={6}>
                            <Panel>
                                <Row className="mb-lg">
                                    <Col md={5}>
                                        <form className="form-inline">
                                            <div className="input-group">
                                                <input ref="query" placeholder="Search message" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                                <span className="input-group-btn">
                                                    <button className="btn btn-new" onClick={this._searchReasons.bind(this, 0)}>
                                                        Search
                                                    </button>
                                                </span>
                                            </div>
                                        </form>
                                    </Col>
                                    <Col md={4}>
                                        <form className="form-inline">
                                            <select className="form-control" ref="type" onChange={this._searchReasons.bind(this, 0)} /*disabled={this.state.editOption}*/ >
                                                {
                                                    this.state.reasonTypes.map((item, i) => {
                                                        return (
                                                            <option key={item.code} value={item.code}>{item.title}</option>
                                                        );
                                                    })
                                                }
                                            </select>
                                        </form>
                                    </Col>
                                    <Col md={3}>
                                        <button className="btn btn-primary pull-right" onClick={this._createReason.bind(this)}>New reason</button>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th className="text-center">
                                                <SortHeader
                                                    label={'Message'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="message"
                                                    sortIndex={0}
                                                    activeIndex={this.state.activeIndex}
                                                    setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                                </SortHeader>
                                            </th>
                                            <th className="text-center">
                                                <SortHeader
                                                    label={'Status'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="status"
                                                    sortIndex={1}
                                                    activeIndex={this.state.activeIndex}
                                                    setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                                </SortHeader>
                                            </th>
                                            <th className="text-center">
                                                <SortHeader
                                                    label={'Created At'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="createdAt"
                                                    sortIndex={2}
                                                    activeIndex={this.state.activeIndex}
                                                    setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                                </SortHeader>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.reasonList.items.map((item, i) => {
                                                return (
                                                    <tr key={'reasonTr' + i} className="tr-hover" onClick={this._editReason.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td className="text-center">{item.message}</td>
                                                        <td className="text-center">{item.status ? <div className="badge p-sm bg-success">Valid</div> : <div className="badge p-sm bg-danger">Invalid</div>}</td>
                                                        <td className="text-center">{UtilService.getDateTime(item.createdAt)}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.reasonList.items.length == 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={5}>
                                                            <p className="text-center">There is no any data.</p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })()}
                                    </tbody>
                                </Table>
                            </Panel>
                        </Col>
                    </Row>
                    <aside className="editsidebar">
                        <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                        <form id="editForm" className="form" data-parsley-validate="">
                            <div className="form-group">
                                <label className="control-label">Type</label>
                                <select className="form-control" required="required" value={this.refs.type ? this.refs.type.value : 1 || 1} onChange={this._changeField.bind(this, 'type')} readOnly >
                                    {
                                        this.state.reasonTypes.map((item, i) => {
                                            return (
                                                <option key={item.code} value={item.code}>{item.title}</option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="control-label">Message</label>
                                <input type="text" className="form-control" value={this.state.selectedReason.message || ''} required="required" onChange={this._changeField.bind(this, 'message')} />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Status</label>
                                <label className="switch ml-xl">
                                    <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'status')} />
                                    <em></em>
                                </label>
                            </div>
                        </form>
                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteReason.bind(this)}>
                            <i className="fa fa-trash fa-lg"></i>
                        </Button>
                        <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                            <i className="fa fa-times fa-lg"></i>
                        </Button>
                    </aside>
                </div>
            </ContentWrapper>
        );
    }
}

export default Reasons;