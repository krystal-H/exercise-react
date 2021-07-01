import React, { Component } from 'react';
import { Input, Button, Table, Divider, Tag, Modal,Select } from 'antd';
import { get,Paths } from '../../../api';
import {AddFirmwareDialog} from './AddFirmwareDialog';
import {ReleaseFirmware} from './ReleaseFirmware';
import {ValidationFirmwareDialog} from './ValidationFirmwareDialog';
import { connect } from 'react-redux';
import { DateTool } from '../../../util/util';
import {Notification} from '../../../components/Notification';
import PageTitle from '../../../components/page-title/PageTitle'
import AloneSection from '../../../components/alone-section/AloneSection'
import FlowChart from '../../../components/flow-chart/FlowChart'
import {VERTYPE,STATUSTAG,UPDATESTATUS,PACKAGETYPE} from './store/constData'
import {getProductList,getVersionList,getExtVerLi,sendFirmwareDetails} from './store/actionCreators'
import './FirmwareManagement.scss';
const { Search,Group } = Input;
const { Option } = Select;
const mapStateToProps = state => {
    const {productList,versionList,extVerisonLi} = state.get('otaUpgrade')
    return {
        productList,versionList,extVerisonLi
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getProLi: param => dispatch(getProductList(param)),
        getVersionLi: param => dispatch(getVersionList(param)),
        getExtVerLi: param => dispatch(getExtVerLi(param)),
        sendFirmwareDetails: details => dispatch(sendFirmwareDetails(details)),
        
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class FirmwareManagement  extends Component {
    constructor(props){
        super(props);
        this.refAddFirmware = {}
        this.refValidationFirmware = ()=>{}
        this.state = {
            versionList:[],
            pager:{
                pageIndex:1,
                totalRows:10,
            },
            //搜索字段
            productId:undefined,
            deviceVersionType:undefined,
            deviceVersionName:undefined,
            addFirmwareDialog:false,//增加弹窗
            validationFirmwareDialog:false,//验证弹窗
            deviceVersionId:'',//当前操作（验证、修改验证、发布）的固件id
            validationDetail:{macSet:'',validateType:0},//修改验证 详情
            validationModTit:'验证',
            validateInfo:[
                // {mac:111,upgradeTime:34234123443531,beforeVersion:1.1,updateStatus:2}

            ],//查看验证信息，同时根据validateInfo.lengt>0与否来判断查看验证弹窗是否可见

            releaseFirmwareDialog:false,//升级弹窗
            releasePackageType:0
        }
        
        this.columns = [
            { title: '固件ID', dataIndex: 'deviceVersionId'},
            { title: '固件包名称', dataIndex: 'deviceVersionName'},
            { title: '固件类型', dataIndex: 'deviceVersionType', 
            render:(t=1)=> VERTYPE.find(({id})=> id==t).nam
        },
            { title: '包类型', dataIndex: 'packageType', 
            render:(t=0)=> {
                t = t||0
                return PACKAGETYPE[t]
            }
        },
            { title: '固件包上传创建时间',dataIndex: 'uploadTime',
                render: t => <span>{DateTool.utcToDev(t)}</span>
            },
            { title: '内部版本号', dataIndex: 'mainVersion', },
            { title: '外部版本号', dataIndex: 'extVersion', },
            { title: '运行状态',  dataIndex: 'updateStatus',
              render: u => {
                  const {nam,color} = STATUSTAG[u]
                  return <Tag color={color} >{nam}</Tag>
              }
            },
            { title: '操作',dataIndex: 'action',
                render:(a,recard) => {//runStatus 0：待验证 1：验证中 2：已发布,3 验证完成,4
                    const {
                        runStatus,deviceVersionId,
                        macSet='',validateType=0,
                        productId,totalVersion,
                        deviceVersionType,firmwareVersionType,
                        packageType
                    } = recard
                    return <span>
                        {
                            runStatus==0?<a onClick={()=>{this.openValidation(deviceVersionId)}}>验证</a>:
                            runStatus==1?<>
                                <a onClick={()=>{this.openValidation(deviceVersionId,{macSet,validateType:validateType||0})}}>修改验证</a>
                                <Divider type="vertical" />
                                <a onClick={()=>{this.getValidateInfo(deviceVersionId)}}>查看验证</a>
                            </>:<>
                                {
                                    runStatus!=4&&<>
                                        <a onClick={()=>{this.openRelease({deviceVersionId,packageType},{productId,totalVersion,deviceVersionType,firmwareVersionType})}}>发布</a>
                                        <Divider type="vertical" />
                                    </>
                                }
                                {
                                    runStatus!=3&&<a onClick={()=>{this.toFirmwareDetails(deviceVersionId)}}>查看批次</a>
                                }
                            </>
                        }
                        <Divider type="vertical" />
                        <a onClick={()=>{this.deleteConfirm(deviceVersionId)}}>删除</a>
                    </span>
                },
            },
        ];
        this.valInfoColumns = [
            { title: 'Mac地址', dataIndex: 'macAddress'},
            { title: '验证时间',dataIndex: 'upgradeTime',
                render: t => <span>{DateTool.utcToDev(t)}</span>
            },
            { title: '升级前版本', dataIndex: 'beforeVersion'},
            { title: '验证状态',  dataIndex: 'upgradeStatus',
              render: u => {
                  const {nam,color} = UPDATESTATUS[u]
                  return <Tag color={color} >{nam}</Tag>
              }
            },
            { title: '失败原因', dataIndex: 'remark', 
                render: (r,{upgradeStatus})=>(upgradeStatus==3&&r||'--')
            },
            
        ];
    }
    componentDidMount() {
        this.props.getProLi({pageRows:999})
        this.pagerIndex()
    }
    toFirmwareDetails = deviceVersionId=>{
        window.location.hash = `#/open/bigData/OTA/firmwareDetails/${deviceVersionId}`;
        // this.props.sendFirmwareDetails({...detail})
    }

    changeState=(k,v)=>{
        this.setState({
            [k]:v
        })
    }
    //打开或者关闭弹窗
    switchDialog = (dialog)=>{
        let pre = this.state[dialog]
        this.setState({
            [dialog]:!pre
        })
    }
    openRelease=({deviceVersionId,packageType},params)=>{
        this.props.getExtVerLi(params)
        this.setState({releaseFirmwareDialog:true,deviceVersionId,releasePackageType:packageType})
    }
    openValidation = (deviceVersionId,validationDetail={macSet:'',validateType:0})=>{
        // console.log(111,validationDetail)
        this.setState({
            validationFirmwareDialog:true,
            deviceVersionId,
            validationDetail,
            validationModTit:validationDetail.macSet&&'修改验证'||'验证'
        })
        
    }
    getValidateInfo = deviceVersionId=>{
        get(Paths.otaValiGetinfo,{deviceVersionId}).then(({data}) => {
            let validateInfo = data||[]
            this.setState({validateInfo});
            if(!validateInfo.length){
                Notification({
                    description:'没有查到验证信息',
                });
            }
        });
    }
    closeValidateInfo = ()=>{
        this.setState({validateInfo:[]});
    }
    //删除固件
    deleteConfirm = (deviceVersionId)=> {
        Modal.confirm({
          title: '删除固件',
          content: `即将删除 ID 为 ${deviceVersionId} 的固件，此固件包下各批次的升级设备信息也将一并删除。`,
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk:()=>{
            get(Paths.otaDeleteVer,{deviceVersionId}).then((model) => {
                let {totalRows,pageIndex} = this.state.pager;
                pageIndex = (totalRows % ((pageIndex-1)*10))>1?pageIndex:pageIndex-1;
                this.pagerIndex(pageIndex)
            });
          }
        });
    }
    //获取固件列表
    pagerIndex=(pageIndex=1)=>{
        let {productId,deviceVersionType,deviceVersionName} = this.state
        let params ={pageIndex}
        productId!=-1 && (params.productId = productId)
        deviceVersionType!=-1 && (params.deviceVersionType = deviceVersionType)
        deviceVersionName && (params.deviceVersionName = deviceVersionName)

        this.props.getVersionLi(params)
    }
    closeValiFirm=()=>{
        this.switchDialog('validationFirmwareDialog')
        // this.setState({
        //     validationDetail:{macSet:'',validateType:0}
        // })
    }
    setValidationDetail=(k,v)=>{
        let validationDetail = this.state.validationDetail
        this.setState({
            validationDetail:{...validationDetail,[k]:v}
        })
    }
    render() {
        const {
            addFirmwareDialog,releaseFirmwareDialog,validationFirmwareDialog,
            deviceVersionId,validationDetail,validateInfo,releasePackageType,validationModTit
        } = this.state;
        const {productList,versionList:{list,pager}} = this.props
        const {pageIndex,totalRows} =pager
        
        return (
            <div className="ota-firmware-up">
                <PageTitle noback={true} title="OTA升级" ></PageTitle>
                <AloneSection>
                    <div className="use-service-flow-wrapper">
                        <FlowChart type={3} flowLists={[
                            { title:'步骤一' },
                            { title:'步骤二' },
                            { title:'步骤三' }
                        ]}></FlowChart>
                        <div className="extra-descs">
                            <div className="descs-item">
                                <p>添加升级包，区分不同的MCU、模组、系统，区分整体包、差分包等。</p>
                            </div>
                            <div className="descs-item">
                                <p>配置升级对象，配置升级批次、升级范围、升级时间等升级具体策略。</p>
                            </div>
                            <div className="descs-item">
                                <p>查看升级包各升级批次的具体设备列表，以及各设备的升级状态。</p>
                            </div>
                        </div>
                    </div>
                </AloneSection>
                <div className='commonContentBox'>
                    <div className='centent'>
                        <Group compact className="searchgroupbox">
                            <Select onChange={val=>{this.changeState('productId',val)}} className='proselect' showSearch optionFilterProp="children" defaultValue={-1}>
                                <Option value={-1}>全部产品</Option>
                                {
                                    productList.map(({productId,productName},i)=><Option key={i} value={productId}>{productName}</Option>)
                                }
                            </Select>
                            <Select className='typeselect' defaultValue={-1} onChange={val=>{this.changeState('deviceVersionType',val)}}>
                                <Option value={-1}>全部类型</Option>
                                {
                                    VERTYPE.map(({id,nam},i)=><Option key={i} value={id}>{nam}</Option>)
                                }
                            </Select>
                            <Search placeholder="输入升级包名称查找"
                                className='serachinpt'
                                enterButton
                                maxLength={20}
                                onChange={e=>{this.changeState('deviceVersionName',e.target.value)}}
                                onSearch={()=>{this.pagerIndex(1)}} 
                            />
                        </Group>
                        <Button className='button' onClick={()=>{this.switchDialog('addFirmwareDialog')}} type="primary">添加固件</Button>
                    </div>
                    
                    <div className='listBox'>
                        <Table 
                            rowKey="deviceVersionId"
                            columns={this.columns}
                            dataSource={list}
                            pagination={{
                                defaultCurrent:pageIndex, 
                                total:totalRows, 
                                hideOnSinglePage:false,
                                onChange:this.pagerIndex
                            }} 
                        />
                    </div>
                    <Modal
                        title='新增固件' 
                        visible={addFirmwareDialog}
                        onOk={()=>{this.refAddFirmware.handleSubmit()}}
                        onCancel={()=>{this.switchDialog('addFirmwareDialog');this.refAddFirmware.resetForm()}}
                        width={650}
                        maskClosable={false}
                    >
                        <AddFirmwareDialog
                            onRef={ref=>{this.refAddFirmware = ref}}
                            changeState={this.changeState}
                        />
                    </Modal>
                    {releaseFirmwareDialog&&
                        <Modal 
                            title='发布固件' 
                            visible={true}
                            width={660}
                            onCancel={()=>{this.switchDialog('releaseFirmwareDialog')}}
                            footer={null}
                            maskClosable={false}
                        >
                            <ReleaseFirmware packageType={releasePackageType} deviceVersionId={deviceVersionId} close={()=>{this.switchDialog('releaseFirmwareDialog')}} />
                        </Modal>
                    }
                    <Modal 
                        title={validationModTit} 
                        visible={validationFirmwareDialog}
                        onOk={()=>{this.refValidationFirmware()}}
                        onCancel={this.closeValiFirm}
                        width={650}
                        maskClosable={false}
                    >
                        <ValidationFirmwareDialog 
                            deviceVersionId={deviceVersionId}
                            validationDetail={{...validationDetail}}
                            setValidationDetail= {this.setValidationDetail}
                            pagerIndex={this.pagerIndex}
                            pageIndex={pageIndex}
                            onRef={ref=>{this.refValidationFirmware = ref}}
                            close = {this.closeValiFirm}
                        />
                    </Modal>
                    <Modal 
                        title='验证信息' 
                        visible={!!validateInfo.length}
                        onCancel={this.closeValidateInfo}
                        width={800}
                        footer={null}
                        maskClosable={false}
                    >
                        <Table rowKey="macAddress" columns={this.valInfoColumns} dataSource={validateInfo} pagination={false} />
                    </Modal>
                </div>
            </div>
        )
    }
}
