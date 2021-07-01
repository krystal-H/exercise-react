import React, { useState,useEffect, useCallback } from 'react'
import {Radio,Input,Tabs,Button } from 'antd'
import {TslTree,ProTree } from './sql-tree/SqlTree'
import {publishFlow,saveNodes,testFlow} from '../../subjects'
import { get,Paths,post} from '../../../../api'
import { TestModal,DownHistory } from './Modals'
import ResTable from './table-field-list/TableFieldList'
import { ServeSourceConfig} from '../../../develop-center/serve-develop/ServeModals'


const { TabPane } = Tabs;
const { TextArea } = Input;

import './SqlAnalysis.scss'
import { Notification } from '../../../../components/Notification'

const getParamsFromSqlstr = str=>{
    const paramarr = str.match(/(?<={).*?(?=})/g)
    return paramarr || []
}

export default function SqlAnalysis({
    service,
    getServeStatu
}) {
    const [productId,setProductId] = useState(undefined)
    const {serviceId,projectId,name} = service;
    const [action,setAction] = useState()
    const [sqlResult,setSqlResult] = useState([])
    const [sqlStr,setSqlStr] = useState('select ')
    const [paramsvisiable,setParamsvisiable] = useState(false)
    const [paramsVals,setParamsVals] = useState([])
    const [logicName,setLogicName] = useState('TSL')// TSL, product
    const [proLogicData,setProLogicData] = useState({})
    const [downHistoryVisi,setDownHistoryVisi] = useState(false)
    const [flowId,setFlowId] = useState()
    const [downHistoryLi,setDownHistoryLi] = useState([])
    const [downHistoryLoading,setDownHistoryLoading] = useState(false)
    const [publishsource,setPublishsource] = useState(false)

    
    

    
    const changeAction = e=>{
        let val = e.target.value
        setAction(val)
    }
    const changeSql = val=>{
        setSqlStr(val)
    }
    const setSelectedData = selectarr=>{
        let s = selectarr[0]
        if(s){
            setSqlStr(sqlStr + ' ' + s)
        }  
    }
    const closeParams = ()=>{
        setParamsvisiable(false)
    }
    const getParamsInNode1 = ()=>{
        return getParamsFromSqlstr(sqlStr).map((key,idx)=>{
            return {
                    param_name:key,
                    param_typ:0,
                    param_required:0,
                    param_default:paramsVals[idx],
                    param_desc:""
                }
        })
    }
    const getParamsInNode2 = ()=>{
        let obj = {};
        let params = getParamsFromSqlstr(sqlStr);
        for(let i=0;i<params.length;i++){
            let key = params[i],
                val = `{{1@${key}}}`;
            obj[key] = val
        }
        return obj
    }
    const closeDownHistory = ()=>{
        setDownHistoryVisi(false)
    }
    const openDownHistory = ()=>{
        setDownHistoryVisi(true)
        getDownTslHistory()
    }
    const getDownTslHistory = ()=>{
        setDownHistoryLoading(true)
        get(Paths.downTslHistory, {flowId}).then(({data=[]})=>{
            setDownHistoryLi(data)
        }).finally(()=>{
            setDownHistoryLoading(false)
        })
    }

    const addTslHistory=()=>{
        get(Paths.addTslHistory, {
            sql:sqlStr,
            projectId,
            productId,
            paramsMap:encodeURI(JSON.stringify(getParamsobj())),
            createTime:new Date().getTime(),
            flowId 
        }).then((data)=>{
            getDownTslHistory()
        })
    }

    const getParamsobj = (val=paramsVals)=>{
        let paramsobj = {}
        if(paramsVals.length>0){
            let params = getParamsFromSqlstr(sqlStr)
            for(let i=0;i<params.length;i++){
                let key = params[i],
                    val = paramsVal[i];
                paramsobj[key] = val
            }
        }
        return paramsobj

    }
    const sqlTest=(paramsVal=[])=>{
        setParamsVals(paramsVal)
        let paramsobj = getParamsobj(paramsVal)
        let apipath = Paths.sqlTestProductData,
            requestparam = {
                sql:sqlStr,
                paramsMap:encodeURI(JSON.stringify(paramsobj))
            };

        if(logicName == 'TSL'){
            apipath = Paths.sqlTestTslData;
            requestparam.projectId = projectId;
            requestparam.productId = productId
        }
        get(apipath, requestparam).then(({code,data=[]})=>{
            setParamsvisiable(false)

            if(data.length>100){
                data = data.slice(0,100)
            }
            setSqlResult(data) 
        })

    }

    const publishTest = (source={})=>{
        
        post(Paths.servePublish,{
            serviceId,
            envType:1,
            operate:1,
            ...source
        },{ timeout: 5 * 60 * 1000 }).then(data => {
            Notification({
                type:'success',
                message:'发布成功'
            })
            getServeStatu()
        })

    }

    const changeLogictype = val=>{
        setLogicName(val)
    }
    useEffect( () => {
        const save = saveNodes.asObservable().subscribe(res => {
            let act = action||new Date().getTime()
            post(Paths.saveFlowData,{
                projectId,
                serviceId,
                lines:'',
                action:act,
                nodes:[
                    {
                        nodeType:101,
                        id:1,
                        nodeName:'数据查询起始',
                        location:'',
                        input:JSON.stringify({
                            action:act,
                            authCheck:1,
                            input:getParamsInNode1() 
                        }),
                        output:''

                    },
                    {
                        nodeType:3101,
                        id:2,
                        pid:1,
                        nodeName:'数据查询',
                        location:'',
                        input:JSON.stringify({
                            productId,
                            projectId,
                            logicSql:sqlStr,
                            logicName,
                            superInstanceId:localStorage.getItem("superInstanceId"),
                            params: JSON.stringify(getParamsInNode2()),
                            
                        }),
                        output:''
                    },
                    {
                        nodeType:701,
                        id:3,
                        pid:2,
                        nodeName:'数据查询结束',
                        location:'',
                        input:JSON.stringify({source:1,sourceType:0,value:2}),
                        output:''
                    }
                ]
            },{needJson:true,noInstance:true}).then(
                data => {
                    Notification({
                        type:'success',
                        message:'保存成功'
                    })
    
                    getServeStatu()
                }
            )

        })
        const publish = publishFlow.asObservable().subscribe(res => {
            setPublishsource(true)
            // get(Paths.servePublish,{
            //     serviceId,
            //     envType:1,
            //     operate:1
            // }).then(data => {
            //     Notification({
            //         type:'success',
            //         message:'发布成功'
            //     })
            //     getServeStatu()
            // })
        })
        const test = testFlow.asObservable().subscribe(res => {//调试
            let params = getParamsFromSqlstr(sqlStr);
            if(params.length>0){
                setParamsvisiable(true)
            }else{
                sqlTest()
            } 
        })
        return () => {
            save.unsubscribe()
            publish.unsubscribe()
            test.unsubscribe()
        }
    },[
        getServeStatu, 
        serviceId,
        productId,
        sqlStr,
        logicName,
        action
    ])
    useEffect( () => {//初始化
        if (serviceId) {
            get(Paths.getFlowData,{serviceId},{noInstance:true}).then(data => {
                if (data.data) {
                    let {flowNodeList = [],flowId,action} = data.data;
                    setFlowId(flowId)
                    setAction(action)
                    if (flowNodeList && flowNodeList.length > 1) {
                        let {input} = flowNodeList[1];
                        if (input) {
                            let {productId,
                                logicSql,
                                logicName,
                            } = JSON.parse(input)
                            setSqlStr(logicSql)
                            setLogicName(logicName)
                            setProductId(productId)
                        }
                    }
                }
            })
        }
    },[serviceId])
    useEffect( () => {//预先获取逻辑模型树结构
        get(Paths.getProLogicTreeData,{},{noInstance:true}).then(data => {
            setProLogicData(data.data||{})
        })
        
    },[])
    
    return (
        <div className="sql-analysis-wrapper">
            <div className="left-wrapper">
                <div className="table-tree-wrapper">
                    <Tabs activeKey={logicName} className='tabpane' onChange={(t)=>{changeLogictype(t)}}>
                        <TabPane tab="物模型" key="TSL">
                            <TslTree setSelectedData={setSelectedData} setPropsProductId={setProductId} productId={productId} ></TslTree>
                        </TabPane>
                        <TabPane tab="逻辑模型" key="product">
                            <ProTree setSelectedData={setSelectedData} proLogicData={proLogicData} ></ProTree>
                        </TabPane>
                    </Tabs>
                </div>
            </div>
            <div className="sql-code-edit-wrapper">
                <div className='topbtn'>
                    <Button type="primary" 
                        size="small"
                        onClick={openDownHistory}
                        disabled={logicName=='product'}
                    > 导出</Button>
                </div>
                <div className='configitem'>
                    <span className='itemname'>SQL语句</span>
                    <TextArea
                        rows={8}
                        value={sqlStr}
                        onChange={(e)=>{changeSql(e.target.value)}}
                    />
                </div>
               <div className='configitem'>
                   <span className='itemname'>发布路径</span>
                   <Input value={action} placeholder="选填" onChange={e=>{changeAction(e)}}/>
               </div>
                <div className='configitem'>
                    <span className='itemname'>调试结果</span>
                    {
                        sqlResult.length>0 && <ResTable fieldList={sqlResult} />
                    }

                </div>
            </div>

            {
                paramsvisiable&&
                <TestModal
                    visible={true}
                    params={getParamsFromSqlstr(sqlStr)}
                    cancelHandle={closeParams}
                    sqlTest={sqlTest}
                />
            }

            <DownHistory
                visible={downHistoryVisi}
                cancelHandle={closeDownHistory}
                downHistoryLi={downHistoryLi}
                getDownTslHistory={getDownTslHistory}
                downHistoryLoading={downHistoryLoading}
                addTslHistory={addTslHistory}
            />

            <ServeSourceConfig
                visible={publishsource}
                envdata = {{id:serviceId,actionType:1,name}}
                onOk={publishTest}
                onCancel={()=>setPublishsource(false)}
            />


            
        </div>
    )
}
