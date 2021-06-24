import React from 'react';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import { Grid, Row, Col, Dropdown, MenuItem, Tooltip, OverlayTrigger, Panel, Button } from 'react-bootstrap';

import ContentWrapper from '../../Layout/ContentWrapper';
import DashboardRun from './DashboardV2.run';
import initSlimScroll from '../../Common/slimscroll'
import UtilService from '../../Common/UtilService'
import DashboardService from '../../API/DashboardService'

class DashboardV2 extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            general: {
                "admins": 0,
                "adminAvaliables": 0,
                "users": 0,
                "userAvailables": 0,
                "drivers": 0,
                "driverAvailables": 0,
                "businesses": 0,
                "businessAvailables": 0,
            },
            approvedList: [],
            problemList: []
        };

        this._goAdmins = this._goAdmins.bind(this);
        this._goUsers = this._goUsers.bind(this);
        this._goDrivers = this._goDrivers.bind(this);
        this._goBusinesses = this._goBusinesses.bind(this);
        this._goTransactions = this._goTransactions.bind(this);
    }

    componentDidMount() {
        document.title = "Dashboard";
        this.ifMounted = true

        this._initVisitorsChart();
        this._initTripsChart();
        this._searchGeneral();
        this._searchApproved();
        this._searchProblems();

        $('[data-scrollable]').each(initSlimScroll);
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _initVisitorsChart() {
        var chartNode = this.refs.visitors_chart;
        var data = [{
            "label": "Visitors",
            "color": "#9cd159",
            "data": [
                ["Jan", 27],
                ["Feb", 82],
                ["Mar", 56],
                ["Apr", 14],
                ["May", 28],
                ["Jun", 77],
                ["Jul", 23],
                ["Aug", 49],
                ["Sep", 81],
                ["Oct", 20],
                ["Nov", 120],
                ["Dec", 60]
            ],
        }];

        var options = {
            series: {
                bars: {
                    align: 'center',
                    lineWidth: 0,
                    show: true,
                    barWidth: 0.6,
                    fill: 0.9
                }
            },
            grid: {
                borderColor: '#eee',
                borderWidth: 1,
                hoverable: true,
                backgroundColor: '#fcfcfc'
            },
            tooltip: true,
            tooltipOpts: {
                content: function (label, x, y) {
                    return x + ' : ' + y;
                }
            },
            xaxis: {
                tickColor: '#fcfcfc',
                mode: 'categories'
            },
            yaxis: {
                // position: 'right' or 'left'
                tickColor: '#eee'
            },
            shadowSize: 0
        };

        if (chartNode) {
            $(chartNode).height($(chartNode).data('height') || 222);
            $.plot(chartNode, data, options);
        }
    }

    _initTripsChart() {
        var chartNode = this.refs.trips_chart;
        var data = [{
            "label": "Completed",
            "color": "#1f92fe",
            "data": [
                ["Jan", 70],
                ["Feb", 40],
                ["Mar", 70],
                ["Apr", 85],
                ["May", 59],
                ["Jun", 93],
                ["Jul", 66],
                ["Aug", 86],
                ["Sep", 60],
                ["Oct", 44],
                ["Nov", 55],
                ["Dec", 60]
            ]
        }, {
            "label": "Cancelled",
            "color": "#f0693a",
            "data": [
                ["Jan", 10],
                ["Feb", 18],
                ["Mar", 21],
                ["Apr", 12],
                ["May", 27],
                ["Jun", 24],
                ["Jul", 16],
                ["Aug", 39],
                ["Sep", 15],
                ["Oct", 14],
                ["Nov", 23],
                ["Dec", 15],
            ]
        }];

        var options = {
            series: {
                lines: {
                    show: false
                },
                points: {
                    show: true,
                    radius: 4
                },
                splines: {
                    show: true,
                    tension: 0.4,
                    lineWidth: 1,
                    fill: 0.5
                }
            },
            grid: {
                borderColor: '#eee',
                borderWidth: 1,
                hoverable: true,
                backgroundColor: '#fcfcfc'
            },
            tooltip: true,
            tooltipOpts: {
                content: function (label, x, y) {
                    return x + ' : ' + y;
                }
            },
            xaxis: {
                tickColor: '#fcfcfc',
                mode: 'categories'
            },
            yaxis: {
                min: 0,
                max: 150, // optional: use it for a clear represetation
                tickColor: '#eee',
                //position: 'right' or 'left',
                tickFormatter: function (v) {
                    return v /* + ' visitors'*/;
                }
            },
            shadowSize: 0
        };

        if (chartNode) {
            $(chartNode).height($(chartNode).data('height') || 222);
            $.plot(chartNode, data, options);
        }
    }

    _goAdmins(e) {
        e.preventDefault();

        this.context.router.push('/admins');
    }

    _goUsers(e) {
        e.preventDefault();

        this.context.router.push('/users');
    }

    _goDrivers(e) {
        e.preventDefault();

        this.context.router.push('/drivers');
    }

    _goBusinesses(e) {
        e.preventDefault();

        this.context.router.push('/businesses');
    }

    _goTransactions(e) {
        e.preventDefault();
    }

    _searchGeneral(e) {
        if (e)
            e.preventDefault();

        DashboardService.readGeneral((res) => {
            console.log(res)
            this.ifMounted && this.setState({
                general: res
            })
        }, (err) => {
            console.log(err)
        });
    }

    _searchApproved(e) {
        if (e)
            e.preventDefault();

        DashboardService.readApproved((res) => {
            this.ifMounted && this.setState({
                approvedList: res
            })
        }, (err) => {
            console.log(err)
        });
    }

    _searchProblems(e) {
        if (e)
            e.preventDefault();

        DashboardService.readProblems((res) => {
            this.ifMounted && this.setState({
                problemList: res
            })
        }, (err) => {
            console.log(err)
        });
    }

    _viewFood(food, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/foodDetail?foodId=' + food.id + '&businessId=' + food.business.id);
    }

    render() {
        const tooltip = function (text) {
            return (
                <Tooltip id="tooltip">{text}</Tooltip>
            );
        };

        return (
            <ContentWrapper>
                <div className="content-heading">
                    { /* START Language list */}
                    <div className="pull-right">
                        <Dropdown id="dropdown-tr" pullRight>
                            <Dropdown.Toggle>
                                English
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="animated fadeInUpShort">
                                <MenuItem eventKey="1" data-set-lang="en">English</MenuItem>
                                <MenuItem eventKey="2" data-set-lang="es">Spanish</MenuItem>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                    { /* END Language list */}
                    Dashboard
                    { /* <small data-localize="dashboard.WELCOME">Welcome to gogo!</small> */}
                </div>
                {/* START widgets box */}
                <Row>
                    <Col lg={3} sm={6}>
                        <div className="panel swidget bg-warning">
                            <div className="row-table">
                                <Col xs={4} className="text-center bg-warning-dark pv-lg">
                                    <em className="fa fa-money fa-3x"></em>
                                </Col>
                                <Col xs={8} className="pv-lg">
                                    <div className="h2 mt0">{this.state.general.adminAvaliables}/{this.state.general.admins}</div>
                                    <div className="text-uppercase">Administrators</div>
                                </Col>
                            </div>
                            <a href="#" className="panel-footer bg-gray-dark bt0 clearfix btn-block" onClick={this._goAdmins}>
                                <span className="pull-left">View Details</span>
                                <span className="pull-right">
                                    <em className="fa fa-chevron-circle-right"></em>
                                </span>
                            </a>
                        </div>
                    </Col>
                    <Col lg={3} sm={6}>
                        {/* Factory widget */}
                        <div className="panel swidget bg-primary">
                            <div className="row-table">
                                <Col xs={4} className="text-center bg-primary-dark pv-lg">
                                    <em className="fa fa-user fa-3x"></em>
                                </Col>
                                <Col xs={8} className="pv-lg">
                                    <div className="h2 mt0">{this.state.general.userAvailables}/{this.state.general.users}</div>
                                    <div data-localize="sidebar.nav.managements.USERS" className="text-uppercase">Users</div>
                                </Col>
                            </div>
                            <a href="#" className="panel-footer bg-gray-dark bt0 clearfix btn-block" onClick={this._goUsers}>
                                <span className="pull-left">View Details</span>
                                <span className="pull-right">
                                    <em className="fa fa-chevron-circle-right"></em>
                                </span>
                            </a>
                        </div>
                    </Col>
                    <Col lg={3} sm={6}>
                        {/* Plant widget */}
                        <div className="panel swidget bg-purple">
                            <div className="row-table">
                                <Col xs={4} className="text-center bg-purple-dark pv-lg">
                                    <em className="fa fa-taxi fa-3x"></em>
                                </Col>
                                <Col xs={8} className="pv-lg">
                                    <div className="h2 mt0">{this.state.general.driverAvailables}/{this.state.general.drivers}</div>
                                    <div data-localize="sidebar.nav.managements.DRIVERS" className="text-uppercase">Drivers</div>
                                </Col>
                            </div>
                            <a href="#" className="panel-footer bg-gray-dark bt0 clearfix btn-block" onClick={this._goDrivers}>
                                <span className="pull-left">View Details</span>
                                <span className="pull-right">
                                    <em className="fa fa-chevron-circle-right"></em>
                                </span>
                            </a>
                        </div>
                    </Col>
                    <Col lg={3} sm={6}>
                        {/* Device widget */}
                        <div className="panel swidget bg-green">
                            <div className="row-table">
                                <Col xs={4} className="text-center bg-green-dark pv-lg">
                                    <em className="fa fa-cutlery fa-3x"></em>
                                </Col>
                                <Col xs={8} className="pv-lg">
                                    <div className="h2 mt0">{this.state.general.businessAvailables}/{this.state.general.businesses}</div>
                                    <div data-localize="sidebar.nav.managements.BUSINESSESS" className="text-uppercase">Businesses</div>
                                </Col>
                            </div>
                            <a href="#" className="panel-footer bg-gray-dark bt0 clearfix btn-block" onClick={this._goBusinesses}>
                                <span className="pull-left">View Details</span>
                                <span className="pull-right">
                                    <em className="fa fa-chevron-circle-right"></em>
                                </span>
                            </a>
                        </div>
                    </Col>
                    {/* <Col lg={3} sm={6}>
                        <div className="panel swidget bg-warning">
                            <div className="row-table">
                                <Col xs={4} className="text-center bg-warning-dark pv-lg">
                                    <em className="fa fa-money fa-3x"></em>
                                </Col>
                                <Col xs={8} className="pv-lg">
                                    <div className="h2 mt0">$4371</div>
                                    <div className="text-uppercase">Total Earnings</div>
                                </Col>
                            </div>
                            <a href="#" className="panel-footer bg-gray-dark bt0 clearfix btn-block" onClick={this._goTransactions}>
                                <span className="pull-left">View Details</span>
                                <span className="pull-right">
                                    <em className="fa fa-chevron-circle-right"></em>
                                </span>
                            </a>
                        </div>
                    </Col> */}
                </Row>
                <Row>
                    <Col lg={6}>
                        <div className="box_orders_title bg-inverse">Foods Registers</div>
                        { /* START list group*/}
                        <div data-height="230" data-scrollable="" className="list-group">
                            {
                                this.state.approvedList.map((item, i) => {
                                    return (
                                        <a key={'foodTr' + i} href="#" onClick={this._viewFood.bind(this, item)} className="media p mt0 list-group-item">
                                            <div className="media-body clearfix">
                                                <span className="media-heading">
                                                    <strong>{item.name}</strong>
                                                </span>
                                                <br />
                                                <small className="text-muted">{item.business.name}</small>
                                            </div>
                                        </a>
                                    );
                                })
                            }
                        </div>
                        { /* END box_orders */}
                    </Col>
                    <Col lg={6}>
                        <div className="box_orders_title bg-danger">Problem List Restaurant</div>
                        { /* START list group*/}
                        <div data-height="230" data-scrollable="" className="list-group">
                            {
                                this.state.problemList.map((item, i) => {
                                    return (
                                        <a key={'foodTr' + i} href="#" onClick={this._viewFood.bind(this, item)} className="media p mt0 list-group-item">
                                            <span className="pull-right">
                                                <div className="badge p-sm bg-gray label_s">{item.business.name}</div>
                                            </span>
                                            <div className="media-body clearfix">
                                                <span className="media-heading">
                                                    <strong>{item.title}</strong>
                                                </span>
                                                <br />
                                                <small className="text-muted">{item.description}</small>
                                            </div>
                                        </a>
                                    );
                                })
                            }
                            { /* END list group item*/}
                        </div>
                        { /* END box_orders */}
                    </Col>
                </Row>
            </ContentWrapper>
        );
    }

}

DashboardV2.contextTypes = {
    router: PropTypes.object.isRequired
}
export default DashboardV2;
