import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import BusinessService from '../../API/BusinessService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Businesses extends React.Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            businessList: {
                total: 0,
                items: []
            },
            selectedBusiness: {
                verify: {
                    isVerified: false,
                },
            },

            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            formTitle: "New Business",
            editOption: false
        }

        // reset editForm
        this.editForm = null;

        this._createBusiness = this._createBusiness.bind(this);
        this._deleteConfirmBusiness = this._deleteConfirmBusiness.bind(this);
        this._submitForm = this._submitForm.bind(this);
        this._closeEditForm = this._closeEditForm.bind(this);
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchBusinesses(1);
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchBusinesses(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        BusinessService.readBusinesses(query, (res) => {
            console.log("res", res);
            this.ifMounted && this.setState({
                businessList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
            console.log(err)
        });
    }

    _createBusiness(e) {
        this.ifMounted && this.setState({
            selectedBusiness: {
                name: "",
                email: "",
                verify: {
                    isVerified: false,
                },
            },
            editOption: false,
            formTitle: "New Business"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();
        $('#switch_verify').prop('checked', false);
        $('#switch_recommend').prop('checked', false);
        $('#switch_mostPopular').prop('checked', false);
        $('#switch_closed').prop('checked', false);
        $(document.body).addClass("editsidebar-open");
    }

    _editBusiness(business, e) {
        this.setState((old) => {
            if (!business.verify) {
                business.verify = {
                    isVerified: false
                }
            }
            old.selectedBusiness = $.extend(true, {}, business)
            old.editOption = true
            old.formTitle = "Edit Business"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
        setTimeout(() => {
            console.log(this.state.selectedBusiness)
            $('#switch_verify').prop('checked', this.state.selectedBusiness.verify.isVerified);
            $('#switch_recommend').prop('checked', this.state.selectedBusiness.recommend);
            $('#switch_mostPopular').prop('checked', this.state.selectedBusiness.mostPopular);
            $('#switch_closed').prop('checked', this.state.selectedBusiness.closed);
        }, 100)
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.editOption) {

                BusinessService.updateBusiness(this.state.selectedBusiness, (res) => {
                    console.log("update data", res);

                    this._searchBusinesses(this.state.activePage);

                    $.notify("Business is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })
            } else {
                BusinessService.createBusiness(this.state.selectedBusiness, (res) => {

                    this._searchBusinesses(this.state.activePage);
                    // show notifiy
                    $.notify("Business is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid business data", "warning");
        }
    }

    _deleteConfirmBusiness(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this business!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteBusiness();
        });
    }

    _deleteBusiness(e) {
        BusinessService.deleteBusiness(this.state.selectedBusiness.id, (res) => {
            this._searchBusinesses(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Business is deleted correctly.", "success");
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

        var selectedBusiness = this.state.selectedBusiness;
        selectedBusiness[field] = e.target.value;

        this.ifMounted && this.setState((old) => {
            old.selectedBusiness = selectedBusiness
        });
    }

    _changeSwitch(field, e) {
        e.preventDefault();

        setTimeout(() => {
            var selectedBusiness = this.state.selectedBusiness;
            if (field == 'isVerify') {
                if (!selectedBusiness.verify) {
                    selectedBusiness.verify = {}
                }
                selectedBusiness.verify.isVerified = UtilService.changeSwitchValue($('#switch_verify'))
            } else if (field == "recommend") {
                selectedBusiness.recommend = UtilService.changeSwitchValue($('#switch_recommend'))
            } else if (field == "mostPopular") {
                selectedBusiness.mostPopular = UtilService.changeSwitchValue($('#switch_mostPopular'))
            } else if (field == "closed") {
                selectedBusiness.closed = UtilService.changeSwitchValue($('#switch_closed'))
            }
            this.ifMounted && this.setState({ selectedBusiness })
        }, 100)

    }

    _handlePageSelect(eventKey) {
        this._searchBusinesses(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.ifMounted && this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchBusinesses(this.state.activePage);
    }

    _viewBusiness(business, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/business/profile?businessId=' + business.id);
    }

    _viewSpecs(business, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/business/foodType?businessId=' + business.id);
    }

    _viewFoods(business, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/foods?businessId=' + business.id);
    }

    render() {
        const hiddenPassword = function (self, hidden) {
            if (!hidden) {
                return (
                    <div>
                        <FormGroup>
                            <p>Password</p>
                            <input type="text" id="password" value={self.state.selectedBusiness.password || ''} required="required" onChange={self._changeField.bind(self, 'password')} type="password" placeholder="Password" className="form-control" pattern={CONST.REGEXP_PASSWORD} />
                        </FormGroup>
                        <FormGroup>
                            <p>Confirm Password</p>
                            <input type="text" value={self.state.selectedBusiness.confirmPassword || ''} required="required" data-parsley-equalto="#password" onChange={self._changeField.bind(self, 'confirmPassword')} type="password" placeholder="Confirm Password" className="form-control" />
                        </FormGroup>
                    </div>
                )
            }
        };

        return (
            <ContentWrapper>
                <div className="content-heading">
                    Businesses
                    </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name and business" className="form-control" style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-primary">
                                                Search
                                                </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-primary pull-right" onClick={this._createBusiness}>New Business</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }}>#</th>
                                    <th>Logo</th>
                                    <th>
                                        <SortHeader
                                            label={'Name'}
                                            action={this._sortList.bind(this)}
                                            sortField="name"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Email'}
                                            action={this._sortList.bind(this)}
                                            sortField="email"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Webiste'}
                                            action={this._sortList.bind(this)}
                                            sortField="website"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Verify'}
                                            action={this._sortList.bind(this)}
                                            sortField="verify.isVerified"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Address'}
                                            action={this._sortList.bind(this)}
                                            sortField="geoLocation.address"
                                            sortIndex={4}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">{'Recommend'}</th>
                                    <th className="text-center">{'Most Popular'}</th>
                                    <th className="text-center">{'Closed'}</th>
                                    <th className="text-center" style={{ width: "260px" }}>{'View'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.businessList.items.map((item, i) => {
                                        return (
                                            <tr key={'businessTr' + i} className="tr-hover" onClick={this._editBusiness.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>
                                                    <div className="user-block-picture thumb48 text-center">
                                                        {<img src={UtilService.getProfileFromPath(item.logo)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                    </div>
                                                </td>
                                                <td>{item.name}</td>
                                                <td>{item.email}</td>
                                                <td><a href={item.website}>{item.website}</a></td>
                                                <td>{item.verify && item.verify.isVerified ? <div className="badge p-sm bg-success">Verified</div> : <div className="badge p-sm bg-danger">No</div>}</td>
                                                <td>{item.geoLocation ? item.geoLocation.address : ""}</td>
                                                <td className="text-center">{item.recommend ? <div className="badge p-sm bg-warning">Recommend</div> : ""}</td>
                                                <td className="text-center">{item.mostPopular ? <div className="badge p-sm bg-success">Most Popular</div> : ""}</td>
                                                <td className="text-center">
                                                    {item.closed ? <div className="badge p-sm bg-danger">Manual Closed</div> : ""}
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" className="btn btn-sm btn-warning mr" onClick={this._viewBusiness.bind(this, item)}>
                                                        Profile <em className="fa fa-search"></em>
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-success mr" onClick={this._viewSpecs.bind(this, item)}>
                                                        Specs <em className="fa fa-glass"></em>
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={this._viewFoods.bind(this, item)}>
                                                        Foods <em className="fa fa-cutlery"></em>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.businessList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={11}>
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
                            className={this.state.businessList.total === 0 ? 'hidden' : 'shown'}
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
                            <input type="text" value={this.state.selectedBusiness.name || ''} placeholder="Title" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Email</label>
                            <input type="text" value={this.state.selectedBusiness.email || ''} placeholder="Email" required="required" data-parsley-type="email" onChange={this._changeField.bind(this, 'email')} className="form-control" />
                        </div>
                        {
                            hiddenPassword(this, this.state.editOption)
                        }

                        <div className="form-group  pt pb">
                            <label className="col-sm-4 control-label padding">Is Verify</label>
                            <Col sm={8}>
                                <label className="switch switch">
                                    <input type="checkbox" id="switch_verify" onClick={this._changeSwitch.bind(this, 'isVerify')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>
                        <div className="form-group pt pb">
                            <label className="col-sm-4 control-label padding">Recommend</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_recommend" onClick={this._changeSwitch.bind(this, 'recommend')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>
                        <div className="form-group pt pb">
                            <label className="col-sm-4 control-label padding">Most Popular</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_mostPopular" onClick={this._changeSwitch.bind(this, 'mostPopular')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>
                        <div className="form-group pt pb">
                            <label className="col-sm-4 control-label padding">Closed</label>
                            <Col sm={8}>
                                <label className="switch">
                                    <input type="checkbox" id="switch_closed" onClick={this._changeSwitch.bind(this, 'closed')} />
                                    <em></em>
                                </label>
                            </Col>
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmBusiness}>
                        <i className="fa fa-trash fa-lg"></i>
                    </Button>
                    <Button bsStyle="primary" style={{ position: 'absolute', bottom: '15px', right: '20px', }} onClick={this._closeEditForm}>
                        <i className="fa fa-times fa-lg"></i>
                    </Button>
                </aside>
            </ContentWrapper>
        )
    }
}

Businesses.contextTypes = {
    router: PropTypes.object.isRequired
}
export default Businesses;