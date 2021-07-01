import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Input, Button, Table, Divider, Tooltip, Tag ,Form,Select} from 'antd';
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal';
import AloneSection from '../../../components/alone-section/AloneSection';
import { Link } from 'react-router-dom';
import { DateTool } from '../../../util/util';
const { Option } = Select;
import './dataasset.scss';
import ParamsTable from './ParamsTable';

export default class Dataasset extends Component {
    constructor(props){
        super(props);
        this.state = {
            loading:true,//key 列表加载
            caseList:[],
            pager:{},
            searchName:'',//搜索框
            searchType:undefined,
            name:'',// 当前删除的数据源名
            id:'',//当前删除的数据源id
            pageIndex:'1',
            typeList:[
                {id:1,name:'mqtt'},
                {id:2,name:'mysql数据库'},
                {id:3,name:'http服务'},
                {id:4,name:'redis'},
                {id:5,name:'rocketMq'},
            ],

        };
        this.columns = [
            { title: '数据资产源名称', dataIndex: 'name', key: 'name'},
            { title: '描述', dataIndex: 'remark',  key: 'remark',
                render:(text,record)=> {
                    return <Tooltip placement="topLeft" title={text}> <span>{text}</span> </Tooltip>
                }
            },
            { title: '类型', dataIndex: 'type', key: 'type',
                render:text=> (this.state.typeList[text-1].name || '--')
            },
            { title: '状态', dataIndex: 'status', key: 'status',  
                render: text => (text==0&&'有效'||'无效')
            },
            { title: '创建时间', dataIndex: 'createTime', key: 'createTime',
                render: text => <span>{DateTool.utcToDev(text)}</span>
            },
            { title: '操作', key: 'action', width:'160px',
                render: (text, record) => {
                    let {id,name} = record;
                    return <span>
                        <Link key="detail" to={`/userCenter/assetdetail/${id}/1`}>查看</Link>
                        <Divider type="vertical" />
                        <Link key="edit" to={`/userCenter/assetdetail/${id}/0`}>编辑</Link>
                        <Divider type="vertical" />
                        <a onClick={this.openDel.bind(this,id,name)} >删除</a>
                    </span>
                },
            },
        ];
        
    }
    //获取资产源列表
    getList = (data={}) => {
        get(Paths.getDataAssetsList,data).then((res) => {
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
    cngSearchType =(searchType)=>{
        this.setState({searchType});
    }
    cngSearchName =(e)=>{
        this.setState({searchName:e.target.value});
    }

    
    //查找
    searchCase = (searchName) => {
        this.setState({searchName},()=>{
            this.pagerIndex(1);
        });
    }
    resetList = ()=>{
        this.setState({
            searchName:'',
            searchType:undefined
        },()=>{this.getList({pageIndex:1,pageRows:10});});
    }
    //打开删除框
    openDel = (id,name) => {
        this.setState({name,id});
    }
    //删除确认框的确认和取消
    delOkCancel = (type)=>{
        if(type=='ok'){// 点击确认
            let {id,pageIndex} = this.state;
            pageIndex=pageIndex?pageIndex:1;
            get(Paths.delDataAssets,{id}).then((res) => {
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
    pagerIndex = (pageIndex) => {
        this.setState({pageIndex,loading:true},()=>{
            let {searchName,searchType} = this.state;
            this.getList({pageIndex,pageRows:10,name: searchName || undefined,type:searchType||undefined});
        });
    }
    render() {
        let { loading, name,caseList, pager,typeList,searchType,searchName,id } = this.state;
       
        return (
           <div className='user-visit-box'>
                <header className="page-content-header butonlyheader">
                    <h3 className="page-name">数据资产知识库管理</h3>
                        <div className='butonly'>
                            <Button className='but-add' type="primary" href={'#/userCenter/assetdetail/0/0'}>新增数据资产源</Button>
                        </div>
                </header>

                <AloneSection title="数据资产列表">
                    <div className="alone-section-content-default">
                        <div className='searchBox'>
                            <div className='searchCriteria'>
                                <Select className='sele' placeholder="请选择数据资产源类型" onChange= {this.cngSearchType} value={searchType} > 
                                   {typeList.map((item)=>{
                                            return <Option key={item.id} value={item.id}>{item.name}</Option>
                                        })}
                                </Select>
                                <Input.Search placeholder="请输入数据资产源名称" value={searchName}  onChange= {this.cngSearchName}
                                    enterButton
                                    maxLength={20}
                                    onSearch={value => this.searchCase(value)} 
                                />
                                <Button className='btn' onClick={this.resetList} >重置</Button>
                            </div>
                        </div>
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
                </AloneSection>

                <ActionConfirmModal
                    visible={!!id}
                    modalOKHandle={this.delOkCancel.bind(this,'ok')}
                    modalCancelHandle={this.delOkCancel.bind(this,'cancel')}
                    title={`删除`}
                    descText={`即将删除数据资产源`}
                    targetName={name}
                />
           </div>
        )
    }
}
