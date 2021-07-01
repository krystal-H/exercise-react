import React, { Component } from 'react';
import {get, Paths} from '../../../api';
import { getUrlParam } from '../../../util/util';
import BasicInformation from './BasicInformation';
import {EditBasicInformation} from './EditBasicInformation';
// import ActionConfirmModal from './../../../components/action-confirm-modal/ActionConfirmModal';
import TreeStructureDisplay from '../../../components/tree-structure-display/TreeStructureDisplay';
import {strToAsterisk} from '../../../util/util';
import PageTitle from '../../../components/page-title/PageTitle';

import {  Tree, Modal, Icon } from 'antd';
import './userLook.scss'


const {TreeNode} = Tree;
export default class UserLook extends Component {
    constructor(props){
        super(props);
        this.state = {
            permissionsTabsKey:'1',//tabs 切换key
            userEditVisible:false,//用户信息编辑
            userInfo:{},
            loading:true,//key 列表加载
            dataTable:[],
            secretKey:'',
            secretId:'',

            productResource:[],//产品服务权限数据
            dataObjRightsList:[],//数据对象权限
            dataDimensionRightsList:[],//数据维度权限
            apiInvokList:[],//api权限数据
            projectAuthList:[],//项目权限
            eye:true,
        };
        this.columns = [
            {
                title: '用户SecretId',
                dataIndex: 'secretId',
                key: 'secretId',
            },
            {
                title: '用户SecretKey',
                dataIndex: 'secret',
                key: 'secret',
                render: text => <a>{this.state.eye?strToAsterisk(text,10):text}{this.state.eye?<Icon className='eyeLeft' type="eye-invisible" onClick={this.clickEye} />:<Icon  className='eyeLeft' type="eye"  onClick={this.clickEye}/>}</a>
            },
            {
                title: '创建时间',
                dataIndex: 'time',
                key: 'time',
            }
        ];
        // this.editUserInfo = this.editUserInfo.bind(this);
    }
    // 获取用户详情
    getChildWithSecret = () => {
        let userId = getUrlParam('userId'),
        userCategory = getUrlParam('userCategory');
        get(Paths.getChildWithSecret,{userId,userCategory},{loading:true}).then((res) => {
            // let dataTable = [
            //     {
            //         key: '1',
            //         secret: res.data.secretKey,
            //         time: res.data.regTime,
            //         secretId: res.data.secretId,
            //     },
            // ];
            this.setState({userInfo:res.data,loading:false,secretKey:res.data.secretKey,secretId:res.data.secretId});
        });
    }
    // 获取权限列表
    getRights(){
        /**
         * 【产品服务】productService
         * 【数据对象】dataObject
         * 【数据维度权限】dataDimension
         */ 
        let userId = getUrlParam('userId'),
        userCategory = getUrlParam('userCategory');
        get(Paths.getRights,{userId,userCategory},{needVersion:1.2,loading:true}).then((model) => {
            let productResource = [],
                dataObjRightsList = [],
                dataDimensionRightsList = [],
                apiInvokList = [],
                projectAuthList=[];
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
                if(item.menuCode=='apiInvok'){
                    apiInvokList = item.checkBoxGroupList;
                }
                if(item.menuCode=='projectAuth'){
                    projectAuthList = item.checkBoxGroupList;
                }
            }
            this.setState({productResource,dataObjRightsList,dataDimensionRightsList,apiInvokList,projectAuthList});
        });
    }
    componentDidMount() {
        this.getChildWithSecret();
        this.getRights();
    }
    clickEye = (state) => {
        this.setState({eye:!this.state.eye});
    }
    renderTreeNodes = data =>
        data.map(item => {
        if (item.children) {
            return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
                {this.renderTreeNodes(item.children)}
            </TreeNode>
            );
        }
        return <TreeNode key={item.key} {...item} />;
    });
    //确认弹窗
    handleOk = () => {
        this.editAffirm.affirm();
    }
    //保存清空关闭
    handleOkCancel = () => {
        this.editAffirm.setState({
            resetChecked:false,
            resetSelectId:null,
            password:null,//密码
            userName:'',//用户名称
            remark:'',//备注
            roleId:null,//角色ID
            ipWhiteSelect:false,//是否提白名单
            ipWhiteList:'',//白名单
        },()=>{
            this.getChildWithSecret();
            this.getRights();
        })
        this.setState({userEditVisible:false});
        console.log('---close');
        this.editAffirm.props.form.resetFields();
    }
    //取消
    handleCancel = (state,e) => {
        this.setState({userEditVisible:false});
        console.log('---close');
        this.editAffirm.props.form.resetFields();
        console.log(this.editAffirm.props.form.getFieldsValue());
    }
    //打开编辑
    editUserInfo = () => {
        if(this.editAffirm){
            this.editAffirm.backfill(this.state.userInfo);
        }
        this.setState({userEditVisible:true});
    }
    render() {
        let { userInfo, secretKey, secretId, userEditVisible, productResource,dataObjRightsList,dataDimensionRightsList,apiInvokList,projectAuthList} = this.state;
        return (
            <div className='user-info-box'>
                <PageTitle backHandle={() => this.props.history.goBack()} title="用户详情" />
                <BasicInformation editUserInfo={this.editUserInfo} userInfo={userInfo} secretKey={secretKey} secretId={secretId}/>
                <TreeStructureDisplay defaultExpandAll={true} userCategory={userInfo.userCategory} productResource={productResource} dataObjRightsList={dataObjRightsList} dataDimensionRightsList={dataDimensionRightsList} apiInvokList={apiInvokList} projectAuthList={projectAuthList} />
                <Modal
                    title="编辑用户信息"
                    visible={userEditVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    className="self-modal"
                    footer={null}
                >
                    <EditBasicInformation userData={userInfo} onCancel={this.handleCancel} onRef={ref => this.editAffirm  = ref} handleClose={this.handleOkCancel}/>
                </Modal>
            </div>
        );
    }
}


