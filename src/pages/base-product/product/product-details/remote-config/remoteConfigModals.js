import React, { useState, useEffect, useRef } from 'react'
import { Modal, Button, Input, Table, Select, InputNumber, Icon, Divider } from 'antd'
import FlowChart from '../../../../../components/flow-chart/FlowChart';
import { createArrayByLength } from '../../../../../util/util';
import { get, post, Paths } from '../../../../../api';
import { Notification } from '../../../../../components/Notification';
import { DateTool, uniqueItemInArrayByKey, checkFileTypeAndSize } from '../../../../../util/util';
import { cloneDeep } from 'lodash';

const { TextArea, Search } = Input;
const { Option } = Select;

const FlowList = [
    {
        title: '填写任务说明'
    },
    {
        title: '添加配置数据'
    },
    {
        title: '选择配置更新的设备'
    }
]

const deviceStatu = ['待执行', '执行中', '成功', '失败'];

export function RemoteConfigAddModal({ visible, productId, onCancel, configProtoclList, isDeviceRomote, getRemoteList, _deviceList,editData ,protocolFormat}) {
    const [step, setStep] = useState(0)
    const [remoteConfigParams, setRemoteConfigParams] = useState(editData ? {taskExplain : editData.taskExplain}: { taskExplain: ''})
    const [protocolSendData, setProtocolSendData] = useState(editData ? (editData.protocolSendData || []) : configProtoclList.map(item => item.defaultPropertyValue || ''))
    const [selectedProtocols,setSelectedProtocols] = useState(editData ? (editData.protocolSelection || []) : [])
    const [sendDataCheck, setSendDataCheck] = useState([])
    const [deviceSelectType, setDeviceSelectType] = useState(1) // 1 - 全部设备； 2 - 通过设备ID/物理地址查找；3 - 导入设备列表（本地文件）；
    const [selectDeviceIndexToAdd, setSelectDeviceIndexToAdd] = useState([])
    const [allDeviceInfo, setAllDeviceInfo] = useState({ curDeviceInfoList: [], allDeviceInfoList: [], allDeviceInfoPager: { pageIndex: 1, currPageRows: 7 } })
    const [searchedDeviceInfoList, setSearchedDeviceInfoList] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [importDeviceData, setImportDeviceData] = useState({ allList: [], successList: [], errorList: [], errorVisible: false })
    const [excelFileName, setExcelFileName] = useState('')
    const [isShowImportResult, setIsShowImportResult] = useState(false)
    const [rightDeviceList, setRightDeviceList] = useState({ rightAllList: editData ? editData.deviceList :[], rightTempList: editData ? editData.deviceList :[] })
    const [selectDeviceIndexToDelete, setSelectDeviceIndexToDelete] = useState([])
    const rightSearchInput = useRef(null);

    const { taskExplain } = remoteConfigParams
    const { curDeviceInfoList, allDeviceInfoList, allDeviceInfoPager } = allDeviceInfo
    const { allList, successList, errorList, errorVisible } = importDeviceData
    const { rightAllList, rightTempList } = rightDeviceList
    const END_STEP = isDeviceRomote ? 1 : 2

    let _FlowList = cloneDeep(FlowList)

    if (isDeviceRomote) {
        _FlowList.splice(2, 1)
    }

    const getAllDeviceInfo = (_pageIndex) => {
        get(Paths.getAllDeviceInfo, {
            productId,
            pageRows: 8,
            pageIndex: _pageIndex || allDeviceInfoPager.pageIndex
        }).then(data => {
            if (data.data) {
                let { list = [], pager = {} } = data.data;

                let _allDeviceInfoList = [...allDeviceInfoList, ...list]

                list.forEach(item => {
                    item.key = item.deviceUniqueId
                })

                setAllDeviceInfo({
                    curDeviceInfoList: list,
                    allDeviceInfoPager: pager,
                    allDeviceInfoList: _allDeviceInfoList
                })
            }
        })
    }

    useEffect(() => {
        if (!isDeviceRomote) {
            getAllDeviceInfo()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, isDeviceRomote])

    const dealSendDataToProtocolJson = () => {
        if (protocolFormat !== 1) {
            return selectedProtocols.map((item) => {
                let protocol = configProtoclList[item];
    
                delete protocol._type
                delete protocol._params
                delete protocol._index
                delete protocol.key
    
                return {
                    ...protocol,
                    sendData: protocolSendData[item]
                }
            })
        } else {   
            return protocolSendData.map((item, index) => {
                let protocol = configProtoclList[index];
                
                delete protocol._type
                delete protocol._params
                delete protocol._index
                delete protocol.key
                
                return {
                    ...protocol,
                    sendData: item
                }
            })
        }
    }

    const saveOrSubmit = (needSubmit) => {
        let _path = Paths.saveRomoteConfig,
            _params = {
                taskExplain,
                productId,
                protocolJson: JSON.stringify(dealSendDataToProtocolJson())
            }

        if (isDeviceRomote) {
            _path = Paths.saveRomoteConfigForDevice
            _params.deviceList = _deviceList
        } else {

            if(rightAllList.length < 1) {
                Notification({
                    description: '请至少选择一个设备'
                })

                return
            }

            _params.deviceList = rightAllList.map(item => {
                let { deviceId, deviceUniqueId, macAddress } = item;

                return {
                    deviceId,
                    deviceUniqueId,
                    macAddress
                }
            })

            if (editData) {
                _params.taskId = editData.taskId
            }
        }

        post(_path, _params, {
            needJson: true,
            loading: true,
            noInstance:true
        }).then(data => {
            if (needSubmit) {
                let taskId = data.data;

                get(Paths.submitRomoteConfig, {
                    taskId,
                    productId
                }, {
                    loading: true
                }).then(data => {
                    getRemoteList(1)
                    onCancel()
                })

            } else {
                getRemoteList(1)
                onCancel()
            }
        })
    }

    const nextStepOrSubmitToEcecute = () => {
        if (step === 0) {
            if (!taskExplain) {
                Notification({
                    description: '请输入远程配置的备注信息'
                })
                return;
            }

        } else if (step === 1) {
            let temp = [];

            if (protocolFormat !== 1) {

                if(selectedProtocols.length < 1) {
                    Notification({
                        description: '请至少选择一条配置协议'
                    })
                    
                    return
                } else {
                    selectedProtocols.forEach((item) => {
                        if (['',' ',null,undefined].includes(protocolSendData[item])) {
                            temp.push(item)
                        }
                    })
                }

            } else {   
                protocolSendData.forEach((item, index) => {
                    if (['',' ',null,undefined].includes(item)) {
                        temp.push(index)
                    }
                })
            }

            if (temp.length > 0) {
                Notification({
                    description: '请为配置协议添加参数'
                })
                setSendDataCheck(temp)
                return;
            }

        } else if (step === 2) {
            if (rightAllList.length < 1) {
                Notification({
                    description: '请至少选择一个设备'
                })
                return;
            }
        }

        if (step === END_STEP) {
            saveOrSubmit(!isDeviceRomote)
        } else {
            setStep(step + 1)
        }
    }

    const canCelOrSave = () => {
        if (step === 2) {
            saveOrSubmit()
        } else {
            onCancel()
        }
    }

    const changeTaskExplain = e => {
        setRemoteConfigParams({
            ...remoteConfigParams,
            taskExplain: e.target.value.trim()
        })
    }

    const changeSendData = (value, index) => {
        let temp = [...protocolSendData],
            _sendDataCheck = sendDataCheck.filter(item => item !== index);

        temp[index] = value

        setProtocolSendData(temp)
        setSendDataCheck(_sendDataCheck)
    }

    const selectTypeChange = value => {
        setDeviceSelectType(+value)
        setSelectDeviceIndexToAdd([])
        setSearchedDeviceInfoList([])
    }

    const protocolSelectChange = selectedRowKeys => {
        setSelectedProtocols(selectedRowKeys)
    }

    const leftSelectChange = selectedRowKeys => {
        setSelectDeviceIndexToAdd(selectedRowKeys)
    }

    const righttSelectChange = selectedRowKeys => {
        setSelectDeviceIndexToDelete(selectedRowKeys)
    }

    const leftDeviceSearch = value => {
        if (!value) {
            Notification({
                description: '请输入查询条件'
            })
            return
        }

        setSearchLoading(true)

        get(Paths.getDeviceInfoByIdOrMacAddress, {
            productId,
            query: value
        }).then(data => {
            let temp = data.data;
            temp.key = temp.deviceUniqueId;
            if (data.data) {
                setSearchedDeviceInfoList([temp])
            }
        }).finally(() => {
            setSearchLoading(false)
        })
    }

    const rightDeviceSearch = (value) => {
        let _temp = [...rightAllList];

        if (value && !!value.trim()) {
            let _value = value.trim();

            _temp = rightAllList.filter(item => {
                let { deviceUniqueId, macAddress } = item;

                return (deviceUniqueId.indexOf(_value) > - 1) ||
                    (macAddress.indexOf(_value) > - 1)
            })
        }

        setRightDeviceList({
            ...rightDeviceList,
            rightTempList: _temp
        })
    }

    const getRemoteExcelTemplate = () => {
        window.open(Paths.downloadRemoteDeviceTemplateExcel)
    }

    const importRemoteExcel = e => {
        console.log(1)
        const input = e.target;

        if (input.files && input.files.length > 0) {

            let { isOk, type, size } = checkFileTypeAndSize(input.files, ['xls', 'xlsx'], 10000)

            if (!isOk) {

                Notification({
                    description: '文件类型或者大小不符合要求'
                })

                return;
            }

            let excel = input.files[0];

            post(Paths.importRemoteDeviceExcel, {
                uploadExcel: excel,
                productId
            }, {
                needFormData: true,
                loading: true
            }).then(data => {
                if (data.data) {
                    let allList = data.data,
                        successList = [],
                        errorList = [];

                    allList.forEach((item, index) => {
                        let { errorType, deviceUniqueId } = item
                        item.key = deviceUniqueId;

                        if (errorType) {
                            errorList.push({
                                deviceUniqueId,
                                errorType,
                                key:deviceUniqueId
                            })
                        } else {
                            successList.push({...item})
                        }
                    })

                    setImportDeviceData({
                        ...importDeviceData,
                        allList,
                        successList,
                        errorList
                    })
                    if (successList.length > 0) {
                        setRightDeviceList({
                            rightAllList: [...successList],
                            rightTempList: [...successList]
                        })
                        setSelectDeviceIndexToDelete([])
                    }
                    setExcelFileName(excel.name)
                    setIsShowImportResult(true)
                }
            })
        }
    }

    const leftToRight = () => {

        let _list = deviceSelectType == 1 ? allDeviceInfoList : searchedDeviceInfoList;

        let toAdd = _list.filter(item => selectDeviceIndexToAdd.includes(item.deviceUniqueId)),
            temp = uniqueItemInArrayByKey([...rightAllList, ...toAdd], 'deviceUniqueId');

        if (rightSearchInput) {
            rightSearchInput.current.input.input.value = ''
        }

        setRightDeviceList({
            rightAllList: temp,
            rightTempList: temp
        })
    }

    const deleteDeviceFromRightList = () => {
        if (selectDeviceIndexToDelete.length === 0) {
            return;
        }

        let _rightAllList = rightAllList.filter(item => {
            let { key } = item;
            return !selectDeviceIndexToDelete.includes(key)
        })
        let _rightTempList = rightTempList.filter(item => {
            let { key } = item;
            return !selectDeviceIndexToDelete.includes(key)
        })

        setRightDeviceList({
            ...rightDeviceList,
            rightAllList: _rightAllList,
            rightTempList: _rightTempList
        })

        setSelectDeviceIndexToDelete([])
    }

    const configColumns = [
        {
            title: '数据名称',
            dataIndex: 'propertyName',
            key: 'propertyName',
            width: 160,
        },
        {
            title: '数据标识',
            dataIndex: 'property',
            width: 240,
            key: 'property'
        },
        {
            title: '数据类型',
            dataIndex: '_type',
            key: '_type',
            width: 140
        },
        {
            title: '数据属性',
            dataIndex: 'propertyValueDesc',
            key: 'propertyValueDesc'
        },
        {
            title: '下发数据',
            dataIndex: 'execTime',
            key: 'execTime',
            width: 180,
            render: (text, record) => {
                let { _type, _params, _index,key } = record,
                _dom = null,
                disabled = protocolFormat !== 1 ? !selectedProtocols.includes(key) : false;

                switch (_type) {
                    case '数值型':
                        _dom = (
                            <InputNumber value={protocolSendData[_index]}
                                min={_params.min}
                                max={_params.max}
                                disabled = {disabled}
                                onChange={value => changeSendData(value, _index)}
                                placeholder="请输入参数"></InputNumber>
                        )
                        break;
                    case '字符型':
                        _dom = (
                            <Input value={protocolSendData[_index]}
                                   maxLength={30}
                                   disabled = {disabled}
                                   onChange={e => changeSendData(e.target.value.trim(), _index)}
                                   placeholder="请输入参数"></Input>
                        )
                        break;
                    default:
                        _dom = (
                            <Select disabled = {disabled} onChange={value => changeSendData(value, _index)} value={protocolSendData[_index] || ""}>
                                <Option key={-1} value="">请选择参数</Option>
                                {
                                    _params && _params.map((item, index) => (
                                        <Option key={index + _type}
                                            value={item.value}
                                        >
                                            {item.name}
                                        </Option>
                                    ))
                                }
                            </Select>
                        )
                        break;
                }

                return (<span className={`config-send-data ${sendDataCheck.includes(_index) ? 'warn' : ''}`}>
                    {_dom}
                </span>)
            },
        }
    ]

    const deviceColumns = [
        {
            title: '设备ID',
            dataIndex: 'deviceUniqueId',
            key: 'deviceUniqueId',
            width: 140,
        },
        {
            title: '物理地址',
            dataIndex: 'macAddress',
            width: 140,
            key: 'macAddress'
        },
    ]

    const protocolSelection = {
        selectedRowKeys: selectedProtocols,
        onChange: protocolSelectChange,
    }

    const leftRowSelection = {
        selectedRowKeys: selectDeviceIndexToAdd,
        onChange: leftSelectChange,
    }

    const rightRowSelection = {
        selectedRowKeys: selectDeviceIndexToDelete,
        onChange: righttSelectChange,
    }

    let leftDeviceDataSource = deviceSelectType === 1 ? curDeviceInfoList : deviceSelectType === 2 ? searchedDeviceInfoList : [];

    const getContentDomByStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="step-0-wrapper flex-row">
                        <div className="step-0-lable"><span className="pre-requst-start">任务说明</span></div>
                        <div className="textarea-wrapper flex1">
                            <TextArea value={taskExplain}
                                maxLength={100}
                                onChange={changeTaskExplain}
                                autoSize={{ minRows: 4, maxRows: 6 }}></TextArea>
                        </div>
                        <div className="count-wrapper">
                            <span>{`${taskExplain.length}/100`}</span>
                        </div>
                    </div>
                )
            case 1:
                return (
                    <div className="step-1-wrapper">
                        <p>{protocolFormat !== 1 ? '请选中需要下发的配置数据，并配置下发数据的值' : '该产品使用了CLink标准数据格式（十六进制），需全量下发配置更新数据'}</p>
                        <div className="table-wrapper">
                            <Table columns={configColumns}
                                   rowSelection={protocolFormat !== 1 ? protocolSelection : null}
                                   dataSource={configProtoclList}
                                   scroll={{ y: 300 }}
                                   pagination={false}
                            />
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="step-2-wrapper">
                        <div className="device-select-wrapper flex-row">
                            <div className="left flex1">
                                <p>选择配置更新的设备</p>
                                <Select value={deviceSelectType} onChange={selectTypeChange}>
                                    <Option value={1} key={1}>全部设备</Option>
                                    <Option value={2} key={2}>通过设备ID/物理地址查找</Option>
                                    <Option value={3} key={3}>导入设备列表（本地文件）</Option>
                                </Select>
                                {
                                    deviceSelectType === 2 &&
                                    <Search enterButton="查 找"
                                        loading={searchLoading}
                                        onSearch={leftDeviceSearch}
                                        maxLength={50}
                                        placeholder="请输入设备ID/物理地址查找"></Search>
                                }
                                {
                                    deviceSelectType === 3 ?
                                        <section className="file-upload-area">
                                            <p>选择本地的设备数据文件上传 <a onClick={getRemoteExcelTemplate}>设备数据模板</a></p>
                                            <p>每次添加最多支持20,000个设备</p>
                                            {
                                                isShowImportResult ?
                                                    <div>
                                                        <div className="result-area">
                                                            <h3>{excelFileName || '--'}</h3>
                                                            <p>{`共${allList.length}条数据`}</p>
                                                            <p>{`${successList.length}台设备成功匹配`}</p>
                                                            <p>{`${errorList.length}条数据匹配失败`}</p>
                                                        </div>
                                                        <div className="tools">
                                                            <a onClick={() => setIsShowImportResult(false)}>重新上传</a>
                                                            <a onClick={() => setImportDeviceData({ ...importDeviceData, errorVisible: true })}>错误日志</a>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <div className="file-input-wrapper">
                                                            <Button type="primary"><Icon type="upload" /> 选择本地设备数据文件</Button>
                                                            <input type="file"
                                                                   onInput={importRemoteExcel}
                                                                   accept=".xls,.xlsx" />
                                                        </div>
                                                        <p>支持xls，xlsx格式，文件大小不超过10MB</p>
                                                    </div>
                                            }
                                        </section> : (
                                            deviceSelectType === 2 ?
                                                <Table columns={deviceColumns}
                                                    dataSource={leftDeviceDataSource}
                                                    rowSelection={leftRowSelection}
                                                    // scroll={{ y: 300 }}
                                                    pagination={false}
                                                />
                                                :
                                                <Table columns={deviceColumns}
                                                    dataSource={leftDeviceDataSource}
                                                    rowSelection={leftRowSelection}
                                                    pagination={{
                                                        total: allDeviceInfoPager.totalRows,
                                                        defaultCurrent: 1,
                                                        defaultPageSize: allDeviceInfoPager.currPageRows,
                                                        showQuickJumper: false,
                                                        hideOnSinglePage: true,
                                                        size: 'small',
                                                        onChange: pageIndex => getAllDeviceInfo(pageIndex),
                                                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                                                    }}
                                                />)
                                }
                            </div>
                            <div className="center">
                                <Button type="primary" disabled={selectDeviceIndexToAdd.length === 0} onClick={leftToRight}>选择设备</Button>
                            </div>
                            <div className="right flex1">
                                <p>已选中配置更新的设备</p>
                                <Search enterButton="查 找"
                                    ref={rightSearchInput}
                                    onSearch={rightDeviceSearch}
                                    maxLength={50}
                                    placeholder="请输入设备ID/物理地址查找"></Search>
                                <div className="tools-wrapper">
                                    <a className={selectDeviceIndexToDelete.length > 0 ? '' : 'disable'}
                                        onClick={deleteDeviceFromRightList}
                                    >取消选中</a>
                                </div>
                                <Table columns={deviceColumns}
                                    rowSelection={rightRowSelection}
                                    dataSource={rightTempList}
                                    pagination={{
                                        total: rightTempList.length,
                                        defaultCurrent: 1,
                                        defaultPageSize: 7,
                                        showQuickJumper: false,
                                        hideOnSinglePage: true,
                                        size: 'small',
                                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )
            default:
                break;
        }
    }

    return (
        <Modal
            visible={visible}
            width={1000}
            className="romote-modal"
            title={'远程配置任务'}
            centered={true}
            closable={false}
            onOk={null}
            destroyOnClose={true}
            maskClosable={false}
            footer={null}
        >
            <div className="romote-add-content flex-column">
                <FlowChart type={2}
                    flowLists={_FlowList}
                    style={{ padding: '12px 0' }}
                    activeItem={step}></FlowChart>
                <div className="content-wrapper flex1">
                    {
                        getContentDomByStep()
                    }
                </div>
                <div className="r-footer">
                    <span>
                        {
                            step > 0 &&
                            <Button onClick={() => setStep(step - 1)} type="primary">上一步</Button>
                        }
                        <Button onClick={nextStepOrSubmitToEcecute} type="primary">{step === END_STEP ? '提交执行' : '下一步'}</Button>
                        <Button onClick={canCelOrSave} type={step === 2 ? "primary" : "default"}>{step === 2 ? '保存' : '取消'}</Button>
                    </span>
                </div>
                {
                    errorVisible &&
                    <DeviceImportErrorLogModal visible={errorVisible} errorList={errorList} onCancel={() => setImportDeviceData({ ...importDeviceData, errorVisible: false })}></DeviceImportErrorLogModal>
                }
            </div>
        </Modal>
    )
}

