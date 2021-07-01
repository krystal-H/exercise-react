import React, { Component } from 'react';
import {Switch,Route,Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';

import UserInfo from './user-info/UserInfo';
import RoleManagement from './roleManagement/RoleManagementList';
import AddRole from './roleManagement/AddRole';
import UserVisit from './user-visit/UserVisit';
import UserLook from './user-visit/UserLook';
import OperateLog from './operate-log/OperateLog';
import SecuritySetting from './security-setting/SecuritySetting';
import CaseManage from './case-manage/CaseManage';
import Authorize from './authorize/Authorize';
import DataAsset from './dataasset/Dataasset';
import DataAssetDetail from './dataasset/dataAssetDetail';





import {PrivateRoute} from '../../configs/route.config';
import OutsideWrapper from '../../components/outside-wrapper/OutsideWrapper'
import Header from '../../pages/open/header/Header'
import PageTabs from '../../components/page-tabs/PageTabs'

import {getNewMessageNums} from '../message-center/store/ActionCreator'
import {getDeveloperInfo} from './store/ActionCreator';

import './UserCenter.scss'

const mapStateToProps = state => {
    return {
        developerInfo: state.getIn(['userCenter', 'developerInfo']).toJS(),
        newMessageNums: state.getIn(['message', 'newMessageNums']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getNewMessageNums: () => dispatch(getNewMessageNums()),
        getDeveloperInfo: () => dispatch(getDeveloperInfo()),
    }
}


@connect(mapStateToProps, mapDispatchToProps)
export default class UserCenter extends Component {
    componentDidMount () {
        let {newMessageNums,getNewMessageNums,getDeveloperInfo,developerInfo} = this.props;

        if (isEmpty(newMessageNums)) {
            getNewMessageNums()
        }

        if (isEmpty(developerInfo)) {
            getDeveloperInfo()
        }
    }
    render() {
        let {developerInfo,newMessageNums,match,getDeveloperInfo} = this.props,
            {path} = match,
            isOk = !(developerInfo.isSubUser === 1);

        return (
            <OutsideWrapper>
                <div className="page-header-wrapper">
                    <Header newMessageNums={newMessageNums} developerInfo={developerInfo} noCollapsed={true}></Header>
                </div>
                <div className="content-wrapper">
                    <PageTabs developerInfo={developerInfo}></PageTabs>
                    <section className="right-wrapper flex-column">
                        <div className="flex1 scroll-y">
                            <Switch>
                                    <Route path={`${path}/info`} component={UserInfo}></Route>
                                    <Route path={`${path}/security`} render={props => <SecuritySetting {...props} developerInfo={developerInfo} getDeveloperInfo={getDeveloperInfo}></SecuritySetting>}></Route>
                                    <PrivateRoute component={RoleManagement} path={`${path}/role`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={UserVisit} path={`${path}/visit`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={UserLook} path={`${path}/look`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={AddRole} path={`${path}/add`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={OperateLog} path={`${path}/log`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>

                                    <PrivateRoute component={CaseManage} path={`${path}/case`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={Authorize} path={`${path}/authorize`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={DataAsset} path={`${path}/dataasset`} redirect={`${path}/info`} isOk={isOk}></PrivateRoute>
                                    <PrivateRoute component={DataAssetDetail} path={`${path}/assetdetail/:id/:readOnly`} redirect={`${path}/info`} isOk={isOk} developerInfo={developerInfo}></PrivateRoute>
                                    <Redirect to={`${path}/info`}></Redirect>
                            </Switch>
                        </div>
                    </section>
                </div>  
            </OutsideWrapper>
        )
    }
}
