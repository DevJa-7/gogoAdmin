import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import UploadService from '../../API/UploadService';
import DietaryService from '../../API/DietaryService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Dietaries extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            dietaryList: {
                total: 0,
                items: [],
            },
            selectedDietary: {},

            formTitle: "New Dietary",
            editOption: true //false-create, true-edit
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchDietaries(1);

        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchDietaries(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES + "&top=2"

        DietaryService.readDietaries(query, (res) => {
            console.log(res)
            this.ifMounted && this.setState({
                dietaryList: res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createDietary(e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedDietary: {
                name: "",
                image: ""
            },
            editOption: false,
            formTitle: "New Dietary"
        })
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editDietary(dietary, e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedDietary: _.clone(dietary),
            editOption: true,
            formTitle: "Edit Dietary"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
        $('#switch_top').prop('checked', dietary.top);
        $('#switch_default').prop('checked', dietary.default);
    }

    _deleteDietary() {
        // delete dietary
        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonDietary: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            DietaryService.deleteDietary($this.state.selectedDietary.id, (res) => {
                $this._searchDietaries();

                $(document.body).removeClass("editsidebar-open");
                $.notify("Dietary is deleted correctly.", "success");
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

    _uploadFile(field, file) {
        var selectedDietary = this.state.selectedDietary;

        const data = new FormData();
        data.append('path', 'dietary');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedDietary[field] = res.path;
            // reset state
            this.setState({
                selectedDietary: selectedDietary
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _changeField(field, e) {
        e.preventDefault();
        // update all fields when change content
        var selectedDietary = this.state.selectedDietary;
        if (field == 'image' || field == 'icon') {
            this._uploadFile(field, this.refs[field].files[0]);
            return;
        } else {
            selectedDietary[field] = e.target.value;
        }
        // update selected dietary state
        this.setState({ selectedDietary });
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedDietary = this.state.selectedDietary;
            if (field == 'top') {
                selectedDietary.top = UtilService.changeSwitchValue($('#switch_top'))
            } else if (field == 'default') {
                selectedDietary.default = UtilService.changeSwitchValue($('#switch_default'))
            }
            this.ifMounted && this.setState({ selectedDietary })
        }, 100)

    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            if (this.state.editOption) {
                // update dietary
                console.log(this.state.selectedDietary)
                DietaryService.updateDietary(this.state.selectedDietary, (res) => {
                    this._searchDietaries(this.state.activePage);

                    $.notify("Dietary is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })

            } else {
                // create dietary
                DietaryService.createDietary(this.state.selectedDietary, (res) => {
                    this._searchDietaries(this.state.activePage);

                    // show notifiy
                    $.notify("Dietary is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid dietary data", "warning");
        }
    }

    _handlePageSelect(eventKey) {
        this._searchDietaries(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchDietaries(this.state.activePage);
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Dietaries
                </div>
                <div>
                    <Row>
                        <Col md={6}>
                            <Panel>
                                <Row>
                                    <Col md={8}>
                                        <form className="form-inline">
                                            <div className="input-group">
                                                <input ref="query" placeholder="Search name" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                                <span className="input-group-btn">
                                                    <button className="btn btn-new" onClick={this._searchDietaries.bind(this, 1)}>
                                                        Search
                                                    </button>
                                                </span>
                                            </div>
                                        </form>
                                    </Col>
                                    <Col md={4}>
                                        <button className="btn btn-primary pull-right" onClick={this._createDietary.bind(this)}>New dietary</button>

                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th style={{ width: '48px' }} className="text-center">
                                                <strong>Icon</strong>
                                            </th>
                                            <th style={{ width: '172px' }} className="text-center">
                                                <strong>Image</strong>
                                            </th>
                                            <th className="text-center">
                                                <SortHeader
                                                    label={'Name'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="name"
                                                    sortIndex={0}
                                                    activeIndex={this.state.activeIndex}
                                                    setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                                </SortHeader>
                                            </th>
                                            <th className="text-center">
                                                Tag
                                            </th>
                                            <th className="text-center">
                                                Default
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.dietaryList.items.map((item, i) => {
                                                return (
                                                    <tr key={'dietaryTr' + i} className="tr-hover" onClick={this._editDietary.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <div className="user-block-picture thumb48 text-center">
                                                                {<img src={UtilService.getImageFromPath(item.icon)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            {<img src={UtilService.getImageFromPath(item.image)} className="img-thumbnail thumb-height48 img-contain" style={{ backgroundColor: 'white' }} />}
                                                        </td>
                                                        <td className="text-center">{item.name}</td>
                                                        <td className="text-center">
                                                            {item.top ? <div className="badge p-sm bg-info">Top</div> : ""}
                                                        </td>
                                                        <td className="text-center">
                                                            {item.default ? <div className="badge p-sm bg-success">Default</div> : ""}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.dietaryList.total == 0) {
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
                            <div className="text-center">
                                <Pagination
                                    className={this.state.dietaryList.total === 0 ? 'hidden' : 'shown'}
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
                        </Col>
                    </Row>
                    <aside className="editsidebar">
                        <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                        <form id="editForm" className="form" data-parsley-validate="">
                            <div className="form-group">
                                <label className="control-label" style={{ marginTop: '6px' }}>Icon</label>
                                <Col md={12} className="padding">
                                    <input
                                        type="file"
                                        ref="icon"
                                        data-classbutton="btn btn-default"
                                        data-classinput="form-control inline"
                                        className="form-control filestyle"
                                        onChange={this._changeField.bind(this, 'icon')} />
                                </Col>
                            </div>
                            <div className="form-group">
                                <label className="control-label" style={{ marginTop: '6px' }}>Image</label>
                                <Col md={12} className="padding">
                                    <input
                                        type="file"
                                        ref="image"
                                        data-classbutton="btn btn-default"
                                        data-classinput="form-control inline"
                                        className="form-control filestyle"
                                        onChange={this._changeField.bind(this, 'image')} />
                                </Col>
                            </div>
                            <div className="form-group">
                                <label className="control-label">Name</label>
                                <input type="text" className="form-control" value={this.state.selectedDietary.name || ''} required="required" onChange={this._changeField.bind(this, 'name')} />
                            </div>
                            <div className="form-group pt pb">
                                <label className="col-sm-4 control-label padding">Is Top</label>
                                <Col sm={8}>
                                    <label className="switch">
                                        <input type="checkbox" id="switch_top" onClick={this._changeSwitch.bind(this, 'top')} />
                                        <em></em>
                                    </label>
                                </Col>
                            </div>
                            <div className="form-group pt pb">
                                <label className="col-sm-4 control-label padding">Is Default</label>
                                <Col sm={8}>
                                    <label className="switch">
                                        <input type="checkbox" id="switch_default" onClick={this._changeSwitch.bind(this, 'default')} />
                                        <em></em>
                                    </label>
                                </Col>
                            </div>
                        </form>
                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteDietary.bind(this)}>
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

export default Dietaries;