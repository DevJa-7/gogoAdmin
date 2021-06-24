import React from 'react';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { browserHistory } from 'react-router'

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import TripService from '../../API/TripService';
import * as CONST from '../../Common/constants';
import UtilService from '../../Common/UtilService';
import initGmap from '../../Common/maps-google'
import SortHeader from '../../Control/SortHeader';

class TripDetails extends React.Component {
    constructor(props, context) {
        super(props, context);
    }


    componentDidMount() {
        this.ifMounted = true
        document.title = "TripDetails - gogo";

        // Google Maps
        $('[data-gmap]').each(initGmap);
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _backPage(e) {
        if (e)
            e.preventDefault();
        browserHistory.goBack();
    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    <button type="button" className="btn btn-link pull-left" onClick={this._backPage.bind(this)}>
                        <em className="fa icon-arrow-left"></em>
                    </button>
                    Trip Details
                </div>
                <div className="p-lg">
                    <Row>
                        <Col lg={9}>
                            { /* START timeline */}
                            <ul className="timeline">
                                <li data-datetime="06/01 12:08" className="timeline-separator"></li>
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
                                                        <img src="img/user/05.jpg" alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>Xiang Tian</strong> requested trip at 04:09 AM</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                { /* START timeline item */}
                                <li className="timeline-inverted">
                                    <div className="timeline-badge green">
                                        <em className="fa fa-taxi"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover right">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-xs">
                                                        <img src="img/user/04.jpg" alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>Anderson</strong> accepted the trip at 04:10 AM</p>
                                                    </div>
                                                </div>
                                                <div data-gmap="" data-address="Shenzhen, Guangdong, China" data-maptype="ROADMAP" data-styled="data-styled" className="gmap"></div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* START timeline item */}
                                <li>
                                    <div className="timeline-badge info">
                                        <em className="fa fa-map-marker"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover left">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-xs">
                                                        <img src="img/user/04.jpg" alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>Anderson </strong>
                                                            arrived pickup location at 04:15AM</p>
                                                        <em>&mdash; address</em>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                { /* START timeline item */}
                                <li>
                                    <div className="timeline-badge purple">
                                        <em className="fa fa-map-marker"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover left">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-sm">
                                                        <img src="img/user/05.jpg" alt="Image" className="media-object img-circle thumb48 pull-left" style={{ marginRight: '10px' }} />
                                                        <img src="img/user/04.jpg" alt="Image" className="media-object img-circle thumb48 pull-left" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            The trip is started at 04:50 AM
                                                            </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                { /* START timeline separator */}
                                <li data-datetime="06/01 17:08" className="timeline-separator"></li>
                                { /* END timeline separator */}
                                { /* START timeline item */}
                                <li>
                                    <div className="timeline-badge success">
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
                                                        <p className="m0">
                                                            The trip is dropped at 04:50 AM.
                                                        </p>
                                                        <p className="m0">
                                                            <em>&mdash; address</em>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                <li className="timeline-inverted">
                                    <div className="timeline-badge warning">
                                        <em className="fa fa-ticket"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover right">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-xs">
                                                        <img src="img/user/05.jpg" alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>Xiang Tian </strong> submited the trip at 05:30 AM
                                                        </p>
                                                        <p className="m0">
                                                            <em>&mdash; comment</em>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                { /* START timeline item */}
                                <li>
                                    <div className="timeline-badge danger">
                                        <em className="fa fa-ticket"></em>
                                    </div>
                                    <div className="timeline-panel">
                                        <div className="popover left">
                                            <div className="arrow"></div>
                                            <div className="popover-content">
                                                <div className="table-grid table-grid-align-middle mb">
                                                    <div className="col col-xs">
                                                        <img src="img/user/04.jpg" alt="Image" className="media-object img-circle thumb48" />
                                                    </div>
                                                    <div className="col">
                                                        <p className="m0">
                                                            <strong>Anderson</strong> submited the trip at 05:30 AM
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                { /* END timeline item */}
                                { /* START timeline item */}
                                <li className="timeline-end">
                                    <a href="#" className="timeline-badge">
                                        End
                                    </a>
                                </li>
                                { /* END timeline item */}
                            </ul>
                            { /* END timeline */}
                        </Col>
                        <Col lg={3}>
                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body bg-warning">
                                    <div className="row row-table">
                                        <div className="col-xs-4 text-center">
                                            <img src="img/user/05.jpg" alt="Image" className="img-circle thumb64" />
                                        </div>
                                        <div className="col-xs-8">
                                            <h4 className="mt0">Xiang Tian</h4>
                                            <ul className="list-unstyled">
                                                <li className="mb-sm">
                                                    <em className="fa fa-envelope fa-fw"></em> asdasd@mail.com</li>
                                                <li className="mb-sm">
                                                    <em className="fa fa-phone fa-fw"></em>+56 123456</li>
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
                                            <p className="m0 text-muted">Trips</p>
                                        </div>
                                        <div className="col-xs-4">
                                            <p className="m0 h3">510</p>
                                            <p className="m0 text-muted">Rating</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body ">
                                    <fieldset className="mb0">
                                        <div className="clearfix">
                                            <p className="pull-left">Base fare</p>
                                            <p className="pull-right mr">$ 10300</p>
                                        </div>
                                        <div className="clearfix">
                                            <p className="pull-left">91 km</p>
                                            <p className="pull-right mr">$ 2700</p>
                                        </div>
                                        <div className="clearfix">
                                            <p className="pull-left">10 mins</p>
                                            <p className="pull-right mr">$ 10300</p>
                                        </div>
                                        <div className="clearfix">
                                            <p className="pull-left">Tax fare</p>
                                            <p className="pull-right mr">$ 2700</p>
                                        </div>
                                    </fieldset>
                                    <div className="clearfix">
                                        <p className="pull-left h3">GRAND TOTAL</p>
                                        <p className="pull-right mr h3">$ 13000</p>
                                    </div>
                                </div>
                            </div>
                            {/* END widget */}

                            {/* START widget */}
                            <div className="panel widget">
                                <div className="panel-body bg-primary">
                                    <div className="row row-table">
                                        <div className="col-xs-4 text-center">
                                            <img src="img/user/04.jpg" alt="Image" className="img-circle thumb64" />
                                        </div>
                                        <div className="col-xs-8">
                                            <h4 className="mt0">Anderson</h4>
                                            <ul className="list-unstyled">
                                                <li className="mb-sm">
                                                    <em className="fa fa-envelope fa-fw"></em> asdasd@mail.com</li>
                                                <li className="mb-sm">
                                                    <em className="fa fa-phone fa-fw"></em>+56 123456</li>
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
                                            <p className="m0 text-muted">Trips</p>
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

export default TripDetails;