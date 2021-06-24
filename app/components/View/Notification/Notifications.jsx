import React from 'react';
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Notifications extends React.Component {
    constructor(props, context) {
        super(props, context);
        // init state params 
        this.state = {

        }
    }

    componentDidMount() {
        this.ifMounted = true;
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }


    render() {
        return (
            <ContentWrapper>
                <div className="content-heading">
                    Notifications
                </div>
            </ContentWrapper>
        );
    }
}

export default Notifications;