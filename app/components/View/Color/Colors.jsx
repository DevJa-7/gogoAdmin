import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import ColorService from '../../API/ColorService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Colors extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {
            colors: [],
            selectedColor: {},

            formTitle: "New Color",
            editOption: true //false-create, true-edit
        }
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.colorEditForm = $('form#colorEditForm').parsley();

        if ($.fn.colorpicker) {
            $('#demo-colorpicker').colorpicker();
        }
        this._searchColors();
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchColors() {
        ColorService.readColors((res) => {
            console.log(res)
            this.ifMounted && this.setState({
                colors: res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        });
    }

    _createColor(e) {
        e.preventDefault();

        $('#demo-colorpicker').colorpicker('setValue', "#ffffff");
        this.ifMounted && this.setState({
            selectedColor: {
                name: "",
                value: "#ffffff"
            },
            editOption: false,
            formTitle: "New Color"
        })
        // reset validation
        this.colorEditForm = $('form#colorEditForm').parsley();
        this.colorEditForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _editColor(color, e) {
        e.preventDefault();

        $('#demo-colorpicker').colorpicker('setValue', color.value);
        this.ifMounted && this.setState({
            selectedColor: _.clone(color),
            editOption: true,
            formTitle: "Edit Color"
        });
        // reset validation
        this.colorEditForm = $('form#colorEditForm').parsley();
        this.colorEditForm.reset();
        $(document.body).addClass("editsidebar-open");
    }

    _deleteColor() {
        // delete color
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
            ColorService.deleteColor($this.state.selectedColor.id, (res) => {
                $this._searchColors();

                $(document.body).removeClass("editsidebar-open");
                $.notify("Color is deleted correctly.", "success");
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
        var selectedColor = this.state.selectedColor;
        selectedColor[field] = e.target.value;

        // update selected color state
        this.setState({ selectedColor });
    }

    _rgb2hex(rgb) {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    _submitForm(e) {
        e.preventDefault();

        this.colorEditForm = $('form#colorEditForm').parsley();
        this.colorEditForm.validate();

        if (this.colorEditForm.isValid()) {
            this.state.selectedColor.value = this._rgb2hex($('#demo-color').css('backgroundColor'))
            if (this.state.editOption) {
                // update color
                ColorService.updateColor(this.state.selectedColor, (res) => {
                    var colors = this.state.colors;
                    var color = _.find(colors, (o) => {
                        return o.id == res.id;
                    });

                    _.extend(color, res);

                    // update state
                    this.ifMounted && this.setState({ colors });

                    $.notify("Color is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                })

            } else {
                // create color
                ColorService.createColor(this.state.selectedColor, (res) => {
                    this._searchColors();

                    // show notifiy
                    $.notify("Color is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    $.notify(err.message, "danger");
                });
            }
        } else {
            $.notify("Input data is invalid color data", "warning");
        }
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Colors
                </div>
                <div>
                    <Row>
                        <Col md={6}>
                            <Panel>
                                <Row>
                                    <Col md={12}>
                                        <legend>
                                            Colors
                                    <button className="btn btn-sm btn-primary pull-right" onClick={this._createColor.bind(this)}>New color</button>
                                        </legend>
                                    </Col>
                                </Row>
                                <Table id="table1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '30px' }}>#</th>
                                            <th className="text-center" style={{ width: '80px' }}>
                                                <strong>Color</strong>
                                            </th>
                                            <th className="text-center">
                                                <strong>Name</strong>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.colors.map((item, i) => {
                                                return (
                                                    <tr key={'colorTr' + i} className="tr-hover" onClick={this._editColor.bind(this, item)}>
                                                        <td>{i + 1}</td>
                                                        <td className="text-center"><span className="circle" style={{ backgroundColor: item.value, width: '10px', height: '10px' }}></span></td>
                                                        <td className="text-center">{item.name}</td>
                                                    </tr>
                                                );
                                            })
                                        }
                                        {(() => {
                                            if (this.state.colors.length == 0) {
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
                        <form id="colorEditForm" className="form" data-parsley-validate="">
                            <div className="form-group">
                                <label className="control-label">Name</label>
                                <input type="text" className="form-control" value={this.state.selectedColor.name || ''} required="required" onChange={this._changeField.bind(this, 'name')} />
                            </div>
                            <div className="form-group">
                                <label className="control-label">Value</label>
                                <div id="demo-colorpicker" className="input-group colorpicker-component">
                                    <input type="text" value={this.state.selectedColor.value} className="form-control" />
                                    <span className="input-group-addon"><i id="demo-color"></i>
                                    </span>
                                </div>
                            </div>
                        </form>
                        <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px', }} onClick={this._submitForm.bind(this)}>
                            <i className="fa fa-check fa-lg"></i>
                        </Button>
                        <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteColor.bind(this)}>
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

export default Colors;