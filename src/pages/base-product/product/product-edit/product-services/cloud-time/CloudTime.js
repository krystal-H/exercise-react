import React from 'react';
import { Icon } from 'antd';
import {connect} from 'react-redux';
import ServiceGuide from '../../../../../../components/product-components/service-guide/ServiceGuide';
import CloudManage from './cloud-time-manage/CloudTimeManage';
import {getTimeServiceList,getProtocolLists,getConfigSteps} from '../../../store/ActionCreator';
import { parseConfigSteps } from '../../../../../../util/util';
import { post,Paths } from '../../../../../../api';
import PageTitle from '../../../../../../components/page-title/PageTitle';

const mapStateToProps = state => {    
    return {
        timeServiceList: state.getIn(['product','timeServiceList']).toJS(),
        productProtocolLists: state.getIn(['product','productProtocolLists']).toJS(),
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getTimeServiceList: params => dispatch(getTimeServiceList(params)),
        getProtocolLists: productId => dispatch(getProtocolLists(productId)),
        getConfigSteps: id => dispatch(getConfigSteps(id)) // 获取产品页面步骤配置
    }
}

@connect(mapStateToProps,mapDispatchToProps)
export default class AppControl extends React.Component {
    constructor(props) {
        super(props)
        this.compareProductId()
    }
    compareProductId(){
        let {productId,getTimeServiceList,getProtocolLists,getConfigSteps} = this.props;
        if (productId && this.lastProductId !== productId) {
            this.lastProductId = productId;
            getTimeServiceList({productId})
            getProtocolLists(productId)
            getConfigSteps(productId)
        }
    }
    componentDidUpdate(prevProps, prevState){
        let {productId} = this.props;
        if(prevProps.productId !== productId) {
            this.compareProductId()
        }
    }
    goBackServiceSelect  = () => {
        let {history}  = this.props;
        history.goBack();
    }
    enableCloud = () => {
        let {productId,getConfigSteps} = this.props,
            oldConfigInfo = {},
            _data = {
                productId,
                type:3
            };

        if (this.configs) {
            oldConfigInfo = this.configs.configInfo;
            _data.stepId = this.configs.stepId;
        }

        _data.configInfo = JSON.stringify({
            ...oldConfigInfo,
            enableCloud:true
        })
        post(Paths.saveConfigSteps,_data).then(
            res => getConfigSteps(productId)
        )
    }
    getConfigSteps = () => {
        let {productConfigSteps} = this.props,
            configs = parseConfigSteps(productConfigSteps,3);
        if (configs) {
            this.configs = configs;
        }

        return configs;
    }
    render() {
        let {timeServiceList,productProtocolLists,getTimeServiceList,productId,noNeedTitle = false,canOperate} = this.props,
            configs = this.getConfigSteps(),
            iSshowCloudManage = configs && configs.configInfo &&  configs.configInfo.enableCloud; 
        return (
            <div className="app-control">
                {
                    !noNeedTitle && 
                    <PageTitle backHandle={this.goBackServiceSelect} title="云端定时服务"></PageTitle>
                }
                {/* {
                    !iSshowCloudManage &&
                    <ServiceGuide canOperate={canOperate} type='cloud' clickHander={this.enableCloud}></ServiceGuide>
                } */}
                {/* {
                    iSshowCloudManage && */}
                    <CloudManage
                        canOperate={canOperate}
                        productId={productId}
                        timeServiceList={timeServiceList}
                        productProtocolLists={productProtocolLists}
                        getTimeServiceList={getTimeServiceList}
                    ></CloudManage>
                {/* } */}
            </div>
        )
    }
}