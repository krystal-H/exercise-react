import React, { Component } from 'react';
import { Input, Button, Table, Divider, Tag, Modal } from 'antd';
import DescWrapper from '../../../../../components/desc-wrapper/DescWrapper';
import { get,Paths } from '../../../../../api';
import {AddFirmwareDialog} from './AddFirmwareDialog';
import {ReleaseFirmware} from './ReleaseFirmware';
import {ValidationFirmwareDialog} from './ValidationFirmwareDialog';
import { connect } from 'react-redux';
import moment from 'moment';


import './FirmwareManagement.scss';

const desc = [
    '温馨提示：',
    '1. 产品支持整包以及差分包的上传升级；',
    '2. 差分包需厂商自行完成差分包生成，以及设备的差分还原程序开发；',
    '3. 固件包支持多批次的发布，以及发布对象设备的查看管理；',
    '4. 可在消息中心查看设备OTA失败详细信息；'
];


const { Search } = Input;
const { confirm } = Modal;


const mapStateToProps = state => {
    return {
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getCatalogList: () => dispatch(getCatalogListAction()),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class FirmwareManagement  extends Component {
    constructor(props){
        super(props);
        this.state = {
            versionList:[],
            pager:{
                pageIndex:1,
                totalRows:1,
            },
            addFirmwareDialog:false,//发布弹窗
            releaseFirmwareDialog:false,//升级弹窗
            validationFirmwareDialog:false,//验证弹窗
            deviceVersionId:'',//固件id
            releaseState:null,//是否发布，用于获取编辑发布时候得详情
            validationState:'',//是否验证，用于获取修改验证时候得详情,
            macListOperationRecords:false,//记录是否操作过mac-发布
            macListValidationRecords:false,//记录是否操作过mac-验证
        }
        this.search = this.search.bind(this);
        this.addFirmware = this.addFirmware.bind(this);
        this.releaseFirmware = this.releaseFirmware.bind(this);
        this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
        this.validationFirmware = this.validationFirmware.bind(this);
        this.pagerIndex = this.pagerIndex.bind(this);
        this.columns = [
            {
              title: '固件ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
                title: '固件类型',
                dataIndex: 'firmwareVersionTypeName',
                key: 'firmwareVersionTypeName',
            },
            {
                title: '固件标识',
                dataIndex: 'deviceVersionTypeName',
                key: 'deviceVersionTypeName',
            },
            {
                title: '内部版本号',
                dataIndex: 'mainVersion',
                key: 'mainVersion',
            },
            {
                title: '外部版本号',
                dataIndex: 'extVersion',
                key: 'extVersion',
            },
            {
              title: '时间',
              dataIndex: 'releaseTime',
              key: 'releaseTime',
            },
            {
              title: '状态',
              key: 'updateStatus',
              dataIndex: 'updateStatus',
              render: updateStatus => (
                <span>
                  {updateStatus.map((tag,index) => {
                    let color = tag =='已发布' ? 'green' :tag =='待验证'? 'blue':'gold';
        
                    return (<Tag color={color} key={'tag'+index}>{tag}</Tag>);
                  })}
                </span>
              ),
            },
            {
                title: '操作',
                key: 'tags',
                dataIndex: 'tags',
                render:(tags,record) => (
                    <span>
                        {tags.map((item,index)=>{
                            {/* ['修改发布'] ['验证','删除'] ['发布','修改验证','删除'] */}
                            if(tags.length==1){
                                {/* 修改发布 */}
                                return (<span key={'tags'+index}>
                                            <a onClick={this.releaseFirmware.bind(this,'',record.id,record.releaseObj)}>{item}</a>
                                        </span>)
                            }else if(tags.length==2){
                                if(index==0){
                                    {/* 验证 */}
                                    return(<span key={'tags'+index}>
                                        <a onClick={this.validationFirmware.bind(this,'',record.id,'')}>{item}</a>
                                        <Divider type="vertical" />
                                    </span>)
                                }else{
                                    {/* 删除 */}
                                    return(<span key={'tags'+index}>
                                        <a onClick={this.showDeleteConfirm.bind(this,record.id)}>{item}</a>
                                    </span>)
                                }
                            }else if(tags.length==3){
                                {/* ['发布','修改验证','删除'] */}
                                if(index==0){
                                    {/* 发布 */}
                                    return(<span key={'tags'+index}>
                                        <a onClick={this.releaseFirmware.bind(this,'',record.id,'')}>{item}</a>
                                        <Divider type="vertical" />
                                    </span>)
                                }else if(index==1){
                                    {/* 修改验证 */}
                                    return(<span key={'tags'+index}>
                                        <a onClick={this.validationFirmware.bind(this,'',record.id,record.macSet)}>{item}</a>
                                        <Divider type="vertical" />
                                    </span>)
                                }else if(index==2){
                                    {/* 删除 */}
                                    return(<span key={'tags'+index}>
                                        <a onClick={this.showDeleteConfirm.bind(this,record.id)}>{item}</a>
                                    </span>)
                                }
                            }
                        })}
                    </span>
                ),
            },
        ];
    }
    componentDidMount() {
        if(this.props.productId){
            get(Paths.versionList,{productId:this.props.productId,pageIndex:1,pageRows:10}).then((model) => {
                let versionList = this.listData(model.data.list);
                this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
            });
        }
    }
    componentDidUpdate(prevProps){
        if(this.props.productBaseInfo.bindType&&(prevProps.productBaseInfo.productId!=this.props.productId)){
            let pageIndex = this.state.pager.pageIndex?this.state.pager.pageIndex:1
            get(Paths.versionList,{productId:this.props.productId,pageIndex,pageRows:10}).then((model) => {
                let versionList = this.listData(model.data.list);
                this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
            });
        }
    }
    //列表数据处理
    listData(data){
        let arr = [];
        data.map((item,index)=>{
            // updateStatus  0：待验证 1：验证中 2：已发布
            return arr.push({
                key: index,
                id: item.deviceVersionId,
                firmwareVersionTypeName:item.firmwareVersionTypeName,
                deviceVersionTypeName:item.totalVersion,//
                mainVersion:item.mainVersion,
                extVersion:item.extVersion,
                releaseTime: moment(item.releaseTime).format('YYYY-MM-DD HH:mm:ss'),
                updateStatus: item.updateStatus==2?['已发布']:item.updateStatus==0?['待验证']:['验证中'],
                tags: item.updateStatus==2?['修改发布']:item.updateStatus==0?['验证','删除']:['发布','修改验证','删除'],
                macSet:item.macSet,
                releaseObj:{
                    upgradeType:item.status,//0-静默 1-普通 2-强制
                    status:item.upgradeType,//0-全部升级 1-指定升级
                    releaseNote:item.releaseNote,
                    macSet:item.macSet
                }
            });
        });
        return arr;
    }
    //搜索
    search(value){
        get(Paths.versionList,{totalVersion:value,productId:this.props.productId,pageIndex:1,pageRows:10}).then((model) => {
            let versionList = this.listData(model.data.list);
            this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
        });
    }
    //添加固件，弹窗控制   str: 是否请求列表
    addFirmware(str){
        if(str){
            get(Paths.versionList,{productId:this.props.productId,pageIndex:1,pageRows:10}).then((model) => {
                let versionList = this.listData(model.data.list);
                this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
            });  
        }
        this.setState({addFirmwareDialog:!this.state.addFirmwareDialog});
    }
    /**
     * 验证固件弹窗
     * @param {*} str 是否请求列表
     * @param {*} id 固件id
     * @param {*} validationState 详情值
     */
    validationFirmware(str,id,validationState){
        if(str){
            get(Paths.versionList,{productId:this.props.productId,pageIndex:1,pageRows:10}).then((model) => {
                let versionList = this.listData(model.data.list);
                this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
            });  
        }
        this.setState({validationFirmwareDialog:!this.state.validationFirmwareDialog,deviceVersionId:id,validationState:validationState||'',macListValidationRecords:false});
    }
    /**
     * 发布弹窗控制
     * @param {*} str 是否请求列表
     * @param {*} id 固件id
     * @param {*} releaseState 详情值
     */
    releaseFirmware(str,id,releaseState){
        if(str){
            get(Paths.versionList,{productId:this.props.productId,pageIndex:1,pageRows:10}).then((model) => {
                let versionList = this.listData(model.data.list);
                this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
            });  
        }
        this.setState({releaseFirmwareDialog:!this.state.releaseFirmwareDialog,deviceVersionId:id,releaseState:releaseState||'',macListOperationRecords:false});
    }
    macListOperationRecordsFunc = () => {
        this.setState({macListOperationRecords:true});
    }
    macListValidationRecordsFunc = () => {
        this.setState({macListValidationRecords:true});
    }
    //删除弹窗控制
    showDeleteConfirm(deviceVersionId) {
        let _this = this;
        confirm({
          title: '固件删除',
          content: '你确定要删除此固件吗？',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk() {
            get(Paths.versionDelete,{deviceVersionId}).then((model) => {
                if(model.code==0){
                    let {totalRows,pageIndex} = _this.state.pager;
                    pageIndex = (totalRows % ((pageIndex-1)*10))>1?pageIndex:pageIndex-1;

                    get(Paths.versionList,{productId:_this.props.productId,pageIndex:pageIndex,pageRows:10}).then((model) => {
                        let versionList = _this.listData(model.data.list);
                        _this.setState({versionList,bindType:_this.props.productBaseInfo.bindType,pager:model.data.pager});
                    });
                }
            });
          },
          onCancel() {},
        });
    }
    pagerIndex(index){
        get(Paths.versionList,{productId:this.props.productId,pageIndex:index,pageRows:10}).then((model) => {
            let versionList = this.listData(model.data.list);
            this.setState({versionList,bindType:this.props.productBaseInfo.bindType,pager:model.data.pager});
        }); 
    }
    render() {
        let {versionList,pager,macListOperationRecords,addFirmwareDialog,releaseState,bindType,releaseFirmwareDialog,validationFirmwareDialog,validationState,deviceVersionId,macListValidationRecords} = this.state;
        return (
            <div className="firmware_management">
                <div className='commonContentBox'>
                    <div className="centent">
                        < DescWrapper desc={desc} />
                    </div>
                    <div className='fonction_fence'>
                        <span>固件标识：</span>
                        <div className='searchBox'>
                            <Search placeholder="请输入固件" onSearch={value => this.search(value)} enterButton />
                        </div>
                        <Button className='button' onClick={this.addFirmware} type="primary">添加固件</Button>
                    </div>
                    <div className='listBox'>
                        <Table 
                            columns={this.columns} 
                            dataSource={versionList} 
                            pagination={{
                                defaultCurrent:pager.pageIndex, 
                                total:pager.totalRows, 
                                hideOnSinglePage:false,
                                onChange:this.pagerIndex
                            }} 
                        />
                    </div>
                    <Modal
                        title='新建固件' 
                        visible={addFirmwareDialog}
                        onOk={this.addFirmware}
                        onCancel={this.addFirmware}
                        width={600}
                        footer={null}
                        maskClosable={false}
                    >
                        <AddFirmwareDialog bindType={bindType} addFirmware={this.addFirmware} productId={this.props.productId} />
                    </Modal>
                    <Modal 
                        title='发布固件' 
                        visible={releaseFirmwareDialog}
                        onOk={this.releaseFirmware}
                        onCancel={this.releaseFirmware}
                        width={600}
                        footer={null}
                        maskClosable={false}
                    >
                        <ReleaseFirmware releaseState={releaseState} deviceVersionId={deviceVersionId} bindType={bindType} releaseFirmware={this.releaseFirmware} productId={this.props.productId} macListOperationRecords={macListOperationRecords} macListOperationRecordsFunc={this.macListOperationRecordsFunc} />
                    </Modal>
                    <Modal 
                        title='验证固件' 
                        visible={validationFirmwareDialog}
                        onOk={this.validationFirmware}
                        onCancel={this.validationFirmware}
                        width={600}
                        footer={null}
                        maskClosable={false}
                    >
                        <ValidationFirmwareDialog deviceVersionId={deviceVersionId} validationState={validationState} validationFirmware={this.validationFirmware} macListValidationRecords={macListValidationRecords} macListValidationRecordsFunc={this.macListValidationRecordsFunc} />
                    </Modal>
                </div>
            </div>
        )
    }
}