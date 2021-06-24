import React from 'react';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';
import { browserHistory } from 'react-router'
import _ from 'underscore'

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import UploadService from '../../API/UploadService';
import FoodTypeService from '../../API/FoodTypeService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class BusinessFoodTypes extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            foodTypes: [],
            selectedFoodType: {},
            editSpecs: false,

            specs: [],
            selectedSpec: {
                options: [],
            },
            formTitle: "New FoodType",
            editOption: true //false-create, true-edit
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this.businessId = this.props.location.query.businessId
        this._searchFoodTypes(this.businessId);

        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchFoodTypes(businessId) {
        FoodTypeService.readFoodTypesByBusiness(businessId, (res) => {
            console.log(res)
            this.ifMounted && this.setState({
                foodTypes: res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createFoodType(e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedFoodType: {
                name: "",
                description: "",
                image: "",
                businessId: this.businessId,
            },
            editOption: false,
            editSpecs: false,
            formTitle: "New FoodType"
        })
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editFoodType(foodType, e) {
        e.preventDefault();

        this.ifMounted && this.setState({
            selectedFoodType: _.clone(foodType),
            editOption: true,
            editSpecs: false,
            formTitle: "Edit FoodType"
        });
        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _deleteFoodType() {
        // delete foodType
        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonFoodType: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            FoodTypeService.deleteFoodType($this.state.selectedFoodType.id, (res) => {
                $this._searchFoodTypes(this.businessId);

                $(document.body).removeClass("editsidebar-open");
                $.notify("FoodType is deleted correctly.", "success");
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
        var selectedFoodType = this.state.selectedFoodType;
        if (field == "image") {
            this._uploadFile(field, this.refs.image.files[0]);
            return
        }
        selectedFoodType[field] = e.target.value;

        // update selected foodType state
        this.setState({ selectedFoodType });
    }

    _changeSpecField(index, field, e) {
        e.preventDefault();

        let specs = this.state.specs
        specs[index][field] = e.target.value
        this.ifMounted && this.setState((old) => {
            old.specs = specs
        })
    }

    _backPage(e) {
        if (e)
            e.preventDefault();
        browserHistory.goBack();
    }

    _uploadFile(field, file) {
        var selectedFoodType = this.state.selectedFoodType;

        const data = new FormData();
        data.append('path', 'foodTypes');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            // console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedFoodType[field] = res.path;
            // reset state
            this.setState({ selectedFoodType });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _editSpecialist(item, e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        this._closeEditForm(e)
        this.refs.spec.value = ""
        this.ifMounted && this.setState({
            editSpecs: true,
            selectedFoodType: item
        })

        this._searchSpecs(item.id)
    }

    _createSpec(e) {
        if (e) {
            e.preventDefault();
        }
        let title = this.refs.spec.value;
        if (title.length == 0) {
            $.notify("Please input valid spec name.", "warning");
            return
        }

        // let specs = this.state.specs;
        // specs.push(spec)
        // this.ifMounted && this.setState({ specs })
        let spec = {
            businessId: this.businessId,
            title: title
        }
        FoodTypeService.createSpec(this.state.selectedFoodType.id, spec, (res) => {
            this.refs.spec.value = ""
            this._searchSpecs(this.state.selectedFoodType.id)
        }, (err) => {
            $.notify(err.message, "danger");
        })
    }

    _searchSpecs(foodTypeId) {
        FoodTypeService.readSpecs(foodTypeId, (res) => {
            for (var i = 0; i < res.length; i++) {
                let details = []
                for (var j = 0; j < res[i].options.length; j++) {
                    details.push(res[i].options[j].name)
                }
                // console.log(details)
                res[i].details = details.join('\n')
            }
            this.ifMounted && this.setState((old) => {
                old.specs = res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        })
    }

    _clickedSaveSpec(item, e) {
        if (e) {
            e.preventDefault();
        }

        item.options = []
        let details = item.details.split("\n")
        for (let i = 0; i < details.length; i++) {
            if (details[i].length == 0) {
                continue
            }
            let option = { name: details[i] }
            item.options.push(option)
        }

        let foodTypeId = this.state.selectedFoodType.id
        FoodTypeService.updateSpec(foodTypeId, item, (res) => {
            this._searchSpecs(foodTypeId);
            $.notify("Specification is updated correctly.", "success");
        }, (err) => {
            $.notify(err.message, "danger");
        })
    }

    _clickedDeleteSpec(item, e) {
        if (e) {
            e.preventDefault();
        }

        // delete spec
        let foodTypeId = this.state.selectedFoodType.id;
        let $this = this
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonFoodType: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            FoodTypeService.deleteSpec(foodTypeId, item.number, (res) => {
                $this._searchSpecs(foodTypeId);
                $.notify("Specification is deleted correctly.", "success");
            }, (err) => {
                // console.log(err.message);
                $.notify(err.message, "danger");
            });
        });
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        console.log(this.state.selectedFoodType)
        if (this.editForm.isValid()) {
            if (this.state.editOption) {
                // update foodType
                FoodTypeService.updateFoodType(this.state.selectedFoodType, (res) => {
                    this._searchFoodTypes(this.businessId);

                    $.notify("FoodType is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })
            } else {
                // create foodType
                FoodTypeService.createFoodType(this.state.selectedFoodType, (res) => {
                    this._searchFoodTypes(this.businessId);

                    // show notifiy
                    $.notify("FoodType is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid foodType data", "warning");
        }
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <button type="button" className="btn btn-link pull-left" onClick={this._backPage.bind(this)}>
                        <em className="fa icon-arrow-left"></em>
                    </button>
                    FoodTypes
                </div>
                <div>
                    <Row>
                        <Col md={4}>
                            <Panel>
                                <Row>
                                    <Col md={12}>
                                        <legend>
                                            FoodTypes
                                            <button className="btn btn-sm btn-primary pull-right" onClick={this._createFoodType.bind(this)}>New foodType</button>
                                        </legend>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th style={{ width: "64px" }} className="text-center">Image</th>
                                            <th className="text-center">
                                                <strong>Name</strong>
                                            </th>
                                            <th className="text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.foodTypes.map((item, i) => {
                                                return (
                                                    <tr key={'foodTypeTr' + i} className="tr-hover" onClick={this._editFoodType.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <div className="user-block-picture thumb64 text-center">
                                                                {<img src={UtilService.getImageFromPath(item.image)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                            </div>
                                                        </td>
                                                        <td className="text-center">{item.name}</td>
                                                        <td className="text-center">
                                                            <button className="btn btn-sm btn-success" onClick={this._editSpecialist.bind(this, item)}>Edit</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.foodTypes.length == 0) {
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
                        <Col md={8}>
                            <Panel style={{ display: this.state.editSpecs ? 'block' : 'none' }}>
                                <Row>
                                    <Col md={12}>
                                        <legend>
                                            Specification
                                            <button className="btn btn-sm btn-primary pull-right" onClick={this._createSpec.bind(this)}>New spec</button>
                                            <input ref="spec" placeholder="Please input new spec" className="form-control input-sm pull-right mr" onChange={this._changeField.bind(this, 'spec')} style={{ width: '190px' }} />
                                        </legend>
                                    </Col>
                                </Row>
                                <Row>
                                    {
                                        this.state.specs.map((item, i) => {
                                            return (
                                                <Col key={'spec' + i} md={4}>
                                                    <div className="panel panel-default">
                                                        <div className="panel-heading pt pl pr pb0">
                                                            <a href="#" data-tool="panel-refresh" data-toggle="tooltip" title="Refresh Panel" className="pull-right" onClick={this._clickedDeleteSpec.bind(this, item)}>
                                                                <em className="fa fa-close"></em>
                                                            </a>
                                                            <a href="#" data-tool="panel-refresh" data-toggle="tooltip" title="Refresh Panel" className="pull-right" onClick={this._clickedSaveSpec.bind(this, item)}>
                                                                <em className="fa fa-check"></em>
                                                            </a>
                                                            <div className="panel-title">{item.title}</div>
                                                        </div>
                                                        <div className="panel-body p-sm">
                                                            <textarea rows="10" value={item.details || ''} onChange={this._changeSpecField.bind(this, i, 'details')} className="form-control note-editor note-editor-margin"></textarea>
                                                        </div>
                                                    </div>
                                                </Col>
                                            );
                                        })
                                    }

                                </Row>
                            </Panel>
                        </Col>
                    </Row>
                    <aside className="editsidebar">
                        <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                        <form id="editForm" className="form" data-parsley-validate="">
                            <div className="form-group">
                                <label className="control-label">Name</label>
                                <input type="text" value={this.state.selectedFoodType.name || ''} placeholder="Name" required onChange={this._changeField.bind(this, 'name')} className="form-control" />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Description</label>
                                <input type="text" value={this.state.selectedFoodType.description || ''} placeholder="Description" required onChange={this._changeField.bind(this, 'description')} className="form-control" />
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
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteFoodType.bind(this)}>
                            <i className="fa fa-trash fa-lg"></i>
                        </Button>
                        <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                            <i className="fa fa-times fa-lg"></i>
                        </Button>
                    </aside>
                </div>
            </ContentWrapper >
        );
    }
}

export default BusinessFoodTypes;