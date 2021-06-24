import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Table, FormControl, FormGroup, Pagination } from 'react-bootstrap';
import { Router, Route, Link, History, withRouter } from 'react-router';

import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import UtilService from '../../Common/UtilService';
import FoodService from '../../API/FoodService';
import FoodDetail from '../../View/Food/FoodDetail';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

class Foods extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            foodList: {
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

            selectedFood: {},
            formTitle: "New Food",
            editOption: false,
        }

        // reset editForm
        this.businessId = this.props.location.query.businessId

        this._createFood = this._createFood.bind(this);
    }

    componentDidMount() {
        $(document.body).removeClass("editsidebar-open");
        this.ifMounted = true

        this._searchFoods(1)
    }

    componentWillUnmount() {
        this.ifMounted = false;
    }

    _searchFoods(page, e) {
        if (e)
            e.preventDefault();

        var query = this.refs.query.value;
        if (this.state.sortDirection != 0) {
            query += "&sort=" + this.state.sortDirection + "&field=" + this.state.sortField
        }
        query += "&offset=" + CONST.NUM_PER_PAGES * (page - 1) + "&count=" + CONST.NUM_PER_PAGES + "&businessId=" + this.businessId

        FoodService.readFoods(query, (res) => {
            console.log("res", res);
            this.ifMounted && this.setState({
                foodList: res,
                activePage: page,
                numOfPages: Math.ceil(res.total / CONST.NUM_PER_PAGES)
            })
        }, (err) => {
            console.log(err)
        });
    }

    _createFood(e) {
        e.preventDefault();

        let foodId = this.state.selectedFood.id ? this.state.selectedFood.id : ""
        this.context.router.push('/foodDetail?foodId=' + foodId + "&businessId=" + this.businessId);
    }

    _editFood(food, e) {
        e.preventDefault();

        let foodId = food.id
        this.context.router.push('/foodDetail?foodId=' + foodId + "&businessId=" + this.businessId);
    }

    _changeField(field, e) {
        e.preventDefault();

        var selectedFood = this.state.selectedFood;
        selectedFood[field] = e.target.value;

        this.ifMounted && this.setState((old) => {
            old.selectedFood = selectedFood
        });
    }

    _changeSwitch(food, e) {
        e.preventDefault();

        setTimeout(() => {
            let value = !food.soldOut
            $('#switch_' + food.id).prop('checked', value);
            food.soldOut = value
            // update indvidual food
            FoodService.updateFood(food, (res) => {
                $.notify("Food is updated successfully.", "success");
            }, (err) => {
                // console.log(err.message);
                $.notify(err.message, "danger");
            })
        }, 100)

    }

    _handlePageSelect(eventKey) {
        this._searchFoods(eventKey);
    }

    _sortList(field, direction) {
        this.state.sortField = field;
        this.state.sortDirection = direction;
        this.ifMounted && this.setState({
            sortField: field,
            sortDirection: direction
        })
        this._searchFoods(this.state.activePage);
    }

    _viewFood(food, e) {
        if (e) {
            e.stopPropagation()
            e.preventDefault()
        }

        this.context.router.push('/food/profile?foodId=' + food.id);
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
                    Foods
                    </div>
                <div>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search name and food" className="form-control" style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-primary">
                                                Search
                                                </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                            <Col md={4}>
                                <button className="btn btn-primary pull-right" onClick={this._createFood}>New Food</button>
                            </Col>
                        </Row>
                        <Table id="datatable1" responsive striped hover className="b0">
                            <thead>
                                <tr>
                                    <th style={{ width: "30px" }}>#</th>
                                    <th className="text-center">Image</th>
                                    <th className="text-center">
                                        <SortHeader
                                            label={'Food type'}
                                            action={this._sortList.bind(this)}
                                            sortField="foodType.name"
                                            sortIndex={0}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th className="text-center">Meal kind</th>
                                    <th className="text-center">Dietary</th>
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
                                            label={'Description'}
                                            action={this._sortList.bind(this)}
                                            sortField="description"
                                            sortIndex={1}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Sold Out'}
                                            action={this._sortList.bind(this)}
                                            sortField="soldOut"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'FreeDelivery'}
                                            action={this._sortList.bind(this)}
                                            sortField="freeDelivery"
                                            sortIndex={3}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        <SortHeader
                                            label={'Created At'}
                                            action={this._sortList.bind(this)}
                                            sortField="createdAt"
                                            sortIndex={4}
                                            activeIndex={this.state.activeIndex}
                                            setActiveIndex={(idx) => this.setState({ activeIndex: idx })}>
                                        </SortHeader>
                                    </th>
                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.foodList.items.map((item, i) => {
                                        return (
                                            <tr key={'foodTr' + i} className="tr-hover">
                                                <td>{(this.state.activePage - 1) * CONST.NUM_PER_PAGES + i + 1}</td>
                                                <td className="text-center">
                                                    <div className="user-block-picture thumb48 text-center">
                                                        {<img src={UtilService.getImageFromPath(item.image)} className="img-thumbnail thumb48 img-fit img-circle" style={{ backgroundColor: 'white' }} />}
                                                    </div>
                                                </td>
                                                <td className="text-center">{item.foodType.name}</td>
                                                <td className="text-center">
                                                    {
                                                        item.mealKinds && item.mealKinds.map((kind, i) => {
                                                            return <div key={"kind" + i} className="badge p-sm bg-success mr-sm">{kind}</div>
                                                        })
                                                    }
                                                </td>
                                                <td className="text-center">
                                                    {
                                                        item.dietaries && item.dietaries.map((dietary, i) => {
                                                            return <div key={"kind" + i} className="badge p-sm bg-warning mr-sm">{dietary}</div>
                                                        })
                                                    }
                                                </td>
                                                <td>{item.name}</td>
                                                <td>{item.description}</td>
                                                <td>
                                                    <label className="switch mr mb">
                                                        {item.soldOut ? <input type="checkbox" id={"switch_" + item.id} defaultChecked onClick={this._changeSwitch.bind(this, item)} /> : <input type="checkbox" id={"switch_" + item.id} onClick={this._changeSwitch.bind(this, item)} />}
                                                        <em></em>
                                                    </label>                                                </td>
                                                <td>{item.freeDelivery ? <div className="badge p-sm bg-success">Freeze</div> : <div className="badge p-sm bg-danger">Fixed</div>}</td>
                                                <td>{UtilService.getDateTime(item.createdAt)}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-success" onClick={this._editFood.bind(this, item)}>Edit</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                {(() => {
                                    if (this.state.foodList.total == 0) {
                                        return (
                                            <tr>
                                                <td colSpan={10}>
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
                            className={this.state.foodList.total === 0 ? 'hidden' : 'shown'}
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

Foods.contextTypes = {
    router: PropTypes.object.isRequired
}
export default Foods;