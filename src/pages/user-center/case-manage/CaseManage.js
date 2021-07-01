import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Input, Button, Table, Divider, Modal, Tooltip ,Form} from 'antd';
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal';
import {AddForm} from './addForm';
import {ApplyForForm} from './applyForForm';
import {Notification} from '../../../components/Notification';


import './caseManage.scss'
import moment from 'moment';

export default class CaseManage extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,//key 列表加载
            caseList:[],
            pager:{},
            searchName:'',//搜索框
            name:'',// 当前操作的实例名称
            id:'',//当前操作的实例id
            addCaseVisible:false,//新增实例弹窗
            updatetype:2, //启动或停用弹窗是否可见, 2-不可见，0-可见启用，1-可见停用
            pageIndex:'1',
            applyForVisible:false,//资源申请弹窗
        };
        this.columns = [
            { title: '实例名称', dataIndex: 'name', key: 'name',
                render: text => <Tooltip placement="topLeft" title={text}><span>{text}</span></Tooltip>
            },
            { title: '实例状态', dataIndex: 'status',  key: 'status',width:'100px',
                render:(text,record)=> {
                    let txt = {'0':'可用','1':'不可用'}[record.status];
                    return <Tooltip placement="topLeft" title={txt}> <span>{txt}</span> </Tooltip>
                }
            },
            { title: '备注', dataIndex: 'desc', key: 'desc',
                render:text=> <Tooltip placement="topLeft" title={text}> <span>{text}</span> </Tooltip>
            },
            { title: '创建时间', dataIndex: 'createTime', key: 'createTime', width:'160px', 
                render: text => <span>{moment(text).add(8, 'h').format('YYYY-MM-DD HH:mm:ss')}</span>
            },
            { title: '创建人', dataIndex: 'createUser', key: 'createUser',
                render: text => <Tooltip placement="topLeft" title={text}><span>{text}</span></Tooltip>
            },
            { title: '可用资源', dataIndex: 'availableRes', key: 'availableRes', 
            render: text => <Tooltip placement="topLeft" title={text}><span>{text}</span></Tooltip>
            },
            { title: '操作', key: 'action', width:'140px',
                render: (text, {id,name,status,type}) => (
                    <span>
                        <a onClick={this.openApplySource.bind(this,id)} >资源申请</a>
                        {
                            type!==0 && <>
                            <Divider type="vertical" />
                            {
                                status==0?
                                <a onClick={this.startOrForbidden.bind(this,1,name,id)} style={{color:'#FF3100'}} >停用</a>
                                :
                                <a onClick={this.startOrForbidden.bind(this,0,name,id)}>启用</a>
                            }
                            </>

                        }
                    </span>
                ),
            },
        ];
    }
    //获取实例列表
    getList = (data={}) => {
        get(Paths.getCasePageList,data).then((res) => {
            this.setState({
                caseList:res.data.list,
                pager:res.data.pager,
                loading:false,
            });
        });
    }
    componentDidMount() {
        this.getList({pageIndex:1,pageRows:10});
    }
    //打开新增实例弹窗
    addCase = () => {
        this.setState({addCaseVisible:true});
    }
    //查找
    searchCase = (searchName) => {
        this.setState({loading:true,
            searchName
       },()=>{
            this.pagerIndex(1);
        });
    }
    //启动或停用
    startOrForbidden = (type,name,id) => {
        this.setState({updatetype:type,name,id});
    }
    //启动或停用的弹窗操作
    startOrForbiddenModal = (type)=>{
        if(type=='ok'){// 点击确认
            let {id,pageIndex,updatetype} = this.state;
            pageIndex=pageIndex?pageIndex:1;
            post(Paths.updateCaseStatus,{status:updatetype,id}).then((res) => {
                if(res.code==0){
                    this.setState({loading:true},()=>{
                        this.getList({pageIndex,pageRows:10});
                    });
                }
            });
        }
        this.setState({updatetype:2}); 
    }
    //添加实例
    addUserModal = (type) => {
        if(type==1){//1:确认 2：取消
            this.addUserRefs.affirm();
        }else{
            this.closeAdd();
            // this.setState({addCaseVisible:false});
            this.addUserRefs.props.form.resetFields();
        }
    }
    closeAdd = () => {
        this.setState({addCaseVisible:false});
    }
    pagerIndex = (pageIndex) => {
        this.setState({pageIndex,loading:true},()=>{
            this.getList({pageIndex,pageRows:10,name: this.state.searchName || undefined});
        });
    }
    //打开/关闭申请资源弹窗
    openApplySource = (id) => {
        console.log('--id--',id);
        if(id!=-1){
            this.setState({applyForVisible:true,id});
        }else{

            this.setState({applyForVisible:false});
            this.applyForRefs.props.form.resetFields();
        }
    }
    applyOk = ()=>{
        let form = this.applyForRefs.props.form;
        let id = this.state.id;
        const { validateFieldsAndScroll } = form;
        validateFieldsAndScroll((err, values) => {
            let {namespaceCpu,namespaceMemory,namespaceStorage} = values;
            if(!err){
                post(Paths.applySource,{namespaceCpu,namespaceMemory,namespaceStorage,id}).then((res) => {
                    if(res.code==0){
                        Notification({type:'success',description:'资源申请成功！'});
                        this.openApplySource(-1);
                        this.pagerIndex(1);
                    }
                });
            }
            
            
        });

    }
    render() {
        let { loading, name, addCaseVisible, updatetype,caseList, pager,applyForVisible } = this.state;
        let editvisible = updatetype!=2, edittypetxt='';
        if(editvisible){
            edittypetxt = updatetype==0?'启用':'停用';
        }
        return (
           <div className='user-visit-box'>
                <header className="page-content-header">
                    <h3 className="page-name">实例管理</h3>
                    <div>
                        <div className='searchBox'>
                            <Input.Search placeholder="请输入实例名查找"
                                enterButton
                                maxLength={20}
                                onSearch={value => this.searchCase(value)} 
                            />
                        </div>
                        <div className='butFloatRight'>
                            <Button className='but-add' type="primary" onClick={this.addCase}>新增实例</Button>
                        </div>
                    </div>
                </header>
                <div className='commonContentBox'>
                    <div className='centent'>
                        <Table 
                            rowKey="id"
                            columns={this.columns} 
                            dataSource={caseList} 
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
                    title="新增实例"
                    visible={addCaseVisible}
                    width={800}
                    onOk={this.addUserModal.bind(this,1)}
                    onCancel={this.addUserModal.bind(this,2)}
                    maskClosable={false}
                >
                    <AddForm onRef={ref => this.addUserRefs = ref} onAddClose={this.closeAdd} pagerIndex={this.pagerIndex} ></AddForm>
                </Modal>

                <Modal
                    title="资源申请"
                    visible={applyForVisible}
                    width={500}
                    onOk={this.applyOk}
                    onCancel={this.openApplySource.bind(this,-1)}
                    maskClosable={false}
                >
                    <ApplyForForm onRef={ref => this.applyForRefs = ref} ></ApplyForForm>
                </Modal>

                <ActionConfirmModal
                    visible={editvisible}
                    modalOKHandle={this.startOrForbiddenModal.bind(this,'ok')}
                    modalCancelHandle={this.startOrForbiddenModal.bind(this,'cancel')}
                    title={`${edittypetxt}实例`}
                    descText={`即将${edittypetxt}实例`}
                    targetName={name}
                    needWarnIcon={updatetype==1}
                />
           </div>
        )
    }
}
