import React,{useState, useMemo, useEffect, useCallback} from 'react'
import {mergeWith,isArray} from 'lodash'
import NodesContainer from './nodes-container/NodesContainer'
import Painter from './painter/Painter'
import StaticPainter from './painter/staticPainter'
import ConfigEdit from './config-edit/ConfigEdit'
import {getProductList,getDeviceListByProductId,getDownPropOrEventList,getFlowData,saveFlowData,getDownDatasource,getDownTableByDatasource,getDownFieldsByDatasourceTable,getEventList} from './apis'
import {NODE_TYPES} from './nodes-container/configs'
import {saveNodes,publishFlow} from '../../subjects'
import './Playground.scss'
import { Notification } from '../../../../components/Notification'

export default function Playground({
    service,
    isStatic
}) {
    // ----没有使用redux，根组件作为仓库存储数数据---------------
    const [nodes,setNodes] = useState([]) // 画布中的节点仓库 [{nodeType,location,id,nodeName,pid,hasChildNode,input}]
    const [nodeIdCount,setNodeIdCount] = useState(0) // ID计数器
    const [focusNodeId,setFocusNodeId] = useState(null) // 选中的节点
    const [pathsConfigs,setPathsConfigs] = useState([]) // 画布的 svg 路径仓库  [{startPoint:[],startNodeId:id,endPoint:[],endNodeId:id}]
    const [productList,setProductList] = useState([]) 
    const [dataSourceList,setDataSourceList] = useState([])
    // ------------------------------------------------------

    const getNodeDataById = _nodeId => {
        if (!_nodeId) return null;

        let _node = nodes.filter(item => item.id === _nodeId);

        return _node[0] || null
    }

    const getParentNodeDataById = _pid => {
        let _pNode = getNodeDataById(_pid)

        while (_pNode && (_pNode.nodeType === NODE_TYPES.DATA_FILTER)) {
            _pNode = _pNode.pid ? getNodeDataById(_pNode.pid) : null
        }

        return _pNode
    }

    const selectedNode = useMemo( () => {
        if (focusNodeId) {
            let _node = nodes.filter(item => item.id === focusNodeId)[0] || {}

            if (_node.pid) {
                let pNode = getParentNodeDataById(_node.pid)
                _node.pProps = (pNode && pNode.input && pNode.input.props) || []
            }

            return _node
        }

        return {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[focusNodeId,nodes])

    const dealNodesInputForSave = (input = {},nodeType) => {
        let _input = {...input}

        //处理聚合计算的input数据
        if (nodeType === NODE_TYPES.DATA_CACL) {
            let {windowDurings = {},slideDurings ={}} = _input,
                {windowDuring,windowUnit} = windowDurings,
                {slideDuring,slideUnit} = slideDurings;

            _input = {..._input,windowDuring,windowUnit,slideDuring,slideUnit}
        }

        //处理聚合计算的input数据
        if (nodeType === NODE_TYPES.TABLE_RELATED) {
            let {relate = {}} = _input,
                {streamFieldCode,dimFieldCode} = relate

            _input = {..._input,streamFieldCode,dimFieldCode}
        }

        //处理输出的input数据
        if (nodeType === NODE_TYPES.DATA_OUTPUT) {
            let {dataSource = [],selectedRowKeys = []} = _input,
                _props = dataSource.filter(item => selectedRowKeys.includes(item.srcCode))

            _input = {..._input,props:_props}
        }

        return JSON.stringify(_input)
    }

    useEffect( () => {
        const {projectId,serviceId} = service

        // 获取产品列表
        projectId && getProductList({projectId,pageRows: 9999}).then(data => {
            data && data.data && data.data.list && setProductList([...data.data.list])
        })

        // 获取流程数据
        serviceId && getFlowData({serviceId}).then(data => {
            if (data.data) {
                let {flowNodeList,lines = ""} = data.data,
                    _pids = (flowNodeList || []).map(item => item.pNodeId),
                    _maxId = 0,
                    _nodes = [];

                    if (flowNodeList) {
                        _nodes = flowNodeList.map(item => { // node 数据格式 {nodeType,location,id,nodeName,pid,hasChildNode,input}
                            let {input,location,nodeId,nodeName,nodeType,output,pNodeId} = item;
    
                            if (nodeId > _maxId) {_maxId = nodeId}
    
                            return {
                                input:JSON.parse(input),
                                nodeType,
                                location:location.split(',').map(item => +item),
                                id:nodeId,
                                nodeName,
                                output,
                                pid:pNodeId || null,
                                hasChildNode: _pids.includes(nodeId)
                            }
                        })
    
                    }

                    if (lines) {
                        setPathsConfigs(JSON.parse(lines))
                    }

                    setNodes(_nodes)
                    setNodeIdCount(_maxId + 1)
            }
        })

        // 获取数据源数据
        getDownDatasource({type:2}).then(data => {
            data && data.data && setDataSourceList([...data.data])
        })
    },[service])

    
    const saveNodesData = useCallback(
        () => {
            const {projectId,serviceId} = service;

            let _data = {
                projectId,
                serviceId,
                lines:JSON.stringify(pathsConfigs)
            }

            _data.nodes = nodes.map(item => {
                const {nodeName,nodeType,pid,id,input,location} = item;

                return {
                    id,
                    pid,
                    nodeName,
                    nodeType,
                    location:location.join(','),
                    input:dealNodesInputForSave(input,nodeType),
                    output:''
                }
            })
            console.log('触发保存 -- ',_data)
            saveFlowData(_data).then(() => {
                Notification({
                    type:'success',
                    description:'保存成功！'
                })
            })
        },
        [nodes, pathsConfigs, service]
    )

    useEffect( () => {
        const save = saveNodes.asObservable().subscribe(res => {saveNodesData()})
        const publish = publishFlow.asObservable().subscribe(res => {})


        return () => {
            save.unsubscribe()
            publish.unsubscribe()
        }
    },[saveNodesData])


    // 获取设备列表
    const getDeviceList = _productId => {
        return getDeviceListByProductId({
            productId:_productId,
            pageRows:9999
        }).then(res => {
            return (res.data && res.data.list) || []
        })
    }

    // 获取事件列表
    const getDownEventList = _productId => {
        return getEventList({
            productId:_productId
        }).then(data => {
            return (data && data.data) || []
        })
    }

    // 获取属性或者事件字段
    const getPropOrEventList = (productId,property,eventIdentifier) => {
        return getDownPropOrEventList({
            productId,property,eventIdentifier
        }).then(data => {
            return (data && data.data && [...data.data].map(item => {
                return {
                    ...item,
                    srcTableCode:''
                }
            })) || []
        })
    }

    // 获取表
    const getTableByDatasource = (datasourceId) => {
        return getDownTableByDatasource({
            datasourceId
        }).then(data => {
            return (data && data.data) || []
        })
    }
    // 获取表属性
    const getFieldsByDatasourceTable = (tableCode,datasourceId) => {
        return getDownFieldsByDatasourceTable({
            datasourceId,
            tableCode
        }).then(data => {
            if (data && data.data) {               
                return [...data.data].map(item => {
                    return {...item,srcTableCode:tableCode}
                })
            }

            return []
        })
    }

    // 修改节点数据的方法
    const changeNodeDataByIds = (_nodeIds = [],_datas = []) => {
        if (_nodeIds.length !== _datas.length) {
            console.log('修改节点数据时，传入的数据异常',_nodeIds,_datas)
            return;
        }

        setNodes(prevNodes => {

            return [...prevNodes].map(item => {
                    const _index = _nodeIds.indexOf(item.id)
                    if (_index > - 1) {
                        return mergeWith({},item,_datas[_index],(objValue, srcValue) => {
                            if (isArray(srcValue)) {
                            return srcValue;
                            }
                        })
                    }
        
                    return item
                })
            }
        )
    }

    // 判断是否存在输入节点
    const hasInputNode = () => {
        const nodeIdList = nodes.map(item => item.nodeType);

        return nodeIdList.includes(NODE_TYPES.DATA_INPUT)
    }

    return (
        <div className="playground-wrapper flex-row">
            {
                isStatic ? 
                <StaticPainter nodes={nodes} pathsConfigs={pathsConfigs}></StaticPainter>
                : 
                <>
                    <NodesContainer></NodesContainer>
                    <Painter nodes={nodes}
                            nodeIdCount={nodeIdCount}
                            setNodeIdCount={setNodeIdCount}
                            focusNodeId={focusNodeId}
                            setFocusNodeId={setFocusNodeId}
                            changeNodeDataByIds={changeNodeDataByIds}
                            hasInputNode={hasInputNode}
                            pathsConfigs={pathsConfigs}
                            setPathsConfigs={setPathsConfigs} 
                            setNodes={setNodes}></Painter>
                    <ConfigEdit {...
                                {changeNodeDataByIds,
                                selectedNode,
                                productList,
                                getDeviceList,
                                getPropOrEventList,
                                getDownEventList,
                                dataSourceList,
                                getTableByDatasource,
                                getFieldsByDatasourceTable,
                                service}
                            }></ConfigEdit>
                </>
            }
        </div>
    )
}
