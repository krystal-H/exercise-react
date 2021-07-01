
import React, { useState, useEffect } from "react";
import { Tabs, Button, Table, Divider } from "antd";
import { DateTool } from "../../../../util/util";
import { get, Paths,post } from "../../../../api";
import PageTitle from "../../../../components/page-title/PageTitle";
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import WarningInofMod from './detail';
const { TabPane } = Tabs;
const initPager = {
    pageRows: 10,
    pageIndex: 1
};

export default props => {
    const [totalData, setTotalData] = useState({});
    useEffect(() => {
        getTotalData();
    }, []);
    const getTotalData = () => {
        get(Paths.getDeviceWarningTotal, { loading: true }).then(res => {
            const data = res.data;
            setTotalData(data);
        });
    };
    return (
        <section className="device-secret-wrapper device-warningpage">
            <div className="device-secret-header">
                <PageTitle noback={true} title="设备告警" />
                <div className="device-secret-statistic clearfix">
                    <div className="common-id">
                        <div>待处理告警</div>
                        <div>{totalData.pendingCount}</div>
                    </div>
                    <div className="used">
                        <div>已处理告警</div>
                        <div>{totalData.processedCount}</div>
                    </div>
                    <div className="register">
                        <div>已发送告警</div>
                        <div>{totalData.sentCount}</div>
                    </div>
                    <div className="unregistered time">
                        <div>最近告警时间</div>
                        <div>{totalData.leastWaringDate&&DateTool.utcToDev(totalData.leastWaringDate) || "无"}</div>
                    </div>
                </div>
            </div>
            
            <Tabs defaultActiveKey={props.location.page || "1"} tabBarStyle={{background: "#fff", padding: "0 24px",margin:"0"}} >
                <TabPane tab="告警列表" key="1">
                <div className='commonContentBox'>
                    <div className='centent'>
                        <WarningList />
                    </div>
                </div>
                </TabPane>
                <TabPane tab="告警配置" key="2">
                <div className='commonContentBox'>
                    <div className='centent'>
                        <WarningConfigList _props={props}/>
                    </div>
                </div>
                </TabPane>
            </Tabs> 

        </section>
    );
};




//告警列表
const WarningList = props=>{
    const [warningList, setWarningList] = useState({
        pager: {},
        list: []
    });
    const [warningInof, setWarningInof] = useState({});
    useEffect(() => {
        getWarningList(initPager);
    }, []);
    
    const getWarningList = param => {
        get(Paths.getWarningList, param, { loading: true }).then(res => {
            
            setWarningList(res.data);
        });
    };
    const columns = [
        { title: "告警时间", dataIndex: "alarmTime", key: "alarmTime",
            render(t) {
                return t ? DateTool.utcToDev(t) : "--";
            }
        },
        { title: "告警标题", dataIndex: "warningTitle", key: "warningTitle" },
        { title: "告警状态", dataIndex: "state", key: "state",
            render:s=><span>{{"1":"待处理","2": "已处理", "3" :"已发送"}[s]}</span>
        },
        { title: "告警消息类型", dataIndex: "warningWay", key: "warningWay",
            render:w=><span>{{"0":"站内","1": "站内+邮件"}[w]}</span>
        },
        { title: "关联的告警规则", dataIndex: "ruleName", key: "ruleName" },
        { title: "操作", dataIndex: "id", key: "id",
            render: (id,record)=>{
                let {state} = record;
                return <a onClick={()=>{warnDetail(id)} } href="javascript:" >{state=="1"&&"处理"||"查看"}</a>
                   
            }
        }
    ];
    const getIndexPage = index =>{
        getWarningList({...initPager, pageIndex: index})
    }
    const warnDetail = warningId =>{
        get(Paths.getWarningInfo, {warningId}, { loading: true }).then(res => {
            setWarningInof(res.data);
        });
    }
    const closeDetailMod = ()=>{
        setWarningInof({});
    }

    const delwithWarn = params=>{
        post(Paths.dealWithWarning, params, { loading: true }).then(res => {
            getIndexPage(warningList.pager.pageIndex || 1);
            closeDetailMod();
        });
    }


    let {list,pager} = warningList;
    return <>
        <Table 
            rowKey="id"
            columns={columns} 
            dataSource={list} 
            pagination={{
                defaultCurrent:pager.pageIndex, 
                total:pager.totalRows, 
                // hideOnSinglePage:true,
                onChange:getIndexPage,
                current: pager.pageIndex
            }}
        />
        <p>备注：仅限站内消息类型有“待处理”和“已处理状态”，站内消息+邮件均为“已发送”状态</p>
        <WarningInofMod warningInof={warningInof} closeDetailMod={closeDetailMod} getIndexPage={getIndexPage} delwithWarn={delwithWarn}/>
    </>
}



//配置列表
const WarningConfigList = props=>{
    const [warningList, setWarningList] = useState({
        pager: {},
        list: []
    });
    const [editId, setEditId] = useState([]);//当前操作的告警配置 [id,name,删除还是停止]
    useEffect(() => {
        getWarningList(initPager);
    }, []);
    
    const getWarningList = param => {
        get(Paths.getWarningConfigLi, param, { loading: true }).then(res => {
            setWarningList(res.data);
        });
    };
    const columns = [
        {title: "规则名称",dataIndex: "name",key: "name"},
        {title: "描述",dataIndex: "remark", key: "remark"},
        {title: "运行状态",dataIndex: "status",key: "status",
            render: s => <span>{ {'0':'初始状态','1':'运行中','2':'已停止'}[s] }</span>
        },
        {title: "最近编辑时间",dataIndex: "updateTime",key: "updateTime",
            render: t=>  t ? DateTool.utcToDev(t) : "--"
        },
        {title: "操作",dataIndex: "id", key: "id",
            render: (t,record)=>{
                let {id,name,status} = record;
                return <span>
                    <a href={`#/open/base/device/warningConfig/${id}`}>编辑</a><Divider type="vertical" />
                    {
                        status==1&&
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
        let questurl =  editId[2] == "del" && Paths.delWarningConfig || Paths.stopWarningConfig;
        get(questurl, {ruleId:editId[0]}, { loading: true }).then(res => {
            getIndexPage(warningList.pager.pageIndex || 1);
            setEditId([]);
        });
    }
    const startRule = (id)=>{
        get(Paths.startWarningConfigLi, {ruleId:id}, { loading: true }).then(res => {
            getIndexPage(warningList.pager.pageIndex || 1);
        });
        
    }
    const {list,pager} = warningList;

    return <>
        <div className="addwarning-btn"><Button href='#/open/base/device/addWarningConfig' icon="plus" type="primary">新增</Button></div>
        <Table 
            rowKey="id"
            columns={columns} 
            dataSource={list}
            pagination={{
                defaultCurrent:pager.pageIndex, 
                total:pager.totalRows, 
                // hideOnSinglePage:true,
                onChange:getIndexPage,
                current: pager.pageIndex
            }}
        />
        <ActionConfirmModal
            visible={editId.length>0}
            modalOKHandle={delOrStop}
            modalCancelHandle={()=>{setEditId([])}}
            title={editId[2]=="del"&&"删除"||"停止"}
            descText={`即将${editId[2]=="del"&&"删除"||"停止"}告警配置`}
            needWarnIcon={true}
            targetName={editId[1]}
        />

    </>


}
