import React, { useState,useEffect,useCallback,useMemo } from 'react'
import { Tabs, Button, Input, Table, Divider, Select } from 'antd'
import PageTitle from '../../../components/page-title/PageTitle'
import AloneSection from '../../../components/alone-section/AloneSection'
import {Link} from 'react-router-dom'
import ActionConfirmModal from '../../../components/action-confirm-modal/ActionConfirmModal'
import { DateTool, getUrlParam } from '../../../util/util'
import { Notification } from '../../../components/Notification'
import { RelaModal,AddDevices} from './ProjectModals'
import { Paths, get, post } from '../../../api'
import ServeList from '../serve-develop/ServeList'

const { TabPane } = Tabs
const { Option } = Select

const GET_LIST_PATHS = [Paths.getProductInProject,Paths.getDeviceInProject]
const PAGE_ROWS = 20

export default function ProjectDetail({match,history}) {

    const [activeKey, setActiveKey] = useState(1)
    const [productDataList,setProductDataList] = useState([])
    const [productDataPager,setProductDataPager] = useState({totalRows:0,pageIndex:1})
    const [deviceDataList,setDeviceDataList] = useState([])
    const [deviceDataPager,setDeviceDataPager] = useState({totalRows:0,pageIndex:1})
    const [relatedProductList,setRelatedProductList] = useState([])
    const [searchData,setsearchData] = useState({name:'',mac:'',productId:''})
    const [dataInRela,setDataInRela] = useState({relaVisible:false,name:'',mac:'',productId:'',list:[],pager:{},relatedDeviceList:[],relatedProductList:[],deviceGroupList:[],_selectedRowKeys:[]})
    const [openRelaLoading,setOpenRelaLoading] = useState(false)
    const [actionData,setActionData] = useState({actionVisibel:false,actionType:'1',actionRecord:{},actionLoading:false}) 

    const PROJECT_ID = match.params && match.params.id
    const PROJECT_NAME = decodeURI(getUrlParam('name'))

    const {relaVisible,_selectedRowKeys} = dataInRela
    const {actionVisibel,actionType,actionRecord,actionLoading} = actionData

    const getList = useCallback(
        (_activeKey,_pageIndex,_productId) => {

            const {name,mac,productId} = searchData

            let _data = {
                projectId:PROJECT_ID
            };

            if(_pageIndex) {
                _data.pageIndex = _pageIndex
            }

            if (_activeKey == 1) {
                _data.name = name
            }

            if (_activeKey == 2) {
                _data = {..._data,mac,productId:_productId || productId}
            }

            get(GET_LIST_PATHS[_activeKey - 1],_data,{loading:true}).then(
                data => {
                    const {list = [],pager = {}} = (data && data.data) || {}
                    _activeKey === 1 ? setProductDataList(list) : setDeviceDataList(list)
                    _activeKey === 1 ? setProductDataPager(pager) : setDeviceDataPager(pager)
                }
            )
        },
        [PROJECT_ID,searchData]
    )

    const unrelaProductOrDevice = useCallback(
        (_id) => {

            let _key = activeKey === 1 ? 'productId' : 'deviceId',
                _path = activeKey === 1 ? Paths.unrelaProduct : Paths.unrelaDevice

            setActionData(preData => {
                return {
                    ...preData,
                    actionLoading:true
                }
            })

            get(_path,{
                projectId:PROJECT_ID,
                [_key]:_id
            }).then(() => {
                getList(activeKey)
            }).finally(() => {
                setActionData({actionVisibel:false,actionRecord:null,actionLoading:false})
            })
        },
        [PROJECT_ID,getList,activeKey]
    )

    const getAllRelatedProduct = useCallback(() => {
        return get(Paths.getAllRelatedProduct,{projectId:PROJECT_ID,pageRows:9999}).then(data => {
            return (data && data.data && data.data.list) || []
        })
    },[PROJECT_ID])
    const getDeviceGroupList = useCallback(() => {
        return get(Paths.getGroupList,{pageRows:9999}).then(res => {
            let deviceGroupList = res.data.list || [];
            return deviceGroupList
        });
    })

    const goToDeviceAndgetListById = useCallback(
        _productId => {
            setActiveKey(2)
            setsearchData(preData => {
                return {
                    ...preData,
                    productId:_productId
                }
            })

            getAllRelatedProduct().then(
                productList => {
                    setRelatedProductList(productList)
                }
            )
            getList(2,undefined,_productId)

        },[getAllRelatedProduct, getList]
    )

    const PageColumns = useMemo(() => {
        switch (activeKey) {
            case 1:
                return [
                    {
                        title: '产品ID',
                        dataIndex: 'productId',
                        key: 'productId',
                        width: 200,
                    },
                    {
                        title: '产品名称',
                        dataIndex: 'productName',
                        key: 'productName',
                        width: 200,
                    },
                    {
                        title: '产品类型',
                        dataIndex: 'productClassId',
                        key: 'productClassId',
                        width: 180,
                        render: (text, record) => {
                            let { productClassId = 0 } = record;
                            return <span>{['普通设备','网关设备'][productClassId]}</span>
                        }
                    },
                    {
                        title: '状态',
                        dataIndex: 'mode',
                        key: 'mode',
                        width: 180,
                        render: (text, record) => {
                            let { mode = 0 } = record;
                            return <span>{['开发中','已发布','审核中'][mode]}</span>
                        }
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'createTime',
                        key: 'createTime',
                        width: 180,
                        render: (text, record) => {
                            let { createTime } = record;
                            return <span>{createTime ? DateTool.utcToDev(createTime) : '--'}</span>
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        render: (text, record) => {
                            let {productId,mode} = record;

                            return <span>
                                <Link to={{
                                    pathname:  `/open/base/product/${mode == 1 && 'details' || 'edit'}/${productId}`
                                }} >查看</Link>
                                <Divider type="vertical" />
                                <a onClick={() => goToDeviceAndgetListById(productId)}>设备管理</a>
                                <Divider type="vertical" />
                                <a onClick={() => openActionModal('1',record) }>解除关联</a>
                            </span>
                        }
                    }
                ]      
            case 2:
                return [
                    {
                        title: '设备ID',
                        dataIndex: 'deviceUniqueId',
                        key: 'deviceUniqueId',
                        width: 200,
                    },
                    {
                        title: '物理地址',
                        dataIndex: 'deviceMac',
                        key: 'deviceMac',
                        width: 200,
                    },
                    {
                        title: '产品',
                        dataIndex: 'productName',
                        key: 'productName',
                        width: 180
                    },
                    {
                        title: '分类',
                        dataIndex: 'productClass',
                        key: 'productClass',
                        width: 180,
                        render: (text, record) => {
                            let { productClass = 0 } = record;
                            return <span>{['普通设备','网关设备'][productClass]}</span>
                        }
                    },
                    {
                        title: '状态',
                        dataIndex: 'status',
                        key: 'status',
                        width: 180,
                        render: (text, record) => {
                            let { status } = record;
                            return <span>{['开发中','已发布','审核中'][status || 0]}</span>
                        }
                    },
                    {
                        title: '最后上线',
                        dataIndex: 'lastOnlineTime',
                        key: 'lastOnlineTime',
                        width: 180,
                        render: (text, record) => {
                            let { lastOnlineTime } = record;
                            return <span>{lastOnlineTime ? DateTool.utcToDev(lastOnlineTime) : '--'}</span>
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 200,
                        render: (text, record) => {
                            let {deviceId} = record;

                            return <span>
                                <Link to={{
                                    pathname:`/open/base/device/onlineDevice/details/${deviceId}`
                                }}>查看</Link>
                                <Divider type="vertical" />
                                <a onClick={ () => openActionModal('1',record)}>解除绑定</a>
                            </span>
                        }
                    }
                ]          
            default:
                break;
        }
    }, [activeKey, goToDeviceAndgetListById])

    const changeSearchParam = (key,value) => {
        setsearchData( preData => {
            let _data = {...preData}
            _data[key] = value
            
            return _data
        })
    }
    
    useEffect(() => {
        if(!PROJECT_ID) {
            Notification({
                description:'请传入项目ID'
            })
            return ;
        }

        getList(1)
        getList(2)
        getAllRelatedProduct().then(
            productList => {
                setRelatedProductList(productList)
            }
        )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [PROJECT_ID])

    const getToolsDom = (type) => {
        const {name,mac,productId} = searchData
        if (type === 1) {
            return (
                <div className="tools">
                    <span className="tool-item">
                        <Button type="primary"
                            loading={openRelaLoading}
                            icon="plus" onClick={openRelaModal}>关联产品</Button>
                    </span>
                    <span className="tool-item">
                        <Button type="default"
                            name={name}
                            onClick={() => history.push({pathname:`/open/base/product/add`,search:`projectId=${PROJECT_ID}`})}
                            icon="plus">创建产品</Button>
                    </span>
                    <span className="tool-item">
                        <Input placeholder="请输入产品查询名称"
                            onChange={e => changeSearchParam('name',e.target.value)}
                            style={{ width: '240px' }}
                            maxLength={20} />
                    </span>
                    <span className="tool-item">
                        <Button type="primary"
                                onClick={() => getList(1)} 
                                icon="search">查询</Button>
                    </span>
                </div>)
        }
        if (type === 2) {
            return (
                <div className="tools">
                    <span className="tool-item">
                        <Button type="primary"
                                loading={openRelaLoading}
                                onClick={openRelaModal}
                                icon="plus">关联设备</Button>
                    </span>
                    <span className="tool-item">
                        <Input placeholder="请输入设备物理地址/设备ID"
                            mac={mac}
                            onChange={e => changeSearchParam('mac',e.target.value)}
                            style={{ width: '240px' }}
                            maxLength={50} />
                    </span>
                    <span className="tool-item">
                        <Select style={{ width: '240px' }} value={productId} onChange={value => changeSearchParam('productId',value)}>
                            <Option value="">全部产品</Option>
                            {
                                relatedProductList.map(item => {
                                    let {productId,productName} = item;
                                    return <Option key={productId} value={productId}>{productName}</Option>
                                })
                            }
                        </Select>
                    </span>
                    <span className="tool-item">
                        <Button type="primary" icon="search" onClick={() => getList(2)} >查询</Button>
                    </span>
                </div>)
        }
    }
    const getTable = () => {
        const {totalRows,pageIndex} = activeKey === 1 ? productDataPager : deviceDataPager
        const _dataList = activeKey === 1 ? productDataList : deviceDataList

        return (
            <Table columns={PageColumns}
                rowKey={activeKey === 1 ? 'productId':'deviceId'}
                dataSource={_dataList}
                pagination={{
                    total: totalRows,
                    current: pageIndex,
                    defaultCurrent: 1,
                    defaultPageSize: PAGE_ROWS,
                    onChange: (index) => getList(activeKey,index),
                    showQuickJumper: true,
                    hideOnSinglePage: true,
                    showTotal: total => <span>共 <a>{total}</a> 条</span>
                }}
            />)
    }
    //获取可关联的产品列表或者设备列表
    const getRelaList = ({name,param,productIds,_index,type}) => {

        let _data = {
            projectId:PROJECT_ID,
            pageRows:10,
            pageIndex:_index || 1
        }
        let path = Paths.getRelaProduct;
        if(activeKey===1){
            name && (_data.name = name)
        }else if(activeKey===2){
            path = Paths.getRelaDevice;
            _data.type = type || 0 ;
            param && (_data.param = param)
            productIds && (_data.productIds = productIds)
        }
        
        return get(path,_data).then(data => {
            data && data.data &&  setDataInRela(preData => {
                return {...preData,...data.data}
            })
            return data
        })
    }

    const relatedProductOrDevice = ids => {
        let _path = activeKey === 1 ? Paths.relaProduct : Paths.relaDevice;

        return post(_path,{
            projectId:PROJECT_ID,
            ids
        })
    }


    const openRelaModal = () => {
        let temp = [getRelaList({})];
        if(activeKey === 2){
            temp.push(
                getAllRelatedProduct(),
                getDeviceGroupList()
            )

        }
        setOpenRelaLoading(true);
        Promise.all(temp).then(datas => {
            let [relaList,relatedProductList=[],deviceGroupList=[]] = datas;
            setDataInRela(preData => {
                return {...preData,
                    relaVisible:true,
                    relatedProductList,
                    deviceGroupList,
                 }
            })
        }).finally( () => {
            setOpenRelaLoading(false)
        })
    }

    const relaOkHandle = selectedRowKeys => {
        relatedProductOrDevice(selectedRowKeys.join(',')).then(data => {
            clearRelaData()
            getList(activeKey)
        })
    }

    const clearRelaData = () => {
        setDataInRela({relaVisible:false,name:'',mac:'',productId:'',list:[],pager:{}}) 
    }

    const openActionModal = (type,record) => {
        setActionData( preData => {
            return {
                ...preData,
                actionType:type,
                actionRecord:{...record},
                actionVisibel:true
            }
        })
    }

    const actionOKHandle = () => {
        let {deviceId,productId} = actionRecord
        if(actionType === '1') {
            activeKey === 1 && unrelaProductOrDevice(productId)
            activeKey === 2 && unrelaProductOrDevice(deviceId)
        }
    }

    return (
        <React.Fragment>
            <PageTitle title={PROJECT_NAME || '--'}></PageTitle>
            <AloneSection style={{minHeight:'calc(100% - 102px)'}}>
                <Tabs activeKey={'' + activeKey} onChange={key => setActiveKey(+key)}>
                    <TabPane tab={"产品列表"} key={1}>
                        <div className="tab-content-wrapper">
                            {getToolsDom(1)}
                        </div>
                        <div className="table-wrapper">
                            {getTable()}
                        </div>
                    </TabPane>
                    <TabPane tab={"设备列表"} key={2}>
                        <div className="tab-content-wrapper">
                            {getToolsDom(2)}
                        </div>
                        <div className="table-wrapper">
                            {getTable()}
                        </div>
                    </TabPane>
                    <TabPane tab={"服务列表"} key={3}>
                        <ServeList projectId={PROJECT_ID}></ServeList>
                    </TabPane>
                </Tabs>
            </AloneSection>
            {
                relaVisible &&
                <RelaModal visible={relaVisible}
                    getRelaList={getRelaList}
                    onOkHandle={relaOkHandle}
                    onCancelHandle={clearRelaData}
                    columns={PageColumns.slice(0,-1)}
                    type={activeKey}
                    dataInRela={dataInRela}
                    setDataInRela={setDataInRela}
                    _selectedRowKeys={_selectedRowKeys}
                ></RelaModal>
            }
            {
                actionVisibel && 
                <ActionConfirmModal
                    visible={actionVisibel}
                    modalOKHandle={actionOKHandle}
                    modalCancelHandle={() => setActionData({actionVisibel:false,actionRecord:null,actionLoading:false})}
                    targetName={actionRecord[activeKey === 1 ? 'productName' : 'deviceUniqueId']}
                    confirmLoading={actionLoading}
                    title={'解除关联'}
                    needWarnIcon={true}
                    descText={'即将解除关联'}
                >
                </ActionConfirmModal>
            }
        </React.Fragment>
    )
}
