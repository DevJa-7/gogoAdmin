import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { browserHistory } from 'react-router'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination, Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import UploadService from '../../API/UploadService';
import BusinessService from '../../API/BusinessService';
import FoodTypeService from '../../API/FoodTypeService';
import FoodService from '../../API/FoodService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class FoodDetail extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            dietaries: [],
            foodTypes: [],
            mealKinds: [],

            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            selectedFood: {
                foodType: {
                    foodOptions: [],
                },
            },
            selectedSpec: {
                options: []
            },

            formTitle: "New Food",
            editOption: false,
            showSpecModal: false,
            showOptionModal: false,
        }

        // reset editForm
        this.editForm = null;

        this._createFood = this._createFood.bind(this);
        this._deleteConfirmFood = this._deleteConfirmFood.bind(this);
        this._submitForm = this._submitForm.bind(this);
    }

    componentDidMount() {
        this.ifMounted = true

        let businessId = this.props.location.query.businessId
        let foodId = this.props.location.query.foodId
        if (foodId.length == 0) {
            this._createFood(businessId)
        } else {
            this._editFood(foodId, businessId)
        }

        this._searchDietaries(businessId)
        this._searchFoodTypes(businessId)
        this._searchMealKinds(businessId)
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }


    _searchDietaries(businessId) {
        BusinessService.readBusinessDietary(businessId, (res) => {
            this.ifMounted && this.setState((old) => {
                old.dietaries = res
            })
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _searchMealKinds(businessId) {
        BusinessService.readBusinessMealKind(businessId, (res) => {
            this.ifMounted && this.setState((old) => {
                old.mealKinds = res
            })
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _searchFoodTypes(businessId) {
        FoodTypeService.readFoodTypesByBusiness(businessId, (res) => {
            this.ifMounted && this.setState((old) => {
                old.foodTypes = res
            })
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _createFood(businessId) {
        this.ifMounted && this.setState({
            selectedFood: {
                name: "",
                price: 0,
                description: "",
                businessId: businessId,
                foodType: {
                    foodOptions: [],
                },
            },
            editOption: false,
            formTitle: "New Food"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
    }

    _editFood(foodId, businessId, e) {
        this.setState({
            editOption: true,
            formTitle: "Edit Food"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        FoodService.readFood(foodId, (res) => {
            this.setState({
                selectedFood: res,
            })

            setTimeout(() => {
                $('#switch_enabled').prop('checked', res.enabled);
                $('#switch_inStock').prop('checked', res.inStock);
                $('#switch_mostPopular').prop('checked', res.mostPopular);
                $('#switch_freeDelivery').prop('checked', res.freeDelivery);
            }, 100)
        }, (err) => {
            $.notify(err.message, "danger");
        })
    }

    _submitForm(e) {
        if (e) {
            e.preventDefault();
        }
        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.editOption) {
                FoodService.updateFood(this.state.selectedFood, (res) => {
                    $.notify("Food is updated successfully.", "success");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })
            } else {
                console.log("createFood", this.state.selectedFood)
                FoodService.createFood(this.state.selectedFood, (res) => {
                    // show notifiy
                    $.notify("Food is created successfully.", "success");
                    this._backPage(e)
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid food data", "warning");
        }
    }

    _deleteConfirmFood(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this food!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteFood();
        });
    }

    _deleteFood(e) {
        FoodService.deleteFood(this.state.selectedFood.id, (res) => {
            $.notify("Food is deleted correctly.", "success");
            this._backPage(e)
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        });
    }

    _closeOptionModal() {
        this.setState((old) => {
            old.showOptionModal = false
        });
        console.log("Closed spec modal dialog");
    }

    _changeField(field, e) {
        e.preventDefault();

        var selectedFood = this.state.selectedFood;
        if (field == "image") {
            console.log(this.refs.image.files[0])
            this._uploadFile(field, this.refs.image.files[0]);
            return
        } else if (field == "foodType") {
            let foodType = _.find(this.state.foodTypes, (o) => {
                return o.code == e.target.value;
            });
            selectedFood[field] = foodType;
        } else if (field == "price") {
            selectedFood[field] = Number(e.target.value);
        } else {
            selectedFood[field] = e.target.value;
        }

        this.ifMounted && this.setState((old) => {
            old.selectedFood = selectedFood
        });
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedFood = this.state.selectedFood;
            selectedFood[field] = UtilService.changeSwitchValue($('#switch_' + field))

            this.ifMounted && this.setState({ selectedFood })
        }, 100)

    }

    _changeMultiOptions(field, selList) {
        var selectedFood = this.state.selectedFood;
        var options = []
        _.map(selList, (o) => {
            options.push(
                o.value
            )
        })
        selectedFood[field] = options;

        this.ifMounted && this.setState({ selectedFood });
    }

    _getMultiOptions(options) {
        var ret = []

        _.map(options, (o) => {
            ret.push({
                value: o.code,
                label: o.name
            })
        })
        return ret
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.ifMounted && this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchFoodes(this.state.activePage);
    }

    _backPage(e) {
        if (e) {
            e.preventDefault();
        }
        browserHistory.goBack();
    }

    _uploadFile(field, file) {
        var selectedFood = this.state.selectedFood;

        const data = new FormData();
        data.append('path', 'foods');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            // console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedFood[field] = res.path;
            // reset state
            this.setState({ selectedFood });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _closeSpecModal() {
        this.setState((old) => {
            old.showSpecModal = false
        });
        console.log("Closed spec modal dialog");
    }

    _clickedAddSpec(e) {
        e.preventDefault();
        this.setState((old) => {
            old.showSpecModal = true
        });
    }

    _selectSpec(spec, e) {
        e.preventDefault();
        spec.enabled = true
        this._closeSpecModal()
    }

    _clickedEditSpec(item, e) {
        e.preventDefault();

        console.log(item)
        this.setState((old) => {
            old.showOptionModal = true
            old.selectedSpec = item
        });

        setTimeout(() => {
            console.log("item.isRequired", item.isRequired)
            $('#switch_isRequired').prop('checked', item.isRequired);
            item.options.map((opt, i) => {
                $('#switch_spec_default_' + i).prop('checked', opt.default);
            })
        }, 100)
    }

    _clickedDeleteSpec(spec, e) {
        e.preventDefault();
        spec.enabled = false
        this._closeSpecModal()
    }

    _changeSpecField(i, field, e) {
        e.preventDefault();

        let selectedSpec = this.state.selectedSpec
        if (field == "isSingle") {
            let isSingle = selectedSpec.isSingle
            console.log(isSingle)
            if (!isSingle) {
                selectedSpec.isSingle = !isSingle

                setTimeout(() => {
                    this.state.selectedSpec.options.map((item, i) => {
                        item.default = false
                        $('#switch_spec_default_' + i).prop('checked', false);
                    })
                }, 100)
            } else { return }
        } else if (field == "isMultiple") {
            let isMultipe = selectedSpec.isSingle
            if (isMultipe) {
                selectedSpec.isSingle = !isMultipe
            } else { return }
        } else if (field == "enabled") {
            let checked = selectedSpec.options[i][field]
            // console.log(checked)
            selectedSpec.options[i][field] = !checked
            if (checked) {
                selectedSpec.options[i]["price"] = 0
            }
        } else if (field == "price") {
            selectedSpec.options[i][field] = Number(e.target.value)
        } else {
            selectedSpec.options[i][field] = e.target.value
        }

        setTimeout(() => {
            this.setState({ selectedSpec });
        }, 100)
    }

    _changeSpecSwitch(i, field, e) {
        e.preventDefault();

        let selectedSpec = this.state.selectedSpec
        if (i == -1 && field == "isRequired") {
            let isRequired = selectedSpec[field]
            selectedSpec[field] = !isRequired
            setTimeout(() => {
                $('#switch_isRequired').prop('checked', !isRequired);
                this.setState({ selectedSpec });
            }, 100)
        } else if (field == "default") {
            let checked = selectedSpec.options[i][field]
            setTimeout(() => {
                if (selectedSpec.isSingle) {
                    if (!checked) {
                        selectedSpec.options.map((item, j) => {
                            item.default = false
                            $('#switch_spec_default_' + j).prop('checked', false);
                        })
                    }
                }
                selectedSpec.options[i][field] = !checked
                $('#switch_spec_default_' + i).prop('checked', !checked);
                this.setState({ selectedSpec });
            }, 100)
        }
    }

    _clickedUpdateSpec(e) {
        e.preventDefault();

        this.setState((old) => {
            old.showOptionModal = false
        })
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <button type="button" className="btn btn-link pull-left" onClick={this._backPage.bind(this)}>
                        <em className="fa icon-arrow-left"></em>
                    </button>
                    Foods
                </div>
                <Row>
                    <Col md={7}>
                        <Panel>
                            <form id="editForm" className="form" data-parsley-validate="">
                                <Row>
                                    <Col md={4}>
                                        <div className="preview_business">
                                            <img src={UtilService.getImageFromPath(this.state.selectedFood.image)} alt="" className="center-block img-responsive" />
                                        </div>
                                        <div className="text-center">
                                            <label htmlFor="inputImage" title="Upload Food Image" className="btn btn_upload_business">
                                                <input
                                                    ref="image"
                                                    id="inputImage"
                                                    accept="image/jpg,image/png,image/jpeg"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={this._changeField.bind(this, 'image')} />
                                                <span data-toggle="tooltip" title="Upload Business Profile" className="docs-tooltip">
                                                    Upload FoodImage
                                                </span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <Row className="mt">
                                            <div className="panel-heading text-bold ml-sm">Basic Information</div>
                                            <Col md={8}>
                                                <div className="form-group">
                                                    <input type="text" value={this.state.selectedFood.name || ''} placeholder="Name" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                                                </div>
                                            </Col>
                                            <Col md={4}>
                                                <div className="form-group">
                                                    <input type="number" value={this.state.selectedFood.price || 0} placeholder="Price" required="required" onChange={this._changeField.bind(this, 'price')} className="form-control" />
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={8}>
                                                <div className="form-group">
                                                    <textarea value={this.state.selectedFood.description || ''} rows="5" placeholder="Description" required="required" onChange={this._changeField.bind(this, 'description')} className="form-control" />
                                                </div>
                                            </Col>
                                            <Col sm={4}>
                                                <div>
                                                    <label className="switch switch-sm mr mb">
                                                        <input type="checkbox" id="switch_enabled" onClick={this._changeSwitch.bind(this, "enabled")} />
                                                        <em></em>
                                                    </label>
                                                    Enabled
                                            </div>
                                                <div>
                                                    <label className="switch switch-sm mr mb">
                                                        <input type="checkbox" id="switch_recommend" onClick={this._changeSwitch.bind(this, "recommend")} />
                                                        <em></em>
                                                    </label>
                                                    Recommend
                                            </div>
                                                <div>
                                                    <label className="switch switch-sm mr mb">
                                                        <input type="checkbox" id="switch_mostPopular" onClick={this._changeSwitch.bind(this, "mostPopular")} />
                                                        <em></em>
                                                    </label>
                                                    Most popular
                                            </div>
                                                <div>
                                                    <label className="switch switch-sm mr mb">
                                                        <input type="checkbox" id="switch_freeDelivery" onClick={this._changeSwitch.bind(this, "freeDelivery")} />
                                                        <em></em>
                                                    </label>
                                                    Free delivery
                                            </div>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <select className="form-control" required="required" value={this.state.selectedFood.foodType.code || ''} onChange={this._changeField.bind(this, 'foodType')}>
                                                <option key="" value="">Select FoodType</option>
                                                {
                                                    this.state.foodTypes && this.state.foodTypes.map((item, i) => {
                                                        return (
                                                            <option key={item.id} value={item.code}>{item.name}</option>
                                                        );
                                                    })
                                                }
                                            </select>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <Select
                                                name="form-field-name"
                                                placeholder="Select meal kinds"
                                                value={this.state.selectedFood.mealKindCodes}
                                                options={this._getMultiOptions(this.state.mealKinds)}
                                                multi={true}
                                                onChange={this._changeMultiOptions.bind(this, 'mealKindCodes')}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <Select
                                                name="form-field-name"
                                                placeholder="Select meal kinds"
                                                value={this.state.selectedFood.dietaryCodes}
                                                options={this._getMultiOptions(this.state.dietaries)}
                                                multi={true}
                                                onChange={this._changeMultiOptions.bind(this, 'dietaryCodes')}
                                                required
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <div className="form-group text-center pull-right">
                                            <button type="button" className="btn btn-danger" onClick={this._deleteConfirmFood.bind(this)}>
                                                <i className="fa fa-trash fa-lg"></i>
                                            </button>
                                        </div>
                                        <div className="form-group text-center pull-right mr-xl">
                                            <button type="button" className="btn btn-success" onClick={this._submitForm.bind(this)}>
                                                <i className="fa fa-check fa-lg"></i>
                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                            </form>
                        </Panel>
                    </Col>
                    <Col md={5}>
                        <Panel>
                            <Row className="mt">
                                <Col md={6}>
                                    <div className="panel-heading text-bold ml-sm">Specification Setting</div>
                                </Col>
                                <Col md={6}>
                                    <div className="form-group text-center pull-right mr-xl">
                                        <button type="button" className="btn btn-primary" onClick={this._clickedAddSpec.bind(this)}>
                                            <i className="fa fa-plus fa-lg"></i>
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={12}>
                                    <Table id="table1" responsive striped hover className="b0">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '30px' }}>#</th>
                                                <th className="text-center">
                                                    <strong>Name</strong>
                                                </th>
                                                <th className="text-center">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.selectedFood.foodType.foodOptions.map((item, i) => {
                                                return (
                                                    item.enabled && <tr key={'specTr' + i}>
                                                        <td>{i + 1}</td>
                                                        <td className="text-center">{item.title}</td>
                                                        <td className="text-center">
                                                            <button className="btn btn-sm btn-success mr-lg" onClick={this._clickedEditSpec.bind(this, item)}>Edit</button>
                                                            <button className="btn btn-sm btn-danger" onClick={this._clickedDeleteSpec.bind(this, item)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Panel>
                    </Col>
                </Row>
                <Modal show={this.state.showSpecModal} onHide={this._closeSpecModal.bind(this)}>
                    <ModalHeader closeButton className="header_modals">
                        <Modal.Title>Please Select Specification.</Modal.Title>
                    </ModalHeader>
                    <ModalBody className="body_modal">
                        <Table id="table2" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.selectedFood.foodType.foodOptions.map((item, i) => {
                                    return (
                                        !item.enabled && <tr key={'specTr' + i} className="tr-hover" onClick={this._selectSpec.bind(this, item)}>
                                            <td className="text-center">{item.title}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </ModalBody>
                </Modal>
                <Modal show={this.state.showOptionModal} onHide={this._closeOptionModal.bind(this)}>
                    <ModalHeader closeButton className="header_modals">
                        <Modal.Title>Specification Edit</Modal.Title>
                    </ModalHeader>
                    <ModalBody className="body_modal">
                        <Row>
                            <Col md={4}>
                                <h4 className="pt0 text-center">{this.state.selectedSpec.title}</h4>
                            </Col>
                            <Col md={4}>
                                <label className="switch mr mb" style={{ paddingTop: '8px' }}>
                                    <input type="checkbox" id={"switch_isRequired"} onClick={this._changeSpecSwitch.bind(this, -1, "isRequired")} />
                                    <em></em>
                                </label>
                                Requried
                            </Col>
                            <Col md={2}>
                                <label className="checkbox c-checkbox c-checkbox-rounded">
                                    <input id="roundedcheckbox10" checked={this.state.selectedSpec.isSingle} type="checkbox" onClick={this._changeSpecField.bind(this, -1, "isSingle")} />
                                    <em className="fa fa-check"></em>Single</label>
                            </Col>
                            <Col md={2}>
                                <label className="checkbox c-checkbox c-checkbox-rounded">
                                    <input id="roundedcheckbox20" checked={!this.state.selectedSpec.isSingle} type="checkbox" onClick={this._changeSpecField.bind(this, -1, "isMultiple")} />
                                    <em className="fa fa-check"></em>Multiple</label>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <Table id="table3" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th className="text-center" style={{ width: '30px' }}>#</th>
                                            <th className="text-center">
                                                <strong>Name</strong>
                                            </th>
                                            <th className="text-center" style={{ width: '120px' }}>
                                                <strong>Price</strong>
                                            </th>
                                            <th className="text-center">
                                                <strong>Default Select</strong>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.selectedSpec.options.map((item, i) => {
                                                return (
                                                    <tr key={'specTr' + i}>
                                                        <td>
                                                            <div className="checkbox c-checkbox">
                                                                <label>
                                                                    <input type="checkbox" checked={item.enabled} onChange={this._changeSpecField.bind(this, i, "enabled")} />
                                                                    <em className="fa fa-check"></em></label>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">{item.name}</td>
                                                        <td>
                                                            <input type="number" placeholder="Price" value={item.price || 0} onChange={this._changeSpecField.bind(this, i, "price")} disabled={!item.enabled} className="form-control pl pr0" />
                                                        </td>
                                                        <td className="text-center">
                                                            <label className="switch mr mb" style={{ paddingTop: '8px' }}>
                                                                <input type="checkbox" id={"switch_spec_default_" + i} onClick={this._changeSpecSwitch.bind(this, i, "default")} disabled={!item.enabled} />
                                                                <em></em>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        }
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12} className="text-center">
                                <Button bsStyle="success" onClick={this._clickedUpdateSpec.bind(this)}>
                                    Done
                                </Button>
                            </Col>
                        </Row>
                    </ModalBody>
                </Modal>
            </ContentWrapper >
        )
    }
}

FoodDetail.contextTypes = {
    router: PropTypes.object.isRequired
}
export default FoodDetail;