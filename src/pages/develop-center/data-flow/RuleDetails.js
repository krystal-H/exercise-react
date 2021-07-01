import React, { PureComponent } from 'react'
import { Descriptions ,Button,Table,Divider,Empty,Popconfirm } from 'antd';
import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import {get,post, Paths} from '../../../api';
import AddRule from './AddRule'
import EditSql from './EditSql'
import CheckSql from './CheckSql'
import OperateData from './OperateData'
import './dataflow.scss';
const OPERATE = [
    '发布到另一个流转规则',
    '发布到RocketMQ',
    '发布到MQTT',
    '发布到MySQL',
    '发布到Redis',
]

export default class DataFlowDetailt extends PureComponent {
    constructor(props) {
        super(props);
        this.id = props.match.params.id
        
        this.state = {
            transferName:'--',
            transferDesc:'--',

            transferSQL:{},
            transferTargetList:[],
            transferRecover:{},
            operateType:0,//0 不显示添加/编辑操作的弹窗，1 添加转发数据，2 编辑转发数据，3 添加转发错误操作 4 编辑转发错误操作
            transferTargetIndex:0,//编辑转发数据的索引号

            editvisable:false,
            editSQLvisiable:false,
            checkSQLvisiable:false,
            tableData:null,
            productList:[],
            transferMenuList:[],
            rocketMQTopicList:[],

        }
        

    }
    componentDidMount() {
        this.getDetail()
        this.getTableInfo()
        this.getProList()
    }
    //打开编辑
    openEditServe = ()=>{
        this.setState({editvisable:true});
    }
    //关闭编辑
    closeEditServe = needupdate =>{
        this.setState({editvisable:false});
        if(needupdate){
            this.getDetail()
        }
    }
    //获取表、数据资产结构数据
    getTableInfo=()=>{
        get(Paths.getTransferDataTable).then(({data = {}}) => {
            let tableData = {...data} ;
            this.setState({tableData})
        });
    }

   
    //获取规则所有信息
    getDetail=()=>{
        get(Paths.getDataTransfer,{transferId:this.id},{loading:true}).then(res => {
            let {transferDesc,transferName,transferSQL,transferTargetList,transferRecover} = res.data || {};
            this.setState({
                transferName,
                transferDesc,
                transferSQL:transferSQL||{},
                transferTargetList:transferTargetList||[],
                transferRecover:transferRecover||{}
            })
        });
    }
    //打开编写SQL
    openEditSQL=()=>{
        this.setState({editSQLvisiable:true});
    }
    openCheckSQL=(open=true)=>{
        this.setState({checkSQLvisiable:open});
    }
    closeEditSQL=(needupdate)=>{
        this.setState({editSQLvisiable:false});
        if(needupdate){
            this.getDetail()
        }
    }

    openOperate=(operateType,index)=>{
        let staobj = {operateType};
        if(operateType==2){
            staobj.transferTargetIndex = index
        }
        this.setState(staobj);
        let {transferMenuList,rocketMQTopicList} = this.state;
        if(transferMenuList.length == 0){
            this.getTransferMenuList();
        }
        if(rocketMQTopicList.length == 0){
            this.getRocketMQTopicList();
        }

        
    }
    closeOperate=(needupdate)=>{
        this.setState({operateType:0});
        if(needupdate){
            this.getDetail()
        }
    }
    //获取产品列表
    getProList = ()=>{
        get(Paths.getProductList,{ pageRows:9999, instanceId:2 },{ needVersion:1.2 }).then((res) => {
          let productList = res.data&&res.data.list || [];
          this.setState({productList});
        }); 
    }
    //获取转发到另一个的下拉列表
    getTransferMenuList=()=>{
        get(Paths.getTransferMenuList).then(({data = {}}) => {
            let transferMenuList = [...data] ;
            this.setState({transferMenuList})
        });
    }
    //获取转发到平台内RockMq的列表
    getRocketMQTopicList=()=>{
        get(Paths.getRocketMQTopicList).then(({data = {}}) => {
            let rocketMQTopicList = [...data] ;
            this.setState({rocketMQTopicList})
        });
    }
    getColumns=(type)=>{
        let dataIndexnam = type==4&&['recoverType','recoverConfig','transferRecoverId']||
            ['targetType','targetConfig','transferTargetId'];
        let [datatype,dataconfig,datatransid] = dataIndexnam;


        return [
            { title: '操作类型', dataIndex: datatype,render:val=>OPERATE[val]},
            { title: '数据目的地', dataIndex: dataconfig,
                // render:(configjson)=>{
                //     let configdata = JSON.parse(configjson);
                // }
            },
            { title: '操作', dataIndex:datatransid, width:120,
                render: (id,record,index) => (
                    <span>
                        <a onClick={()=>{this.openOperate(type,index)}} >编辑</a>
                        <Divider type="vertical" />
                        <Popconfirm 
                            title="确定要移除吗？"
                            onConfirm={()=>{this.deleteTarget(id,type)} }
                            okText="是"
                            cancelText="否"
                            // placement="topRight"
                        >
                            <a>移除</a>
                        </Popconfirm>
                    </span>
                ),
            },
        ];
    }
    