export function RemoteConfigDetailModal({ visible, record, statusText, onCancel, searchDeviceResult, isDeviceRomote }) {

    const [searchParams, setSearchParams] = useState({ selectType: 1, keyWords: '', filterStatus: 0 })
    const [errorLog, setErrorLog] = useState({ errorLogVisible: false, errorLogRecord: {} })

    let { taskId, taskExplain, status, execTime, protocolConfig, total, success, inExec, fail, list = [], pager = {} } = record;

    const { selectType, keyWords, filterStatus } = searchParams;
    const { errorLogVisible, errorLogRecord } = errorLog;

    const retryByTaskId = (remoteId) => {
        get(Paths.retryByTaskId, {
            remoteId
        }).then(data => {
            _searchDeviceResult(pager.pageIndex)
        })
    }

    const openErrorLog = (record) => {
        const { remoteId, errorType } = record

        if (errorType == 2) {
            get(Paths.getReceiveMsg, {
                remoteId
            }, {
                loading: true
            }).then(
                data => {
                    setErrorLog({
                        errorLogVisible: true,
                        errorLogRecord: {
                            errorType,
                            receiveMsg: data.data && data.data.receiveMsg
                        }
                    })
                }
            )
        } else {
            setErrorLog({
                errorLogVisible: true,
                errorLogRecord: {
                    errorType,
                    receiveMsg: null
                }
            })
        }
    }

    const configColumns = [
        {
            title: '数据名称',
            dataIndex: 'propertyName',
            key: 'propertyName',
            width: 200,
        },
        {
            title: '数据标识',
            dataIndex: 'property',
            width: 240,
            key: 'property'
        },
        {
            title: '数据类型',
            dataIndex: '_type',
            key: '_type',
            width: 120
        },
        {
            title: '数据属性',
            dataIndex: 'propertyValueDesc',
            key: 'propertyValueDesc'
        },
        {
            title: '下发数据',
            dataIndex: 'sendData',
            key: 'sendData',
            width: 140
        }
    ]

    const deviceColumns = [
        {
            title: '设备ID',
            dataIndex: 'deviceUniqueId',
            key: 'deviceUniqueId',
            width: 200,
        },
        {
            title: '物理地址',
            dataIndex: 'macAddress',
            width: 200,
            key: 'macAddress'
        },
        {
            title: '配置结果',
            dataIndex: 'status',
            key: 'status',
            width: 160,
            render: (text, record) => {
                let { status } = record;

                return <span className={`verify-statu-${status}`}>{deviceStatu[status - 1]}</span>
            }
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (text, record) => {
                const { status, remoteId, receiveMsg, errorType } = record
                return <span>
                    {
                        ('' + status) === '4' ?
                            <React.Fragment>
                                <a onClick={() => retryByTaskId(remoteId)}>重试</a>
                                <Divider type="vertical" />
                                <a onClick={() => openErrorLog(record)}>日志</a>
                            </React.Fragment> : null
                    }
                </span>
            }
        }
    ]

    const changeSearParams = (value, key) => {
        setSearchParams({
            ...searchParams,
            [key]: value
        })
    }

    const _searchDeviceResult = (pageIndex) => {
        let _params = {}

        if (pageIndex) {
            _params.pageIndex = pageIndex
        }

        if (keyWords) {
            _params[selectType === 1 ? 'deviceUniqueId' : 'macAddress'] = keyWords
        }

        if (filterStatus) {
            _params['status'] = filterStatus
        }

        _params.taskId = taskId

        searchDeviceResult(_params)
    }

    const batchRetry = () => {
        get(Paths.batchRetry, {
            taskId
        }).then(data => {
            _searchDeviceResult()
        })
    }

    const exportTaskResult = () => {
        get(Paths.exportTaskResult, {
            taskId
        }).then(data => {
            window.open(Paths.exportTaskResult + `?taskId=${taskId}`)
        })
    }

    return (
        <Modal
            visible={visible}
            width={1000}
            className="romote-modal"
            title={'远程配置任务'}
            centered={true}
            closable={true}
            onOk={null}
            onCancel={onCancel}
            destroyOnClose={true}
            maskClosable={false}
            footer={null}
        >
            <div className="romote-detail-content height-premit">
                <h3>基础信息</h3>
                <div className="base-info">
                    <p><span>任务ID</span><span>{taskId || '--'}</span></p>
                    <p><span>任务说明</span><span>{taskExplain || '--'}</span></p>
                    <p><span>任务状态</span><span>{statusText[status] || '--'}</span></p>
                    <p><span>执行时间</span><span>{DateTool.utcToDev(execTime) || '--'}</span></p>
                </div>
                <h3>配置数据</h3>
                <Table columns={configColumns}
                    dataSource={protocolConfig || []}
                    pagination={false}
                />
                {
                    !isDeviceRomote &&
                    <>
                        <h3>配置设备</h3>
                        <div className="device-wrapper">
                            <div>
                                <h4>配置设备数</h4>
                                <p>{Number.isInteger(total) ? total : '--'}</p>
                            </div>
                            <div>
                                <h4>配置成功</h4>
                                <p>{Number.isInteger(success) ? success : '--'}</p>
                            </div>
                            <div>
                                <h4>执行中</h4>
                                <p>{Number.isInteger(inExec) ? inExec : '--'}</p>
                            </div>
                            <div>
                                <h4>配置失败</h4>
                                <p>{Number.isInteger(fail) ? fail : '--'}</p>
                            </div>
                            <div>
                                <span className={+fail === 0 ? 'disable' : ''} onClick={+fail > 0 ? batchRetry : null}>批量重试</span>
                            </div>
                        </div>

                        <div className="filter-wrapper">
                            <Select value={selectType} onChange={value => changeSearParams(value, 'selectType')}>
                                <Option key="1" value={1}>设备ID</Option>
                                <Option key="2" value={2}>物理地址</Option>
                            </Select>
                            <Input placeholder="支持精确查询"
                                value={keyWords}
                                maxLength={50}
                                onChange={e => changeSearParams(e.target.value, 'keyWords')}
                            ></Input>
                            <span>配置结果</span>
                            <Select value={filterStatus} onChange={value => changeSearParams(value, 'filterStatus')}>
                                <Option key="0" value={0}>全部</Option>
                                <Option key="1" value={1}>待执行</Option>
                                <Option key="2" value={2}>执行中</Option>
                                <Option key="3" value={3}>执行成功</Option>
                                <Option key="4" value={4}>执行失败</Option>
                            </Select>
                            <Button type="primary" onClick={() => _searchDeviceResult()}>查找</Button>
                            <Button type="primary" onClick={exportTaskResult}>导出数据</Button>
                        </div>
                        <Table columns={deviceColumns}
                            dataSource={list || []}
                            pagination={{
                                total: pager.totalRows,
                                current: pager.pageIndex,
                                defaultCurrent: 1,
                                defaultPageSize: pager.defaultPageRows,
                                showQuickJumper: false,
                                hideOnSinglePage: true,
                                size: 'small',
                                onChange: (page) => _searchDeviceResult(page),
                                showTotal: total => <span>共 <a>{total}</a> 条</span>
                            }}
                        />

                        {
                            errorLogVisible &&
                            <RemoteErrorLogModal visible={errorLogVisible}
                                onCancel={() => setErrorLog({ errorLogVisible: false, errorLogRecord: {} })}
                                record={errorLogRecord} ></RemoteErrorLogModal>
                        }
                    </>
                }
            </div>
        </Modal>
    )
}

