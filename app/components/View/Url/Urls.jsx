import React from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UrlService from '../../API/UrlService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

class Urls extends React.Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            urlsList: {
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

            selectedUrl: {},
            formTitle: "New Url",
            editOption: false
        }

        // reset editForm
        this.editForm = null;

        this._createUrl = this._createUrl.bind(this);
        this._submitForm = this._submitForm.bind(this);
        this._deleteConfirmUrl = this._deleteConfirmUrl.bind(this);
        this._closeEditForm = this._closeEditForm.bind(this);
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();

        this._searchUrls(1);
    }

    componentWillUnmount() {
        this.ifMounted = false;
        $(document.body).removeClass("editsidebar-open");
    }

    _searchUrls(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        UrlService.readUrls(query, (res) => {
            // console.log("urls", res);
            this.ifMounted && this.setState({
                urlsList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _createUrl(e) {
        this.ifMounted && this.setState({
            selectedUrl: {
                name: "",
                url: ""
            },
            editOption: false,
            formTitle: "New Url"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _editUrl(url, e) {
        this.setState({
            selectedUrl: _.clone(url),
            editOption: true,
            formTitle: "Edit Url"
        });

        // reset validation
        this.editForm = $('form#editForm').parsley();
        this.editForm.reset();

        $(document.body).addClass("editsidebar-open");
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();

        if (this.editForm.isValid()) {
            // console.log(this.state.selectedUser, this.state.editOption);
            if (this.state.editOption) {

                UrlService.updateUrl(this.state.selectedUrl, (res) => {
                    // console.log(res);
                    var urlsList = this.state.urlsList;
                    var url = _.find(urlsList.items, (o) => {
                        return o.id == res.id;
                    });

                    _.extend(url, res);

                    // update state
                    this.ifMounted && this.setState({
                        urlsList: urlsList,
                    });

                    $.notify("Url is updated successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                })

            } else {

                UrlService.createUrl(this.state.selectedUrl, (res) => {
                    // console.log("create:", res);
                    this._searchUrls(this.state.activePage);

                    // show notifiy
                    $.notify("Url is created successfully.", "success");
                    $(document.body).removeClass("editsidebar-open");
                }, (err) => {
                    // console.log(err.message);
                    $.notify(err.message, "danger");
                });
            }
        } else {
            // console.log("Invalid user data");
            $.notify("Input data is invalid user data", "warning");
        }
    }

    _deleteConfirmUrl(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this url!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function () {
            $this._deleteUrl();
        });
    }

    _deleteUrl(e) {
        UrlService.deleteUrl(this.state.selectedUrl.id, (res) => {
            this._searchUrls(this.state.activePage);

            $(document.body).removeClass("editsidebar-open");
            $.notify("Url is deleted correctly.", "success");
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

        var selectedUrl = this.state.selectedUrl;
        selectedUrl[field] = e.target.value;

        this.setState({
            selectedUrl: selectedUrl
        });
    }

    _handlePageSelect(eventKey) {
        this._searchUrls(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchUrls(this.state.activePage);
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Urls
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name and url" className="form-control" style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-primary">
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-primary pull-right" onClick={this._createUrl}>New Url</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }}>#</th>
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
                                            label={'Url'}
                                            action={this._sortList.bind(this)}
                                            sortField="url"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Created at'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={2}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Update at'}
                                            action={this._sortList.bind(this)}
                                            sortField="updateAt"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.urlsList.items.map((item, i) => {
                                        return (
                                            <tr key={'urlTr' + i} className="tr-hover" onClick={this._editUrl.bind(this, item)}>
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.url}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.urlsList.total == 0) {
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
                            className={this.state.urlsList.total === 0 ? 'hidden' : 'shown'}
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
                            <label className="control-label">Name</label>
                            <input type="text" value={this.state.selectedUrl.name || ''} placeholder="Name" required="required" onChange={this._changeField.bind(this, 'name')} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="control-label">Url</label>
                            <input type="text" value={this.state.selectedUrl.url || ''} placeholder="Url" required="required" onChange={this._changeField.bind(this, 'url')} className="form-control" />
                        </div>
                    </form>

                    <Button bsStyle="success" style={{ position: 'absolute', bottom: '15px', left: '20px' }} onClick={this._submitForm}>
                        <i className="fa fa-check fa-lg"></i>
                    </Button>
                    <Button bsStyle="danger" style={{ position: 'absolute', bottom: '15px', left: '90px', display: this.state.editOption ? 'block' : 'none' }} onClick={this._deleteConfirmUrl}>
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

export default Urls;