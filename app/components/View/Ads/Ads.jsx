import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import UploadService from '../../API/UploadService';
import AdsService from '../../API/AdsService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Ads extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            adsList: {
                total: 0,
                items: [],
            },
            selectedAds: {},
            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            formTitle: "New Ads",
            editOption: true //false-create, true-edit
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchAllAds();

        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchAllAds() {
        let query = ""
        if (this.state.sortDirection != 0) {
            query += "sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }

        AdsService.readAllAds(query, (res) => {
            console.log(res)
            this.ifMounted && this.setState({
                adsList: res
            })
        }, (err) => {
            console.log(err)
            $.notify(err.message, "danger");
        });
    }

    _createAds(e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedAds: {
                name: "",
                description: "",
                path: "",
            },
            editOption: false,
            formTitle: "New Ads"
        })
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editAds(ads, e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedAds: _.clone(ads),
            editOption: true,
            formTitle: "Edit Ads"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _deleteAds() {
        // delete ads
        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonAds: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            AdsService.deleteAds($this.state.selectedAds.id, (res) => {
                $this._searchAllAds();

                $(document.body).removeClass("editsidebar-open");
                $.notify("Ads is deleted correctly.", "success");
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
        var selectedAds = this.state.selectedAds;
        if (field == 'image') {
            this._uploadFile(field, this.refs.image.files[0]);
            return;
        } else {
            selectedAds[field] = e.target.value;
        }

        // update selected ads state
        this.setState({ selectedAds });
    }

    _uploadFile(field, file) {
        var selectedAds = this.state.selectedAds;

        const data = new FormData();
        data.append('path', 'ads');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedAds[field] = res.path;
            // reset state
            this.setState({ selectedAds });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            if (this.state.editOption) {
                // update ads
                AdsService.updateAds(this.state.selectedAds, (res) => {
                    this._searchAllAds();

                    $.notify("Ads is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })

            } else {
                // create ads
                AdsService.createAds(this.state.selectedAds, (res) => {
                    this._searchAllAds();

                    // show notifiy
                    $.notify("Ads is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid ads data", "warning");
        }
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchAllAds();
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Ads
                </div>
                <div>
                    <Row>
                        <Col md={8}>
                            <Panel>
                                <Row>
                                    <Col md={12}>
                                        <button className="btn btn-sm btn-primary pull-right" onClick={this._createAds.bind(this)}>New ads</button>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th className="text-center">
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
                                                <SortHeader
                                                    label={'Description'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="description"
                                                    sortIndex={1}
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
                                            this.state.adsList.items.map((item, i) => {
                                                return (
                                                    <tr key={'adsTr' + i} className="tr-hover" onClick={this._editAds.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td className="text-center">
                                                            {<img src={UtilService.getImageFromPath(item.image)} className="img-thumbnail thumb-height48 img-fit" style={{ backgroundColor: 'white' }} />}
                                                        </td>
                                                        <td className="text-center">{item.name}</td>
                                                        <td className="text-center">{item.description}</td>
                                                        <td className="text-center">{UtilService.getDateTime(item.createdAt)}</td>
                                                        <td className="text-center">{UtilService.getDateTime(item.updatedAt)}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.adsList.length == 0) {
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
                                <input type="text" className="form-control" value={this.state.selectedAds.name || ''} required="required" onChange={this._changeField.bind(this, 'name')} />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Description</label>
                                <input type="text" className="form-control" value={this.state.selectedAds.description || ''} required="required" onChange={this._changeField.bind(this, 'description')} />
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
                        </form>
                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteAds.bind(this)}>
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

export default Ads;