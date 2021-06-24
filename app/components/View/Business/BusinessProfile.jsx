import React from 'react';
import ReactDom from 'react-dom';
import { Row, Col, Panel, Button, Table, FormControl, Pagination, Tabs, Tab, FormGroup, Modal, ModalBody, ModalHeader } from 'react-bootstrap';
import PlacesAutocomplete, { geocodeByAddress, geocodeByPlaceId } from 'react-places-autocomplete';
import Select from 'react-select';
import { browserHistory } from 'react-router'
import _ from 'underscore'

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import BusinessService from '../../API/BusinessService';
import UploadService from '../../API/UploadService';
import MealKindService from '../../API/MealKindService';
import DietaryService from '../../API/DietaryService';
import FoodTypeService from '../../API/FoodTypeService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class BusinessProfile extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            business: {
                geoLocation: {},
                bankInfo: {},
                schedules: [{ weekday: 0 }, { weekday: 1 }, { weekday: 2 }, { weekday: 3 }, { weekday: 4 }, { weekday: 5 }, { weekday: 6 }],
                subBusiness: [],
            },
            mealKinds: [],
            dietaries: [],
            showScheduleModal: false,

            subBusiness: {},
            formTitle: "New Sub",
            editOption: false
        }

        // reset editForm
        this.editForm = null;
        this.editSubForm = null;

        this._handleSelectPlace = this._handleSelectPlace.bind(this)
        this._handleChange = this._handleChange.bind(this)
    }

    componentDidMount() {
        document.title = 'Business Profile';
        $(document.body).removeClass("editsidebar-open");
        this.ifMounted = true

        this.editForm = $('form#editForm').parsley();
        this.editSubForm = $('form#editSubForm').parsley();

        var businessId = this.props.location.query.businessId
        this._readBusinessProfile(businessId)

        this._searchMealKinds()
        this._searchDietaries()

        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _readBusinessProfile(id, e) {
        if (e)
            e.preventDefault();

        BusinessService.readBusiness(id, (res) => {
            console.log("res", res);
            this.ifMounted && this.setState((old) => {
                old.business = res
            })
        }, (err) => {
            console.log(err)
        });
    }

    _searchMealKinds() {
        MealKindService.readMealKinds((res) => {
            console.log(res)
            this.ifMounted && this.setState({
                mealKinds: res.items
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _searchDietaries() {
        let query = "&top=2"
        DietaryService.readDietaries(query, (res) => {
            this.ifMounted && this.setState({
                dietaries: res.items
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _changeField(field, e) {
        if (e)
            e.preventDefault();

        var business = this.state.business;
        if (field == "logo") {
            this._uploadFile(field, this.refs.logo.files[0]);
            return
        } else if (field == "bankName") {
            business.bankInfo.name = e.target.value;
        } else if (field == "bankAccount") {
            business.bankInfo.account = e.target.value;
        } else if (field == "bankNumber") {
            business.bankInfo.number = e.target.value;
        } else if (field == "priceLevel" || field == "preparationTime") {
            business[field] = Number(e.target.value);
        } else {
            business[field] = e.target.value;
        }

        this.ifMounted && this.setState((old) => {
            old.business = business
        });
    }

    _changeTime(weekday, type, e) {
        e.preventDefault()
        var business = this.state.business;

        if (type == "from") {
            business.schedules[weekday].openTime = Number(e.date.unix())
        } else if (type == "to") {
            business.schedules[weekday].closeTime = Number(e.date.unix())
        }
        this.ifMounted && this.setState((old) => {
            old.business = business
        });
    }

    _clickedSchedule(e) {
        console.log("_clickedSchedule")
        if (e)
            e.preventDefault()

        let business = this.state.business;
        business.schedules.map((item, i) => {
            setTimeout(() => {
                $('#day_time_' + item.weekday).prop('checked', item.enabled);
                $('#day_' + item.weekday + '_from').datetimepicker({
                    format: 'LT',
                    ignoreReadonly: true

                });
                $('#day_' + item.weekday + '_to').datetimepicker({
                    format: 'LT',
                    ignoreReadonly: true

                });
                $('#day_' + item.weekday + '_from').on('dp.change', this._changeTime.bind(this, item.weekday, 'from'));
                $('#day_' + item.weekday + '_to').on('dp.change', this._changeTime.bind(this, item.weekday, 'to'));
            }, 100)
        })
        this.setState((old) => { old.showScheduleModal = true })
    }

    _clickedRegister(e) {
        if (e)
            e.preventDefault()

        this._submitForm()
    }

    _getMultiOptions(optioins) {
        var ret = []

        _.map(optioins, (o) => {
            ret.push({
                value: o.code,
                label: o.name
            })
        })
        return ret
    }

    _changeMultiOptions(field, selList) {
        var business = this.state.business;
        var options = []
        _.map(selList, (o) => {
            options.push(
                o.value
            )
        })
        business[field] = options;

        this.ifMounted && this.setState({ business });
    }

    _backPage(e) {
        if (e)
            e.preventDefault();
        browserHistory.goBack();
    }

    _uploadFile(field, file) {
        var business = this.state.business;

        const data = new FormData();
        data.append('path', 'business');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            // console.log(res)
            $.notify("File is uploaded successfully", "success");
            business[field] = res.path;
            // reset state
            this.setState({ business });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _submitForm(e) {
        if (e)
            e.preventDefault();
        console.log("business", this.state.business);

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();
        if (this.editForm.isValid()) {
            BusinessService.updateBusiness(this.state.business, (res) => {
                $.notify("Business is updated successfully.", "success");
            }, (err) => {
                $.notify(err.message, "danger");
            })
        } else {
            $.notify("Input data is invalid business data", "warning");
        }
    }

    _handleChange(address) {
        // update all fields when change content
        var business = this.state.business;
        business.geoLocation.address = address;
        // update selected state
        this.setState({ business });
    }

    _handleSelectPlace(address, placeId) {
        geocodeByAddress(address, (err, { lat, lng }, results) => {
            if (err) {
                $.notify(err, "warning");
                this.setState({
                    addressLoading: false
                })
            }

            // check address
            var business = this.state.business;
            var address_components = results[0]['address_components'];
            // check city available
            if (!_.contains(results[0]['types'], "locality")) {
                $.notify("Please input correct city string...", "warning");
            }
            business.geoLocation.address = address;
            business.geoLocation.placeId = placeId;
            business.geoLocation.geoJson = { type: "Point", coordinates: [lng, lat] };
            this.setState({ business });
        })
    }

    _closeScheduleModal() {
        this.setState((old) => {
            old.showScheduleModal = false
        });
        console.log("Closed schedule modal dialog");
    }

    _changeSwitch(field, e) {
        if (e)
            e.preventDefault();

        setTimeout(() => {
            var business = this.state.business;
            business.schedules[field].enabled = UtilService.changeSwitchValue($('#day_time_' + field))
            this.ifMounted && this.setState((old) => {
                old.business = business
            })
        }, 100)
    }

    /* Sub Business */
    _editSubBusiness(item, e) {

    }

    _createSubBusiness(e) {
        console.log("Add Sub")
        this.ifMounted && this.setState({
            subBusiness: {
                name: "",
                email: ""
            },
            editOption: false,
            formTitle: "New Sub"
        });

        // reset validation
        this.editSubForm = $('form#editSubForm').parsley();
        this.editSubForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _submitSubForm(e) {
        if (e)
            e.preventDefault();

        this.editSubForm = $('form#editSubForm').parsley();
        this.editSubForm.validate();

        if (this.editSubForm.isValid()) {

        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid sub business data", "warning");
        }
    }

    _deleteConfirmSubBusiness(e) {
        if (e)
            e.preventDefault();
    }

    _closeEditSubForm(e) {
        if (e)
            e.preventDefault();
        $(document.body).removeClass("editsidebar-open");
    }

    render() {
        const cssClasses = {
            root: 'form-group',
            label: 'form-label',
            input: 'Demo__search-input',
            autocompleteContainer: 'Demo__autocomplete-container'
        }

        const inputProps = {
            value: this.state.business.geoLocation.address || '',
            onChange: this._handleChange,
            onBlur: () => {
                console.log('blur!')
            },
            type: 'search',
            placeholder: "Please input location...",
            autoFocus: true,
            name: 'Demo__input',
        }

        const AutocompleteItem = ({ formattedSuggestion }) => (
            <div className="Demo__suggestion-item">
                <i className='fa fa-map-marker Demo__suggestion-icon' />
                <strong>{formattedSuggestion.mainText}</strong>{' '}
                <small className="text-muted">{formattedSuggestion.secondaryText}</small>
            </div>)

        const hiddenPassword = function (self, hidden) {
            if (!hidden) {
                return (
                    <div>
                        <FormGroup>
                            <p>Password</p>
                            <input type="text" id="password" value={self.state.subBusiness.password || ''} required="required" onChange={self._changeField.bind(self, 'password')} type="password" placeholder="Password" className="form-control" pattern={CONST.REGEXP_PASSWORD} />
                        </FormGroup>
                        <FormGroup>
                            <p>Confirm Password</p>
                            <input type="text" value={self.state.subBusiness.confirmPassword || ''} required="required" data-parsley-equalto="#password" onChange={self._changeField.bind(self, 'confirmPassword')} type="password" placeholder="Confirm Password" className="form-control" />
                        </FormGroup>
                    </div>
                )
            }
        };

        return (
            <ContentWrapper>
                <div className="content-heading">
                    <button type="button" className="btn btn-link pull-left" onClick={this._backPage.bind(this)}>
                        <em className="fa icon-arrow-left"></em>
                    </button>
                    Business Profile
                </div>
                <Panel>
                    <form id="editForm" className="form" data-parsley-validate="">
                        <Row>
                            <Col md={4}>
                                <div className="preview_business">
                                    <img src={UtilService.getImageFromPath(this.state.business.logo)} alt="" className="center-block img-responsive" />
                                </div>
                                <div className="text-center">
                                    <label htmlFor="inputImage" title="Upload Business Profile" className="btn btn_upload_business">
                                        <input
                                            ref="logo"
                                            id="inputImage"
                                            type="file"
                                            accept="image/jpg,image/png,image/jpeg"
                                            className="sr-only"
                                            onChange={this._changeField.bind(this, 'logo')} />
                                        <span data-toggle="tooltip" title="Upload Business Profile" className="docs-tooltip">
                                            Upload Business Profile
                                        </span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={8}>
                                <Row>
                                    <div className="panel-heading text-bold">Owner Information</div>
                                    <Col sm={6}>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.name || ''} placeholder="Name" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.phone || ''} placeholder="Phone" required="required" onChange={this._changeField.bind(this, 'phone')} className="form-control" />
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.email || ''} placeholder="Email" required="required" onChange={this._changeField.bind(this, 'email')} className="form-control" />
                                        </div>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.identification || ''} placeholder="Identification" required="required" onChange={this._changeField.bind(this, 'identification')} className="form-control" />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <div className="panel-heading text-bold">Bank Account Information</div>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.bankInfo ? this.state.business.bankInfo.name : '' || ''} placeholder="Bank Name" required="required" onChange={this._changeField.bind(this, 'bankName')} className="form-control" />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.bankInfo ? this.state.business.bankInfo.account : '' || ''} placeholder="Account Holder Name" required="required" onChange={this._changeField.bind(this, 'bankAccount')} className="form-control" />
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className="form-group">
                                            <input type="text" value={this.state.business.bankInfo ? this.state.business.bankInfo.number : '' || ''} placeholder="Number Account" required="required" onChange={this._changeField.bind(this, 'bankNumber')} className="form-control" />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <div className="panel-heading text-bold">More Information</div>
                            <Col md={3}>
                                <div className="form-group">
                                    <select className="form-control" required="required" value={this.state.business.priceLevel || ''} onChange={this._changeField.bind(this, 'priceLevel')}>
                                        <option value={0}>Price Level</option>
                                        <option value={1}>$</option>
                                        <option value={2}>$$</option>
                                        <option value={3}>$$$</option>
                                        <option value={4}>$$$$</option>
                                    </select>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="form-group">
                                    <select className="form-control" required="required" value={this.state.business.preparationTime || ''} onChange={this._changeField.bind(this, 'preparationTime')}>
                                        <option value={0}>Prepartion time</option>
                                        <option value={1}>10~25 mins</option>
                                        <option value={2}>25~35 mins</option>
                                        <option value={3}>35~45 mins</option>
                                        <option value={4}>Over 1hr</option>
                                    </select>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="form-group">
                                    <input type="text" value={this.state.business.website || ''} placeholder="Website" required="required" onChange={this._changeField.bind(this, 'website')} className="form-control" />
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className="form-group">
                                    <a href="#" className="form-control clearfix btn-block" onClick={this._clickedSchedule.bind(this)}>
                                        <span className="pull-left">Schedule</span>
                                        <span className="pull-right">
                                            <em className="fa fa-chevron-circle-right"></em>
                                        </span>
                                    </a>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Row>
                                    <Col md={12}>
                                        <FormGroup>
                                            <PlacesAutocomplete
                                                inputProps={inputProps}
                                                onSelect={this._handleSelectPlace}
                                                autocompleteItem={AutocompleteItem}
                                                classNames={cssClasses}
                                                onEnterKeyDown={this._handleSelectPlace}
                                                required="required"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <div className="form-group">
                                            <Select
                                                name="form-field-name"
                                                placeholder="Select meal kinds"
                                                value={this.state.business.mealKindCodes}
                                                options={this._getMultiOptions(this.state.mealKinds)}
                                                multi={true}
                                                onChange={this._changeMultiOptions.bind(this, 'mealKindCodes')}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12}>
                                        <div className="form-group">
                                            <Select
                                                name="form-field-name"
                                                placeholder="Select dietaries"
                                                value={this.state.business.dietaryCodes}
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
                                        <div className="form-group">
                                            <textarea value={this.state.business.description || ''} placeholder="Short Description" required="required" onChange={this._changeField.bind(this, 'description')} className="form-control" style={{ height: '85px', resize: 'none' }} />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Row className="mb-lg">
                                    <Col md={8}>
                                        <div className="text-bold mt">
                                            {"Sub Restaurants"}
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <button className="btn btn-primary pull-right" onClick={this._createSubBusiness.bind(this)}>Add Sub</button>
                                    </Col>
                                </Row>
                                <Table id="datatable1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "30px" }}>#</th>
                                            <th>{"Name"}</th>
                                            <th>{"Email"}</th>
                                            <th>{"Address"}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.business.subBusiness && this.state.business.subBusiness.map((item, i) => {
                                                // console.log(item)
                                                return (
                                                    <tr key={'businessTr' + i} className="tr-hover" onClick={this._editSubBusiness.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.email}</td>
                                                        <td>{item.geoLocation ? item.geoLocation.address : ""}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (!this.state.business.subBusiness || this.state.business.subBusiness.length == 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={4}>
                                                            <p className="text-center">There is no any data.</p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })()}
                                    </tbody>
                                </Table>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <div className="form-group">
                                    <button type="button" className="btn btn-info" onClick={this._clickedRegister.bind(this)}>COMPLETE REGISTER</button>
                                </div>
                            </Col>
                        </Row>
                    </form>
                </Panel>
                <Modal show={this.state.showScheduleModal} onHide={this._closeScheduleModal.bind(this)}>
                    <ModalHeader closeButton className="header_modals">
                        <Modal.Title>Please Select Your Schelude.</Modal.Title>
                    </ModalHeader>
                    <ModalBody className="body_modal">
                        <div className="schedule_list">
                            {
                                this.state.business.schedules.map((item, i) => {
                                    return (
                                        <div key={'schedule' + i} className="schedule_item">
                                            <Col sm={5} className="name_day">
                                                <Col sm={5}>
                                                    {item.name}
                                                </Col>
                                                <Col sm={5}>
                                                    <label className="switch switch-sm">
                                                        <input type="checkbox" id={"day_time_" + item.weekday} onClick={this._changeSwitch.bind(this, item.weekday)} />
                                                        <em></em>
                                                    </label>
                                                </Col>
                                                <Col sm={2}>

                                                </Col>
                                            </Col>
                                            <Col sm={7}>
                                                <Col sm={6}>
                                                    {/* <input type="time" className={'form-control'} required="required" onChange={this._changeTime.bind(this, 'day_' + item.id + '_from')} /> */}
                                                    <div id={"day_" + item.weekday + "_from"} className="input-group date">
                                                        <input type="text" className="form-control" required="required" value={UtilService.getShortTime1(item.openTime) || ''} onChange={this._changeTime.bind(this, item.weekday, "from")} />
                                                        <span className="input-group-addon">
                                                            <span className="fa fa-clock-o"></span>
                                                        </span>
                                                    </div>
                                                </Col>
                                                <Col sm={6}>
                                                    {/* <input type="time" className={'form-control'} required="required" onChange={this._changeTime.bind(this, 'day_' + item.id + '_to')} /> */}
                                                    <div id={"day_" + item.weekday + "_to"} className="input-group date">
                                                        <input type="text" className="form-control" required="required" value={UtilService.getShortTime1(item.closeTime) || ''} onChange={this._changeTime.bind(this, item.weekday, "to")} />
                                                        <span className="input-group-addon">
                                                            <span className="fa fa-clock-o"></span>
                                                        </span>
                                                    </div>
                                                </Col>
                                            </Col>
                                        </div>
                                    );
                                })
                            }
                        </div>{ /* schedule_list */}

                        <div className="botton_s">
                            &nbsp;
                        </div>
                    </ModalBody>
                </Modal>
                <aside className="editsidebar">
                    <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                    <form id="editSubForm" className="form" data-parsley-validate="">
                        <div className="form-group">
                            <label className="control-label">Title</label>
                            <input type="text" value={this.state.subBusiness.name || ''} placeholder="Title" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <input type="text" value={this.state.subBusiness.email || ''} placeholder="Email" required="required" data-parsley-type="email" onChange={this._changeField.bind(this, 'email')} className="form-control" />
                        </div>
                        {
                            hiddenPassword(this, this.state.editOption)
                        }
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitSubForm.bind(this)}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmSubBusiness.bind(this)}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditSubForm.bind(this)}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper >
        )
    };
}

export default BusinessProfile;