import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Configuration extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {

        }
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Configuration
                </div>
                <Panel>
                    <legend>Service Settings</legend>
                    <form className="form-horizontal">
                        <FormGroup>
                            <label className="col-sm-2 control-label">Booking Fee:</label>
                            <Col sm={10}>
                                <FormControl type="text" className="form-control" />
                            </Col>
                        </FormGroup>
                    </form>

                    <legend>Email Settings</legend>
                    <form className="form-horizontal">
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Email Server:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Email Port:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Email Username:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Email Password:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                    </form>


                    <legend>Twillo Settings</legend>
                    <form className="form-horizontal">
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Twillo Sid:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">Twillo Token:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                            <label className="col-sm-2 control-label">Twillo From:</label>
                            <Col sm={10}>
                                <FormControl type="text" className="form-control" />
                            </Col>
                        </FormGroup>
                    </form>

                    <legend>Google MAP Settings</legend>
                    <form className="form-horizontal">
                        <FormGroup>
                            <label className="col-sm-2 control-label">Google MAP API Key:</label>
                            <Col sm={10}>
                                <FormControl type="text" className="form-control" />
                            </Col>
                        </FormGroup>
                    </form>

                    <legend>OneSignal Notification Settings</legend>
                    <form className="form-horizontal">
                        <fieldset>
                            <FormGroup>
                                <label className="col-sm-2 control-label">Create Notification URL:</label>
                                <Col sm={10}>
                                    <FormControl type="text" className="form-control" />
                                </Col>
                            </FormGroup>
                        </fieldset>
                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">UserApp Name:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">UserApp BundleID:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                        <fieldset>
                            <Row>
                                <Col sm={6}>
                                    <FormGroup>
                                        <label className="col-sm-4 control-label">UserApp AppID:</label>
                                        <Col sm={8}>
                                            <FormControl type="text" className="form-control" />
                                        </Col>
                                    </FormGroup>
                                </Col>
                                <Col sm={6}>
                                    <FormGroup>
                                        <label className="col-sm-4 control-label">UserApp APIKey:</label>
                                        <Col sm={8}>
                                            <FormControl type="text" className="form-control" />
                                        </Col>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </fieldset>

                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">DriverApp Name:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">DriverApp BundleID:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">DriverApp AppID:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                            <Col sm={6}>
                                <FormGroup>
                                    <label className="col-sm-4 control-label">DriverApp APIKey:</label>
                                    <Col sm={8}>
                                        <FormControl type="text" className="form-control" />
                                    </Col>
                                </FormGroup>
                            </Col>
                        </Row>
                    </form>

                    <legend>Websocket Settings</legend>
                    <form className="form-horizontal">
                        <FormGroup>
                            <label className="col-sm-2 control-label">Server URL:</label>
                            <Col sm={10}>
                                <FormControl type="text" className="form-control" />
                            </Col>
                        </FormGroup>
                    </form>
                </Panel>
            </ContentWrapper>
        );
    }
}

export default Configuration;