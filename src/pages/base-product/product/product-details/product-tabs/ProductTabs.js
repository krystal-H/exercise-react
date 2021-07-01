import React,{Component} from 'react'
import { post,Paths } from '../../../../../api';
import ProduceInfo from '../../product-edit/product-info/ProductInfo';
import ProductProtocols from '../../product-edit/product-protocols/ProductProtocols';
import FirmwareManagement from '../firmware-management/FirmwareManagement';
import DebuggingTool from '../../deviceDebugging/deviceDebuggerTest/StartTest';
import AppControl from '../../product-edit/product-services/app-control/AppControl';
import CloudTime from '../../product-edit/product-services/cloud-time/CloudTime';
import SceneLink from '../../product-edit/product-services/scene-link/SceneLink';
import DeviceRegister from '../device-register';
import CommercailInfo from '../basic-information/commercailinfo';
import Firmware from '../basic-information/firmware';
import RemoteConfig from '../remote-config/RemoteConfig';
import LabelManage from '../label-manage/LabelManage';
import TopicList from '../topic-list/TopicList'
import PtotocalTag from '../protocal-tag/PtotocalTag';

import {getUrlParam} from '../../../../../util/util';
import {
    updateDeviceDebugAccountListAction,//更新账号列表
    updateDeviceDebugMacListAction,//更新mac列表
} from '../../store/ActionCreator_debug.js';
import { connect } from 'react-redux';

import './ProductTabs.scss'

import { Tabs } from 'antd';
const { TabPane } = Tabs;


const mapStateToProps = state => {
    return {
        deviceDebugAccountList: state.getIn(['deviceDebug','deviceDebugAccountList']).toJS(),
        deviceDebugMacList: state.getIn(['deviceDebug','deviceDebugMacList']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        updateDeviceDebugAccountList: (data)=>dispatch(updateDeviceDebugAccountListAction(data)),
        updateDeviceDebugMacList: (data)=>dispatch( updateDeviceDebugMacListAction(data))
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class ProductTabs  extends Component {
    constructor(props){
        super(props);
        this.state = {
            steps:getUrlParam('step')||'1',
        }
    }
    callback = (steps) => {
        let {productId} = this.props;
        window.location.hash = `#/open/base/product/details/${productId}?step=${steps}`;
        if(steps=='4'){
            let accountList = [],
            macList = [];
            this.setState({steps},()=>{
                post(Paths.deviceDebugAccountGetList,{productId}).then((model) => {
                    if(model.code==0){
                        accountList = model.data;
                        this.props.updateDeviceDebugAccountList(model);
                        post(Paths.debugSecretList,{productId}).then((res) => {
                            if(res.code==0){
                                macList = res.data;
                                this.props.updateDeviceDebugMacList(res);
                                if(macList.length<1){
                                    this.debugVisible.debugVisible();
                                }
                            }
                        });
                    }
                });
                // let { deviceDebugAccountList, deviceDebugMacList } = this.props;
                // if(deviceDebugAccountList.data.length<1||deviceDebugMacList.data.length<1){
                //     this.debugVisible.debugVisible();
                // }
            });
        }else{
            this.setState({steps});
        }
    }
    render() {
        let {productId,productBaseInfo,protocolLists} = this.props;
        let { authorityType, accessModeId } = productBaseInfo;
        return (
            <div className="product_tabs">
                <Tabs defaultActiveKey={this.state.steps} onChange={value => this.callback(value)}>
                    <TabPane key={'1'} tab={'基本信息'}>
                        <ProduceInfo  productId={productId} canOperate={false}/>
                    </TabPane>
                    <TabPane key={'14'} tab={'物标签'}>
                        <PtotocalTag productId={productId} />
                    </TabPane>
                    <TabPane key={'13'} tab={'topic列表'}>
                        <div style={{padding:'1px',background:'#e9e9e9'}}>
                            <TopicList productIdHex={productBaseInfo.productIdHex || "${YourProductKey}"} type={0} canOperate={false}/>
                        </div>
                    </TabPane>
                    <TabPane key={'2'} tab={'功能定义'}>
                        <ProductProtocols productId={productId} canOperate={false}/>
                    </TabPane>
                    <TabPane key={'10'} tab={'硬件开发'}>
                        <Firmware productId={productId}/>
                    </TabPane>
                    <TabPane key={'3'} tab={'固件管理'}>
                    <FirmwareManagement productId={productId} />
                    </TabPane>
                    <TabPane key={'4'} tab={'调试工具'}>
                        <div className="gray-bg-padding">
                            <DebuggingTool productId={productId} onRef={ref => this.debugVisible = ref} />
                        </div>
                    </TabPane>
                    <TabPane key={'11'} tab={'标签'}>
                        <LabelManage productId={productId}/>
                    </TabPane>
                    <TabPane key={'12'} tab={'远程配置'}>
                        <RemoteConfig productId={productId} protocolLists={protocolLists}/>
                    </TabPane>
                    <TabPane key={'5'} tab={'APP控制'}>
                        <AppControl productId={productId} canOperate={true} noNeedTitle={true}/>
                    </TabPane>
                    <TabPane key={'6'} tab={'云端定时'}>
                        <CloudTime productId={productId} canOperate={true} noNeedTitle={true}/>
                    </TabPane>
                    <TabPane key={'7'} tab={'场景服务'}>
                        <SceneLink productId={productId} canOperate={true} noNeedTitle={true}/>
                    </TabPane>
                    {
                        // authorityType !== null && authorityType !== 0 &&  {/*取消限制初级鉴权等级没有设备注册的页面*/}
                        <TabPane key={'8'} tab={'设备注册'}>
                            <DeviceRegister productId={productId} productBaseInfo={productBaseInfo} />
                        </TabPane>
                    }
                    <TabPane key={'9'} tab={'商业化信息'}>
                        <CommercailInfo productId={productId}/>
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}
