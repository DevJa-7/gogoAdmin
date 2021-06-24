import React from 'react';
import _ from 'underscore'
import async from 'async';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import api from '../../../API/api';
import DriverService from '../../../API/DriverService';
import DocumentService from '../../../API/DocumentService';
import VehicleService from '../../../API/VehicleService';
import UploadService from '../../../API/UploadService';
import UtilService from '../../../Common/UtilService';
import * as CONST from '../../../Common/constants';
import LightboxView from '../../../Control/LightboxView';

class CarsTab extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            driver: {},
            vehicleIndex: 0,
            selectedVehicle: {},
            vehicles: [],
            formTitle: "Edit Vehicle",
            documents: [],

            showImageView: false,
        };

        this.images = []
        this.titles = []
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");
        this.ifMounted = true;

        async.parallel([
            (cb) => {
                this._searchDocuments();
                this._searchActiveVehicles();
            },
        ], function (err, ret) {
            if (err) {
                console.log(err);
                return;
            }
        })

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    componentWillReceiveProps(nextProps) {
        this.ifMounted && this.setState({
            driver: nextProps.driver,
        });
    }

    _searchDocuments() {
        var query = "&is_filter=" + true
        DocumentService.readDocuments(query, (res) => {
            console.log("documents", res);
            this.setState({
                documents: res
            })
        }, (err) => {
        });
    }

    _searchActiveVehicles() {
        VehicleService.readActiveVehicles((res) => {
            // console.log("vehicles", res);
            this.ifMounted && this.setState({
                vehicles: res,
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _searchBrands() {

    }

    _searchColors() {

    }

    _viewDocument(vehicle, id, i, e) {
        e.preventDefault();
        this.setState({
            vehicleIndex: i,
            selectedVehicle: $.extend(true, {}, vehicle),
            formTitle: "Edit Vehicle",

            showImageView: false,
        });

        this.images = []
        this.titles = []

        $('#switch_status').prop('checked', vehicle.status);
        vehicle.documents.map((d, i) => {
            $('#switch_' + d.id).prop('checked', d.status == 2 ? true : false);
        })

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');

        $(document.body).addClass("editsidebar-open");
    }

    _changeField(field, e) {
        if (e) {
            e.preventDefault();
        }

        var selectedVehicle = this.state.selectedVehicle;
        selectedVehicle[field] = e.target.value;

        this.setState({ selectedVehicle });
    }

    _changeSwitch(field, e) {
       if (e) {
            e.preventDefault();
        }

        setTimeout(() => {
            var selectedVehicle = this.state.selectedVehicle;
            console.log(selectedVehicle)
            if (field == 'status') {
                selectedVehicle.status = UtilService.changeSwitchValue($('#switch_status'));
            }
            this.ifMounted && this.setState({ selectedVehicle })
        }, 100)
    }

    _changeDocumentSwitch(d, e) { 
        console.log(d)
        
        if (e) {
            e.preventDefault();
        }
        if (d == null) {
            return
        }
        setTimeout(() => {
            var selectedVehicle = this.state.selectedVehicle;
            d.status = UtilService.changeSwitchValue($('#switch_' + d.id)) ? 2 : 1;
            this.ifMounted && this.setState({ selectedVehicle })
        }, 100)
    }

    _changeDocumentImage(d, e) {
        if (e) {
            e.preventDefault();
        }

        var selectedVehicle = this.state.selectedVehicle;
        this._uploadFile(d, this.refs['image_' + d.id].files[0]);
    }

    _uploadFile(d, file) {
        var driver = this.state.driver;

        const data = new FormData();
        data.append('type', 'documents/' + driver.id);
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {
            console.log("upload:", res)
            $.notify("File is uploaded successfully", "success");
            d['image'] = res.message;
            // reset state
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }


    _updateVehicle(id) {
        var vehicle = this.state.selectedVehicle;
        DriverService.updateDriverVehicle(id, vehicle, (res) => {
            var driver = this.state.driver
            driver.driverVehicles[this.state.vehicleIndex] = vehicle
            this.setState({ driver })

            $.notify("Vehicle is update.", "success");
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _deleteVehicle(e) {
        if (e) {
            e.preventDefault();
        }

        var driver = this.state.driver
        var vehicle = this.state.selectedVehicle
        console.log("output:", vehicle)

        DriverService.deleteDriverVehicle(driver.id, vehicle, (res) => {
            driver.driverVehicles.splice(this.state.vehicleIndex, 1)
            this.setState({ driver })

            $.notify("Vehicle is deleted correctly.", "success");
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _closeEditForm(e) {
        if (e) {
            e.preventDefault();
        }

        $(document.body).removeClass("editsidebar-open");
    }

    // for Document
    _viewImage(d, e) {
        if (e) {
            e.preventDefault();
        }

        this.index = this.images.indexOf(d)
        this.ifMounted && this.setState({
            showImageView: true,
        })
    }

    render() {
        const showDocumentStatus = ((d) => {
            if (d == undefined) return
            switch (d.status) {
                default://missing
                    return <span className="circle circle-danger circle-lg" />
                case 1://pending
                    return <span className="circle circle-warning circle-lg" />
                case 2://accepted
                    return <span className="circle circle-success circle-lg" />
            }
        })
        const initDocuments = (() => {
            this.images = []
            this.titles = []
        })
        const showDocuments = ((items) => {
            var results = [];
            items && items.map((item, i) => {
                item = _.clone(item)
                var d = _.find(this.state.selectedVehicle.documents, (o) => {
                    return o.id == item.id
                })

                // console.log(this.state.selectedVehicle)
                _.extend(item, d)

                if (item.image) {
                    this.images.push(item.image)
                    this.titles.push(item.name)
                }

                results.push(
                    <fieldset key={"doc" + i} className="pb mb">
                        <div className="form-group">
                            {showDocumentStatus(item)}
                            <label className="control-label">{item.name}</label>
                            {item.isRequired ? '' : <small>{'(optional)'}</small>}
                            <label className="switch switch-sm pull-right">
                                <input type="checkbox" id={"switch_" + item.id} onClick={this._changeDocumentSwitch.bind(this, d)} />
                                <em></em>
                            </label>
                            <Row>
                                <Col sm={2}>
                                    <button type="button" className="btn btn-default" style={{ marginTop: '2px' }} onClick={this._viewImage.bind(this, item.image)} disabled={item.image ? false : true}>
                                        <em className="fa fa-search"></em>
                                    </button>
                                </Col>
                                <Col sm={10}>
                                    <input
                                        type="file"
                                        ref={"image_" + item.id}
                                        data-classbutton="btn btn-default"
                                        data-classinput="form-control inline"
                                        className="form-control filestyle"
                                        onChange={this._changeDocumentImage.bind(this, d)} disabled={item.image ? false : true} />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={12}>
                                    <div className="text-primary">
                                        <cite>{item.isExpired ? 'Expire date: ' + UtilService.getDate(item.expireDate) : ''}</cite>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </fieldset>
                )
            })
            return results
        })

        return (
            <div>
                <LightboxView
                    isOpen={this.state.showImageView}
                    index={this.index}
                    images={this.images}
                    titles={this.titles}
                    closeImageView={() => this.setState({ showImageView: false })}
                />
                <Row>
                    {
                        this.props.driver.driverVehicles && this.props.driver.driverVehicles.map((item, i) => {
                            return (
                                <Col key={'car' + i} sm={6}>
                                    <div className="list-group">
                                        <a href="#" className="media pb-sm list-group-item" onClick={this._viewDocument.bind(this, item, this.props.driver.id, i)}>
                                            <span className="pull-left">
                                                <img src="img/ic_car.png" alt="Car Name" className="thumb-height48 img-contain" />
                                            </span>
                                            <span className="pull-right">
                                                <span className={item.status ? 'circle circle-success circle-lg car_s' : 'circle circle-danger circle-lg car_s'}></span>
                                            </span>
                                            <span className="pull-right mt-sm mr-md">
                                                <pre className="pt0 pb0 pr pl"><h4>{item.number}</h4></pre>
                                            </span>
                                            <span className="media-body pt-sm">
                                                <span className="heading">
                                                    <strong>{item.brand}</strong>
                                                    <br />
                                                    <small className="text-muted">{item.model} | {item.color} | {item.year}</small>
                                                </span>
                                            </span>
                                        </a>
                                    </div>
                                </Col>
                            );
                        })
                    }
                </Row>
                <aside className="editsidebar">
                    <div className="sidebar-header text-center"><legend>{this.state.formTitle}</legend></div>
                    <form id="editForm" className="form" data-parsley-validate="">
                        <div className="form-group row">
                            <label className="col-sm-3 control-label  pt-sm">Vehicle</label>
                            <Col sm={9}>
                                <select className="form-control" required="required" value={this.state.selectedVehicle.vehicleId || ''} onChange={this._changeField.bind(this, 'vehicleId')} >
                                    <option key="" value="">Select vechicle</option>
                                    {
                                        this.state.vehicles && this.state.vehicles.map((item, i) => {
                                            return (
                                                <option key={item.id} value={item.id}>{item.title}</option>
                                            );
                                        })
                                    }
                                </select>
                            </Col>
                        </div>
                        {/*
                            <div className="form-group row">
                                <label className="col-sm-3 control-label pt-sm">Number</label>
                                <Col sm={9}>
                                    <input type="text" value={this.state.selectedVehicle.number || ''} placeholder="Number" required="required" onChange={this._changeField.bind(this, 'number')} className="form-control" />
                                </Col>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 control-label pt-sm">Brand</label>
                                <Col sm={9}>
                                    <input type="text" value={this.state.selectedVehicle.brand || ''} placeholder="Brand" required="required" onChange={this._changeField.bind(this, 'brand')} className="form-control" />
                                </Col>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 control-label pt-sm">Model</label>
                                <Col sm={9}>
                                    <input type="text" value={this.state.selectedVehicle.model || ''} placeholder="Model" onChange={this._changeField.bind(this, 'model')} className="form-control" />
                                </Col>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 control-label pt-sm">Color</label>
                                <Col sm={9}>
                                    <input type="text" value={this.state.selectedVehicle.color || ''} placeholder="Color" onChange={this._changeField.bind(this, 'color')} className="form-control" />
                                </Col>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 control-label pt-sm">Year</label>
                                <Col sm={9}>
                                    <input type="text" value={this.state.selectedVehicle.year || ''} placeholder="Year" onChange={this._changeField.bind(this, 'year')} className="form-control" />
                                </Col>
                            </div>
                        */}
                        <div className="form-group row">
                            <label className="col-sm-3 control-label pt-sm">Status</label>
                            <Col sm={9}>
                                <label className="switch switch-sm pt-sm">
                                    <input type="checkbox" id="switch_status" onClick={this._changeSwitch.bind(this, 'status')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>

                        <legend><small>Documents</small></legend>
                        {initDocuments()}
                        {showDocuments(this.state.documents.vehicle)}
                        {showDocuments(this.state.documents.driver)}
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._updateVehicle.bind(this, this.props.driver.id)}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px' }} onClick={this._deleteVehicle.bind(this)}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm.bind(this)}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </div>
        );
    }
}

export default CarsTab;
