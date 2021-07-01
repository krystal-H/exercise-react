import React,{useState,useEffect} from 'react';
import {Button,Icon,Table,Divider,Tooltip} from 'antd';
import { get,Paths } from '../../../../../api';
import { DateTool, setFuncDataType,addKeyToTableData, createArrayByLength} from '../../../../../util/util';
import { cloneDeep} from 'lodash';

import AloneSection from '../../../../../components/alone-section/AloneSection'
import DescWrapper  from '../../../../../components/desc-wrapper/DescWrapper';
import FlowChart from '../../../../../components/flow-chart/FlowChart';

import { RemoteConfigAddModal as AddModal,RemoteConfigDetailModal as DetailModal,RemoteErrorLogModal } from './remoteConfigModals';

import './RemoteConfig.scss';
import ActionConfirmModal from '../../../../../components/action-confirm-modal/ActionConfirmModal';

const DESC = ['平台支持远程更新设备的配置数据，您可以提交远程配置任务，实时对设备的系统参数等数据进行远程更新，并且获取设备配置的更新状态；详细说明可参考文档']
const FLOWLIST = [
    {
        title:'创建远程配置任务'
    },
    {
        title:'添加配置数据'
    },
    {
        title:'选择设备'
    },
    {
        title:'执行任务'
    }
]
const PAGE_ROWS = 10
const statusText = ['草稿','待执行','执行中','已执行']
const statusTextForDevice = ['','执行中','执行成功','执行失败']

