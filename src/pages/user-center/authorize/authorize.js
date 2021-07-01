import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Input, Button, Table, Select, Modal, Tooltip, Tag ,Form} from 'antd';
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal';
import {AddForm} from './addForm';
import CancelMod from './cancelMod';
import { Notification } from '../../../components/Notification';
import './authorize.scss';
import { DateTool } from '../../../util/util';
const {Option} = Select;
const TOTYPE = ['产品','设备分组','数据资产源','API权限调用'];

export default class Authorize extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,//key 列表加载
            caseList:[],
            pager:{},
            searchName:'',//搜索框
            name:'',// 当前操作的授权名称
            id:'',//当前操作的授权id
            addCaseVisible:false,//新增授权弹窗
            cancelVisible:false,
            pageIndex:'1',

            cancelData:false,
            authType:0,
        };
        this.columns = [
            { title: '授权对象名称', dataIndex: 'name', key: 'name'},
            { title: '授权对象类型', dataIndex: 'authType',  key: 'authType',
                render:text=><span>{TOTYPE[text]}</span>
            },
            { title: '被授权人', dataIndex: 'receiver', key: 'receiver'},
            { title: '被授权主体', dataIndex: 'instanceName', key: 'instanceName',
                render: text => {
                    let list = text.split(',');
                    return list.map((item,index)=>{
                        return <span key={index}>{item}{index<list.length-1 && '、' ||''}<br/></span>
                    })
                }
            },
            { title: '被授权主体类型', dataIndex: 'authorizedType', key: 'authorizedType',
                render: text => <span>{{'0':'实例'}[text]}</span>
            },
            { title: '授权策略', dataIndex: 'authPolicy', key: 'authPolicy',
                render: text => <span>{{'0':'默认策略'}[text]}</span>
            },
            // { title: '备注', dataIndex: 'remark', key: 'remark', 
            //     render: text => <Tooltip placement="topLeft" title={text}><span>{text}</span></Tooltip>
            // },
            { title: '授权时间', dataIndex: 'createTime', key: 'createTime', width:'160px', 
                render: text => <span>{DateTool.utcToDev(text)}</span>
            },
            { title: '操作', key: 'action', width:'160px',
                render: (text, record) => 
                <a onClick={this.cancelModVisiable.bind(this,record)} style={{color:'#FF3100'}} >取消授权</a>
                // <a onClick={this.startOrForbidden.bind(this,record.name,record.id)} style={{color:'#FF3100'}} >取消授权</a>
            },
        ];
    }
    cancelModVisiable = cancelData =>{
        this.setState({cancelData});
    }

    //获取授权列表
    getList = (data={}) => {
        get(Paths.getAuthorizeList,data).then((res) => {
            this.setState({
                caseList:res.data.list,
                pager:res.data.pager,
                loading:false,
            });
        });
    }
    componentDidMount() {
        this.pagerIndex(1);
    }
    //打开新增授权弹窗
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
    pagerIndex = (pageIndex) => {
        let {searchName,authType} = this.state;
        this.setState({pageIndex,loading:true},()=>{
            this.getList({pageIndex,pageRows:10,authType,param:searchName || undefined});
        });
    }
    deleAuthOk = ()=>{
        this.cancelAuthRefs.cancelCommit();
    }
    cancelSucess=()=>{
        this.cancelModVisiable(false);
        this.pagerIndex(this.state.pageIndex);
    }

    //新增授权
    addOk = ()=>{
        let form = this.addFormRefs.props.form;
        let id = this.state.id;
        const { validateFieldsAndScroll } = form;
        validateFieldsAndScroll((err, values) => {
            let {authType,authorizedType,authPolicy,instanceObj,proid,groupid,toobjid,apiid} = values;
            let instanceId = instanceObj[1],
                ar = instanceObj[0].split(',');
            let receiverEmail = ar[1],receiverId = ar[0];
            let productId = proid || groupid || apiid || toobjid[1];
            if(!err){
                post(Paths.addAuthorize,{
                    productId,
                    authType,
                    authorizedType,
                    authPolicy,
                    instanceId,
                    receiverEmail,
                    receiverId
                }).then((res) => {
                    if(res.code==0){
                        Notification({type:'success',description:'新增成功！'});
                        this.addCancel();
                        this.pagerIndex(1);
                    }
                });
            }  
        });

    }
    addCancel = ()=>{
        this.setState({addCaseVisible:false});
        this.addFormRefs.props.form.resetFields();
        this.addFormRefs.setState({authType:0});
    }
    cngSearchType =(authType)=>{
        this.setState({loading:true,authType},()=>{
            this.pagerIndex(1);
        });
    }

    render() {
        let { loading, name, addCaseVisible, cancelVisible,caseList, pager,cancelData } = this.state;
        return (
           <div className='authorize-page'>
                <header className="page-content-header">
                    <h3 className="page-name">授权管理</h3>
                    <div>
                        <Input.Group compact className="searchgroupbox">
                            <Select style={{ width: '30%' }} defaultValue={0} onChange={this.cngSearchType}>
                                {
                                    TOTYPE.map((item,i)=><Option key={i} value={i}>{item}</Option>)
                                }
                            </Select>

                            <Input.Search style={{ width: '70%' }} placeholder="请输入授权对象名查找"
                                enterButton
                                maxLength={20}
                                onSearch={value => this.searchCase(value)} 
                            />
                        </Input.Group>
                        <div className='butFloatRight'>
                            <Button className='but-add' type="primary" onClick={this.addCase}>新增授权</Button>
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
                    title="新增授权"
                    visible={addCaseVisible}
                    width={650}
                    onOk={this.addOk}
                    onCancel={this.addCancel}
                    maskClosable={false}
                >
                   <AddForm onRef={ref => this.addFormRefs = ref} ></AddForm>
                </Modal>

                <Modal
                    title="取消授权"
                    visible={!!cancelData}
                    width={400}
                    onOk={this.deleAuthOk}
                    onCancel={this.cancelModVisiable.bind(this,false)}
                    maskClosable={false}
                >
                    <CancelMod onRef={ref => this.cancelAuthRefs = ref} cancelData={cancelData} cancelSucess={this.cancelSucess}  ></CancelMod>
                </Modal>

{/* 
                <ActionConfirmModal
                    visible={cancelVisible}
                    modalOKHandle={this.startOrForbiddenModal.bind(this,'ok')}
                    modalCancelHandle={this.startOrForbiddenModal.bind(this,'cancel')}
                    title={`取消授权`}
                    descText={`即将取消授权`}
                    targetName={name}
                /> */}
           </div>
        )
    }
}
