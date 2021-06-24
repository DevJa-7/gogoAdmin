import React, { Component } from 'react';
import ContentWrapper from '../../Layout/ContentWrapper';
import { Grid, Row, Col, Panel, Button, Table } from 'react-bootstrap';
import SortHeader from '../../Control/SortHeader';

class Problems extends Component {

    constructor(props, context) {
        super(props,context);
        this.state = {
            selectedProblem: {},
        }
        this.editForm = null;
    }

    componentDidMount() {
        document.title = "Problem List - gogo";

        this.ifMounted = true
        this.editForm = $('form#editForm').parsley();
        $(document.body).removeClass("editsidebar-open");
    }

    render() {
        return(
            <ContentWrapper>
               <div className="content-heading">
                    Problems List
                    <div className="pull-right btn_mobile">
                        <button className="btn btn-new pull-right" >Add New</button>
                    </div>
                </div>

                <Row>
                <Col lg={ 12 }>
                    <Panel>
                        <Row className="mb-lg">
                            <Col md={8}>
                                <form className="form-inline">
                                    <div className="input-group">
                                        <input ref="query" placeholder="Search user, driver" className="form-control"  style={{ width: '250px' }} />
                                        <span className="input-group-btn">
                                            <button className="btn btn-search">
                                                Search
                                            </button>
                                        </span>
                                    </div>
                                </form>
                            </Col>
                              <Col md={4}>
                                <button className="btn btn-new pull-right table_new_btn">New Problem</button>
                            </Col>
                        </Row>
                        <div className="table-responsive">
                        <Table id="datatable1" responsive striped hover className="b0">
                                    <thead>
                                        <tr>
                                        <th>#</th>
                                        <th>
                                            <SortHeader
                                                label={'Problem Name'}
                                                sortField="problem"
                                                sortIndex={0}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Type'}
                                                sortField="type"
                                                sortIndex={1}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Status'}
                                                sortField="status"
                                                sortIndex={2}>
                                            </SortHeader>
                                        </th>
                                        <th>
                                            <SortHeader
                                                label={'Create At'}
                                                sortField="create"
                                                sortIndex={3}>
                                            </SortHeader>
                                        </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="tr-hover">
                                            <td>1</td>
                                            <td>The card was declined</td>
                                            <td>General</td>
                                            <td><div className="badge p-sm bg-success">Active</div></td>
                                            <td>14:00 2017/03/12</td>
                                        </tr>
                                        <tr className="tr-hover">
                                            <td>2</td>
                                            <td>I was in an accident</td>
                                            <td>Trip</td>
                                            <td><div className="badge p-sm bg-success">Active</div></td>
                                            <td>14:00 2017/03/12</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Panel>
                    </Col>
                </Row>
            </ContentWrapper>
        )
    }
}

export default Problems;