export default function RemoteConfig({productId,protocolLists = [],remoteType='product',deviceId,deviceUniqueId,macAddress}) {

    const [addVisible,setAddVisible] = useState(false)
    const [detailData,setDetailData] = useState({detailVisible:false,selectRecord:{}})
    const [remoteConfigList,setRemoteConfigList] = useState([])
    const [remoteConfigPager,setRemoteConfigPager] = useState({pageIndex:1})
    const [deleteParams,setDeleteParams] = useState({deletevisible:false,deleteItem:null,deleteLoading:false})
    const [configProtoclList,setConfigProtoclList] = useState([])
    const [protocolFormat,setProtocolFormat] = useState(0)
    const [editData,setEditData] = useState(null)
    const [errorLog,setErrorLog] = useState({errorLogVisible:false,errorLogRecord:{}})
    
    const {errorLogVisible,errorLogRecord} = errorLog;
    const {totalRows,pageIndex,pageRows} = remoteConfigPager
    const {deletevisible,deleteItem,deleteLoading} = deleteParams
    const {detailVisible,selectRecord} = detailData

    const isDeviceRomote = remoteType === 'device'

    let _FLOWLIST = cloneDeep(FLOWLIST)

    if (isDeviceRomote) {
        _FLOWLIST.splice(2,1)
    }

    const _text = isDeviceRomote ? statusTextForDevice : statusText;

    let PageColumns = [
        {
            title: '任务ID',
            dataIndex: 'taskId',
            key: 'taskId',
            width:200,
        },
        {
            title: '任务说明',
            dataIndex: 'taskExplain',
            key: 'taskExplain'
        },
        {
            title: '更新设备数量',
            dataIndex: 'deviceTotal',
            key: 'deviceTotal',
            width:180
        },
        {
            title: '任务状态',
            dataIndex: 'status',
            key: 'status',
            width:180,
            render:(text,record) => {
                let {status} = record;

                return <span className={`h5-statu-${status+1}`}>{_text[status]}</span>
            }
        },
        {
            title: '执行时间',
            dataIndex: 'execTime',
            key: 'execTime',
            width:180,
            render:(text,record) => {
                let {execTime} = record;
                return <span>{execTime ? DateTool.utcToDev(execTime) : '--'}</span>
            }
        },
        {
            title: '操作',
            key: 'action',
            width:200,
            render: (text, record) => {
                const {status,taskId} = record
                return !isDeviceRomote ?( 
                <span>
                    {
                        ('' + status) === '1' ? 
                        <React.Fragment>
                            <a onClick={() => addOrEditRemoteConfig(record)}>编辑</a>
                            <Divider type="vertical" />
                            <a onClick={() => setDeleteParams({deletevisible:true,deleteItem:record})}>删除</a>
                        </React.Fragment> :
                        <a onClick={() => showRomoteConfigDetail(record)}>查看</a>
                    }
                </span>):     
                (<span>
                    <a onClick={() => showRomoteConfigDetail(record)}>查看</a>
                    {
                        ('' + status) === '3' ? 
                        <React.Fragment>
                            <Divider type="vertical" />
                            <a onClick={() => retryForDeviceByTaskId(taskId)}>重试</a>
                            <Divider type="vertical" />
                            <a onClick={() => showErrorLogForDeviceByTaskId(record)}>日志</a>
                        </React.Fragment> : null
                    }
                </span>)
            }
        }
    ]

    if (isDeviceRomote) {
        PageColumns.splice(2,1)
    }

    const getRemoteList = (_pageIndex) => {
        let   _path = Paths.getRomoteConfigListByProduct,
        _params = {
          pageIndex:_pageIndex || pageIndex,
          pageRows:PAGE_ROWS
        }

        if (isDeviceRomote) {
            _path = Paths.getRomoteConfigListForDevice
            _params.deviceId = deviceId
        } else {
            _params.productId = productId
        }

        get(_path,_params).then(data => {
            let {pager = {},list = []} = data.data;
            setRemoteConfigList(addKeyToTableData(list))
            setRemoteConfigPager(pager)
        })
    }

    useEffect(() => {
        getRemoteList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[productId, pageIndex, isDeviceRomote, deviceId])

    useEffect(() => {
        let config = protocolLists.filter(item => item.dataType == 5), // 配置协议
            _config = config[0] && config[0].list || [],
            _protocolFormat = config[0] && config[0].protocolFormat || 0;

        _config = _config.filter(item => item.property !== "Base_Null_Reserved_Null"); // 过滤保留字

        _config = _config.map((item,index) => {
            let {propertyValueDesc} = item,
                _params=null;
            if (propertyValueDesc && propertyValueDesc.indexOf('|') > -1) {
                _params = propertyValueDesc.split('|').map(item => {
                    let p = item.split('-');
                    if(p.length > 1) {
                        return {
                            name:p[1],
                            value:p[0]
                        }
                    }

                    return {}
                })
            }
            if (propertyValueDesc && propertyValueDesc.indexOf('~') > -1) {
                let [min,max] = propertyValueDesc.split('~');

                _params = {
                    min:+min,
                    max:+max
                }

            }
            return {
                ...item,
                _type:setFuncDataType(item),
                _params,
                _index:index,
                key:index
            }
        })
        setConfigProtoclList(_config)
        setProtocolFormat(_protocolFormat)
    },[protocolLists])

    const addOrEditRemoteConfig = (record) => {
        if (record) { // 编辑
            let {taskId} = record
            getDetail(taskId,1).then(data => {
                let {taskExplain,taskId,protocolJson,deviceList} = data.data,
                    _oldProtoclList = JSON.parse(protocolJson),
                    _oldPropertys = _oldProtoclList.map(item => item.property),
                    protocolSendData = configProtoclList.map(item => item.defaultPropertyValue || ''),
                    protocolSelection = [];
                    
                configProtoclList.forEach((item,index) => {
                    let {property} = item,
                        _index = _oldPropertys.indexOf(property);

                    if(_index > -1) {
                        protocolSendData[index] = _oldProtoclList[_index].sendData;
                        protocolSelection.push(index);
                    }
                })

                deviceList.forEach(item => item.key = item.deviceUniqueId)

                setEditData({
                    taskId,
                    taskExplain,
                    deviceList,
                    protocolSendData,
                    protocolSelection
                })
                setAddVisible(!addVisible)
            })
        } else {
            if(configProtoclList.length > 0) {
                setAddVisible(!addVisible)
            }
        }
    }

    const showRomoteConfigDetail = record => {
        let {taskId} = record;

        if (isDeviceRomote) {

            get(Paths.getRemoteDetailForDevice,{taskId},{loading:true}).then(data => {
                let {protocolJson} = data.data;

                setDetailData({
                    detailVisible:!detailVisible,
                    selectRecord:{...record,protocolConfig:JSON.parse(protocolJson)}
                })
            })

        } else {

            
            Promise.all([getDetail(taskId,2),getResultTotal(taskId),getDeviceResultList({taskId})]).then(datas => {
                const [detailData,totalData,deviceListData] = datas,
                {protocolJson = '[]'} = detailData.data,
                result = totalData.data,
                {list,pager} = deviceListData.data;
                
                setDetailData({
                    detailVisible:!detailVisible,
                    selectRecord:{...record,protocolConfig:JSON.parse(protocolJson),...result,list,pager}
                })
            })
        }
    }

    const changePage = index => {
        getRemoteList(index)
    }

    const deletelOKHandle = () => {
        let {taskId} = deleteItem

        setDeleteParams({
            ...deleteParams,
            deleteLoading:true            
        })

        get(Paths.deleteRomoteConfig,{
            taskId
        }).then(data => {
            getRemoteList(pageRows > 1 ? pageIndex : ((pageIndex - 1 > 0) ? pageIndex - 1 : 1))
        }).finally(() => {
            setDeleteParams({deletevisible:false,deleteItem:null,deleteLoading:false})
        })
    }

    const getDetail = (taskId,type) => {
        return get(Paths.getRemoteDetail,{
            taskId,
            type
        },{
            loading:true
        })
    }

    const getResultTotal = (taskId) => {
        return get(Paths.getResultTotal,{
            taskId
        },{
            loading:true
        })
    }

    const getDeviceResultList = (params) => {
        return get(Paths.getDeviceResultList,{
            ...params
        },{
            loading:true
        })
    }

    const searchDeviceResult = (params) => {
        getDeviceResultList(params).then( data => {
            let {list,pager} = data.data;

            setDetailData({
               detailVisible,
               selectRecord:{...selectRecord,list,pager}
            })
        })
    }

    const retryForDeviceByTaskId = (taskId) => {
        get(Paths.retryByTaskIdForDevice,{
            taskId
        },{loading:true}).then( data => {
            getRemoteList(pageIndex)
        })
    }

    const showErrorLogForDeviceByTaskId = (record) => {
        let {taskId,errorType} = record;

        if (errorType == 2) {
            get(Paths.getReceiveMsgForDevice,{
                taskId
            },{loading:true}).then( data => {
                setErrorLog({
                    errorLogVisible:true,
                    errorLogRecord:{
                        errorType,
                        receiveMsg: data.data && data.data.receiveMsg
                    }
                })
            })
        } else {
            setErrorLog({
                errorLogVisible:true,
                errorLogRecord:{
                    errorType,
                    receiveMsg:null
                }
            })
        }
    }

    return (
        <div className="remote-config-wrapper">
            <AloneSection style={{margin:'0 0 24px',padding:'24px'}}>
                <DescWrapper desc={DESC}></DescWrapper>
                <div style={{padding:'24px 0 0'}} className="use-service-flow-wrapper">
                    <FlowChart type={3} flowLists={_FLOWLIST}></FlowChart>
                    <div className="extra-descs">
                        <div className="descs-item">
                            <p>创建远程配置任务，填写任务的目的或备注信息</p>
                        </div>
                        <div className="descs-item">
                            <p>添加要更新的产品配置数据字段和更新的数值</p>
                        </div>
                        {!isDeviceRomote && 
                            <div className="descs-item">
                                <p>可通过设备ID/物理地址，设备标签，本地导入确定要配置的设备</p>
                            </div>
                        }
                        <div className="descs-item">
                            <p>提交执行远程配置任务，设备更新结果实时可见</p>
                        </div>
                    </div>
                </div>
            </AloneSection>
            <section className="remote-config-manage-wrapper section-bg">
                    <h3>
                        远程配置任务
                        {
                                !!configProtoclList.length ? 
                                <Button style={{float:'right'}} 
                                        type="primary"
                                        onClick={() => addOrEditRemoteConfig()}>
                                            <Icon type="plus"/>
                                            创建任务
                                </Button>:
                                <Tooltip title="无配置协议时不支持创建">
                                        <Button style={{float:'right'}} 
                                                type="primary"
                                                disabled={true}
                                            >
                                                <Icon type="plus"/>
                                                创建任务
                                        </Button>
                                </Tooltip>
                        }
                    </h3>
                    <div className="table-wrapper">
                        <Table columns={PageColumns}
                                    className="ant-table-fixed" 
                                    dataSource={remoteConfigList}
                                    pagination={{
                                        total: totalRows,
                                        current:pageIndex,
                                        defaultCurrent:1,
                                        defaultPageSize:PAGE_ROWS,
                                        onChange : (index) => changePage(index),
                                        showQuickJumper: true,
                                        hideOnSinglePage:true,
                                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                                    }}
                                    />
                    </div>
                    {
                        addVisible && <AddModal
                                            visible={addVisible}
                                            productId={productId}
                                            protocolFormat={protocolFormat}
                                            onCancel={() => {setAddVisible(false);setEditData(null)}}
                                            editData={editData}
                                            configProtoclList={configProtoclList}
                                            getRemoteList={getRemoteList}
                                            isDeviceRomote={isDeviceRomote}
                                            _deviceList={[{deviceId,deviceUniqueId,macAddress}]}
                                            ></AddModal>
                    }
                    {
                        detailVisible && <DetailModal
                                            visible={detailVisible}
                                            record={selectRecord}
                                            statusText={_text}
                                            isDeviceRomote={isDeviceRomote}
                                            searchDeviceResult={searchDeviceResult}
                                            onCancel={() => setDetailData({
                                                detailVisible:false,
                                                selectRecord:{}
                                            })}
                                            ></DetailModal>
                    }
            </section>
            {
                deletevisible && 
                <ActionConfirmModal
                    visible={deletevisible}
                    modalOKHandle={deletelOKHandle}
                    modalCancelHandle={() => setDeleteParams({deletevisible:false,deleteItem:null,deleteLoading:false})}
                    targetName={deleteItem.taskId}
                    confirmLoading={deleteLoading}
                    title={'删除任务'}
                    needWarnIcon={true}
                    descText={'即将删除的任务'}
                    tipText={'任务的所有信息将完全被删除，无法找回，请谨慎操作'}
                >
                </ActionConfirmModal>
            }
            {
                    errorLogVisible && 
                    <RemoteErrorLogModal visible={errorLogVisible}
                                         onCancel={() => setErrorLog({errorLogVisible:false,errorLogRecord:{}})} 
                                         record={errorLogRecord} ></RemoteErrorLogModal>
                }  
        </div>
    )
}
