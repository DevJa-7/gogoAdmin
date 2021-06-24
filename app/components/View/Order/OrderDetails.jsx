import React from 'react';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { browserHistory } from 'react-router'

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import OrderService from '../../API/OrderService';
import * as CONST from '../../Common/constants';
import UtilService from '../../Common/UtilService';
import initGmap from '../../Common/maps-google'
import SortHeader from '../../Control/SortHeader';

class OrderDetails extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            order: {
                user: {},
                business: {},
                driver: {},
                deliveryLocation: {},
                statusAt: {},
                foods: [],
            },
        }
    }

    componentDidMount() {
        this.ifMounted = true
        document.title = "OrderDetails";

        let orderId = this.props.location.query.orderId
        this._searchOrder(orderId)

        // Google Maps
        $('[data-gmap]').each(initGmap);
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _searchOrder(orderId) {
        OrderService.readOrder(orderId, (res) => {
            console.log("order", res)
            this.ifMounted && this.setState((old) => {
                old.order = res
            })
        }, (err) => {
            $.notify(err.message, "danger");
        })
    }

    _backPage(e) {
        if (e)
            e.preventDefault();
        browserHistory.goBack();
    }

    render() {
        let order = this.state.order

        const orderShow = (order) => {
            return

        }

        return (
            <ContentWrapper>
                <div className="content-heading">
                    <button type="button" className="btn btn-link pull-left" onClick={this._backPage.bind(this)}>
                        <em className="fa icon-arrow-left"></em>
                    </button>
                    Order Details: #{order.number}
                </div>
                <div className="p-lg">
                    <Row>
                        <Col lg={9}>
                            <ul className="timeline">
                                <li data-datetime={UtilService.getDateTimeByFormat(order.createdAt, "MM/DD HH:mm")} className="timeline-separator"></li>
                                { /* START timeline item */}
                                <li>
                                    <div className="timeline-badge primary">
                                        <em className="fa fa-comment"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover left">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-xs">
                                                        <img src={UtilService.getUserAvatar(order.user)} alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>{UtilService.getFullname(order.user)}</strong> requested order at {UtilService.getDateTimeByFormat(order.createdAt, "MM/DD hh:mm a")}</p>
                                                        <em>&mdash; {order.deliveryLocation.address}</em>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* START timeline item */}
                                {(() => {
                                    switch (order.orderStatus) {
                                        case "OrderDecline":
                                        case "OrderAccepted":
                                        case "OrderCancelled":
                                        case "OrderPrepared":
                                        case "OrderReady":
                                            return <li className="timeline-inverted">
                                                <div className="timeline-badge green">
                                                    <em className="fa fa-coffee"></em>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="popover right">
                                                        <div className="arrow"></div>
                                                        <div className="popover-content">
                                                            <div className="table-grid table-grid-align-middle mb">
                                                                <div className="col col-xs">
                                                                    <img src={UtilService.getProfileFromPath(order.business ? order.business.logo : "")} alt="Image" className="media-object img-circle thumb48" />
                                                                </div>
                                                                <div className="col">
                                                                    {(() => {
                                                                        switch (order.orderStatus) {
                                                                            case "OrderDecline":
                                                                                return <p className="m0"> <strong>{order.business.name}</strong> declined the order at {UtilService.getDateTimeByFormat(order.statusAt.OrderDeclined, "MM/DD hh:mm a")}</p>;
                                                                            case "OrderAccepted":
                                                                            case "OrderCancelled":
                                                                                return <p className="m0"> <strong>{order.business.name}</strong> accepted the order at {UtilService.getDateTimeByFormat(order.statusAt.OrderAccepted, "MM/DD hh:mm a")}</p>;
                                                                            case "OrderPrepared":
                                                                            case "OrderReady":
                                                                                return <div>
                                                                                    <p className="m0"> <strong>{order.business.name}</strong> accepted the order at {UtilService.getDateTimeByFormat(order.statusAt.OrderAccepted, "MM/DD hh:mm a")}</p>
                                                                                    <p className="m0"> After soon they prepared the order at {UtilService.getDateTimeByFormat(order.statusAt.OrderPrepared, "MM/DD hh:mm a")}</p>
                                                                                </div>
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                    }
                                })()}
                                {(() => {
                                    if (order.orderStatus == "OrderCancelled") {
                                        return <li>
                                            <div className="timeline-badge info">
                                                <em className="fa fa-ban"></em>
                                            </div>
                                            <div className="timeline-panel">
                                                <div className="popover left">
                                                    <div className="arrow"></div>
                                                    <div className="popover-content">
                                                        <div className="table-grid table-grid-align-middle mb">
                                                            <div className="col col-xs">
                                                                <img src={UtilService.getUserAvatar(order.user)} alt="Image" className="media-object img-circle thumb48" />
                                                            </div>
                                                            <div className="col">
                                                                <p className="m0">
                                                                    <strong>{UtilService.getFullname(order.user)}</strong> cancelled order at {UtilService.getDateTimeByFormat(order.statusAt.OrderCancelled, "MM/DD hh:mm a")}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    }
                                })()}
                                {(() => {
                                    switch (order.tripStatus) {
                                        case "TripRequest":
                                        case "TripAccepted":
                                        case "TripDeclined":
                                        case "TripCancelled":
                                        case "TripConfirmed":
                                        case "TripStarted":
                                        case "TripArrived":
                                        case "TripDropped":
                                        case "TripCompleted":
                                            return <li className="timeline-inverted mt0">
                                                <div className="timeline-badge warning">
                                                    <em className="fa fa-taxi"></em>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="popover right">
                                                        <div className="arrow"></div>
                                                        <div className="popover-content">
                                                            <div className="table-grid table-grid-align-middle mb">
                                                                <div className="col col-xs">
                                                                    <img src="img/ic_car.png" alt="Image" className="thumb-height48 img-fit" />
                                                                </div>
                                                                <div className="col">
                                                                    <p className="m0">
                                                                        <strong>{order.business.name}</strong> requested trip at {UtilService.getDateTimeByFormat(order.statusAt.TripRequest, "MM/DD hh:mm a")}</p>
                                                                    <em>&mdash; {"to " + UtilService.getFullname(order.driver)}</em>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                    }
                                })()}
                                { /* END timeline item */}
                                { /* START timeline item */}
                                {(() => {
                                    switch (order.tripStatus) {
                                        case "TripAccepted":
                                        case "TripDeclined":
                                        case "TripCancelled":
                                        case "TripConfirmed":
                                        case "TripStarted":
                                        case "TripArrived":
                                        case "TripDropped":
                                        case "TripCompleted":
                                            return <li style={{ marginTop: '50px' }}>
                                                <div className="timeline-badge purple">
                                                    <em className="fa fa-map-marker"></em>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="popover left">
                                                        <div className="arrow"></div>
                                                        <div className="popover-content">
                                                            <div className="table-grid table-grid-align-middle mb">
                                                                <div className="col col-xs">
                                                                    <img src={UtilService.getUserAvatar(order.driver)} alt="Image" className="media-object img-circle thumb48" />
                                                                </div>
                                                                <div className="col">
                                                                    {(() => {
                                                                        switch (order.tripStatus) {
                                                                            case "TripAccepted":
                                                                            case "TripConfirmed":
                                                                            case "TripStarted":
                                                                            case "TripArrived":
                                                                            case "TripDropped":
                                                                            case "TripCompleted":
                                                                                return <p className="m0"><strong>{UtilService.getFullname(order.driver)}</strong> accepted order at {UtilService.getDateTimeByFormat(order.statusAt.TripAccepted, "MM/DD hh:mm a")}</p>
                                                                            case "TripDeclined":
                                                                                return <div>
                                                                                    <p className="m0"><strong>{UtilService.getFullname(order.driver)}</strong> declined order at {UtilService.getDateTimeByFormat(order.statusAt.TripDeclined, "MM/DD hh:mm a")}</p>
                                                                                    <em>&mdash; {order.reason ? order.reason.message : ""}</em>
                                                                                </div>
                                                                            case "TripCancelled":
                                                                                return <div>
                                                                                    <p className="m0"><strong>{UtilService.getFullname(order.driver)}</strong> accepted order at {UtilService.getDateTimeByFormat(order.statusAt.TripAccepted, "MM/DD hh:mm a")}</p>
                                                                                    <p className="m0">Next he/she cancelled order at {UtilService.getDateTimeByFormat(order.statusAt.TripCancelled, "MM/DD hh:mm a")}</p>
                                                                                    <em>&mdash; {order.reason ? order.reason.message : ""}</em>
                                                                                </div>
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                    }
                                })()}
                                { /* END timeline item */}
                                { /* START timeline separator */}
                                {(() => {
                                    switch (order.tripStatus) {
                                        case "TripConfirmed":
                                        case "TripStarted":
                                        case "TripArrived":
                                        case "TripDropped":
                                        case "TripCompleted":
                                            return <li data-datetime={UtilService.getDateTimeByFormat(order.statusAt.TripConfirmed, "MM/DD HH:mm")} className="timeline-separator"></li>
                                    }
                                })()}
                                { /* END timeline separator */}
                                { /* START timeline item */}
                                {(() => {
                                    switch (order.tripStatus) {
                                        case "TripConfirmed":
                                        case "TripStarted":
                                        case "TripArrived":
                                        case "TripDropped":
                                        case "TripCompleted":
                                            return <li>
                                                <div className="timeline-badge primary">
                                                    <em className="fa fa-ticket"></em>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="popover left">
                                                        <div className="arrow"></div>
                                                        <div className="popover-content">
                                                            <div className="table-grid table-grid-align-middle mb">
                                                                <div className="col col-sm">
                                                                    <img src="img/ic_car.png" alt="Image" className="thumb-height48 img-fit" />
                                                                </div>
                                                                <div className="col">
                                                                    {(() => {
                                                                        switch (order.tripStatus) {
                                                                            case "TripConfirmed":
                                                                                return <p className="m0">The trip is confirmed at {UtilService.getDateTimeByFormat(order.statusAt.TripConfirmed, "MM/DD hh:mm a")}</p>
                                                                            case "TripStarted":
                                                                            case "TripArrived":
                                                                            case "TripDropped":
                                                                            case "TripCompleted":
                                                                                return <div>
                                                                                    <p className="m0">The trip is confirmed at {UtilService.getDateTimeByFormat(order.statusAt.TripConfirmed, "MM/DD hh:mm a")}</p>
                                                                                    <p className="m0">The trip is started at {UtilService.getDateTimeByFormat(order.statusAt.TripStarted, "MM/DD hh:mm a")} </p>
                                                                                    {order.pickupScore == 1 ? <em className="fa fa-thumbs-up fa-lg text-warning pull-right"></em> : ""}
                                                                                    {order.pickupScore == -1 ? <em className="fa fa-thumbs-down fa-lg text-warning pull-right"></em> : ""}
                                                                                </div>
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                    }
                                })()}
                                { /* END timeline item */}
                                { /* START timeline item */}
                                {(() => {
                                    switch (order.tripStatus) {
                                        case "TripArrived":
                                        case "TripDropped":
                                        case "TripCompleted":
                                            return <li>
                                                <div className="timeline-badge pink">
                                                    <em className="fa fa-ticket"></em>
                                                </div>
                                                <div className="timeline-panel">
                                                    <div className="popover left">
                                                        <div className="arrow"></div>
                                                        <div className="popover-content">
                                                            <div className="table-grid table-grid-align-middle mb">
                                                                <div className="col col-sm">
                                                                    <img src={UtilService.getUserAvatar(order.user)} alt="Image" className="media-object img-circle thumb48 pull-left mr" />
                                                                    <img src={UtilService.getUserAvatar(order.driver)} alt="Image" className="media-object img-circle thumb48 pull-left" />
                                                                </div>
                                                                <div className="col">
                                                                    {(() => {
                                                                        switch (order.tripStatus) {
                                                                            case "TripConfirmed":
                                                                                return <p className="m0">Driver arrived to delivery location at {UtilService.getDateTimeByFormat(order.statusAt.TripArrived, "MM/DD hh:mm a")}</p>
                                                                            case "TripDropped":
                                                                            case "TripCompleted":
                                                                                return <div>
                                                                                    <p className="m0">Driver arrived to delivery location at {UtilService.getDateTimeByFormat(order.statusAt.TripArrived, "MM/DD hh:mm a")}</p>
                                                                                    <p className="m0">Driver droped the packages at {UtilService.getDateTimeByFormat(order.statusAt.TripDropped, "MM/DD hh:mm a")}</p>
                                                                                    <em>&mdash; {order.recipient}</em>
                                                                                </div>
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                    }
                                })()}
                                { /* END timeline item */}

                                { /* START timeline item */}
                                {(() => {
                                    if (order.orderStatus == "OrderCompleted") {
                                        return <li className="timeline-inverted">
                                            <div className="timeline-badge success">
                                                <em className="fa fa-tag"></em>
                                            </div>
                                            <div className="timeline-panel">
                                                <div className="popover right">
                                                    <div className="arrow"></div>
                                                    <div className="popover-content">
                                                        <div className="table-grid table-grid-align-middle mb">
                                                            <div className="col col-xs">
                                                                <img src={UtilService.getProfileFromPath(order.business ? order.business.logo : "")} alt="Image" className="media-object img-circle thumb48" />
                                                            </div>
                                                            <div className="col">
                                                                <p className="m0">
                                                                    <strong>Business</strong> completed the order at {UtilService.getDateTimeByFormat(order.statusAt.OrderCompleted, "MM/DD hh:mm a")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    }
                                })()}
                                { /* END timeline item */}
                                { /* START timeline item */}
                                {(() => {
                                    if (order.tripStatus == "TripCompleted") {
                                        return <li>
                                            <div className="timeline-badge warning">
                                                <em className="fa fa-ticket"></em>
                                            </div>
                                            <div className="timeline-panel">
                                                <div className="popover left">
                                                    <div className="arrow"></div>
                                                    <div className="popover-content">
                                                        <div className="table-grid table-grid-align-middle mb">
                                                            <div className="col col-xs">
                                                                <img src={UtilService.getUserAvatar(order.driver)} alt="Image" className="media-object img-circle thumb48" />
                                                            </div>
                                                            <div className="col">
                                                                <p className="m0">
                                                                    <strong>{UtilService.getFullname(order.driver)}</strong> completed the trip at {UtilService.getDateTimeByFormat(order.statusAt.TripCompleted, "MM/DD hh:mm a")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    }
                                })()}
                                { /* START timeline item */}
                                <li className="timeline-end">
                                    <a className="timeline-badge">
                                        End
                                    </a>
                                </li>
                                { /* END timeline item */}
                            </ul>
                        </Col>
                        <Col lg={3}>
                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body bg-warning">
                                    <div className="row row-table">
                                        <div className="col-xs-4 text-center">
                                            <img src={UtilService.getUserAvatar(order.user)} alt="Image" className="img-circle thumb64" />
                                        </div>
                                        <div className="col-xs-8">
                                            <h4 className="mt0">{UtilService.getFullname(order.user)}</h4>
                                            <ul className="list-unstyled">
                                                <li className="mb-sm">
                                                    <em className="fa fa-envelope fa-fw"></em>{order.user.email}</li>
                                                <li className="mb-sm">
                                                    <em className="fa fa-phone fa-fw"></em>{UtilService.getPhoneNumber(order.user.phoneCode, order.user.phone)}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body bg-green-dark">
                                    <div className="row row-table">
                                        <div className="col-xs-4 text-center">
                                            <img src={UtilService.getProfileFromPath(order.business.logo)} alt="Image" className="img-circle thumb64" />
                                        </div>
                                        <div className="col-xs-8">
                                            <h4 className="mt0">{order.business.name}</h4>
                                            <ul className="list-unstyled">
                                                <li className="mb-sm">
                                                    <em className="fa fa-envelope fa-fw"></em>{order.business.email}</li>
                                                <li className="mb-sm">
                                                    <em className="fa fa-phone fa-fw"></em>{UtilService.getPhoneNumber(order.business.phoneCode, order.business.phone)}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body ">
                                    <fieldset className="mb0">
                                        {
                                            order.foods.map((item, i) => {
                                                return (
                                                    <div key={"food" + i} className="clearfix">
                                                        <p className="pull-left">{item.food.food.name}</p>
                                                        <p className="pull-right mr">{item.count} ✕ {item.food.price} = {item.price}</p>
                                                    </div>
                                                );
                                            })
                                        }
                                        <div className="clearfix">
                                            <p className="pull-left">{"Tax"}</p>
                                            <p className="pull-right mr">{order.tax}</p>
                                        </div>
                                        <div className="clearfix">
                                            <p className="pull-left">{"Booking Fee"}</p>
                                            <p className="pull-right mr">{order.bookingFee}</p>
                                        </div>
                                    </fieldset>
                                    <div className="clearfix">
                                        <p className="pull-left h3">TOTAL</p>
                                        <p className="pull-right mr h3">{order.price}</p>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body bg-primary">
                                    <div className="row row-table">
                                        <div className="col-xs-4 text-center">
                                            <img src={UtilService.getUserAvatar(order.driver)} alt="Image" className="img-circle thumb64" />
                                        </div>
                                        <div className="col-xs-8">
                                            <h4 className="mt0">{UtilService.getFullname(order.driver)}</h4>
                                            <ul className="list-unstyled">
                                                <li className="mb-sm">
                                                    <em className="fa fa-envelope fa-fw"></em>{order.driver.email}</li>
                                                <li className="mb-sm">
                                                    <em className="fa fa-phone fa-fw"></em>{UtilService.getPhoneNumber(order.driver.phoneCode, order.driver.phone)}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel-body bg-inverse">
                                    <div className="row row-table text-center">
                                        <div className="col-xs-4">
                                            <p className="m0 h3">700</p>
                                            <p className="m0 text-muted">Reviews</p>
                                        </div>
                                        <div className="col-xs-4">
                                            <p className="m0 h3">1500</p>
                                            <p className="m0 text-muted">Orders</p>
                                        </div>
                                        <div className="col-xs-4">
                                            <p className="m0 h3">510</p>
                                            <p className="m0 text-muted">Rating</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                        </Col>
                    </Row>
                </div>
            </ContentWrapper>
        )
    }
}

export default OrderDetails;