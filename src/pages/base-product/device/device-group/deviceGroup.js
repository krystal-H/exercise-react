import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {get,post, Paths} from '../../../../api';
import { Input, Button, Table, Divider, Modal ,Form} from 'antd';
import { Notification } from '../../../../components/Notification';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import {AddForm} from './addForm';
import PageTitle from '../../../../components/page-title/PageTitle';
import './deviceGroup.scss'
import moment from 'moment';

export default class DeviceGroup extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,// 列表加载
            caseList:[],
            pager:{},
            searchName:'',//搜索框
            name:'',// 当前操作的分组名称
            id:'',//当前操作的分组id
            addCaseVisible:false,//新增分组弹窗
            pageIndex:'1',
        };
        this.columns = [
            { title: '分组名称', dataIndex: 'name', key: 'name'},
            { title: '分组ID', dataIndex: 'id',  key: 'id'},
            { title: '描述', dataIndex: 'remark',  key: 'remark'},
            { title: '添加时间', dataIndex: 'createTime', key: 'createTime', 
                render: text => <span>{text && moment(text).add(8,'h').format('YYYY-MM-DD HH:mm:ss') || '--'}</span>
            },
            
            { title: '操作', key: 'action', width:'140px',
                render: (text, record) => (
                    <span>
                        <Link to={`/open/base/device/groupDetails/${record.id}/${record.groupId}`}>查看</Link>
                        <Divider type="vertical" />
                        <a onClick={this.openDel.bind(this,record.id,record.name)} >删除</a>
                    </span>
                ),
            },
        ];
    }
    //获取分组列表
    getList = (data={}) => {
        get(Paths.getGroupList,data).then((res) => {
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
    //打开新增弹窗
    addCase = () => {
        this.setState({addCaseVisible:true});
    }
    //打开删除框
    openDel = (id,name) => {
        this.setState({id,name});
    }
    //删除确认框的确认和取消
    delOkCancel = (type)=>{
        if(type=='ok'){// 点击确认
            let {id,pageIndex} = this.state;
            pageIndex=pageIndex?pageIndex:1;
            get(Paths.deleteGroup,{id}).then((res) => {
                if(res.code==0){
                    this.setState({loading:true,id:''},()=>{
                        this.getList({pageIndex,pageRows:10});
                    });
                }
            });
        }else{
            this.setState({id:''}); 
        }
    }
    //查找
    searchCase = (searchName) => {
        this.setState({loading:true,
            searchName
       },()=>{
            this.pagerIndex(1);
        });
    }
    //添加分组
    updateModal = (type) => {
        if(type==1){//1:确认 2：取消
            let form = this.addFormRefs.props.form;
            const { validateFieldsAndScroll } = form;
            validateFieldsAndScroll((err, values) => {
                let {name,remark} = values;
                if(!err){
                    post(Paths.updateGroup,{name,remark}).then((res) => {
                        if(res.code==0){
                            Notification({type:'success',description:'新增成功！'});
                            this.addCancel();
                            this.pagerIndex(1);
                        }
                    });
                }  
            });

        }else{
            this.addCancel();
        }

    }
    addCancel=()=>{
        this.setState({addCaseVisible:false});
        this.addFormRefs.props.form.resetFields();
    }
    pagerIndex = (pageIndex) => {
        this.setState({pageIndex,loading:true},()=>{
            this.getList({pageIndex,pageRows:10,name: this.state.searchName || undefined});
        });
    }
    render() {
        let { loading, addCaseVisible,caseList, pager,id,name } = this.state;
        return (
           <div className='devicegroup-box'>
                <header className="page-content-header">
                    <PageTitle noback={true} title="设备分组管理" />
                    <div>
                        <div className='searchBox'>
                            <Input.Search placeholder="请输入分组名查找"
                                enterButton
                                maxLength={20}
                                onSearch={value => this.searchCase(value)} 
                            />
                        </div>
                        <div className='butFloatRight'>
                            <Button className='but-add' type="primary" onClick={this.addCase}>新增分组</Button>
                           
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
                    title="新增分组"
                    visible={addCaseVisible}
                    width={600}
                    onOk={this.updateModal.bind(this,1)}
                    onCancel={this.updateModal.bind(this,2)}
                    maskClosable={false}
                    className="self-modal"
                >
                    <AddForm onRef={ref => this.addFormRefs = ref} ></AddForm>
                </Modal>

                <ActionConfirmModal
                    visible={!!id}
                    modalOKHandle={this.delOkCancel.bind(this,'ok')}
                    modalCancelHandle={this.delOkCancel.bind(this,'cancel')}
                    title='删除分组'
                    descText='即将删除分组'
                    targetName={name}
                />
           </div>
        )
    }
}
