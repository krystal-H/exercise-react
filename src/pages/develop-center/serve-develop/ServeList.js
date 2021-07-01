import React,{useState,useCallback,useEffect} from 'react'
import { Button, Input, Table, Divider,Modal } from 'antd'
import { DateTool,openNewWindow } from '../../../util/util'
import { Paths, get, post } from '../../../api'
import { AddServe,CallExplain,CopyServe,ServeSourceConfig} from './ServeModals'
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal'
import { Link} from 'react-router-dom'

import './ServeDevelop.scss'
import { Notification } from '../../../components/Notification'
const PAGE_ROWS = 10

//testEnv和proEnv的值 0、1、2、3，0是开发状态，按钮也显示“发布”，但灰色不可点击
const ACTIONYPE = ["发布","发布","停止","启动","",""] 

export default function ServeList({projectId}) {
    const [addServeVisible,setAddServeVisible] = useState(false)
    const [callExplainData,setcallExplainData] = useState({
        callExplainVisible:false,
        paramList:[],
        url:[]
    })
    const [name,setName] = useState('')
    const [dataList,setDataList] = useState([])
    const [dataPager,setDataPager] = useState({totalRows:0,pageIndex:1})
    const [projectList,setProjectList] = useState([])
    const [actionData,setActionData] = useState({actionType:0,actionRecord:{},actionLoading:false}) //actionType 0,没有操作，1 在测试环境操作,2 在生产环境操作,3 删除操作
    const [dataAnlData,setDataAnlData] = useState({dataAnlVisibel:false,dataAnlRecord:null})
    const [copyServeId,setCopyServeId] = useState(-1)//复制服务操作的服务id，默认值-1表示当前没有复制操作，复制弹窗不可见
    const [editContent,setEditContent] = useState({id:-1, neme:"", desc:""})//修改服务名称、描述（和复制用的同一个弹窗组件）

    const {totalRows,pageIndex} = dataPager
    const {callExplainVisible,paramList,url} = callExplainData
    const {actionType,actionRecord,actionLoading} = actionData
    const {dataAnlVisibel,dataAnlRecord} = dataAnlData

    // const getList = useCallback(
    //     (index) => {
    //         console.log(name);
    //         let _data = {

    //         };
    //         projectId && (_data.projectId = projectId);
    //         index && (_data.pageIndex = index);
    //         name && (_data.name = name);
    //         get(Paths.getServeList,_data,{loading:true}).then(
    //             data => {
    //                 const {list,pager} = (data && data.data) || {}
    //                 setDataList(list)
    //                 setDataPager(pager)
    //             }
    //         )
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [projectId,name]
    // )

    useEffect(() => {
        getList(1)
    }, [getList,projectId])
    //获取服务列表
    const getList = (index) => {
        let _data = {
            pageRows:10
        };
        projectId && (_data.projectId = projectId);
        index && (_data.pageIndex = index);
        name && (_data.name = name);
        get(Paths.getServeList,_data,{loading:true}).then(
            data => {
                const {list,pager} = (data && data.data) || {}
                setDataList(list)
                setDataPager(pager)
            }
        )
    }
    //打开新增服务弹窗
    const openAddServe = async () => {
        if (!projectId) {
            const res = await get(Paths.getProjectList,{},{loading:true})
            setProjectList(res.data || [])
        }
        setAddServeVisible(true)
    }
    //新增服务
    const addServeOkHandle = (values) => {
        post(Paths.serveAdd,{...values},{
            loading:true
        }).then(() => {
            setName('')
            setAddServeVisible(false)
            getList(1)
            Notification({
                type:'success',
                description:`新增成功！`
            })
        })
    }
    //复制或者修改服务
    const copyOrEditOkHandle = (values) => {
        if(copyServeId!==-1){
            post(Paths.serveCopy,{...values,id:copyServeId},{
                loading:true
            }).then(() => {
                setName('');
                setCopyServeId(-1);
                getList(1);
            })
        }else if(editContent.id!==-1){
            post(Paths.updateServe,{...values,id:editContent.id},{
                loading:true
            }).then(() => {
                setEditContent({id:-1,name:"",desc:""})
                getList(pageIndex);
            })
        }

        
    }
    //发布服务
    const publishServe = (serviceId,envType,operate,source={}) => {
        post(Paths.servePublish,{
            serviceId,
            envType,
            operate,
            ...source
        },{ timeout: 5 * 60 * 1000 }).then(data => {
            getList(pageIndex)
            // Notification({
            //     type:'success',
            //     description:`${operate==1&&'发布'||'启动'}成功！`
            // })
        }).finally(actionCancelHandle)
    }
    //删除服务
    const deleteServe = id => {
        post(Paths.serveDelete,{
            id
        }).then( () => {
            getList()
            Notification({
                type:'success',
                description:'删除成功！'
            })
        }).finally(actionCancelHandle)
    }
    //打开 发布、启动、停止、删除 弹窗
    const openActionModal = async (type,record) => {
        setActionData( preData => {
            return {
                ...preData,
                actionType:type,
                actionRecord:{...record},
            }
        })
    }
    //停止、删除服务二次确认
    const confimOKHandle = () =>{
        setActionData(preData => {
            return {
                ...preData,
                actionLoading:true
            }
        })
        let id = actionRecord.id;
        if(actionType==3){//删除
            deleteServe(id);
        }else{//停止
            let env = actionType==1&&1||0; //1 测试， 0 生产
            publishServe(id,env,2)
        }
    }
    //发布服务确认
    const publishOkHandle = (source) => {
        setActionData(preData => {
            return {
                ...preData,
                actionLoading:true
            }
        })
        let {id,proEnv,testEnv} = actionRecord,
            env = 1,
            operate = testEnv;
        if( actionType==2 ){//actionType 0,没有操作，1 在测试环境操作,2 在生产环境操作,3 删除操作
            env = 0;
            operate = proEnv;
        }
        publishServe(id,env,operate,source)
    }

    //关闭 发布、启动、停止、删除 弹窗
    const actionCancelHandle =()=>{
        setActionData({
            actionType:0,
            actionRecord:{},
            actionLoading:false
        })
    }
    //打开调用说明弹窗
    const getExplain = id => {
        get(Paths.serveCallExplain,{serviceId:id},{loading:true}).then( data => {
            let paramList = [],
                url = '';

            if (data.data) {

                if (data.data.input) {

                    let _list = JSON.parse(data.data.input)
                    _list.input && (paramList = _list.input)
                   
                }

                if (data.data.flowVersion) {
                    url = data.data.flowVersion.invokeUrl || ''
                }

            }
            setcallExplainData({
                paramList,
                url,
                callExplainVisible:true
            })
        })
    }
    //进入数据分析服务页面
    const openDataAnalysis = (funcType,record) => {
        let {id,projectId,desc,name} = record || dataAnlRecord || {};

        openNewWindow(`/dataAnalysis/${projectId}/${id}`,`desc=${desc}&name=${name}&analysisiType=${funcType}`)

        setDataAnlData(preData => {
            return {
                ...preData,
                dataAnlVisibel:false
            }
        })
    }
    //进入数据分析服务页面
    const editDataAnalysis = (record) => {
        const {id} = record;

        get(Paths.getDataAnlzType,{
            serveId:id
        }).then(data => {
            let {funcType} = (data && data.data) || {}

            if (funcType) {
                openDataAnalysis(funcType,record)
            } else {
                setDataAnlData(preData => {
                    return {
                        ...preData,
                        dataAnlVisibel:true,
                        dataAnlRecord:record
                    }
                })
            }
        })
    }
    //编辑按钮
    const getEditDom = record => {
        const {id,type = 0,projectId} = record;
        if (+type === 0) {
            // target="_black"打开新窗口会在自身已经是被打开的新窗口时失效，即只能打开一个新窗口，后续再打开新窗口都是在里面进行更新
            return (
                <a onClick={() => openNewWindow(`/logicDevelop/${projectId}/${id}`)}>编辑</a>
            )
        }
        return (
            <a onClick={() => editDataAnalysis(record)}>编辑</a>
        )
    }
    const cancelEditCopyMod = ()=>{
        if(copyServeId!==-1){
            setCopyServeId(-1)

        }else if(editContent.id !==-1){
            setEditContent({id:-1,name:"",desc:""})
        }   
    }
    const PageColumns =  [
        {
            title: '服务名称',
            dataIndex: 'name',
            key: 'name',
            width: 160,
            render:(name, record)=>{
                const {id,desc} = record;
                return <a onClick={() => setEditContent({id,name,desc})}>{name}</a>
            }
        },
        {
            title: '服务类型',
            dataIndex: 'type',
            key: 'type',
            width: 160,
            render: (text, record) => {
                let { type = 0 } = record;
                return <span>{['业务逻辑服务','数据分析服务'][type]}</span>
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 160,
            render: (text, record) => {
                let { createTime } = record;
                return <span>{createTime ? DateTool.utcToDev(createTime) : '--'}</span>
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 500,
            render: (text, record) => {
                const {id,type = 0,testEnv,proEnv,projectId,name} = record;
                const testactiontxt = testEnv==5?'重新发布新版本到测试环境':`${ACTIONYPE[testEnv]}测试环境`
                const proactiontxt = proEnv==5?'重新部署新版本到生产环境':`${ACTIONYPE[proEnv]}生产环境`

                return <span>
                    {
                        proEnv === 2 &&
                        <>
                            <Link to={{
                                pathname:`/open/developCenter/serveDetail/${id}`,
                                search:`?serveName=${name}&projectId=${projectId}&type=${type}`
                            }} target="_black">查看</Link>
                            <Divider type="vertical" />
                        </>
                    }
                    {
                        getEditDom(record)
                    }
                    <Divider type="vertical" />
                    <a disabled={testEnv === 0} onClick={() => openActionModal(1,record)}>{testactiontxt}</a>
                    <Divider type="vertical" />
                    <a disabled={!'type === 1'} onClick={() => getExplain(id)}>调用说明</a>
                    <Divider type="vertical" />
                    <a disabled={proEnv === 0} onClick={() => openActionModal(2,record)}>{proactiontxt}</a>
                    <Divider type="vertical" />
                    {/* <a disabled={type === 1}  onClick={() => setCopyServeId(id)}>复制</a> */}
                    <a onClick={() => setCopyServeId(id)}>复制</a>
                    <Divider type="vertical" />
                    <a onClick={() => openActionModal(3,record)}>删除</a>
                </span>
            }
        }
    ]
    const getActionModal = ()=>{
        let {id,name,proEnv,testEnv} = actionRecord;
        let isDelete = actionType==3,
            isTest = actionType==1,
            isPro = actionType==2,
            testStop = testEnv==2,
            proStop = proEnv==2;
       
        return <>
            <ActionConfirmModal
                visible={isDelete ||  isTest && testStop || isPro && proStop}
                modalOKHandle={confimOKHandle}
                modalCancelHandle={actionCancelHandle}
                targetName={name}
                confirmLoading={actionLoading}
                title={isDelete&&'删除服务'||'停止服务'}
                needWarnIcon={true}
                descText={`即将${['在测试环境停止','在生产环境停止','删除服务'][actionType - 1]}`}
            >
            </ActionConfirmModal>

            <ServeSourceConfig
                visible={ (isTest&&!testStop) || (isPro&&!proStop)}
                envdata = {{id,actionType,testEnv,proEnv,name}}
                onOk={publishOkHandle}
                confirmLoading={actionLoading}
                onCancel={actionCancelHandle}>
            </ServeSourceConfig>
        
        </>

    } 
    return (
        <>
            <div className="tab-content-wrapper">           
                <div className="tools">
                    <span className="tool-item">
                        <Button type="primary"
                            onClick={openAddServe}
                            icon="plus">新建服务</Button>
                    </span>
                    <span className="tool-item">
                        <Input placeholder="请输入服务名称查询"
                            style={{ width: '240px' }}
                            value={name}
                            onChange={e =>  setName(e.target.value)}
                            maxLength={20} />
                    </span>
                    <span className="tool-item">
                        <Button type="primary" icon="search" onClick={() => getList(1)}>查询</Button>
                    </span>
                </div>
            </div>
            <div className="table-wrapper">

                <Table columns={PageColumns} rowKey='id'
                    dataSource={dataList}
                    pagination={{
                        total: totalRows,
                        current: pageIndex,
                        defaultCurrent: 1,
                        defaultPageSize: PAGE_ROWS,
                        onChange: (index) => getList(index),
                        showQuickJumper: true,
                        hideOnSinglePage: true,
                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                    }}
                />
            </div>
            {
                addServeVisible &&
                <AddServe  
                    visible={addServeVisible}
                    onOk={addServeOkHandle}
                    projectId={projectId}
                    projectList={projectList}
                    onCancel={() => setAddServeVisible(false)}>
                </AddServe>
            }
            {
                copyServeId &&
                <CopyServe 
                    visible={copyServeId!==-1 || editContent.id!==-1}
                    editContent= {editContent}
                    onOk={copyOrEditOkHandle}
                    onCancel={cancelEditCopyMod} >
                </CopyServe>
            }
            { getActionModal() }
            
            {
                callExplainVisible &&
                <CallExplain paramList={paramList} url={url} visible={callExplainVisible} onCancel={() => setcallExplainData({callExplainVisible:false,paramList:[]})}></CallExplain>
            }
            {
                dataAnlVisibel && 
                <Modal  visible={dataAnlVisibel}
                        className="sql-modal-self-class" 
                        width={500}
                        title="选择数据分析类型"
                        closable={true}
                        centered={true}
                        footer={null}
                        onCancel={() => setDataAnlData({dataAnlVisibel:false,dataAnlRecord:null})}
                        destroyOnClose={true}
                        maskClosable={false}>
                        <div className="type-select">
                            <span onClick={() => openDataAnalysis(1)}>节点实时流任务</span>
                            <span onClick={() => openDataAnalysis(3)}>数据分析任务</span>
                            <span onClick={() => openDataAnalysis(4)}>SQL实时流任务</span>
                        </div>
                </Modal>
            }
        </>
    )
}
