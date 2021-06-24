import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import OrderService from '../../API/OrderService';
import * as CONST from '../../Common/constants';
import UtilService from '../../Common/UtilService';
import SortHeader from '../../Control/SortHeader';

class Orders extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            orderList: {
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

            selectedOrder: {},
        }
    }

    componentDidMount() {
        document.title = "Orders";

        this.ifMounted = true
        this._searchOrders(1);
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _searchOrders(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES

        // get users from webservic via api
        OrderService.readOrders(query, (res) => {
            console.log("orders", res);
            this.ifMounted && this.setState({
                orderList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
        });
    }

    _handlePageSelect(eventKey) {
        this._searchOrders(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchOrders(this.state.activePage);
    }

    _viewOrder(order, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/order/details?orderId=' + order.id);
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Order List
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
                                                label={'Number'}
                                                action={this._sortList.bind(this)}
                                                sortField="number"
                                                sortIndex={0}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Customer'}
                                                action={this._sortList.bind(this)}
                                                sortField="user.lastname"
                                                sortIndex={1}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Business'}
                                                action={this._sortList.bind(this)}
                                                sortField="business.name"
                                                sortIndex={2}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Driver'}
                                                action={this._sortList.bind(this)}
                                                sortField="driver.lastname"
                                                sortIndex={3}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            {'Packages'}
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
                                                label={'Delivery location'}
                                                action={this._sortList.bind(this)}
                                                sortField="deliveryLocation.address"
                                                sortIndex={5}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Order Status'}
                                                action={this._sortList.bind(this)}
                                                sortField="orderStatus"
                                                sortIndex={6}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'Trip Status'}
                                                action={this._sortList.bind(this)}
                                                sortField="tripStatus"
                                                sortIndex={7}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">
                                            {'Reason'}
                                        </th>
                                        <th className="text-center">
                                            <SortHeader
                                                label={'CreatedAt'}
                                                action={this._sortList.bind(this)}
                                                sortField="createdAt"
                                                sortIndex={8}
                                                activeIndex={this.state.activeIndex}
                                                setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                            </SortHeader>
                                        </th>
                                        <th className="text-center">{'View'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.orderList.items.map((item, i) => {
                                            return (
                                                <tr key={'orderTr' + i} className="tr-hover">
                                                    <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                    <td>{item.number}</td>
                                                    <td>
                                                        {<img src={UtilService.getUserAvatar(item.user)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />} {item.user ? item.user.lastname : ""}
                                                    </td>
                                                    <td>
                                                        {<img src={UtilService.getProfileFromPath(item.business ? item.business.logo : "")} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />} {item.business ? item.business.name : ""}
                                                    </td>
                                                    <td>
                                                        {item.driver ? <img src={UtilService.getUserAvatar(item.driver)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} /> : ""}{item.driver ? item.driver.lastname : ""}
                                                    </td>
                                                    <td className="text-center">{item.foods.length}</td>
                                                    <td className="text-center">{item.tax + item.price + item.bookingFee}</td>
                                                    <td className="text-center">{item.deliveryLocation.address}</td>
                                                    <td className="text-center">{UtilService.getOrderStatus(item.orderStatus)}</td>
                                                    <td className="text-center">{UtilService.getTripStatus(item.tripStatus)}</td>
                                                    <td>{item.status ? item.status.message : ""} </td>
                                                    <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                    <td className="text-center">
                                                        <button type="button" className="btn btn-sm btn-default" onClick={this._viewOrder.bind(this, item)}>
                                                            <em className="fa fa-search"></em>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                    {(() => {
                                        if (this.state.orderList.total == 0) {
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
                        </div>
                    </Panel>
                    <div className="text-center">
                        <Pagination
                            className={this.state.orderList.total === 0 ? 'hidden' : 'shown'}
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

Orders.contextTypes = {
    router: PropTypes.object.isRequired
}

export default Orders;
