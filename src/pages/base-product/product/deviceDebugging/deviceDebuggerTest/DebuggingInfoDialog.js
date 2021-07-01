import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Notification} from '../../../../../components/Notification';
import {Tooltip} from 'antd';
import { post,Paths } from '../../../../../api';
import moment from 'moment';
import { 
    changeDeviceDebugMACDataAction,//改变mac列表数据
    deleteDeviceDebugMacDataAction,//删除mac列表数据
    editDeviceDebugMacDataAction,//编辑录入mac
    addDeviceDebugMacListAction,//新增输入框
    getRenewalAccountAction,//添加调试账号dom
    getDeviceDebugMacList,
    updateDeviceDebugAccountListAction,
    getDeviceDebugAccountListAction
} from '../../store/ActionCreator_debug.js';

import { Modal, Input, Divider } from 'antd';

const mapStateToProps = state => {
    return {
        // deviceDebugAccountList: state.getIn(['product','deviceDebugAccountList']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        changeDeviceDebugMacData: (data) => dispatch(changeDeviceDebugMACDataAction(data)),
        deleteDeviceDebugMacData: (pid,id,data) => dispatch(deleteDeviceDebugMacDataAction(pid,id,data)),
        editDeviceDebugMacData: (data) => dispatch(editDeviceDebugMacDataAction(data)),
        addDeviceDebugMacList: (pid,id) => dispatch(addDeviceDebugMacListAction(pid,id)),
        getDeviceDebugAccountInsert: (pid,account) => dispatch(addDeviceDebugMacListAction(pid,account)),
        getRenewalAccount: (data) => dispatch(getRenewalAccountAction(data)),
        getDeviceDebugMacList: (id) => dispatch(getDeviceDebugMacList(id)),
        updateDeviceDebugAccountList: (data) => dispatch(updateDeviceDebugAccountListAction(data)),
        getDeviceDebugAccountList: (id) => dispatch(getDeviceDebugAccountListAction(id)),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class DebuggingInfoDialog  extends Component {
    constructor(props){
        super(props);
        this.state = {
            macStr:'',
            macInput:'',//编辑mac记录

            editAccount:'',//编辑账号记录
            remark:'',//备注
            addAccountInput:'',//新增账号
            addRemarkInput:'',//新增备注输入
        }
        this.eidtMac = this.eidtMac.bind(this);
        this.macInput = this.macInput.bind(this);
        this.deviceMacAdd = this.deviceMacAdd.bind(this);
        this.addAccountDom = this.addAccountDom.bind(this);
        this.deleteAccountDom = this.deleteAccountDom.bind(this);
        this.accountInput = this.accountInput.bind(this);
        this.productIdInput = this.productIdInput.bind(this);
        this.eidtAccount = this.eidtAccount.bind(this);//账号编辑
        this.deleteAccount = this.deleteAccount.bind(this);//删除账号
        this.eidtAddAccoun = this.eidtAddAccoun.bind(this);//编辑账号
        this.remark = this.remark.bind(this);//备注
        this.addAccountInput = this.addAccountInput.bind(this);//新增账号输入
        this.addAccount = this.addAccount.bind(this);
        this.addRemark = this.addRemark.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);//取消账号编辑
    }
    componentDidMount() {

    }
    //改变mac列表呈现状态
    eidtMac(index){
        let data = this.props.deviceDebugMacList;
        data.data[index].editOrDelete = true;
        this.props.changeDeviceDebugMacData(data);
        this.setState({macInput:data.data[index].mac});
    }
    /**删除mac
     * type:1 已有得删除 2：未添加得删除
     * id 已有得删除为id  未添加得删除为index
     */
    deleteMac = (type,id,) => {
        console.log('type ， id,', type, id);
        if(type==2){//通过index判断是否是新建的mac输入框删除
            let data = this.props.deviceDebugMacList;
            data.data.splice(id,1);
            this.props.deleteDeviceDebugMacData(this.props.pid,id,data);
        }else{
            this.props.deleteDeviceDebugMacData(this.props.pid,id);
        }
    }
    //新增mac
    macAdd = (e) => {
        let macStr = e.target.value;
        this.setState({macStr});
    }
    //修改mac
    macInput(index,e){
        let val = e.target.value;
        let dataMac = this.props.deviceDebugMacList;
        dataMac.data[index].mac = val;
        this.props.editDeviceDebugMacData(dataMac);
    }
    //保存mac 
    insertMac = () => {
        let macStr = this.state.macStr;
        if(!macStr){
            Notification({
                description:'物理地址不能为空!',
                type:'warn'
            });
            return false;
        }
        if (macStr.match(/^[\da-zA-Z]{1,50}$/)) {
            let data = {
                physicalAddr:this.state.macStr,
                productId:+(this.props.pid)//接口参数规定number类型
            };
            post(Paths.addDebugMac,data,{loading:true}).then((model) => {
                if(model.code==0){
                    this.setState({macStr:''},()=>{
                        this.props.getDeviceDebugMacList(this.props.pid);
                    });
                }
            });
        }else{
            Notification({
                description:'物理地址格式错误，应为50位以内的大小写字母加数字组成!',
                type:'warn'
            });
            
            return false;
        }
    }
    deviceMacAdd(){
        let data = this.props.deviceDebugMacList;
        data.data = data.data?data.data:[];//没有物理地址时，返回为null，需要处理一下。
        if(data.data.length>19){
            Notification({
                description:'最多只能添加20个MAC！',
                type:'warn'
            });
            return false;
        }
        data.data.push({});
        this.props.addDeviceDebugMacList(data);
    }
    //添加账号输入框
    addAccountDom(){
        let data = this.props.deviceDebugAccountList;
        if(data.data.length>19){
            Notification({
                description:'最多只能添加20个调试账号！',
                type:'warn'
            });
            return false;
        }
        data.data.push({});
        this.props.getRenewalAccount(data);
    }
    //改变账号列表呈现状态
    eidtAccount(index){
        let data = this.props.deviceDebugAccountList;
        data.data[index].editOrDelete = true;
        this.props.updateDeviceDebugAccountList(data);
        this.setState({
            editAccount:data.data[index].account,//编辑账号记录
            remark:data.data[index].remark,//备注
        });
    }
    //删除账号 
    deleteAccount(productId,debugAccountId){
        post(Paths.deviceDebugAccountDelete,{productId,debugAccountId},{needVersion:1.1,loading:true}).then((model) => {
            if(model.code==0){
                this.props.getDeviceDebugAccountList(productId);//获取调试账号
            }
        });
    }
    //删除账号输入框
    deleteAccountDom(index){
        let data = this.props.deviceDebugAccountList;
        data.data.splice(index,1);
        this.props.getRenewalAccount(data);
    }
    //编辑账号输入
    accountInput(index,e){
        let data = this.props.deviceDebugAccountList;
        data.data[index].account = e.target.value;
        this.props.getRenewalAccount(data);
    }
    //备注
    remark(index,e){
        let data = this.props.deviceDebugAccountList;
        data.data[index].remark = e.target.value;
        this.props.getRenewalAccount(data);
    }
    //取消账号编辑
    cancelEdit(index){
        let { editAccount, remark } = this.state;
        let data = this.props.deviceDebugAccountList;
            data.data[index].account = editAccount;
            data.data[index].remark = remark;
            data.data[index].editOrDelete = false;
        this.props.getRenewalAccount(data);
    }
    //编辑保存
    eidtAddAccoun(index,account,debugAccountId,productId,remarks){
        let {editAccount,remark} = this.state;
        let sign = false;
        let data = {
            productId,
            debugAccountId,
            account,
            remark:remarks
        }
        if(account!=''&&editAccount!=account){
            data.account = account;
            sign = true;
        }
        if(remarks!=''&&remark!=remarks){
            data.remark = remarks;
            sign = true;
        }
        if(!data.account){
            Notification({
                description:'账号不能为空',
                type:'warn'
            });
            
            return false;
        }
        if(sign){//有改变 请求接口 
            post(Paths.deviceDebugAccountInsert,data,{needVersion:1.1,loading:true}).then((model) => {
                if(model.code==0){
                    this.props.getDeviceDebugAccountList(productId);//获取调试账号
                }
            });
        }else{
            let data = this.props.deviceDebugAccountList;
                data.data[index].editOrDelete=false;
            this.props.getRenewalAccount(data);
        }
    }
    //新增账号输入
    addAccountInput(e){
        this.setState({addAccountInput:e.target.value});
    }
    //新增备注输入
    addRemark(e){
        this.setState({addRemarkInput:e.target.value});
    }
    //备注输入
    productIdInput(index,e){
        let data = this.props.deviceDebugAccountList;
        data.data[index].productId=e.target.value;
        this.props.getRenewalAccount(data);
    }
    //保存账号
    addAccount(){
        let {addAccountInput,addRemarkInput} = this.state;
        let productId = this.props.pid;
        if(!addAccountInput){
            Notification({
                description:'账号不能为空',
                type:'warn'
            });
            return false;
        }
        let data = {
            productId,
            account:addAccountInput,
            remark:addRemarkInput
        };
        post(Paths.deviceDebugAccountInsert,data,{needVersion:1.1,loading:true}).then((model) => {
            if(model.code==0){
                this.setState({addAccountInput:''},()=>{
                    this.props.getDeviceDebugAccountList(productId);//获取调试账号
                });
            }
        });
    }
    render() {
        let {editAccount,remark,addAccountInput,addRemarkInput} = this.state;
        let { visible, deviceDebugAccountList, deviceDebugMacList, pid, authorityType } = this.props;
        let authorityClass = '';
        if(authorityType==0){
            authorityClass = '初级安全认证';
        }else if(authorityType==1){
            authorityClass = '中级安全认证';
        }else if(authorityType==2){
            authorityClass = '高级安全认证';
        }
        return (
            <div>
                <Modal
                    title="配置调试信息"
                    visible={visible}
                    onOk={this.props.visibleFun}
                    onCancel={this.props.visibleFun}
                    width='800px'
                    className='debuggingInformation self-modal'
                    maskClosable={false}
                >
                    <div className='debuggingInfo_box'>
                        <div className='title'>调试设备</div>
                        <div className='instructions'>
                            您的产品使用了{/* <span className='explainLink-N' >*/}"{authorityClass}"{/*</span>*/} 能力，
                            {
                            authorityClass === "高级安全认证" ? 
                            <span>
                                每台设备需要烧录平台颁发的设备密钥，进行身份认证通过后才可以激活设备，连接平台通信。使用烧录工具烧录设备ID/设备密钥，让设备连接平台完成激活，再录入设备物理地址即可开始调试。每个产品最多可以添加20个设备进行调试。
                                {/* <a href="https://opendoc.clife.cn/download" target='_blank' >点击下载烧录工具</a>； */}
                            </span>
                            : authorityClass === "中级安全认证" ? <span>
                                每台设备需要烧录所属产品的密钥，并提前在平台注册设备信息，才可以完成身份认证，可以激活设备，连接平台通信。在这里添加设备物理地址可以注册设备，设备激活成功后，即可开始调试。每个产品最多可以添加20个设备进行调试。
                            </span> :
                            <span>
                                每台设备需要烧录所属产品的密钥，进行身份认证通过后才可以激活设备，连接平台通信。设备激活成功后，录入设备的物理地址即可开始调试。每个产品最多可以添加20个设备进行调试。
                            </span>
                        }</div>
                        <div className='macListBox'>
                            {
                                deviceDebugMacList.data&&deviceDebugMacList.data.map((item,index)=>{
                                    return item.physicalAddr?//这里用productId作为是新增添加的mac输入框判断，没有productId就是新增的输入框
                                        <div className='macItem' key={'debuggingInfoMacItem'+index}>
                                            <div className='macOrImei'>
                                                <p>
                                                  <span className='lable'>物理地址：</span>
                                                   <Tooltip title={item.physicalAddr}>
                                                        <span className='details single-text'>{item.physicalAddr}</span>
                                                    </Tooltip>
                                                </p>
                                                <p><span className='lable'>设备ID：</span><Tooltip title={item.id}><span className='details single-text'>{item.id}</span></Tooltip></p>
                                                <p><span className='lable'>设备密钥：</span><Tooltip title={item.deviceSecret}><span className='details single-text'>{item.deviceSecret}</span></Tooltip></p>
                                                <span className='operationBut delete' onClick={this.deleteMac.bind(this,1,item.id)}>删除</span>
                                            </div>
                                        </div>
                                        :
                                        <div className='macItem addDom' key={'debuggingInfoMacItem'+index}>
                                            <Input placeholder='请输入设备物理地址' maxLength={50} defaultValue='' onChange={this.macAdd} />
                                            <span className='operationBut' onClick={this.insertMac.bind(this,2)}>保存</span>
                                            <Divider type='vertical' />
                                            <span className='' onClick={this.deleteMac.bind(this,2,index)}>删除</span>
                                        </div>
                                })
                            }
                            <div className='add' onClick={this.deviceMacAdd}>
                                <span>添加调试设备</span>
                            </div>
                        </div>
                        <div>
                            <div className='title'>调试白名单</div>
                            <table className='table'>
                                <thead>
                                    <tr>
                                        <th style={{width:'10%'}}>账号ID</th>
                                        <th style={{width:'20%'}}>手机号</th>
                                        <th style={{width:'30%'}}>备注</th>
                                        <th style={{width:'25%'}}>添加时间</th>
                                        <th style={{width:'15%'}}>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deviceDebugAccountList.data.map((item,index)=>{
                                        console.log("---", item.createTime, moment(item.createTime).utcOffset(8).format('YYYY-MM-DD HH:mm:ss'), moment(item.createTime).format('YYYY-MM-DD HH:mm:ss'))
                                        return item.editOrDelete?<tr key={'account'+index}>
                                                    <td colSpan='5'>
                                                        <div className='accountBox'>
                                                            <Input placeholder="请输入C-Life账号" maxLength={11} value={item.account} onChange={this.accountInput.bind(this,index)}/>
                                                            <Input placeholder="请输入备注" maxLength={20} value={item.remark} onChange={this.remark.bind(this,index)}/>
                                                            <div className='saveTime'>{moment(item.createTime).utcOffset(-480).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                            <span className='save' onClick={this.eidtAddAccoun.bind(this,index,item.account,item.debugAccountId,item.productId,item.remark)}>保存</span>
                                                            <Divider type="vertical" />
                                                            <span onClick={this.cancelEdit.bind(this,index)}>取消</span>
                                                            <Divider type="vertical" />
                                                            <span onClick={this.deleteAccount.bind(this,pid,item.debugAccountId)}>删除</span>
                                                        </div>
                                                    </td>
                                                </tr>:item.productId?<tr key={'account'+index}>
                                                    <td>{index+1}</td>
                                                    <td>{item.account}</td>
                                                    <td>{item.remark||'-'}</td>
                                                    <td>{moment(item.createTime).utcOffset(-480).format('YYYY-MM-DD HH:mm:ss')}</td>
                                                    <td>
                                                        <span className='save' onClick={this.eidtAccount.bind(this,index)}>编辑</span>
                                                    </td>
                                                </tr>:<tr key={'account'+index}>
                                                    <td colSpan='5'>
                                                        <div className='accountBox'>
                                                            <Input placeholder="请输入C-Life账号" maxLength={11} onChange={this.addAccountInput} value={addAccountInput}/>
                                                            <Input placeholder="请输入备注" maxLength={20} onChange={this.addRemark} value={addRemarkInput}/>
                                                            <div className='saveTime'>{moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}</div>
                                                            <span className='save' onClick={this.addAccount}>保存</span>
                                                            <Divider type="vertical" />
                                                            <span onClick={this.deleteAccountDom.bind(this,index)}>删除</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            })}
                                </tbody>
                            </table>
                        </div>
                        <div className='accountAdd'>
                            {/* <MyIcon className='icon' type="icon-jia"></MyIcon> */}
                            <span onClick={this.addAccountDom}>添加账号</span>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}