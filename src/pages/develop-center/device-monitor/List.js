
import React, { useState, useEffect } from "react";
import { Table, Divider,Button,Input } from "antd";
import { DateTool } from "../../../util/util";
import { get, Paths,post } from "../../../api";
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal';
import PageTitle from '../../../components/page-title/PageTitle'
import AloneSection from '../../../components/alone-section/AloneSection'
import FlowChart from '../../../components/flow-chart/FlowChart'
const FLOWLIST = [
    {
        title:'配置数据流转'
    },
    {
        title:'选择监控对象'
    },
    {
        title:'定义监控规则'
    },
    {
        title:'确定监控形式'
    }
]
const initPager = {
    pageRows: 10,
    pageIndex: 1
};
//配置列表
export default props=>{
    const [warningList, setWarningList] = useState({
        pager: {},
        list: []
    });
    const [editId, setEditId] = useState([]);//当前操作的告警配置 [id,name,删除还是停止]
    const [searchId, setSearchId] = useState([]);//当前操作的告警配置 [id,name,删除还是停止]
    useEffect(() => {
        getWarningList(initPager);
    }, []);
    
    const getWarningList = param => {
        searchId&&(param.warningId = searchId);
        get(Paths.geMonitorList, param, { loading: true }).then(res => {
            setWarningList(res.data);
        });
    };
    const columns = [
        {title: "规则名称",dataIndex: "name",key: "name"},
        {title: "描述",dataIndex: "description", key: "description"},
        {title: "运行状态",dataIndex: "runType",key: "runType",
            render: s => <span>{ {'0':'初始状态','1':'运行中','2':'已停止'}[s] }</span>
        },
        {title: "最近编辑时间",dataIndex: "updateTime",key: "updateTime",
            render: t=>  t ? DateTool.utcToDev(t) : "--"
        },
        {title: "操作",dataIndex: "id", key: "id",
            render: (t,record)=>{
                let {id,name,runType} = record;
                return <span>
                    <a href={`#/open/developCenter/deviceMonitor/edit/${id}`}>编辑</a><Divider type="vertical" />
                    {
                        runType==1&&
                        <a onClick={()=>{setEditId([id,name,"stop"])} } href="javascript:" >停止</a>||
                        <a onClick={()=>{startRule(id)} } href="javascript:" >启动</a>
                    }
                    <Divider type="vertical" />
                    <a onClick={()=>{setEditId([id,name,"del"])} } href="javascript:" >删除</a>
                </span>
            }
        }
    ];
    const getIndexPage = index =>{
        getWarningList({...initPager, pageIndex: index})
    }
    const delOrStop = ()=>{
        let questurl =  editId[2] == "del" && Paths.deleteMonitor || Paths.stopMonitor;
        get(questurl, {id:editId[0]}, { loading: true }).then(res => {
            getIndexPage(warningList.pager.pageIndex || 1);
            setEditId([]);
        });
    }
    const startRule = (id)=>{
        get(Paths.startMonitor, {id}, { loading: true }).then(res => {
            getIndexPage(warningList.pager.pageIndex || 1);
        });
        
    }
    const {list,pager} = warningList;

    return <>
            <PageTitle noback={true} title="设备监控" ></PageTitle>
            <AloneSection>
                <div className="use-service-flow-wrapper">
                    <FlowChart type={3} flowLists={FLOWLIST}></FlowChart>
                    <div className="extra-descs">
                        <div className="descs-item">
                            <p>配置数据流转，选择需要进行设备监控的rocketMQ数据对象。</p>
                        </div>
                        <div className="descs-item">
                            <p>选择需要进行设备监控配置的对象，包括设备、产品、设备组。</p>
                        </div>
                        <div className="descs-item">
                            <p>定义监控对象的具体监控规则，包括参数对比值、时长定义、条件比较等规则。</p>
                        </div>
                        <div className="descs-item">
                            <p>在配置好规则前，可自定义具体整体规则的监控形式。</p>
                        </div>
                    </div>
                </div>
            </AloneSection>
            <div className='commonContentBox'>
                <div className='centent'>
                    <Button href='#/open/developCenter/deviceMonitor/add' icon="plus" type="primary">新增配置</Button>     
                    <Input placeholder="请输入预警唯一ID查询"
                        style={{ width: '240px',margin:'0 24px 24px' }}
                        value={searchId}
                        onChange={e =>  setSearchId(e.target.value)}
                        maxLength={20} 
                    />
                    <Button type="primary" icon="search" onClick={() => getIndexPage(1)}>查询</Button>
                    <Table 
                        rowKey="id"
                        columns={columns} 
                        dataSource={list}
                        pagination={{
                            defaultCurrent:pager.pageIndex,
                            total:pager.totalRows,
                            // hideOnSinglePage:true,
                            onChange:getIndexPage,
                            current: pager.pageIndex,
                            showTotal: total => <span>共 {total} 条</span>
                        }}
                    />  
                </div>
            </div>
    
            <ActionConfirmModal
                visible={editId.length>0}
                modalOKHandle={delOrStop}
                modalCancelHandle={()=>{setEditId([])}}
                title={editId[2]=="del"&&"删除"||"停止"}
                descText={`即将${editId[2]=="del"&&"删除"||"停止"}监控规则`}
                needWarnIcon={true}
                targetName={editId[1]}
            />

    </>


}
