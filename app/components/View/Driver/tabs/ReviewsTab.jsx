import React from 'react';
import _ from 'underscore'
import Rating from 'react-rating';
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';

import api from '../../../API/api';
import TripService from '../../../API/TripService';
import UtilService from '../../../Common/UtilService';
import * as CONST from '../../../Common/constants';

class ReviewsTab extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            driver_id: "",
            reviewList: {
                total: 0,
                reviews: [],
            },

            // for pagination
            numOfPages: 1,
            activePage: 1,
            // for sort
            activeIndex: -1,
            sortField: "",
            sortDirection: 0,
        };
    }

    componentDidMount() {
        this.ifMounted = true;
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    componentWillReceiveProps(nextProps) {
        // console.log("driver_id:", nextProps.driver_id)
        this.ifMounted && this.setState({
            driver_id: nextProps.driver_id,
        });

        setTimeout(() => {
            this._searchReviews(1);
        }, 100)
    }

    _searchReviews(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_SM_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_SM_PAGES

        // get reviews from webservic via api
        TripService.readTripsReview(this.state.driver_id, query, (res) => {
            // console.log("reviews", res);
            this.ifMounted && this.setState({
                reviewList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_SM_PAGES)
            })
        }, (err) => {
        });
    }

    _handlePageSelect(eventKey) {
        this._searchReviews(eventKey);
    }

    render() {
        return (
            <div>
                <Row className="mb-lg">
                    <Col md={8}>
                        <form className="form-inline">
                            <div className="input-group">
                                <input ref="query" placeholder="Search user's name" className="form-control" style={{ width: '190px' }} />
                                <span className="input-group-btn">
                                    <button className="btn btn-new" onClick={this._searchReviews.bind(this, 1)}>
                                        Search
                                    </button>
                                </span>
                            </div>
                        </form>
                    </Col>
                </Row>
                <table className="table table-hover mb-mails">
                    <tbody>
                        {
                            this.state.reviewList.reviews.map((item, i) => {
                                return (
                                    <tr key={'reviewTr' + i} className="tr-hover">
                                        <td>
                                            <img alt="Mail Avatar" src={UtilService.getProfileFromPath(item.user.image)} className="mb-mail-avatar pull-left" />
                                            <div className="mb-mail-date pull-right">{UtilService.getDateTime2ByFormat(item.drop_date, "MM-DD HH:mm")}</div>
                                            <div className="mb-mail-meta">
                                                <div className="pull-left mb-sm">
                                                    <div className="mb-mail-subject">{item.user.user_name}</div>
                                                    <div className="mb-mail-from">
                                                        <Rating
                                                            empty="fa fa-star-o text-warning"
                                                            full="fa fa-star text-warning"
                                                            fractions={2}
                                                            initialRate={Number(item.driver_rate.rating.toFixed(0))}
                                                            readonly
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-mail-preview"><em>&mdash; "{item.driver_rate.review ? item.driver_rate.review : 'Feedback not given'}"</em></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        }
                        {(() => {
                            if (this.state.reviewList.total == 0) {
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
                </table>
                <div className="text-center">
                    <Pagination
                        className={this.state.reviewList.total === 0 ? 'hidden' : 'shown'}
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
        );
    }
}

export default ReviewsTab;
