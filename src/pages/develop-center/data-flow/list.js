import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {get,post, Paths} from '../../../api';
import { Input, Button, Table, Alert, Modal, Tooltip, Divider ,Popconfirm} from 'antd';
import PageTitle from '../../../components/page-title/PageTitle';
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal';
import FlowArrowImg from '../../../assets/images/flow-arrow.png';
import './dataflow.scss';
import { DateTool } from '../../../util/util';
import AddRule from './AddRule'

const FLOWLIST = [
    '创建规则','选择产品','编写SQL，处理数据','添加操作，转发数据','验证规则','启动规则'
];
const CONFIRMTXT = [
    ['删除', '即将要删除规则'],
    ['启动', '即将要启动规则'],
    ['停用', '即将要停用规则']
]
export default class Authorize extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,//列表加载
            ruleList:[],
            pager:{},
            searchName:'',//搜索框
            name:'',// 当前操作的规则名称
            id:'',//当前操作（启动、停用、删除）的规则id
            confirmType:0,//0 二次确认窗不显示 1 删除 2 启动 3 停用 
            addRuleVisible:false,//创建规则弹窗
            pageIndex:1,//当前页码
        };
        this.columns = [
            { title: '规则名称', dataIndex: 'transferName'},
            { title: '规则ID', dataIndex: 'transferId', width:90},
            { title: '描述', dataIndex: 'transferDesc'},
            { title: '创建时间', dataIndex: 'createTime',width:162,
                render: text => <span>{DateTool.utcToDev(text)}</span>
            },
            { title: '状态', dataIndex: 'status',width:90,
                render: text => <span>{{'0':'未启用','1':'启用'}[text] || '--'}</span>
            },
            { title: '操作', key: 'action', width:160,
                render: (text, {transferId,transferName,status}) => (
                    <span>
                        <Link to={`/open/developCenter/dataFlow/ruledetail/${transferId}`}>查看</Link>
                        <Divider type="vertical" />
                        <a onClick={()=>{this.openConfirmMod(transferId,transferName,status+2)}} >{['启用','停用'][status]}</a>
                        <Divider type="vertical" />
                        <a onClick={()=>{this.openConfirmMod(transferId,transferName,1)}} >删除</a>
                    </span>
                ),
            },
        ];
    }
    componentDidMount() {
        this.pagerIndex(1);
    }
    //请求list
    getList = (data={}) => {
        get(Paths.getDataTransferList,data).then((res) => {
        // get(Paths.getGroupList,data).then((res) => {
            this.setState({
                ruleList:res.data.list,
                pager:res.data.pager,
                loading:false,
            });
        });
    }
    
    //打开创建规则窗
    openAdd = () => {
        this.setState({addRuleVisible:true});
    }
    //关闭新增弹窗，并判断是否需要更新列表
    closeAdd=updatelist=>{
        this.setState({addRuleVisible:false});
        if(updatelist){
            this.pagerIndex(1);
        }
    }
    //查找
    searchRule = (searchName) => {
        this.setState({loading:true,
            searchName
       },()=>{
            this.pagerIndex(1);
        });
    }
    //获取一页list
    pagerIndex = (pageIndex) => {
        this.setState({pageIndex,loading:true},()=>{
            this.getList({pageIndex,pageRows:10,transferName: this.state.searchName || undefined});
        });
    }
    //引导步骤条
    getGuidStep = ()=>{
        let dom = []
        for(let i=0;i<FLOWLIST.length;i++){
            dom.push(
                <div className='step' key={'step_'+i}>
                    <span className='number'>{i+1}</span><span className='desc'>{FLOWLIST[i]}</span>
                </div>
            )
            if(i+1 < FLOWLIST.length){
                dom.push(
                    <img className="arrow" key={'img_'+i} src={FlowArrowImg} />
                )
            }
        }
        return dom
    }
    
    openConfirmMod = (id,name,confirmType)=>{
        this.setState({id,name,confirmType})
    }
    modOk = ()=>{
        let {id,confirmType,pageIndex=1,ruleList} = this.state;
        if(confirmType==1){//删除
            get(Paths.delOneTransfer,{transferId:id},{loading:true}).then((res) => {
                if(ruleList.length == 1 && pageIndex>1){
                    --pageIndex
                }
                this.pagerIndex(pageIndex)
                this.setState({confirmType:0})
            });
        }else{//启用、停用
            let status= confirmType==2&&1||0;
            post(Paths.saveTransfer,{transferId:id,status},{needJson:true,noInstance:true,loading:true}).then((res) => {
                this.pagerIndex(pageIndex)
                this.setState({confirmType:0})
            });
        }
    }
    modCancel = ()=>{
        this.setState({confirmType:0})
    }

    

    render() {
        let { loading, name, addRuleVisible,ruleList, pager,confirmType } = this.state;
        
        return (
           <div className='dataflow-page'>
               <PageTitle noback={true} title="数据流转" />
                <header className="page-content-header">
                    <div className='searchBox'>
                        <Input.Search placeholder="请输入规则名查找"
                            enterButton
                            maxLength={20}
                            onSearch={value => this.searchRule(value)} 
                        />
                    </div>
                    <div className='butFloatRight'>
                        <Button className='but-add' type="primary" icon='plus' onClick={this.openAdd}>创建规则</Button>
                    </div>
                </header>
                <div className='commonContentBox'>
                    <div className='centent'>
                        <Alert
                            message='数据流转规则可以对设备上报的数据进行简单处理，并将处理后的数据流转到其他Topic或其他存储实例，目前只支持Json数据的处理'
                            type="info"
                            showIcon
                        />
                        <div className='guid-step'>{this.getGuidStep()}</div>
                    </div>
                </div>
                <div className='commonContentBox'>
                    <div className='centent'>
                        <Table 
                            rowKey="transferId"
                            columns={this.columns} 
                            dataSource={ruleList} 
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
                <AddRule visable={addRuleVisible} closeMod={updatelist=>{this.closeAdd(updatelist)}}></AddRule>
               
                <ActionConfirmModal
                    visible={confirmType>0}
                    modalOKHandle={this.modOk}
                    modalCancelHandle={this.modCancel}
                    title={confirmType>0&&CONFIRMTXT[confirmType-1][0]}
                    descText={confirmType>0&&CONFIRMTXT[confirmType-1][1]}
                    targetName={name}
                />
               
                
           </div>
        )
    }
}
