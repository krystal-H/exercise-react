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
                productName:"--",//????????????
                productId:"--",//??????ID
                productType:"--",//????????????
                productClass:"--",//????????????
                productCode:"--",//????????????
                deviceKey:"--",//????????????
                deviceUniqueId:"--",//????????????
                deviceSecret:"--",//????????????
                deviceMac:"--",//mac??????/??????IMEI
                activeTime:"",//????????????
                moduleVersion:"--",//??????????????????
                pcbVersion:"--",//MCU????????????
                gateWay:"--",//????????????
                deviceSite:"--",//??????????????????
                deviceName:"--",//????????????
                bindUser:"--",//??????C?????????
                macAddress:"?????????",
                deviceIdentifier:'--',//IMEI
                simNumber:'--',//SIM??????
                online:'--',//????????????

            },
            showdeviceKey:false,//??????????????????????????????
            showdeviceKeyagin:false,//???????????????????????????????????????
            showdeviceSecret:false,//??????????????????????????????
            editid:-1,//?????????????????????id
            editkey:'',
            editval:'',
            addkey:'',
            addval:'',
            infoJurisdiction : CheckPermissions('????????????'),//??????tebs????????????
			// shadowJurisdiction : CheckPermissions('????????????'),//??????tebs????????????
            tagJurisdiction : CheckPermissions('????????????'),//
            delLabelId:'',//???????????????????????????id????????????????????????????????????
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

    // ??????????????????
    getDeviceDetailt() {
        let deviceId = this.props.match.params.deviceid;
        get(Paths.getDeviceInfo,{ deviceId }).then((model) => {
            if(model.code==0){
                this.setState({infodata:model.data});
            }
        });
    }

    // ????????????????????????
    getDeviceLabelList() {
        let pageIndex = this.state.pageIndex,
            deviceId = this.props.match.params.deviceid;
        this.props.getDeviceLabelList({
            deviceId,
            pageIndex,
            pageRows: 10,
        });
    }

    // ????????????????????????
    getDefaultLabel(){
        let deviceId = this.props.match.params.deviceid;
        this.props.getDefaultLabel({
            deviceId,
            // pageIndex: 1,
            // pageRows: 20,
            defaultLabel: 1
        });
    }

    // ?????????????????????
    getLabelBaseList() {
        this.props.getLabelBaseList({
            pageIndex: 1,
            pageRows: 9999,//???????????????????????????
        });
    }

    // ??????????????????
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
                description:'?????????????????????????????????',
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

    editConfirm(key,val){//?????????????????????????????????????????? ?????????key value
        let {editid,editkey,editval } =this.state;
        if(editkey==''&&editval==''){
            Notification({
                description:'?????????????????????????????????',
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
            keysource.push(item.labelTypeName||'???????????????Key');
            if(key && key == item.labelTypeName){
                item.labelDatas.forEach(label=>{
                    valuesource.push(label.labelName||'???????????????Value');
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
                                <a href="javascript:" onClick={this.editConfirm.bind(this,labelKey,labelValue)}>??????</a><Divider type="vertical" />
                                <a href="javascript:" onClick={this.editLabel.bind(this,-1,'','')}>??????</a>
                            </td>
                        </tr>;

            }else{
                return <tr key={'tr_'+i} >
                            <td>{labelKey}</td><td>{labelValue}</td>
                            <td>{
                                labelCategory==1?null:<React.Fragment>
                                <a href="javascript:" onClick={this.editLabel.bind(this,id,labelKey,labelValue)}>??????</a><Divider type="vertical" />
                                <a href="javascript:" onClick={()=>this.openDelMod(id,labelKey,labelValue)}>??????</a></React.Fragment>

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
                    <p><span className="title">{title}???</span>
                        {
                            type === "visible" ? <LabelVisible label={label || ""} tip="????????????" copy={true}/> :
                            <span>{label}</span>
                        }
                    </p>
                )
            }

            return (
            <section className="page-main-wrapper devicepage flex-column">
                <PageTitle title="????????????"></PageTitle>
                <div className="headerbox">
                    <p className="maintext">
                        <span className="keyvalue"><span className="key">??????ID???</span>{deviceUniqueId}</span>
                        <span className="keyvalue"><span className="key">???????????????</span>{deviceMac}</span>
                        <span className="keyvalue"><span className="key">???????????????</span>{productName}</span>
                        <span className="keyvalue"><span className="key">???????????????</span>{productType}</span>
                        <span className="keyvalue"><span className="key">???????????????</span>{online&&'??????'||'??????'}</span>
                    </p>
                </div>
                <div>
                    <Tabs defaultActiveKey="1" tabBarStyle={{background: "#fff", padding: "0 24px"}} onChange={(activeKey) => this.tabChangeHandle(activeKey,productId)}>
                        {
                            infoJurisdiction?<TabPane tab="????????????" key="1">
                            <AloneSection title="????????????">
                                <div className="device-info">
                                    <ListItem title="??????ID" label={deviceUniqueId}/>
                                    <ListItem title="????????????" label={deviceSecret} type="visible"/>
                                    <ListItem title="????????????" label={deviceMac}/>
                                    <ListItem title="????????????" label={activeTime && DateTool.utcToDev(activeTime)}/>
                                    <ListItem title="??????????????????" label={moduleVersion}/>
                                    <ListItem title="MCU????????????" label={pcbVersion}/>
                                    <ListItem title="????????????" label={gateWay}/>
                                    <ListItem title="????????????" label={deviceName}/>
                                    <ListItem title="????????????" label={deviceSite}/>
                                    <ListItem title="??????C?????????" label={bindUser}/>
                                    <ListItem title="SIM??????" label={simNumber}/>
                                    <ListItem title="IMEI" label={deviceIdentifier}/>
                                </div>
                            </AloneSection>
                            <AloneSection title="????????????">
                                <div className="device-info">
                                    <ListItem title="????????????" label={productName}/>
                                    <ListItem title="??????ID" label={productId} />
                                    <ListItem title="????????????" label={productType}/>
                                    <ListItem title="????????????" label={{"0":"????????????","1":"????????????"}[productClass] || "--"}/>
                                    <ListItem title="????????????" label={productCode}/>
                                    <ListItem title="????????????" label={deviceKey} type="visible"/>
                                </div>
                            </AloneSection>
                        </TabPane>:null
                        }
                        <TabPane tab="topic??????" key="9">
                            <TopicList productIdHex={productCode || "${YourProductKey}"} type={1}></TopicList>
                        </TabPane>
						{
                            'shadowJurisdiction'&&<TabPane tab="????????????" key="2"><DeviceShadow deviceId={deviceId} /></TabPane>//??????????????? ???????????? ??????????????????
                        }
                        {
                            tagJurisdiction?<TabPane tab="????????????" key="4">
                            <AloneSection title={<LabelTip label="??????????????????" tipPlacement="right"
                                tip={"???????????????????????????????????????????????????????????????????????????Key???value??????????????????????????????????????????????????????????????????"} />}>
                                <div className="section-bg tabdevice">
                                    <table className="labeltable" >
                                        <thead >
                                            <tr><th style={{width:"38%"}}>??????Key</th><th style={{width:"62%"}}>??????Value</th><th style={{width:"24%"}}></th></tr>
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

                            <AloneSection title={<LabelTip label="?????????????????????" tipPlacement="right"
                                 tip={"???????????????????????????????????????????????????????????????????????????Key???value??????????????????????????????????????????????????????????????????"} />}>
                                <div className="section-bg tabdevice">
                                    <table className="labeltable" >
                                        <thead >
                                            <tr><th style={{width:"38%"}}>??????Key</th><th style={{width:"38%"}}>??????Value</th><th style={{width:"24%"}}>??????</th></tr>
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
                                                    <a href="javascript:" onClick={this.addConfirm.bind(this)}>??????</a>
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
                                                showTotal={total => <span>??? <a>{total}</a> ???</span>}
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
                            <TabPane tab="????????????" key="3">
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
                    title={'????????????'}
                    needWarnIcon={true}
                    descText={'?????????????????????'}
                ></ActionConfirmModal>
            </section>
        )
    }
}
