import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import TripService from '../../API/TripService';
import * as CONST from '../../Common/constants';
import UtilService from '../../Common/UtilService';
import SortHeader from '../../Control/SortHeader';

class Trips extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            tripList: {
                total: 0,
                trips: []
            },
            // for pagination
            numOfPages: 1,
            activePage: 1,

            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,

            selectedTrip: {},
        }
    }

    componentDidMount() {
        document.title = "Trips - gogo";

        this.ifMounted = true
        this._searchTrips(1);
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _searchTrips(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from webservic via api
        TripService.readTrips(query, (res) => {
            console.log("trips", res);
            this.ifMounted && this.setState({
                tripList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _handlePageSelect(eventKey) {
        this._searchTrips(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchTrips(this.state.activePage);
    }

    _viewTrip(trip, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/trip/details');
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Trip List
                </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search user, driver" className="form-control" style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-search">
                                                Search
                                    </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                        </Row>
                        <div className="table-responsive">
                            <Table id="datatable1" responsive striped hover className="b0">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>
                                            <SortHeader
                                                label={'User'}
                                                action={this._sortList.bind(this)}
                                                sortField="user.user_name"
                                                sortIndex={0}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Driver'}
                                                action={this._sortList.bind(this)}
                                                sortField="driver.user_name"
                                                sortIndex={1}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Vehicle'}
                                                action={this._sortList.bind(this)}
                                                sortField="vehicle.title"
                                                sortIndex={2}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Distance (m)'}
                                                action={this._sortList.bind(this)}
                                                sortField="distance"
                                                sortIndex={3}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Price ($)'}
                                                action={this._sortList.bind(this)}
                                                sortField="price"
                                                sortIndex={4}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Payment Mode'}
                                                action={this._sortList.bind(this)}
                                                sortField="payment.brand"
                                                sortIndex={5}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Status'}
                                                action={this._sortList.bind(this)}
                                                sortField="status"
                                                sortIndex={6}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'UpdatedAt'}
                                                action={this._sortList.bind(this)}
                                                sortField="updatedAt"
                                                sortIndex={7}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">{'View'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.tripList.trips.map((item, i) => {
                                            return (
                                                <tr key={'tripTr' + i} className="tr-hover">
                                                    <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                    <td>
                                                        {<img src={UtilService.getProfileFromPath(item.user.image)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />} {item.user.user_name}
                                                    </td>
                                                    <td>
                                                        {<img src={UtilService.getProfileFromPath(item.driver.image)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />} {item.driver.user_name}
                                                    </td>
                                                    <td>
                                                        {<img src={UtilService.getImageFromPath(item.vehicle.map_icon)} className="img-thumbnail thumb48 img-contain img-circle" style={{ backgroundColor: 'white' }} />} {item.vehicle.title}
                                                    </td>
                                                    <td className="text-center">{item.distance}</td>
                                                    <td className="text-center">{item.price}</td>
                                                    <td className="text-center">{UtilService.getCardBrand(item.payment.brand)}</td>
                                                    <td className="text-center">{UtilService.getTripStatus(item.status)}</td>
                                                    <td>{UtilService.getDateTime(item.updatedAt)}</td>
                                                    <td className="text-center">
                                                        <button type="button" className="btn btn-sm btn-default" onClick={this._viewTrip.bind(this, item)}>
                                                            <em className="fa fa-search"></em>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                    {(() => {
                                        if (this.state.tripList.total == 0) {
                                            return (
                                                <tr>
                                                    <td colSpan={9}>
                                                        <p className="text-center">There is no any data.</p>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    })()}
                                </tbody>
                            </Table>
                        </div>
                    </Panel>
                    <div className="text-center">
                        <Pagination
                            className={this.state.tripList.total === 0 ? 'hidden' : 'shown'}
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
            </ContentWrapper>
        )
    }
}

Trips.contextTypes = {
    router: PropTypes.object.isRequired
}

export default Trips;
