import React from 'react';
import PropTypes from 'prop-types';
import ContentWrapper from '../../Layout/ContentWrapper';
import api from '../../API/api';
import AdminService from '../../API/AdminService';
import UploadService from '../../API/UploadService';
import UtilService from '../../Common/UtilService';
import * as CONST from '../../Common/constants';
import SortHeader from '../../Control/SortHeader';

import swal from 'sweetalert'
import _ from 'underscore'
import { Grid, Row, Col, Panel, Button, Tab, Nav, NavItem, ListGroup, ListGroupItem } from 'react-bootstrap';

class Profile extends React.Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            user: {},
        };

        this._submitForm = this._submitForm.bind(this);
        this._setPassword = this._setPassword.bind(this);
    }

    componentDidMount() {
        document.title = 'Profile';
        this.setState({
            user: api.getCurrentUser()
        })
        this.editForm = $('form#editForm').parsley();
        this.passwordForm = $("form#passwordForm").parsley();

        if ($.fn.filestyle)
            $('.filestyle').filestyle('clear');
    }

    _changeField(field, e) {
        e.preventDefault();

        // update all fields when change content
        var user = this.state.user;
        if (field == 'avatar') {
            this._uploadFile(field, this.refs.avatar.files[0]);
            return;
        } else {
            user[field] = e.target.value;
        }

        this.setState({ user });
    }

    _uploadFile(field, file) {
        var user = this.state.user;
        
        const data = new FormData();
        data.append('type', 'admins');
        data.append('file', file)

        UploadService.uploadImage(data, (res) => {

            $.notify("File is uploaded successfully", "success");
            user[field] = res.path;
            // reset state
            this.setState({
                user: user
            });
        }, (err) => {
            $.notify("File is not uploaded", "danger");
        });
    }

    _submitForm(e) {
        e.preventDefault();

        this.editForm = $('form#editForm').parsley();
        this.editForm.validate();
        console.log(this.state.user);
        if (this.editForm.isValid()) {
            AdminService.updateAdmin(this.state.user, (res) => {
                // update state
                this.setState({
                    user: this.state.user,
                });

                // update local storage
                api.setCurrentUser(this.state.user)
                if ($.fn.filestyle)
                    $('.filestyle').filestyle('clear');

                $.notify("Account updated successfully.", "success");
                $(document.body).removeClass("editsidebar-open");
            }, (err) => {
                //(err.message);
                $.notify(err.message, "danger");
            })
        }
    }

    _setPassword(e) {
        e.preventDefault();

        this.passwordForm = $("form#passwordForm").parsley();
        this.passwordForm.validate();

        if (this.passwordForm.isValid()) {
            AdminService.setPassword(this.state.user, (res) => {
                // init input box
                this.state.user.password = ""
                this.state.user.new_password = ""
                this.state.user.confirmPassword = ""
                this.setState({
                    user: this.state.user,
                });

                $.notify("Password updated successfully.", "success");
            }, (err) => {
                //console.log(err.message);
                $.notify(err.message, "danger");
            })
        }
    }

    _clickedLogOut(e) {
        e.preventDefault();

        var $this = this;
        swal({
            title: "Will you logout really?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Confirm",
            closeOnConfirm: true
        }, function () {
            $this._logOut();
        });
    }

    _logOut() {
        api.logout();
        this.context.router.push('login')
    }

    render() {
        return (
            <ContentWrapper>
                <Tab.Container className="container-md" id="settings-tab" defaultActiveKey="tabpanel1">
                    <Row>
                        <Col md={3}>
                            <div className="panel b">
                                <div className="panel-heading bg-gray-lighter text-bold">Personal Settings</div>
                                <Nav>
                                    <NavItem eventKey="tabpanel1">Profile</NavItem>
                                    <NavItem eventKey="tabpanel2">Change Password</NavItem>
                                </Nav>
                            </div>
                            <Button bsStyle="danger" className="btn-block" onClick={this._clickedLogOut.bind(this)}>
                                Log out
                            </Button>
                        </Col>
                        <Col md={9}>
                            <Tab.Content animation className="p0 b0">
                                <Tab.Pane eventKey="tabpanel1">
                                    <div className="panel b">
                                        <div className="panel-heading bg-gray-lighter text-bold">Profile</div>
                                        <div style={{ backgroundImage: "url('img/bg7.jpg')" }} className="panel-body bg-cover clearfix">
                                            <div className="media mt0">
                                                <div className="media-left">
                                                    <img src={UtilService.getProfileFromPath(this.state.user.avatar)} alt="Image" className="media-object img-thumbnail img-circle thumb64" />
                                                </div>
                                                <div className="media-body media-middle">
                                                    <div className="clearfix">
                                                        <div className="pull-left">
                                                            <h4 className="media-heading m1 text-white" style={{ marginTop: '8px' }}>{this.state.user.user_name || ''}</h4>
                                                            <p className="text-white">{this.state.user.role != undefined ? this.state.user.role.name : "-"}</p>
                                                        </div>
                                                        <div className="pull-right" style={{ marginTop: '16px' }}>
                                                            <input
                                                                type="file"
                                                                ref="avatar"
                                                                data-classbutton="btn btn-default"
                                                                data-classinput="form-control inline"
                                                                className="form-control filestyle"
                                                                onChange={this._changeField.bind(this, 'avatar')} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/*{<img src={UtilService.getProfileFromPath(this.state.user.image)} className="img-thumbnail thumb64 img-fit img-circle" style={{ backgroundColor: 'white' }} />}*/}
                                        </div>
                                        <div className="panel-body">
                                            <form id="editForm" className="form" data-parsley-validate="">
                                                <fieldset>
                                                    <Row>
                                                        <Col sm={6}>
                                                            <div className="form-group">
                                                                <label>First name</label>
                                                                <input type="text" value={this.state.user.firstname || ''} placeholder="First name" required="required" onChange={this._changeField.bind(this, 'firstname')} className="form-control" />
                                                            </div>
                                                        </Col>
                                                        <Col sm={6}>
                                                            <div className="form-group">
                                                                <label>Last name</label>
                                                                <input type="text" value={this.state.user.lastname || ''} placeholder="Last name" required="required" onChange={this._changeField.bind(this, 'lastname')} className="form-control" />
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group">
                                                        <label>E-mail</label>
                                                        <input type="text" value={this.state.user.email || ''} placeholder="E-mail" required="required" onChange={this._changeField.bind(this, 'email')} className="form-control" readOnly />
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group">
                                                        <label>Verify </label>
                                                        {this.state.user.isVerify ? <div className="badge p-sm bg-success pull-right">Verified</div> : <div className="badge p-sm bg-danger pull-right">No</div>}
                                                    </div>
                                                </fieldset>
                                                <fieldset>
                                                    <div className="form-group">
                                                        <label>Status </label>
                                                        {this.state.user.status ? <div className="badge p-sm bg-success pull-right">Active</div> : <div className="badge p-sm bg-danger pull-right">Deactive</div>}
                                                    </div>
                                                </fieldset>
                                                <button type="button" className="btn btn-info" onClick={this._submitForm}>Update profile</button>
                                            </form>
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="tabpanel2">
                                    <div>
                                        <div className="panel b">
                                            <div className="panel-heading bg-gray-lighter text-bold">Change</div>
                                            <div className="panel-body">
                                                <form id="passwordForm" className="form" data-parsley-validate="">
                                                    <div className="form-group">
                                                        <label>Current password</label>
                                                        <input type="password" value={this.state.user.password || ''} required="required" onChange={this._changeField.bind(this, 'password')} className="form-control" />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>New password</label>
                                                        <input id="password" value={this.state.user.new_password || ''} required="required" onChange={this._changeField.bind(this, 'new_password')} type="password" className="form-control" pattern={CONST.REGEXP_PASSWORD} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Confirm new password</label>
                                                        <input value={this.state.user.confirmPassword || ''} required="required" data-parsley-equalto="#password" onChange={this._changeField.bind(this, 'confirmPassword')} type="password" className="form-control" />
                                                    </div>
                                                    <button type="button" className="btn btn-info" onClick={this._setPassword}>Update password</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </Tab.Pane>
                            </Tab.Content>
                        </Col>
                    </Row >
                </Tab.Container >
            </ContentWrapper >
        )
    }
}

Profile.contextTypes = {
    router: PropTypes.object.isRequired
}

export default Profile;