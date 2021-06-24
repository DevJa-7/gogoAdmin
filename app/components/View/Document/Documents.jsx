import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import DocumentService from '../../API/DocumentService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Documents extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            documents: {
                "vehicle": [],
                "driver": [],
            },

            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            selectedDocument: {},

            formTitle: "New Document",
            editOption: false,

            documentTypes: [
                { "code": 0, "title": "For Vehicle" },
                { "code": 1, "title": "For Driver" }],
        }

        // reset editForm
        this.editForm = null;
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchDocuments();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchDocuments(e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }

        DocumentService.readDocuments(query, (res) => {
            console.log("documents", res);
            this.setState({
                documents: res
            })
        }, (err) => {
        });
    }


    _createDocument(e) {
        // initialize doc data and variable
        this.ifMounted && this.setState({
            selectedDocument: {
                type: 0,
                name: "",
                isRequired: true,
                isExpired: true,
                valid: true,
            },
            editOption: false,
            formTitle: "New Document"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_required').prop('checked', true);
        $('#switch_expired').prop('checked', true);
        $('#switch_valid').prop('checked', true);

        $(document.body).addClass("editsidebar-open");
    }

    _editDocument(doc, e) {
        // get doc and update state
        this.setState({
            selectedDocument: _.clone(doc),
            editOption: true,
            formTitle: "Edit Document"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_required').prop('checked', doc.isRequired);
        $('#switch_expired').prop('checked', doc.isExpired);
        $('#switch_valid').prop('checked', doc.valid);

        $(document.body).addClass("editsidebar-open");
    }

    _submitForm(e) {
        e.preventDefault();
        console.log("document data", e);
        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedDocument, this.state.editOption);
            if (this.state.editOption) {
                // update doc
                DocumentService.updateDocument(this.state.selectedDocument, (res) => {
                    // console.log(res);
                    this._searchDocuments();

                    $.notify("Document is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })

            } else {
                // create doc
                DocumentService.createDocument(this.state.selectedDocument, (res) => {
                    // console.log("create:", res);
                    this._searchDocuments();

                    // show notifiy
                    $.notify("User is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid doc data");
            $.notify("Input data is invalid doc data", "warning");
        }
    }

    _deleteConfirmDocument(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this document!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteDocument();
        });
    }

    _deleteDocument(e) {
        // delete doc
        DocumentService.deleteDocument(this.state.selectedDocument.id, (res) => {
            this._searchDocuments();

            $(document.body).removeClass("editsidebar-open");
            $.notify("Document is deleted correctly.", "success");
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
        //     this._searchDocuments();
        //     return;
        // }

        // update all fields when change content
        var selectedDocument = this.state.selectedDocument;
        if (field == 'type') {
            selectedDocument[field] = Number(e.target.value);
        } else {
            selectedDocument[field] = e.target.value;
        }

        // update selected doc state
        this.ifMounted && this.setState((old) => {
            old.selectedDocument = selectedDocument
        })
    }


    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchDocuments();
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedDocument = this.state.selectedDocument;
            if (field == 'isExpired') {
                selectedDocument.isExpired = UtilService.changeSwitchValue($('#switch_expired'));
            } else if (field == 'isRequired') {
                selectedDocument.isRequired = UtilService.changeSwitchValue($('#switch_required'));
            } else if (field == 'valid') {
                selectedDocument.valid = UtilService.changeSwitchValue($('#switch_valid'));
            }

            this.ifMounted && this.setState((old) => {
                old.selectedDocument = selectedDocument
            })
        }, 100)
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Documents
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" onClick={this._createDocument.bind(this)}>Add New</button>
                    </div>
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-new" onClick={this._searchDocuments.bind(this)}>
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn" onClick={this._createDocument.bind(this)}>New Document</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }}>#</th>
                                    <th>
                                        <SortHeader
                                            label={'Name'}
                                            action={this._sortList.bind(this)}
                                            sortField="name"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Expired'}
                                            action={this._sortList.bind(this)}
                                            sortField="isExpired"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Required'}
                                            action={this._sortList.bind(this)}
                                            sortField="isRequired"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Valid'}
                                            action={this._sortList.bind(this)}
                                            sortField="valid"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={4}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Updated at'}
                                            action={this._sortList.bind(this)}
                                            sortField="updatedAt"
                                            sortIndex={5}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={7}>
                                        <div className="panel swidget bg-inverse-light mb0">
                                            <div className="row-table" style={{ height: '32px' }}>
                                                <Col xs={1} className="text-center bg-inverse">
                                                    <em className="fa fa-taxi"></em>
                                                </Col>
                                                <Col xs={9}>
                                                    <div className="text-uppercase"><strong>For Vehicle</strong></div>
                                                </Col>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                {
                                    this.state.documents.vehicle.map((item, i) => {
                                        return (
                                            <tr key={'docTr' + i} className="tr-hover" onClick={this._editDocument.bind(this, item)}>
                                                <td>{i + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.isExpired ? <div className="badge p-sm bg-primary">Yes</div> : <div className="badge p-sm bg-warning">No</div>}</td>
                                                <td>{item.isRequired ? <div className="badge p-sm bg-primary">Yes</div> : <div className="badge p-sm bg-warning">No</div>}</td>
                                                <td>{item.valid ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-danger">Deactive</div>}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.documents.vehicle.length == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={7}>
                                                    <p className="text-center">There is no any data.</p>
                                                </td>
                                            </tr>
                                        )
                                    }
                                })()}

                                <tr>
                                    <td colSpan={7}>
                                        <div className="panel swidget bg-inverse-light mb0">
                                            <div className="row-table" style={{ height: '32px' }}>
                                                <Col xs={1} className="text-center bg-inverse">
                                                    <em className="fa fa-user"></em>
                                                </Col>
                                                <Col xs={9}>
                                                    <div className="text-uppercase"><strong>For Driver</strong></div>
                                                </Col>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                {
                                    this.state.documents.driver.map((item, i) => {
                                        return (
                                            <tr key={'docTr1' + i} className="tr-hover" onClick={this._editDocument.bind(this, item)}>
                                                <td>{this.state.documents.vehicle.length + i + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.isExpired ? <div className="badge p-sm bg-primary">Yes</div> : <div className="badge p-sm bg-warning">No</div>}</td>
                                                <td>{item.isRequired ? <div className="badge p-sm bg-primary">Yes</div> : <div className="badge p-sm bg-warning">No</div>}</td>
                                                <td>{item.valid ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-danger">Deactive</div>}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.documents.driver.length == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={7}>
                                                    <p className="text-center">There is no any data.</p>
                                                </td>
                                            </tr>
                                        )
                                    }
                                })()}
                            </tbody>
                        </Table>
                    </Panel>

                    <aside className="editsidebar">
                        <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                        <form id="editForm" className="form" data-parsley-validate="">
                            <div className="form-group">
                                <label className="control-label">Type</label>
                                <select className="form-control" required="required" value={this.state.selectedDocument.type || 0} onChange={this._changeField.bind(this, 'type')} disabled={this.state.editOption} >
                                    {
                                        this.state.documentTypes.map((item, i) => {
                                            return (
                                                <option key={item.code} value={item.code}>{item.title}</option>
                                            );
                                        })
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="control-label">Name</label>
                                <input type="text" value={this.state.selectedDocument.name || ''} placeholder="Document Name" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                            </div>
                            <div className="form-group peaks">
                                <label className="col-sm-4 control-label padding">Is Expired</label>
                                <Col sm={8}>
                                    <label className="switch switch-sm">
                                        <input type="checkbox" id="switch_expired" onClick={this._changeSwitch.bind(this, 'isExpired')} />
                                        <em></em>
                                    </label>
                                </Col>
                            </div>
                            <div className="form-group peaks">
                                <label className="col-sm-4 control-label padding">Is Required</label>
                                <Col sm={8}>
                                    <label className="switch switch-sm">
                                        <input type="checkbox" id="switch_required" onClick={this._changeSwitch.bind(this, 'isRequired')} />
                                        <em></em>
                                    </label>
                                </Col>
                            </div>
                            <div className="form-group peaks">
                                <label className="col-sm-4 control-label padding">Valid</label>
                                <Col sm={8}>
                                    <label className="switch switch-sm">
                                        <input type="checkbox" id="switch_valid" onClick={this._changeSwitch.bind(this, 'valid')} />
                                        <em></em>
                                    </label>
                                </Col>
                            </div>
                        </form>

                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmDocument.bind(this)}>
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

export default Documents;