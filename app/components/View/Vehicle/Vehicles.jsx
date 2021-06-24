import React from 'react';
import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import VehicleService from '../../API/VehicleService';
import UploadService from '../../API/UploadService';
import * as CONST from '../../Common/constants';
import Config from '../../Common/Config';
import UtilService from '../../Common/UtilService';
import SortHeader from '../../Control/SortHeader';

class Vehicles extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params
        this.state = {
            vehicleList: {
                total: 0,
                items: []
            },
            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            selectedVehicle: {},
            formTitle: "New Vehicle",
            editOption: false //false-create, true-edit
        };

        // reset editForm
        this.editForm = null;
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchVehicles(1);

        // Notifiy
        // $('[data-notify]').each(notifyAlert);
        // FileStyle
        if ($.fn.filestyle)
            $('.filestyle').filestyle();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    // _searchVehicle searches vehicles by query
    _searchVehicles(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get vehicles from webservic via api
        VehicleService.readVehicles(query, (res) => {
            // console.log("vehicles", res);
            this.ifMounted && this.setState({
                vehicleList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _createVehicle(e) {
        // initialize vehicle data and variable
        this.ifMounted && this.setState({
            selectedVehicle: {
                maxSeat: 2,
                searchRadius: 1000
            },
            editOption: false,
            formTitle: "New Vehicle"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_status').prop('checked', false);
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _editVehicle(vehicle, e) {
        // get vehicle and update state
        this.setState({
            selectedVehicle: _.clone(vehicle),
            editOption: true,
            formTitle: "Edit Vehicle"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $('#switch_status').prop('checked', vehicle.status);
        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedVehicle, this.state.editOption);
            if (this.state.editOption) {
                // update vehicle
                VehicleService.updateVehicle(this.state.selectedVehicle, (res) => {
                    this._searchVehicles(this.state.activePage);

                    $.notify("Vehicle is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    console.log(err);
                    $.notify(err.message, "danger");
                })

            } else {
                // create vehicle
                VehicleService.createVehicle(this.state.selectedVehicle, (res) => {
                    // console.log("create:", res);
                    this._searchVehicles(this.state.activePage);

                    // show notifiy
                    $.notify("User is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid vehicle data");
            $.notify("Input data is invalid vehicle data", "warning");
        }
    }

    _deleteConfirmVehicle(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this vehicle!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteVehicle();
        });
    }

    _deleteVehicle(e) {
        // delete vehicle
        VehicleService.deleteVehicle(this.state.selectedVehicle.id, (res) => {
            this._searchVehicles(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Vehicle is deleted correctly.", "success");
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
        //     this._searchVehicles(this.state.activePage);
        //     return;
        // }

        // update all fields when change content
        var selectedVehicle = this.state.selectedVehicle;
        selectedVehicle[field] = e.target.value;

        if (field == 'photo') {
            this._uploadFile(field, this.refs.photo.files[0]);
            return;
        } else if (field == 'image') {
            this._uploadFile(field, this.refs.image.files[0]);
            return;
        } else if (field == 'menuIcon') {
            this._uploadFile(field, this.refs.menuIcon.files[0]);
            return;
        } else if (field == 'mapIcon') {
            this._uploadFile(field, this.refs.mapIcon.files[0]);
            return;
        } else if (field == 'maxSeat' || field == 'searchRadius') {
            selectedVehicle[field] = Number(e.target.value)
        }
        // update selected vehicle state
        this.setState({
            selectedVehicle: selectedVehicle
        });
    }

    _uploadFile(field, file) {
        var selectedVehicle = this.state.selectedVehicle;

        const data = new FormData();
        data.append('type', 'vehicles');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log(res)
            $.notify("File is uploaded successfully", "success");
            selectedVehicle[field] = res.message;
            // reset state
            this.setState({
                selectedVehicle: selectedVehicle
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _handlePageSelect(eventKey) {
        this._searchVehicles(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchVehicles(this.state.activePage);
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedVehicle = this.state.selectedVehicle;
            selectedVehicle.status = UtilService.changeSwitchValue($('#switch_status'))
            this.ifMounted && this.setState({
                selectedVehicle: selectedVehicle
            })
        }, 100)
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Vehicles
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" onClick={this._createVehicle.bind(this)}>Add New</button>
                    </div>
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search title, seats and etc" className="form-control" onChange={this._changeField.bind(this, 'search')} style={{ width: '190px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-new" onClick={this._searchVehicles.bind(this, 1)}>
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn" onClick={this._createVehicle.bind(this)}>New Vehicle</button>
                            </Col>
                        </Row>
                        <Table id="table" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th className="text-center" style={{ width: "30px" }}><strong>#</strong></th>
                                    <th className="text-center">Photo</th>
                                    <th className="text-center">Image</th>
                                    <th className="text-center">Menu icon</th>
                                    <th className="text-center">Map icon</th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Title'}
                                            action={this._sortList.bind(this)}
                                            sortField="title"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Detail'}
                                            action={this._sortList.bind(this)}
                                            sortField="detail"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Max seat'}
                                            action={this._sortList.bind(this)}
                                            sortField="maxSeat"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Search radius'}
                                            action={this._sortList.bind(this)}
                                            sortField="searchRadius"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Status'}
                                            action={this._sortList.bind(this)}
                                            sortField="status"
                                            sortIndex={4}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center" style={{ width: '250px' }}>
                                        <SortHeader
                                            label={'Description'}
                                            action={this._sortList.bind(this)}
                                            sortField="description"
                                            sortIndex={5}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={6}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Updated at'}
                                            action={this._sortList.bind(this)}
                                            sortField="updatedAt"
                                            sortIndex={7}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.vehicleList.items.map((item, i) => {
                                        return (
                                            <tr key={'vehicleTr' + i} className="tr-hover text-center" onClick={this._editVehicle.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>{<img src={UtilService.getImageFromPath(item.photo)} className="img-thumbnail thumb-height48 img-contain" style={{ backgroundColor: 'white' }} />}</td>
                                                <td>{<img src={UtilService.getImageFromPath(item.image)} className="img-thumbnail thumb-height48 img-contain" style={{ backgroundColor: 'white' }} />}</td>
                                                <td>{<img src={UtilService.getImageFromPath(item.menuIcon)} className="img-thumbnail thumb48 img-contain img-circle" style={{ backgroundColor: 'white' }} />}</td>
                                                <td>{<img src={UtilService.getImageFromPath(item.mapIcon)} className="img-thumbnail thumb48 img-contain img-circle" style={{ backgroundColor: 'white' }} />}</td>
                                                <td><strong>{item.title}</strong></td>
                                                <td>{item.detail}</td>
                                                <td>{item.maxSeat}</td>
                                                <td>{item.searchRadius} m</td>
                                                <td>{item.status ? <div className="badge p-sm bg-success">Active</div> : <div className="badge p-sm bg-danger">Deactive</div>}</td>
                                                <td className="text-left">{item.description}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.vehicleList.total == 0) {
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
                            className={this.state.vehicleList.total === 0 ? 'hidden' : 'shown'}
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
                            <input type="text" value={this.state.selectedVehicle.title || ''} placeholder="Title" required="required" onChange={this._changeField.bind(this, 'title')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Detail</label>
                            <input type="text" value={this.state.selectedVehicle.detail || ''} placeholder="Detail" required="required" onChange={this._changeField.bind(this, 'detail')} className="form-control" />
                        </div>
                        <div className="form-group" >
                            <label className="control-label col-sm-6 padding" style={{ marginTop: '6px' }}>Max seat</label>
                            <Col sm={6}>
                                <input type="number" value={this.state.selectedVehicle.maxSeat || ''} placeholder="Max seat" required="required" onChange={this._changeField.bind(this, 'maxSeat')} className="form-control" />
                            </Col>
                        </div>
                        <div className="form-group peaks">
                            <label className="control-label col-sm-6 padding" style={{ marginTop: '6px' }}>Search radius(m)</label>
                            <Col sm={6}>
                                <input type="number" value={this.state.selectedVehicle.searchRadius || ''} placeholder="Search radius" required="required" onChange={this._changeField.bind(this, 'searchRadius')} className="form-control" />
                            </Col>
                        </div>
                        <div className="form-group">
                            <label className="control-label">Description</label>
                            <textarea value={this.state.selectedVehicle.description || ''} placeholder="Description" required="required" onChange={this._changeField.bind(this, 'description')} className="form-control" style={{ height: '80px', resize: 'none' }} />
                        </div>
                        <div className="form-group peaks">
                            <label className="col-sm-6 control-label padding">Status</label>
                            <Col sm={6}>
                                <label className="switch switch-sm">
                                    <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'switch_status')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>
                        <div className="form-group">
                            <label className="control-label" style={{ marginTop: '6px' }}>Photo</label>
                            <Col md={12} className="padding">
                                <input
                                    type="file"
                                    ref="photo"
                                    data-classbutton="btn btn-default"
                                    data-classinput="form-control inline"
                                    className="form-control filestyle"
                                    onChange={this._changeField.bind(this, 'photo')} />
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
                            <label className="control-label" style={{ marginTop: '6px' }}>Menu icon</label>
                            <Col md={12} className="padding">
                                <input
                                    type="file"
                                    ref="menuIcon"
                                    data-classbutton="btn btn-default"
                                    data-classinput="form-control inline"
                                    className="form-control filestyle"
                                    onChange={this._changeField.bind(this, 'menuIcon')} />
                            </Col>
                        </div>
                        <div className="form-group">
                            <label className="control-label" style={{ marginTop: '6px' }}>Map icon</label>
                            <Col md={12} className="padding">
                                <input
                                    type="file"
                                    ref="map_icon"
                                    data-classbutton="btn btn-default"
                                    data-classinput="form-control inline"
                                    className="form-control filestyle"
                                    onChange={this._changeField.bind(this, 'mapIcon')} />
                            </Col>
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm.bind(this)}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmVehicle.bind(this)}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper>
        );
    }

}

export default Vehicles;
