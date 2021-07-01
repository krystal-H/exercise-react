import React, { Component } from 'react'
import {Switch,Redirect,Route} from 'react-router-dom'
import {connect} from 'react-redux'
import { get,Paths } from '../../../api'
import { getDeveloperInfo } from '../store/ActionCreator'


import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import ContactInformation from './ContactInformation';

import TreeStructureDisplay from '../../../components/tree-structure-display/TreeStructureDisplay'

import './UserInfo.scss'
import { DateTool } from '../../../util/util'


const mapStateToProps = state => {
    return {
        developerInfo: state.getIn(['userCenter', 'developerInfo']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getDeveloperInfo: () => dispatch(getDeveloperInfo()),
    }
}


@connect(mapStateToProps, mapDispatchToProps)
export default class UserInfo extends Component {

    render() {
        let {developerInfo,match,getDeveloperInfo} = this.props,
        {path} = match;

        return (
            <Switch>
                <Route path={`${path}/base`} render={routeProps => <BaseInfo {...routeProps} developerInfo={developerInfo} getDeveloperInfo={getDeveloperInfo}></BaseInfo>}></Route>
                {/* 设置项相关的子路由，已迁移到security-setting组件下 */}
                <Redirect to={`${path}/base`}></Redirect>
            </Switch>
        )
    }
}


class BaseInfo extends Component {
    constructor (props) {
        super(props);
        let {isSubUser} = this.props.developerInfo;
        this.state = {
            isSubUser:!!isSubUser,
            productResource:[],
            dataObjRightsList:[],
            dataDimensionRightsList:[]
        }
    }
    componentDidMount () {
        this.getSubRights()
    }
    componentDidUpdate (prevProps) {
        let {isSubUser} = this.props.developerInfo;
        if(prevProps.developerInfo.isSubUser !== isSubUser) {
            this.getSubRights()
            this.setState({
                isSubUser:!!isSubUser
            })
        }
    }
    getSubRights = () => {
        let {developerInfo = {}} = this.props,
            {isSubUser} = developerInfo;

        if (isSubUser) {
            get(Paths.getRightsOneself, {}, {loading: true}).then((model) => {
                let productResource = [];
                let dataObjRightsList = [];
                let dataDimensionRightsList = [];
                let arr = model.data;
                for (let a = 0; a < arr.length; a++) {
                    let item = arr[a];
                    if(item.menuCode=='productService'){
                        productResource = item.checkBoxGroupList
                    }
                    if(item.menuCode=='dataObject'){
                        dataObjRightsList = item.checkBoxGroupList
                    }
                    if(item.menuCode=='dataDimension'){
                        dataDimensionRightsList = item.checkBoxGroupList
                    }
                }
                this.setState({productResource,dataObjRightsList,dataDimensionRightsList});
            });
        }
    }
    render() {
        let {isSubUser,productResource,dataObjRightsList,dataDimensionRightsList} = this.state,
            {developerInfo,getDeveloperInfo} = this.props,
            {id,email,createTime,userRole,parentAccount,account} = developerInfo;

        return (
            isSubUser ? 
            // 子账号页面
            <React.Fragment>
                <PageTitle noback={true} title="基本资料"></PageTitle>
                <AloneSection title="基本信息">
                    <div className="alone-section-content-default base-info">
                        <div className="p-flex">
                            <span className="flex-item">
                                <span className="title">登录账号：</span>
                                {account}
                            </span>
                            <span className="flex-item">
                                <span className="title">所属主帐号：</span>
                                {parentAccount}
                            </span>
                            <span className="flex-item">
                                <span className="title">账户角色：</span>
                                {userRole}
                            </span>
                            <span className="flex-item">
                                <span className="title">创建时间：</span>
                                {createTime ? DateTool.utcToDev(createTime) : ''}
                            </span>
                        </div>
                    </div>
                </AloneSection>
                <TreeStructureDisplay userCategory='1' productResource={productResource} dataObjRightsList={dataObjRightsList} dataDimensionRightsList={dataDimensionRightsList} />
            </React.Fragment>
            // 主账号页面
            :<React.Fragment>
                <PageTitle noback={true} title="基本资料"></PageTitle>
                <AloneSection title="基本信息">
                    <div className="alone-section-content-default base-info">
                        <div className="p-flex">
                            <span className="flex-item">
                                <span className="title">开发者ID：</span>
                                {id}
                            </span>
                            <span className="flex-item">
                                <span className="title">电子邮箱：</span>
                                {email}
                            </span>
                            <span className="flex-item">
                                <span className="title">注册时间：</span>
                                {createTime ? DateTool.utcToDev(createTime) : ''}
                            </span>
                        </div>
                    </div>
                </AloneSection>
                <AloneSection title="联系信息">
                    <div className="alone-section-content-default form-wrapper">
                        <ContactInformation getDeveloperInfo={getDeveloperInfo} developerInfo={developerInfo}></ContactInformation>
                    </div>
                </AloneSection>
            </React.Fragment>
        )
    }
}


