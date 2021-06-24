import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import MealKindService from '../../API/MealKindService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class MealKinds extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            mealKinds: {
                total: 0,
                items: [],
            },
            selectedMealKind: {},

            formTitle: "New MealKind",
            editOption: true //false-create, true-edit
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchMealKinds();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchMealKinds() {
        MealKindService.readMealKinds((res) => {
            console.log(res)
            this.ifMounted && this.setState({
                mealKinds: res
            })
        }, (err) => {
            console.log(err)
            $.notify(err.message, "danger");
        });
    }

    _createMealKind(e) {

        e.preventDefault();

        this.ifMounted && this.setState({
            selectedMealKind: {
                name: "",
                image: ""
            },
            editOption: false,
            formTitle: "New MealKind"
        })
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _editMealKind(mealKind, e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedMealKind: _.clone(mealKind),
            editOption: true,
            formTitle: "Edit MealKind"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        $(document.body).addClass("editsidebar-open");
    }

    _deleteMealKind() {
        // delete mealKind
        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonMealKind: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            MealKindService.deleteMealKind($this.state.selectedMealKind.id, (res) => {
                $this._searchMealKinds();

                $(document.body).removeClass("editsidebar-open");
                $.notify("MealKind is deleted correctly.", "success");
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
        var selectedMealKind = this.state.selectedMealKind;
        selectedMealKind[field] = e.target.value;

        // update selected mealKind state
        this.setState({ selectedMealKind });
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            if (this.state.editOption) {
                // update mealKind
                MealKindService.updateMealKind(this.state.selectedMealKind, (res) => {
                    this._searchMealKinds();

                    $.notify("MealKind is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })

            } else {
                // create mealKind
                MealKindService.createMealKind(this.state.selectedMealKind, (res) => {
                    this._searchMealKinds();

                    // show notifiy
                    $.notify("MealKind is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid mealKind data", "warning");
        }
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    MealKinds
                </div>
                <div>
                    <Row>
                        <Col md={6}>
                            <Panel>
                                <Row>
                                    <Col md={12}>
                                        <button className="btn btn-sm btn-primary pull-right" onClick={this._createMealKind.bind(this)}>New mealKind</button>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th className="text-center">
                                                <strong>Name</strong>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.mealKinds.items.map((item, i) => {
                                                return (
                                                    <tr key={'mealKindTr' + i} className="tr-hover" onClick={this._editMealKind.bind(this, item)}>
                                                        <td>{item.code}</td>
                                                        <td className="text-center">{item.name}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.mealKinds.length == 0) {
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
                                <label className="control-label">Name</label>
                                <input type="text" className="form-control" value={this.state.selectedMealKind.name || ''} required="required" onChange={this._changeField.bind(this, 'name')} />
                            </div>
                        </form>
                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteMealKind.bind(this)}>
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

export default MealKinds;