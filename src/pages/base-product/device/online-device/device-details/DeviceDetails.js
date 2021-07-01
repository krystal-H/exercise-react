import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Tabs,Pagination,Divider,AutoComplete } from 'antd';
import { getDeviceLabelListAction,getLabelBaseListAction, getDefaultLabelAction } from '../store/ActionCreator';
import { getProtocolLists } from '../../../product/store/ActionCreator';
import { get,post,Paths } from "../../../../../api";
import {Notification} from '../../../../../components/Notification';
import { DateTool } from '../../../../../util/util';
import PageTitle from '../../../../../components/page-title/PageTitle';
import {CheckPermissions} from '../../../../../components/CheckPermissions';
import ActionConfirmModal from '../../../../../components/action-confirm-modal/ActionConfirmModal';
import AloneSection from '../../../../../components/alone-section/AloneSection';
import LabelVisible from '../../../../../components/form-com/LabelVisible';
import LabelTip from '../../../../../components/form-com/LabelTip';
import RemoteConfig from '../../../product/product-details/remote-config/RemoteConfig';
import TopicList from '../../../product/product-details/topic-list/TopicList'
import DeviceShadow from './DeviceShadow';

const { TabPane } = Tabs;
const mapStateToProps = state => {
    return {
        deviceLabelList: state.getIn(['device', 'deviceLabel']).toJS(),
        LabelBaseList: state.getIn(['device', 'deviceLabelBase']).toJS(),
        defaultLabel: state.getIn(['device', 'defaultLabel']).toJS(),
        protocolLists:state.getIn(['product','productProtocolLists']).toJS()
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getDeviceLabelList: data => dispatch(getDeviceLabelListAction(data)),
        getLabelBaseList: data => dispatch(getLabelBaseListAction(data)),
        getDefaultLabel: data => dispatch(getDefaultLabelAction(data)),
        getProtocolLists: id => dispatch(getProtocolLists(id))
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class DeviceDetailt extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pageIndex: 1,
            infodata:{
                productName:"--",//产品名字
                productId:"--",//产品ID
                productType:"--",//产品分类
                productClass:"--",//产品类型
                productCode:"--",//产品编号
                deviceKey:"--",//产品密钥
                deviceUniqueId:"--",//设备编码
                deviceSecret:"--",//设备密钥
                deviceMac:"--",//mac地址/设备IMEI
                activeTime:"",//入网时间
                moduleVersion:"--",//模组固件版本
                pcbVersion:"--",//MCU固件版本
                gateWay:"--",//绑定网关
                deviceSite:"--",//设备所在位置
                deviceName:"--",//设备昵称
                bindUser:"--",//绑定C端用户
                macAddress:"无数据",
                deviceIdentifier:'--',//IMEI
                simNumber:'--',//SIM卡号
                online:'--',//在线状态

            },
            showdeviceKey:false,//是否显示产品秘钥明文
            showdeviceKeyagin:false,//是否显示又一个产品秘钥明文
            showdeviceSecret:false,//是否显示设备秘钥明文
            editid:-1,//正在编辑的标签id
            editkey:'',
            editval:'',
            addkey:'',
            addval:'',
            infoJurisdiction : CheckPermissions('基本信息'),//页面tebs权限判断
			// shadowJurisdiction : CheckPermissions('设备影子'),//页面tebs权限判断
            tagJurisdiction : CheckPermissions('设备标签'),//
            delLabelId:'',//标记将要删除的标签id，为空时，关闭删除确认框
            deleteLoading:false,
            dellabelKey:'',
            dellabelValue:'',
        }
    }

    componentDidMount() {
        this.getDeviceDetailt();
        this.getDeviceLabelList();
        this.getLabelBaseList();
        this.getDefaultLabel();

    }

    // 获取设备详情
    getDeviceDetailt() {
        let deviceId = this.props.match.params.deviceid;
        get(Paths.getDeviceInfo,{ deviceId }).then((model) => {
            if(model.code==0){
                this.setState({infodata:model.data});
            }
        });
    }

    // 获取设备标签列表
    getDeviceLabelList() {
        let pageIndex = this.state.pageIndex,
            deviceId = this.props.match.params.deviceid;
        this.props.getDeviceLabelList({
            deviceId,
            pageIndex,
            pageRows: 10,
        });
    }

    // 获取默认设备标签
    getDefaultLabel(){
        let deviceId = this.props.match.params.deviceid;
        this.props.getDefaultLabel({
            deviceId,
            // pageIndex: 1,
            // pageRows: 20,
            defaultLabel: 1
        });
    }

    // 获取标签库列表
    getLabelBaseList() {
        this.props.getLabelBaseList({
            pageIndex: 1,
            pageRows: 9999,//全部展示在下拉框里
        });
    }

    // 删除设备标签
    deleteOkHandle(){
        let labelId = this.state.delLabelId;
        this.setState({
            deleteLoading:true
        },() => {
            post(Paths.deleteDeviceLabel,{ labelId }).then((model) => {
                this.setState({
                    delLabelId:''
                })
                if(model.code==0){
                    this.getDeviceLabelList();
                }
            }).finally( () => {
                this.setState({
                    deleteLoading:false
                })
            })
        })

    }
    openDelMod(id,key,val){
        this.setState({ delLabelId:id, dellabelKey:key , dellabelValue:val});
    }
    closeDelLabelMod(){
        this.setState({ delLabelId:'' });
    }

    addConfirm(){
        let {addkey,addval} =this.state;
        if(addkey==''||addval==''){
            Notification({
                description:'请将添加输入框补充完整',
                type:'warn'
            });
            
            return false;
        }
        let deviceId = this.props.match.params.deviceid;
        post(Paths.addDeviceLabel,{
            deviceId,
            labelKey:addkey,
            labelValue:addval,

        }).then((model) => {
            if(model.code==0){
                this.setState({addkey:'',addval:''});
                this.getDeviceLabelList();
                this.getLabelBaseList();
            }
        });

    }

    editLabel(id,key,val){
        this.setState({
            editid:id,
            editkey:key,
            editval:val
        });
    }

    onChangeInput(type,value){
        if(value&&value.length>50){
            return false;
        }
        let _state = {};
        _state[type] = value;
        this.setState(_state);
    }

    editConfirm(key,val){//点击编辑并没修改又保存的时候 保存原key value
        let {editid,editkey,editval } =this.state;
        if(editkey==''&&editval==''){
            Notification({
                description:'请将编辑输入框补充完整',
                type:'warn'
            });
            
        }
        post(Paths.updateDeviceLabel,{
            labelId:editid,
            labelKey:editkey||key,
            labelValue:editval||val,
        }).then((model) => {
            if(model.code==0){
                this.setState({editid:-1,editkey:'',editval:''});
                this.getDeviceLabelList();
                this.getLabelBaseList();
            }
        });

    }

    toggleShow = (type) => {
        let setstateobj = {},
            newshow = !this.state[type];
        setstateobj[type] = newshow;
        this.setState(setstateobj);
    };

    getDataSource(key){
        let LabelBaseList = this.props.LabelBaseList,
            keysource = [],valuesource=[];
        LabelBaseList.forEach(item => {
            keysource.push(item.labelTypeName||'无法识别的Key');
            if(key && key == item.labelTypeName){
                item.labelDatas.forEach(label=>{
                    valuesource.push(label.labelName||'无法识别的Value');
                });
            }
        })
        if(key == undefined){ return keysource; }
        return valuesource;

    }

    getListHtml(){
        let list = this.props.deviceLabelList.list || [],
            {editid,editkey,editval} = this.state;
        let html = list.map((item,i) => {
            let {id,labelKey,labelValue,labelCategory} = item;
            if(id == editid){
                return  <tr key={'tr_'+i} >
                            <td>
                                <AutoComplete
                                    value={editkey}
                                    dataSource={this.getDataSource()}
                                    style={{ width: "80%" }}
                                    onChange={this.onChangeInput.bind(this,'editkey')}
                                    placeholder="Key"
                                    filterOption={true}
                                />
                            </td>
                            <td>
                                <AutoComplete
                                    value={editval}
                                    dataSource={this.getDataSource(editkey)}
                                    style={{ width: "80%" }}
                                    onChange={this.onChangeInput.bind(this,'editval')}
                                    placeholder="Value"
                                    filterOption={true}
                                />
                            </td>
                            <td>
                                <a href="javascript:" onClick={this.editConfirm.bind(this,labelKey,labelValue)}>确认</a><Divider type="vertical" />
                                <a href="javascript:" onClick={this.editLabel.bind(this,-1,'','')}>取消</a>
                            </td>
                        </tr>;

            }else{
                return <tr key={'tr_'+i} >
                            <td>{labelKey}</td><td>{labelValue}</td>
                            <td>{
                                labelCategory==1?null:<React.Fragment>
                                <a href="javascript:" onClick={this.editLabel.bind(this,id,labelKey,labelValue)}>编辑</a><Divider type="vertical" />
                                <a href="javascript:" onClick={()=>this.openDelMod(id,labelKey,labelValue)}>删除</a></React.Fragment>

                                }

                            </td>
                        </tr>;
            }
        });
        return html;
    }

    changePage(pageIndex) {
        this.setState({pageIndex}, this.getDeviceLabelList)
    }

    copyText(){
        var e = document.getElementById("copy");
        e.select();
        document.execCommand("Copy");
    }

    tabChangeHandle = (activeKey,productId) => {
        // console.log("tabChangeHandle -> activeKey", activeKey)
        let {getProtocolLists} =  this.props;
        if(activeKey === '3') {
            getProtocolLists(productId)
        }
    }

    render() {
        let {infodata,addkey,addval,pageIndex,infoJurisdiction,tagJurisdiction,delLabelId,deleteLoading, dellabelKey , dellabelValue} = this.state,
            pager = this.props.deviceLabelList.pager,
            { deviceUniqueId,deviceMac,productName,productType,productCode,deviceKey,deviceSecret,productId,productClass,
                activeTime,moduleVersion,pcbVersion,gateWay,deviceName,deviceSite,bindUser,macAddress,deviceIdentifier,simNumber,online,
            } = infodata;
            const { defaultLabel,match:{params:{deviceid:deviceId}},protocolLists } = this.props;
            let lihtml = this.getListHtml();
            const ListItem = ({title, label, type}) => {
                return (
                    <p><span className="title">{title}：</span>
                        {
                            type === "visible" ? <LabelVisible label={label || ""} tip="点击复制" copy={true}/> :
                            <span>{label}</span>
                        }
                    </p>
                )
            }

            return (
            <section className="page-main-wrapper devicepage flex-column">
                <PageTitle title="设备详情"></PageTitle>
                <div className="headerbox">
                    <p className="maintext">
                        <span className="keyvalue"><span className="key">设备ID：</span>{deviceUniqueId}</span>
                        <span className="keyvalue"><span className="key">物理地址：</span>{deviceMac}</span>
                        <span className="keyvalue"><span className="key">产品名称：</span>{productName}</span>
                        <span className="keyvalue"><span className="key">所属分类：</span>{productType}</span>
                        <span className="keyvalue"><span className="key">在线状态：</span>{online&&'在线'||'离线'}</span>
                    </p>
                </div>
                <div>
                    <Tabs defaultActiveKey="1" tabBarStyle={{background: "#fff", padding: "0 24px"}} onChange={(activeKey) => this.tabChangeHandle(activeKey,productId)}>
                        {
                            infoJurisdiction?<TabPane tab="基本信息" key="1">
                            <AloneSection title="设备信息">
                                <div className="device-info">
                                    <ListItem title="设备ID" label={deviceUniqueId}/>
                                    <ListItem title="设备秘钥" label={deviceSecret} type="visible"/>
                                    <ListItem title="物理地址" label={deviceMac}/>
                                    <ListItem title="入网时间" label={activeTime && DateTool.utcToDev(activeTime)}/>
                                    <ListItem title="模组固件版本" label={moduleVersion}/>
                                    <ListItem title="MCU固件版本" label={pcbVersion}/>
                                    <ListItem title="绑定网关" label={gateWay}/>
                                    <ListItem title="设备昵称" label={deviceName}/>
                                    <ListItem title="设备位置" label={deviceSite}/>
                                    <ListItem title="绑定C端账户" label={bindUser}/>
                                    <ListItem title="SIM卡号" label={simNumber}/>
                                    <ListItem title="IMEI" label={deviceIdentifier}/>
                                </div>
                            </AloneSection>
                            <AloneSection title="产品信息">
                                <div className="device-info">
                                    <ListItem title="产品名称" label={productName}/>
                                    <ListItem title="产品ID" label={productId} />
                                    <ListItem title="所属分类" label={productType}/>
                                    <ListItem title="产品类型" label={{"0":"普通设备","1":"网关设备"}[productClass] || "--"}/>
                                    <ListItem title="产品编码" label={productCode}/>
                                    <ListItem title="产品秘钥" label={deviceKey} type="visible"/>
                                </div>
                            </AloneSection>
                        </TabPane>:null
                        }
                        <TabPane tab="topic列表" key="9">
                            <TopicList productIdHex={productCode || "${YourProductKey}"} type={1}></TopicList>
                        </TabPane>
						{
                            'shadowJurisdiction'&&<TabPane tab="设备影子" key="2"><DeviceShadow deviceId={deviceId} /></TabPane>//后台没改好 要发布了 前端写死权限
                        }
                        {
                            tagJurisdiction?<TabPane tab="设备标签" key="4">
                            <AloneSection title={<LabelTip label="默认设备标签" tipPlacement="right"
                                tip={"设备标签是您给产品设备自定义的标识，标签的结构为：Key：value，您可以使用标签功能实现设备的分类统一管理。"} />}>
                                <div className="section-bg tabdevice">
                                    <table className="labeltable" >
                                        <thead >
                                            <tr><th style={{width:"38%"}}>标签Key</th><th style={{width:"62%"}}>标签Value</th><th style={{width:"24%"}}></th></tr>
                                        </thead>
                                        <tbody>
                                            {
                                                defaultLabel.length ? defaultLabel.map((item, index) => 
                                                    <tr key={index}>
                                                        <td>{item.labelKey}</td>
                                                        <td>{item.labelValue}</td>
                                                    </tr>
                                                ) : null
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </AloneSection>

                            <AloneSection title={<LabelTip label="自定义设备标签" tipPlacement="right"
                                 tip={"设备标签是您给产品设备自定义的标识，标签的结构为：Key：value，您可以使用标签功能实现设备的分类统一管理。"} />}>
                                <div className="section-bg tabdevice">
                                    <table className="labeltable" >
                                        <thead >
                                            <tr><th style={{width:"38%"}}>标签Key</th><th style={{width:"38%"}}>标签Value</th><th style={{width:"24%"}}>管理</th></tr>
                                        </thead>
                                        <tbody>
                                            { lihtml }
                                            <tr>
                                                <td>
                                                    <AutoComplete
                                                        value ={addkey}
                                                        dataSource={this.getDataSource()}
                                                        style={{ width: "80%" }}
                                                        onChange={this.onChangeInput.bind(this,'addkey')}
                                                        placeholder="Key"
                                                        maxLength='100'
                                                        filterOption={true}
                                                    />
                                                </td>
                                                <td>
                                                    <AutoComplete
                                                        value={addval}
                                                        dataSource={this.getDataSource(addkey)}
                                                        style={{ width: "80%" }}
                                                        onChange={this.onChangeInput.bind(this,'addval')}
                                                        placeholder="Value"
                                                        maxLength='100'
                                                        filterOption={true}
                                                    />
                                                </td>
                                                <td>
                                                    <a href="javascript:" onClick={this.addConfirm.bind(this)}>确认</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <footer className="list-pagination">
                                        {
                                            pager && pager.totalRows>0 ?
                                            <Pagination className="self-pa"
                                                total={pager.totalRows}
                                                current={pageIndex}
                                                defaultCurrent={1}
                                                defaultPageSize={10}
                                                onChange={(page) => this.changePage(page)}
                                                showTotal={total => <span>共 <a>{total}</a> 条</span>}
                                                showQuickJumper
                                                hideOnSinglePage
                                            ></Pagination> : null
                                        }
                                    </footer>
                                </div>
                            </AloneSection>
                        </TabPane>:null
                        }
                        {
                            <TabPane tab="远程配置" key="3">
                                <RemoteConfig remoteType="device"
                                    productId={productId}
                                    deviceId={this.props.match.params.deviceid}
                                    deviceUniqueId={deviceUniqueId}
                                    macAddress={macAddress}
                                    protocolLists={protocolLists}>
                                </RemoteConfig>
                            </TabPane>
                        }
                    </Tabs>
                </div>
                <ActionConfirmModal
                    visible={!!delLabelId}
                    modalOKHandle={this.deleteOkHandle.bind(this)}
                    modalCancelHandle={this.closeDelLabelMod.bind(this)}
                    targetName={`key: ${dellabelKey}, value: ${dellabelValue}`}
                    confirmLoading={deleteLoading}
                    title={'删除标签'}
                    needWarnIcon={true}
                    descText={'即将删除的标签'}
                ></ActionConfirmModal>
            </section>
        )
    }
}
