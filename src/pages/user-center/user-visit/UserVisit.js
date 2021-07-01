import React, { Component } from 'react';
import {get, Paths} from '../../../api';
import { Input, Button, Table, Divider, Modal, Tooltip, Tag } from 'antd';
import ActionConfirmModal from './../../../components/action-confirm-modal/ActionConfirmModal';
import {AddUserInfo} from './AddUserInfo';
import {Notification} from '../../../components/Notification';
import './userVisit.scss'
import moment from 'moment';

export default class UserVisit extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,//key 列表加载
            userList:[],
            pager:{},
            addUserVisible:false,//添加用户弹窗
            userName:'',//用户名称
            userId:'',//用户id
            startModalVisible:false,//启用弹窗
            forbiddenModalVisible:false,//停用弹窗
            deleteModalVisible:false,//删除弹窗
            deleteInputValue:'',//删除确认框内容
            deleteId:'',//删除的ID
            pageIndex:'',
        };
        this.columns = [
            { title: '用户名', dataIndex: 'userName', key: 'userName',
                render: text => <Tooltip placement="topLeft" title={text}><a>{text}</a></Tooltip>
            },
            { title: '用户角色', dataIndex: 'roleName',  key: 'roleName',
                render:text=> <Tooltip placement="topLeft" title={text}> <span>{text}</span> </Tooltip>
            },
            { title: '账户类型', dataIndex: 'userCategory', key: 'userCategory', width:'170px',
                render: text => (
                    <span>
                      <Tag color={text ==1 ? 'blue' :'green'} >{text ==1 ? '控制台访问用户' :'接口访问用户'}</Tag>
                    </span>
                  )
            },
            { title: '备注', dataIndex: 'remark', key: 'remark',
                render:text=> <Tooltip placement="topLeft" title={text}> <span>{text}</span> </Tooltip>
            },
            { title: '用户状态', dataIndex: 'status', key: 'status', width:'100px',
                render:(text,record)=>(
                    record.status==1?<span className="colordot colordotgreen">正常</span>:<span className="colordot colordotred">停用</span>
                )
            },
            { title: '创建时间', dataIndex: 'regTime', key: 'regTime', width:'160px', render: text => <span>{moment(text).add(8,'h').format('YYYY-MM-DD HH:mm:ss')}</span>},
            { title: '操作', key: 'action', width:'140px',
                render: (text, record) => (
                    <span>
                        <a onClick={this.examine.bind(this,record.userId,record.userCategory)}>查看</a>
                        <Divider type="vertical" />
                        {
                            record.status==1?
                            <a onClick={this.startOrForbidden.bind(this,1,record.userName,record.userId)} style={{color:'#FF3100'}} >停用</a>
                            :
                            <a onClick={this.startOrForbidden.bind(this,0,record.userName,record.userId)}>启用</a>
                        }
                        <Divider type="vertical" />
                        <a onClick={this.delete.bind(this,record.userId)}>删除</a>
                    </span>
                ),
            },
        ];
    }
    //获取账号列表
    getList = (data={}) => {
        get(Paths.getChildlist,data).then((res) => {
            this.setState({
                userList:res.data.list,
                pager:res.data.pager,
                loading:false,
            });
        });
    }
    componentDidMount() {
        this.getList({pageIndex:1,pageRows:10});
    }
    //打开添加用户弹窗
    addUser = () => {
        this.setState({addUserVisible:true});
    }
    //查找
    searchProduct = (userName) => {
        let pageIndex = this.state.pageIndex;
            pageIndex=1;
        this.setState({loading:true,
            userName
       },()=>{
            // this.getList({pageIndex,pageRows:10,userName});
            this.pagerIndex(1);
        });
    }
    examine = (id,userCategory) => {
        window.location.hash = `#/userCenter/look?userId=${id}&userCategory=${userCategory}`;
    }
    //启动或停用
    startOrForbidden = (type,userName,userId) => {
        if(type==1){//禁用
            this.setState({forbiddenModalVisible:true,userName,userId});
        } else if(type==0){//启动
            this.setState({startModalVisible:true,userName,userId});
        }
    }
    //关闭启动弹窗
    startModal = (type) => {
        if(type==1){//1:确认 2：取消
            let {userId,pageIndex} = this.state;
            pageIndex=pageIndex?pageIndex:1;
            get(Paths.unfreezeChild,{userId}).then((res) => {
                if(res.code==0){
                    this.setState({loading:true},()=>{
                        this.getList({pageIndex,pageRows:10});
                    });
                }
            });
        }
        this.setState({startModalVisible:false});
    }
    //关闭禁用弹窗
    forbiddenModal = (type) => {
        if(type==1){//1:确认 2：取消
            let {userId,pageIndex} = this.state;
            pageIndex=pageIndex?pageIndex:1;
            get(Paths.freezeChild,{userId}).then((res) => {
                if(res.code==0){
                    this.setState({loading:true},()=>{
                        this.getList({pageIndex:pageIndex,pageRows:10});
                    });
                }
            });
        }
        this.setState({forbiddenModalVisible:false});
    }
    //删除
    delete = (userId) => {
        this.setState({deleteModalVisible:true,userId});
    }
    //删除确认框输入
    inputOnChangeHandle = (val) => {
        this.setState({ deleteInputValue : val.target.value})
    }
    //删除弹窗关闭
    deleteModal = (type) => {
        if(type==1){//1:确认 2：取消
            if(this.state.deleteInputValue!='delete'){
                Notification({
                    type:'info',
                    description:'请输入delete确认删除！',
                });
                
                return false;
            }
            let {userId,pageIndex,pager} = this.state;
                pageIndex=pageIndex?pageIndex:1;
            get(Paths.deleteChild,{userId}).then((res) => {
                if(res.code==0){
                    this.setState({loading:true,deleteInputValue:''},()=>{
                        pageIndex = (pager.totalRows % ((pageIndex-1)*10))>1?pageIndex:pageIndex-1;
                        this.getList({pageIndex,pageRows:10});
                    });
                }
            });
        }
        this.setState({deleteModalVisible:false});
    }
    //添加用户
    addUserModal = (type) => {
        if(type==1){//1:确认 2：取消
            this.addUserRefs.affirm();
        }else{
            this.setState({addUserVisible:false});
            this.addUserRefs.setState({
                userNameList:[''],//用户名称
                userCategory:1,//用户类型
                roleId:null,//角色ID
                resetSelectId:'',
                password:'',
                ipWhiteSelect:false,//是否提白名单
                ipWhiteList:'',//白名单
                remark:'',//备注
            });
            this.addUserRefs.props.form.resetFields();
        }
    }
    //添加成功取消新建框
    closeAdd = () => {
        this.setState({addUserVisible:false});
    }
    pagerIndex = (pageIndex) => {
        this.setState({pageIndex,loading:true},()=>{
            this.getList({pageIndex,pageRows:10,userName: this.state.userName || undefined});
        });
    }
    render() {
        let { loading, userName, addUserVisible, startModalVisible, forbiddenModalVisible, deleteModalVisible, deleteInputValue,userList, pager } = this.state;
        return (
           <div className='user-visit-box'>
                <header className="page-content-header">
                    <h3 className="page-name">访问用户</h3>
                    <div>
                        <div className='searchBox'>
                            <Input.Search placeholder="请输入用户名查找"
                                enterButton
                                maxLength={20}
                                onSearch={value => this.searchProduct(value)} 
                            />
                        </div>
                        <div className='butFloatRight'>
                            <Button className='but-add' type="primary" onClick={this.addUser}>创建用户</Button>
                        </div>
                    </div>
                </header>
                <div className='commonContentBox'>
                    <div className='centent'>
                        <Table 
                            rowKey="userId"
                            columns={this.columns} 
                            dataSource={userList} 
                            pagination={{
                                defaultCurrent:pager.pageIndex, 
                                total:pager.totalRows, 
                                hideOnSinglePage:false,
                                onChange:this.pagerIndex,
                                current: pager.pageIndex
                            }} 
                            loading={loading} 
                        />
                    </div>
                </div>
                <Modal
                    title="创建用户"
                    visible={addUserVisible}
                    onOk={this.addUserModal.bind(this,1)}
                    onCancel={this.addUserModal.bind(this,2)}
                    maskClosable={false}
                    className="self-modal"
                    footer={null}
                >
                    <AddUserInfo onAddClose={this.closeAdd} onCancel={this.addUserModal.bind(this,2)} pagerIndex={this.pagerIndex} onRef={ref => this.addUserRefs = ref} />
                </Modal>
                <ActionConfirmModal
                    visible={startModalVisible}
                    modalOKHandle={this.startModal.bind(this,1)}
                    modalCancelHandle={this.startModal.bind(this,2)}
                    title={'启用用户'}
                    tipText={'启用用户后，该用户将恢复访问。'}
                    descText={'即将启用用户'}
                    targetName={userName}
                />
                <ActionConfirmModal
                    visible={forbiddenModalVisible}
                    modalOKHandle={this.forbiddenModal.bind(this,1)}
                    modalCancelHandle={this.forbiddenModal.bind(this,2)}
                    title={'停用用户'}
                    tipText={'停用用户后，该用户将暂时无法访问，您可以重新启用账户。'}
                    descText={'即将停用用户'}
                    needWarnIcon={true}
                    targetName={userName}
                />
                <ActionConfirmModal
                    visible={deleteModalVisible}
                    modalOKHandle={this.deleteModal.bind(this, 1)}
                    modalCancelHandle={this.deleteModal.bind(this, 2)}
                    title={'删除用户'}
                    tipText={'删除用户将同步删除UUID和用户SecretKey，无法找回，请谨慎操作。'}
                    descText={'即将删除用户'}
                    needWarnIcon={true}
                    targetName={userName}
                >
                    <Input className="modal-content-input"
                        onChange={this.inputOnChangeHandle}
                        placeholder="请输入“delete”确认删除该用户"
                        maxLength={20}
                        value={deleteInputValue}
                    />
                </ActionConfirmModal>
           </div>
        )
    }
}