const errorText = ['没问题', '下发配置数据失败', '上报的配置数据不一致', '上报的配置数据在超时时间内未获取到', '存在相同的设备在执行远程配置任务', '后台数据异常']


export function RemoteErrorLogModal({ visible, record, onCancel }) {

    const { errorType, receiveMsg } = record

    function dealErrorMsg(_receiveMsg) {
        if (!_receiveMsg) {
            return <h4>无报文信息</h4>
        }
        let msgObj = JSON.parse(_receiveMsg),
            keys = Object.keys(msgObj);

        return (<>
            <h4>报文解析列表</h4>
            {
                keys.map(item => <div className="log-row">
                    <span className="log-left-key">{item}</span>
                    <span className="log-right-content">{msgObj[item]}</span>
                </div>)
            }
        </>)
    }
    return (
        <Modal
            visible={visible}
            width={600}
            className="romote-modal"
            title={'日志'}
            centered={true}
            closable={true}
            onOk={null}
            onCancel={onCancel}
            destroyOnClose={true}
            maskClosable={false}
            footer={null}
        >
            <div className="remote-error-wrapper">
                <div><label>失败原因：</label> <span>{errorText[errorType]}</span></div>
                <div><label>报文信息：</label>
                    <div className="msg-wrap">
                        {
                            dealErrorMsg(receiveMsg)
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

const deviceImportErrorText = ['设备ID的长度超过限制', '物理地址的长度超限制', '设备ID发生重复', '物理地址发生重复', '设备ID不存在或未联网', '物理地址不存在或未联网']

export function DeviceImportErrorLogModal({ visible, errorList, onCancel }) {

    const errorColumns = [
        {
            title: '设备ID',
            dataIndex: 'deviceUniqueId',
            key: 'deviceUniqueId',
            width: 200,
        },
        {
            title: '错误原因',
            dataIndex: 'errorType',
            width: 200,
            key: 'errorType',
            render: (text, record) => {
                let { errorType } = record;
                return <span>{deviceImportErrorText[errorType - 1]}</span>
            }
        }
    ]

    return (
        <Modal
            visible={visible}
            width={600}
            className="romote-modal"
            title={'设备导入错误日志'}
            centered={true}
            closable={true}
            onOk={null}
            onCancel={onCancel}
            destroyOnClose={true}
            maskClosable={false}
            footer={null}
        >
            <div>
                <Table columns={errorColumns}
                    dataSource={errorList || []}
                    pagination={{
                        total: errorList.length,
                        defaultCurrent: 1,
                        defaultPageSize: 10,
                        showQuickJumper: false,
                        hideOnSinglePage: true,
                        size: 'small',
                        showTotal: total => <span>共 <a>{total}</a> 条</span>
                    }}
                />
            </div>
        </Modal>
    )
}