    deleteTarget = (id,type)=>{  
        let data =type==4&&{transferRecoverId:id}||{transferTargetId:id}
        get(Paths.delOneTransfer,data,{loading:true,noInstance:true}).then((res) => {
            this.getDetail()
        });
    }
    render() {
        let {
            transferDesc,transferName,editvisable,
            transferSQL,
            editSQLvisiable,
            checkSQLvisiable,
            tableData,
            productList,

            operateType,
            transferTargetIndex,
            transferTargetList,
            transferRecover,

            transferMenuList,
            rocketMQTopicList

        } = this.state;
        
        
        return (
            <section className="page-dataflowdetail">
                <PageTitle title="规则详情"></PageTitle>
                <header className="header">
                    <Descriptions className='descriptions' column={2}>
                        <Descriptions.Item label="规则名称" >{transferName}</Descriptions.Item>
                        <Descriptions.Item label="规则 ID">{this.id}</Descriptions.Item>
                        <Descriptions.Item label="规则描述">{transferDesc}</Descriptions.Item>
                    </Descriptions>
                    <Button className='deitbtn' type="primary" onClick={this.openEditServe} >编辑</Button>
                </header>
                <AloneSection title="处理数据">
                    <div className="alone-section-content-default">
                        {/* <Button className='checkbtn' type="primary" onClick={this.openEditServe} >调试 SQL</Button> */}
                        <Button className='addbtn' type="primary" onClick={this.openEditSQL} >编写 SQL</Button>
                        <div className='sqltit'>规则查询语句:</div>
                        {
                            transferSQL.transferSQL &&
                            <div className='sqlstr'>{transferSQL.transferSQL} <a onClick={()=>this.openCheckSQL(true)}>调试SQL</a></div>||
                            <><Empty className='emptyimg' description={false} image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
                            <div className='emptysql'>您还没有编写 SQL 语句处理数据，<a onClick={this.openEditSQL} >编写 SQL</a></div></>
                        }
                    </div>
                </AloneSection>
                <AloneSection title="转发数据">
                    <div className="alone-section-content-default">
                        <Button className='addbtn' type="primary" onClick={()=>{this.openOperate(1)}} >添加操作</Button>
                        {
                            transferTargetList.length>0 && 
                            <Table 
                                rowKey="transferTargetId"
                                columns={this.getColumns(2)} 
                                dataSource={transferTargetList}
                                pagination={false}
                            />||
                            <><Empty className='emptyimg' description={false} image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
                            <div className='emptysql'>暂无转发数据，<a onClick={()=>{this.openOperate(1)}} >添加操作</a></div></>
                        }
                        
                    </div>
                </AloneSection>
                <AloneSection title="转发错误操作数据">
                    <div className="alone-section-content-default">
                        {
                            transferRecover.recoverConfig &&
                            <Table 
                                rowKey="transferRecoverId"
                                columns={this.getColumns(4)} 
                                dataSource={[transferRecover]} 
                                pagination={false}
                            />
                            || 
                            <>
                                {/* <Button className='addbtn' type="primary" onClick={()=>{this.openOperate(3)}} >添加操作</Button> */}
                                <Empty className='emptyimg' description={false} image={Empty.PRESENTED_IMAGE_SIMPLE}></Empty>
                                <div className='emptysql'>暂无转发错误操作数据，<a onClick={()=>{this.openOperate(3)}} >添加操作</a></div>
                            </>

                        }
                    </div>
                </AloneSection>

                <AddRule //编辑规则名称描述
                    visable={editvisable}
                    transferId={this.id}
                    transferName={transferName}
                    transferDesc={transferDesc}
                    closeMod={needupdate=>{this.closeEditServe(needupdate)}}
                ></AddRule>

                {
                    //编写SQL
                editSQLvisiable&&<EditSql 
                    visable={editSQLvisiable}
                    transferId={this.id}
                    tableData={tableData}
                    productList={productList}
                    transferSQL={transferSQL}
                    closeMod={needupdate=>{this.closeEditSQL(needupdate)}}
                ></EditSql>
                }
                {
                    //调试SQL
                checkSQLvisiable&&<CheckSql 
                    visable={checkSQLvisiable}
                    transferId={this.id}
                    productList={productList}
                    closeMod={()=>this.openCheckSQL(false)}
                ></CheckSql>
                }

                {
                    //添加/编辑-转发操作/转发错误操作
                    operateType>0&&<OperateData
                        operateList = {OPERATE}
                        transferId={this.id}
                        operateType={operateType}
                        transferTargetIndex={transferTargetIndex}
                        topicList={[transferMenuList,rocketMQTopicList]}
                        
                        transferTargetList={transferTargetList}
                        transferRecover={transferRecover}
                        closeMod={needupdate=>{this.closeOperate(needupdate)}}
                    ></OperateData>
                }

            </section>
        )
    }
}
