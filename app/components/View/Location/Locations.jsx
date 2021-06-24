import React from 'react';
import PlacesAutocomplete, { geocodeByAddress, geocodeByPlaceId } from 'react-places-autocomplete';
import Flag from "react-flags";
import swal from 'sweetalert';
import DatePicker from 'react-datepicker';
import _ from 'underscore';

import ContentWrapper from '../../Layout/ContentWrapper';
import LocationService from '../../API/LocationService';
import VehicleService from '../../API/VehicleService';
import * as CONST from '../../Common/constants';
import Config from '../../Common/Config';
import UtilService from '../../Common/UtilService';
import initGmap from '../../Common/maps-google'
import SortHeader from '../../Control/SortHeader';


import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

class Locations extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            locationList: {
                total: 0,
                items: []
            },
            vehicleInfos: [],
            vehicles: [],
            selectedLocation: {
                // dayTime: {},
                // nightTime: {}
            },
            selectedVehicleInfo: {
                vehicleId: "",
                fare: {}
            },
            formTitle: "New Location",
            addressLoading: false,

            sidebarType: 0, //0 - Location , 1 - Vehicle Info
            showLocationDetail: 0,
            editOption: false //false-create, true-edit
        }

        this._handleSelectPlace = this._handleSelectPlace.bind(this)
        this._handleChange = this._handleChange.bind(this)
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();
        this.vehicleInfoEditForm = $('form#vehicleInfoEditForm').parsley();

        this._searchLocations(1);
        this._searchActiveVehicles();

        // Google Maps
        //$('[data-gmap]').each(initGmap);

        this._initTimePicker()
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _initTimePicker() {
        // TimePicker
        setTimeout(() => {
            $('#day_from').datetimepicker({
                format: 'LT',
                ignoreReadonly: true

            });
            $('#day_to').datetimepicker({
                format: 'LT',
                ignoreReadonly: true,
            });
            $('#night_from').datetimepicker({
                format: 'LT',
                ignoreReadonly: true

            });
            $('#night_to').datetimepicker({
                format: 'LT',
                ignoreReadonly: true,
            });

            $('#day_from').on('dp.change', this._changeTime.bind(this, 'day_from'));
            $('#day_to').on('dp.change', this._changeTime.bind(this, 'day_to'));
            $('#night_from').on('dp.change', this._changeTime.bind(this, 'night_from'));
            $('#night_to').on('dp.change', this._changeTime.bind(this, 'night_to'));
        }, 100)
    }

    // _searchUser searches users by query
    _searchLocations(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from webservic via api
        LocationService.readLocations(query, (res) => {
            console.log("locations", res);
            this.ifMounted && this.setState({
                locationList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _searchLocation(id, e) {
        if (e)
            e.preventDefault();

        // get vehicle infos from webservic via api
        LocationService.readLocation(id, (res) => {
            this.ifMounted && this.setState({
                vehicleInfos: res.vehicleInfos != null ? res.vehicleInfos : [],
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _searchActiveVehicles(e) {
        if (e)
            e.preventDefault();

        VehicleService.readActiveVehicles((res) => {
            // console.log("vehicles", res);
            this.ifMounted && this.setState({
                vehicles: res,
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createLocation(e) {
        // initialize user data and variable
        this.ifMounted && this.setState({
            selectedLocation: {
                countryCode: "",
                city: "",
                latitude: 0.0,
                longitude: 0.0,
                placeId: "",
                isDayTime: false,
                dayTime: null,
                isNightTime: false,
                nightTime: null,
            },
            sidebarType: 0,
            showLocationDetail: 0,
            editOption: false,
            formTitle: "New Location"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#day_time').prop('checked', false);
        $(".day_times").slideUp();
        $('#night_time').prop('checked', false);
        $(".night_times").slideUp();

        $(document.body).addClass("editsidebar-open");
    }

    _editLocation(location, e) {
        e.preventDefault()
        e.stopPropagation();
        // get user and update state
        // console.log(location);
        this.ifMounted && this.setState({
            selectedLocation: _.clone(location),
            sidebarType: 0,
            editOption: true,
            formTitle: "Edit Location"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        // reset timepickers
        if (location.isDayTime == true) {
            $('#day_time').prop('checked', true);
            $(".day_times").slideDown();
        } else {
            $('#day_time').prop('checked', false);
            $(".day_times").slideUp();
        }
        if (location.isNightTime == true) {
            $('#night_time').prop('checked', true);
            $(".night_times").slideDown();
        } else {
            $('#night_time').prop('checked', false);
            $(".night_times").slideUp();
        }

        $(document.body).addClass("editsidebar-open");
    }

    _showLocation(location, e) {
        e.preventDefault()
        $('#gmapWrapper').html("<div data-address=\"" + location.city + "\" data-gmap=\"\" data-maptype=\"ROADMAP\" data-styled=\"data-styled\" class=\"gmap\"></div>")
        this._searchLocation(location.id);

        this.ifMounted && this.setState({
            selectedLocation: _.clone(location),
            showLocationDetail: 1,
        });
        setTimeout(() => {
            $('.gmap').each(initGmap);
        }, 10);

        $(document.body).removeClass("editsidebar-open");
    }

    _submitForm(e) {
        e.preventDefault();

        if (this.state.sidebarType == 0) {
            this.editForm = $('form#editForm').parsley();
            this.editForm.validate();

            if (this.editForm.isValid()) {
                // console.log(this.state.selectedLocation, this.state.editOption);
                if (this.state.selectedLocation.isDayTime == false) this.state.selectedLocation.dayTime = null;
                if (this.state.selectedLocation.isNightTime == false) this.state.selectedLocation.nightTime = null;
                if (this.state.editOption) {
                    // update location
                    LocationService.updateLocation(this.state.selectedLocation, (res) => {
                        this._searchLocations(this.state.activePage);

                        $.notify("Location is updated successfully.", "success");
                        $(document.body).removeClass("editsidebar-open");
                    }, (err) => {
                        $.notify(err.message, "danger");
                    })

                } else {
                    // create location
                    LocationService.createLocation(this.state.selectedLocation, (res) => {

                        this._searchLocations(this.state.activePage);

                        // show notifiy
                        $.notify("Location is created successfully.", "success");
                        $(document.body).removeClass("editsidebar-open");
                    }, (err) => {
                        console.log(err.message);
                        $.notify(err.message, "danger");
                    });
                }
            } else {
                $.notify("Input data is invalid location data", "warning");
            }
        } else if (this.state.sidebarType == 1) {
            this.vehicleInfoEditForm = $('form#vehicleInfoEditForm').parsley();
            this.vehicleInfoEditForm.validate();

            if (this.vehicleInfoEditForm.isValid()) {
                var vehicleInfos = this.state.vehicleInfos;
                if (this.state.editOption) {
                    var vehicleInfo = _.find(vehicleInfos, (o) => {
                        return o.vehicleId == this.state.selectedVehicleInfo.vehicleId;
                    });
                    _.extend(vehicleInfo, this.state.selectedVehicleInfo);
                } else {
                    vehicleInfos.push(this.state.selectedVehicleInfo);
                }

                LocationService.updateVehicleInfo(this.state.selectedLocation.id, vehicleInfos, (res) => {
                    this._searchLocation(this.state.selectedLocation.id);

                    $.notify("Vehicle info is upinserted successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })
            } else {
                $.notify("Input data is invalid vehicle info data", "warning");
            }
        }
    }

    _deleteConfirmLocation(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this item!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            if ($this.state.sidebarType == 0) {
                $this._deleteLocation();
            } else {
                $this._deleteVehicleInfo();
            }
        });
    }

    _deleteLocation() {
        // delete user
        LocationService.deleteLocation(this.state.selectedLocation.id, (res) => {
            this._searchLocations(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Location is deleted correctly.", "success");
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        });
    }

    _deleteVehicleInfo() {
        var vehicleInfos = this.state.vehicleInfos;
        var vehicleInfo = _.find(vehicleInfos, (o) => {
            return o.vehicleId == this.state.selectedVehicleInfo.vehicleId;
        });
        var idx = vehicleInfos.indexOf(vehicleInfo);
        vehicleInfos.splice(idx, 1);

        LocationService.updateVehicleInfo(this.state.selectedLocation.id, vehicleInfos, (res) => {
            this._searchLocation(this.state.selectedLocation.id);

            $.notify("Vehicle info is deleted correctly.", "success");
            $(document.body).removeClass("editsidebar-open");
        }, (err) => {
            // console.log(err.message);
            $.notify(err.message, "danger");
        })
    }

    _closeEditForm(e) {
        e.preventDefault();
        $(document.body).removeClass("editsidebar-open");
    }

    _changeField(field, e) {
        e.preventDefault();
        // update all fields when change content
        var selectedLocation = this.state.selectedLocation;
        selectedLocation[field] = e.target.value;

        // update selected user state
        this.setState({
            selectedLocation: selectedLocation
        });
    }

    // Time functions
    _changeTime(field, e) {
        e.preventDefault();

        var selectedLocation = this.state.selectedLocation;

        if (field == "day_from" || field == "day_to") {
            if (field == "day_from") selectedLocation.dayTime.from = e.date;
            if (field == "day_to") selectedLocation.dayTime.to = e.date;

            var from = this._extractTime(selectedLocation.dayTime.from);
            var to = this._extractTime(selectedLocation.dayTime.to);

            if (this._compareTime(to, from) != -1) {
                // to is greater than from
                $('#day_time_group').css('border-width', '0px');
            } else {
                // to is less than from
                $('#day_time_group').css('border-style', 'solid');
                $('#day_time_group').css('border-color', 'red');
                $('#day_time_group').css('border-width', '1px');
            }
        }

        if (field == "night_from" || field == "night_to") {
            if (field == "night_from") selectedLocation.nightTime.from = e.date;
            if (field == "night_to") selectedLocation.nightTime.to = e.date;

            var from = this._extractTime(selectedLocation.nightTime.from);
            var to = this._extractTime(selectedLocation.nightTime.to);

            if (this._compareTime(to, from) != -1) {
                // to is greater than from
                $('#night_time_group').css('border-width', '0px');
            } else {
                // to is less than from
                $('#night_time_group').css('border-style', 'solid');
                $('#night_time_group').css('border-color', 'red');
                $('#night_time_group').css('border-width', '1px');
            }
        }

        this.ifMounted && this.setState({
            selectedLocation: selectedLocation
        });
    }

    _extractTime(workTime) {
        var strTime = UtilService.getTimeExceptSecond(workTime);
        var strMinHourArray = strTime.split(':');
        var timeObject = new Object();
        timeObject.hour = Number(strMinHourArray[0]);
        timeObject.min = Number(strMinHourArray[1]);
        return timeObject;
    }

    _compareTime(time1, time2) {
        if (time1.hour > time2.hour) {
            return 1;
        }
        else if (time1.hour < time2.hour) {
            return -1;
        }
        else {
            if (time1.min > time2.min) {
                return 1;
            }
            else if (time1.min < time2.min) {
                return -1;
            }
            else {
                return 0;
            }
        }
    }

    _handlePageSelect(eventKey) {
        this._searchLocations(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchLocations(this.state.activePage);
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
            var selectedLocation = this.state.selectedLocation;
            var address_components = results[0]['address_components'];
            address_components.map((component, i) => {
                if (_.contains(component.types, "country")) {
                    selectedLocation.countryCode = component.short_name;
                    return;
                }
            })
            // check city available
            if (!_.contains(results[0]['types'], "locality")) {
                $.notify("Please input correct city string...", "warning");
            }
            selectedLocation.city = address;
            selectedLocation.placeId = placeId;
            selectedLocation.latitude = lat;
            selectedLocation.longitude = lng;
            this.setState({
                selectedLocation: selectedLocation
            });
        })
    }

    _handleChange(address) {
        // update all fields when change content
        var selectedLocation = this.state.selectedLocation;
        selectedLocation.city = address;
        // update selected state
        this.setState({
            selectedLocation: selectedLocation
        });
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        // console.log(field, e)
        setTimeout(() => {
            var selectedLocation = this.state.selectedLocation;

            if (field == 'day_time') {
                if ($('#day_time').prop('checked') == true) {
                    $('#day_time').prop('checked', false);
                    $(".day_times").slideUp();
                    selectedLocation.isDayTime = false;
                } else if ($('#day_time').prop('checked') == false) {
                    $('#day_time').prop('checked', true);
                    $(".day_times").slideDown();
                    selectedLocation.isDayTime = true;
                    if (selectedLocation.dayTime == null) {
                        selectedLocation.dayTime = { from: new Date(), to: new Date() }
                    }
                }
            } else if (field == 'night_time') {
                if ($('#night_time').prop('checked') == true) {
                    $('#night_time').prop('checked', false);
                    $(".night_times").slideUp();
                    selectedLocation.isNightTime = false;
                } else if ($('#night_time').prop('checked') == false) {
                    $('#night_time').prop('checked', true);
                    $(".night_times").slideDown();
                    selectedLocation.isNightTime = true;
                    if (selectedLocation.nightTime == null) {
                        selectedLocation.nightTime = { from: new Date(), to: new Date() }
                    }
                }
            }

            this.ifMounted && this.setState({
                selectedLocation: selectedLocation
            })
        }, 100)
    }

    //=============================================================
    // Vehicle Info
    //=============================================================

    _addVehicleInfo(e) {
        e.preventDefault();

        this.vehicleInfoEditForm = $('form#vehicleInfoEditForm').parsley();
        this.vehicleInfoEditForm.reset()

        this.ifMounted && this.setState({
            selectedVehicleInfo: {
                vehicleId: "",
                fare: {
                    baseFare: 0.0,
                    minFare: 0.0,
                    perKm: 0.0,
                    perMinute: 0.0,
                    bookingFee: 0.0,
                    nightSurge: 1.0
                },
            },
            sidebarType: 1,
            editOption: false,
            formTitle: "Add Vehicle-Info"
        });

        $(document.body).addClass("editsidebar-open");
    }

    _editVehicleInfo(info, e) {
        e.preventDefault();
        //console.log(info)
        this.vehicleInfoEditForm = $('form#vehicleInfoEditForm').parsley();
        this.vehicleInfoEditForm.reset()

        this.ifMounted && this.setState({
            selectedVehicleInfo: $.extend(true, {}, info),//_.clone(info),
            editOption: true,
            sidebarType: 1,
            formTitle: "Edit Vehicle-Info"
        });

        $(document.body).addClass("editsidebar-open");
    }

    _changeInfoField(field, e) {
        e.preventDefault();

        var selectedVehicleInfo = this.state.selectedVehicleInfo;
        if (field == "vehicleId") {
            selectedVehicleInfo[field] = e.target.value;
        } else {
            selectedVehicleInfo.fare[field] = Number(e.target.value);
        }
        // update selected user state
        this.setState({
            selectedVehicleInfo: selectedVehicleInfo
        });
    }

    render() {
        const cssClasses = {
            root: 'form-group',
            label: 'form-label',
            input: 'Demo__search-input',
            autocompleteContainer: 'Demo__autocomplete-container'
        }

        const inputProps = {
            value: this.state.selectedLocation.city || '',
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

        return (
            <ContentWrapper>
                <div className="content-heading">
                    Locations
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" onClick={this._createLocation.bind(this)}>Add New</button>
                    </div>
                </div>
                <div>
                    <Row>
                        <Col lg={4}>
                            <Panel>
                                <Row className="mb-lg">
                                    <Col md={8}>
                                        <form className="form-inline">
                                            <div className="input-group">
                                                <input ref="query" placeholder="Search location" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                                <span className="input-group-btn">
                                                    <button className="btn btn-new" onClick={this._searchLocations.bind(this, 1)}>
                                                        Search
                                                    </button>
                                                </span>
                                            </div>
                                        </form>
                                    </Col>
                                    <Col md={4}>
                                        <button className="btn btn-new pull-right table_new_btn" onClick={this._createLocation.bind(this)}>New</button>
                                    </Col>
                                </Row>
                                <Table id="table" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th className="text-center">
                                                Country
                                            </th>
                                            <th className="text-center">
                                                <SortHeader
                                                    label={'City'}
                                                    action={this._sortList.bind(this)}
                                                    sortField="city"
                                                    sortIndex={1}
                                                    activeIndex={this.state.activeIndex}
                                                    setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                                </SortHeader>
                                            </th>
                                            <th className="text-center">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.locationList.items.map((item, i) => {
                                                return (
                                                    <tr key={'locationTr' + i} className="tr-hover text-center" onClick={this._showLocation.bind(this, item)}>
                                                        <td>
                                                            <Flag
                                                                name={item.countryCode}
                                                                format="png"
                                                                pngSize={32}
                                                                shiny={true}
                                                            />
                                                        </td>
                                                        <td>{item.city}</td>
                                                        <td>
                                                            <button className="btn btn-success btn-sm" onClick={this._editLocation.bind(this, item)}>Edit</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.locationList.total == 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={3}>
                                                            <p className="text-center">There is no any data.</p>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })()}
                                    </tbody>
                                </Table>
                            </Panel>
                            {/*<div className="text-center">
                                <Pagination
                                    className={this.state.locationList.total === 0 ? 'hidden' : 'shown'}
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
                            </div>*/}
                        </Col>
                        <Col lg={8}>
                            <Panel style={{ display: this.state.showLocationDetail == 1 ? 'block' : 'none' }}>
                                <Row className="mb-lg">
                                    <Col xs={6} md={12}>
                                        <button className="btn btn-new pull-right" onClick={this._addVehicleInfo.bind(this)}>Add Vehicle-Info</button>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th className="text-center" style={{ width: "30px" }}>#</th>
                                            <th className="text-center" style={{ width: "160px" }}>Vehicle</th>
                                            <th className="text-center">Base fare</th>
                                            <th className="text-center">Min fare</th>
                                            <th className="text-center">Per-km</th>
                                            <th className="text-center">Per-minute</th>
                                            <th className="text-center">Night surge</th>
                                            <th className="text-center">Booking fee</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.vehicleInfos.map((item, i) => {
                                                return (
                                                    <tr key={'vehicleTr' + i} className="tr-hover text-center" onClick={this._editVehicleInfo.bind(this, item)}>
                                                        <td>{i + 1}</td>{console.log("item.vehicle", item.vehicle)}
                                                        <td className="text-left">{<img src={UtilService.getImageFromPath(item.vehicle.menuIcon)} className="img-thumbnail thumb32 img-fit img-circle" style={{ backgroundColor: 'white' }} />} {item.vehicle.title}</td>
                                                        <td>{item.fare.baseFare}</td>
                                                        <td>{item.fare.minFare}</td>
                                                        <td>{item.fare.perKm}</td>
                                                        <td>{item.fare.perMinute}</td>
                                                        <td>{item.fare.nightSurge}</td>
                                                        <td>{item.fare.bookingFee}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.locationList.total == 0) {
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
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Panel style={{ display: this.state.showLocationDetail == 1 ? 'block' : 'none' }} id="gmapWrapper">

                            </Panel>
                        </Col>
                    </Row>
                </div>
                <aside className="editsidebar">
                    <div className="sidebar-header"><legend>{this.state.formTitle}</legend></div>
                    <form id="editForm" className="form" data-parsley-validate="" style={{ display: this.state.sidebarType == 0 ? 'block' : 'none' }}>
                        <div className="form-group">
                            <label className="control-label">City</label>
                            <FormGroup>
                                <PlacesAutocomplete
                                    inputProps={inputProps}
                                    onSelect={this._handleSelectPlace}
                                    autocompleteItem={AutocompleteItem}
                                    classNames={cssClasses}
                                    onEnterKeyDown={this._handleSelectPlace}
                                />
                            </FormGroup>
                        </div>

                        <div className="form-group">
                            <label className="control-label">Country Code</label>
                            <input type="text" value={this.state.selectedLocation.countryCode || ''} placeholder="Country" onChange={this._changeField.bind(this, 'countryCode')} className="form-control" />
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Day Time</label>
                            <Col sm={8}>
                                <label className="switch switch-sm">
                                    <input type="checkbox" id="day_time" onClick={this._changeSwitch.bind(this, 'day_time')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <div className="form-group range_dates day_times" id="day_time_group">
                            <label className="col-sm-4 control-label" style={{ marginTop: '5px' }}>From</label>
                            <Col sm={8}>
                                <div id="day_from" className="input-group date">
                                    <input type="text" className="form-control in_from" value={this.state.selectedLocation.dayTime != undefined ? UtilService.getTimeExceptSecond(this.state.selectedLocation.dayTime.from) : '' || ''} onChange={this._changeTime.bind(this, 'day_from')} readOnly />
                                    <span className="input-group-addon">
                                        <span className="fa fa-clock-o"></span>
                                    </span>
                                </div>
                            </Col>
                            <label className="col-sm-4 control-label" style={{ marginTop: '5px' }}>To</label>
                            <Col sm={8}>
                                <div id="day_to" className="input-group date">
                                    <input type="text" className="form-control in_to" value={this.state.selectedLocation.dayTime != undefined ? UtilService.getTimeExceptSecond(this.state.selectedLocation.dayTime.to) : '' || ''} onChange={this._changeTime.bind(this, 'day_to')} readOnly />
                                    <span className="input-group-addon">
                                        <span className="fa fa-clock-o"></span>
                                    </span>
                                </div>
                            </Col>
                        </div>

                        <div className="form-group peaks">
                            <label className="col-sm-4 control-label padding">Night Time</label>
                            <Col sm={8}>
                                <label className="switch switch-sm">
                                    <input type="checkbox" id="night_time" onClick={this._changeSwitch.bind(this, 'night_time')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <div className="form-group range_dates night_times" id="night_time_group">
                            <label className="col-sm-4 control-label" style={{ marginTop: '5px' }}>From</label>
                            <Col sm={8}>
                                <div id="night_from" className="input-group date">
                                    <input type="text" className="form-control in_from" value={this.state.selectedLocation.nightTime != undefined ? UtilService.getTimeExceptSecond(this.state.selectedLocation.nightTime.from) : '' || ''} onChange={this._changeTime.bind(this, 'night_from')} readOnly />
                                    <span className="input-group-addon">
                                        <span className="fa fa-clock-o"></span>
                                    </span>
                                </div>
                            </Col>
                            <label className="col-sm-4 control-label" style={{ marginTop: '5px' }}>To</label>
                            <Col sm={8}>
                                <div id="night_to" className="input-group date">
                                    <input type="text" className="form-control in_to" value={this.state.selectedLocation.nightTime != undefined ? UtilService.getTimeExceptSecond(this.state.selectedLocation.nightTime.to) : '' || ''} onChange={this._changeTime.bind(this, 'night_to')} readOnly />
                                    <span className="input-group-addon">
                                        <span className="fa fa-clock-o"></span>
                                    </span>
                                </div>
                            </Col>
                        </div>
                    </form>

                    <form id="vehicleInfoEditForm" className="form" data-parsley-validate="" style={{ display: this.state.sidebarType == 1 ? 'block' : 'none' }}>
                        <div className="form-group">
                            <label className="control-label">Vehicle</label>
                            <select className="form-control" required="required" value={this.state.selectedVehicleInfo.vehicleId || ''} onChange={this._changeInfoField.bind(this, 'vehicleId')} disabled={this.state.editOption} >
                                <option key="" value="">Select vechicle</option>
                                {
                                    this.state.vehicles.map((item, i) => {
                                        var vehicleInfo = _.find(this.state.vehicleInfos, (o) => {
                                            return o.vehicleId == item.id;
                                        });
                                        if (this.state.editOption || vehicleInfo == undefined) {
                                            return (
                                                <option key={item.id} value={item.id}>{item.title}</option>
                                            );
                                        }
                                    })
                                }
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="control-label">Base fare</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.baseFare || ''} required="required" placeholder="Base fare" onChange={this._changeInfoField.bind(this, 'baseFare')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Min fare</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.minFare || ''} required="required" placeholder="Min fare" onChange={this._changeInfoField.bind(this, 'minFare')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Per-km</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.perKm || ''} required="required" placeholder="Per km" onChange={this._changeInfoField.bind(this, 'perKm')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Per-minute</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.perMinute || ''} required="required" placeholder="Per minute" onChange={this._changeInfoField.bind(this, 'perMinute')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Night surge</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.nightSurge || ''} required="required" placeholder="Night surge" onChange={this._changeInfoField.bind(this, 'nightSurge')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Booking fee</label>
                            <input type="Number" value={this.state.selectedVehicleInfo.fare.bookingFee || ''} required="required" placeholder="Booking fee" onChange={this._changeInfoField.bind(this, 'bookingFee')} className="form-control" />
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm.bind(this)}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmLocation.bind(this)}>
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

export default Locations;
