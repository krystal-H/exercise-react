import React, { useState,useRef} from 'react'
import NodeFactory from '../nodes-container/nodeFactory'
import SvgFLow from './SvgFlow'
import { Notification } from '../../../../../components/Notification';
import {NODE_DEFAULT_INPUTS, NODE_TYPES} from '../nodes-container/configs';
import {cloneDeep} from 'lodash'

const PAINTER_MARGIN = 2;

export default function Painter({
    setNodes,
    nodes,
    nodeIdCount,
    setNodeIdCount,
    focusNodeId,
    setFocusNodeId,
    changeNodeDataByIds,
    hasInputNode,
    pathsConfigs,
    setPathsConfigs
}) {
    const [workStatu,setWorkStatu] = useState('default') // 画布的工作状态，目前只有 mouseDownStartPoint:按下了第一个节点，正在连线的状态
    const [tempPath,setTempPath] = useState({}) // 临时的 svg 路径，展示的是节点和画布中移动点的连线
    const [menuData,setMenuData] = useState({   // 右键菜单的状态、其他参数
        showMenu:false,
        menuLeft:0,
        menuTop:0
    })

    const painter = useRef(null) // 画布实例

    const {showMenu,menuLeft,menuTop,selectNodeIdToDelete,selectLinkLineToDelete} = menuData;

    const getPainterClientRect = () => {
        return (painter && painter.current.getBoundingClientRect()) || {}
    }
   
    // 对节点位置进行限制
    const limitNodePostion = (_num,_self,type) => {
        let {width,height} = getPainterClientRect(),
            _container = (type === 'left') ? width : height;
           
        if (_num + _self > _container - PAINTER_MARGIN) {
            _num = _container - _self - PAINTER_MARGIN
        }
    
        return _num > PAINTER_MARGIN ? _num : PAINTER_MARGIN
    }

    // 设置选中节点
    const setFocusNode = _id => {
        setFocusNodeId(_id)
    }

    // 清除删除菜单
    const clearMenu = () => {
        setMenuData({
            showMenu:false,
            menuLeft:0,
            menuTop:0,
            selectNodeIdToDelete:null,
            selectLinkLineToDelete:null
        })
    }

    const dragOverHandle = e => {
        e.preventDefault()
    }

    // 添加节点
    const dropHandle = e => {
        e.stopPropagation()
        e.preventDefault()

        const { currentTarget, clientX, clientY } = e,
              { offsetLeft, offsetTop } = currentTarget,
              _nodeData = JSON.parse(e.dataTransfer.getData('text/plain') || ""),
              {x,y,l,t,nodeType,nodeName,w,h} = _nodeData,
              _id = nodeIdCount + 1;

        if((nodeType === NODE_TYPES.DATA_INPUT) && hasInputNode()) {
            Notification({
                message:'已存在输入节点'
            })
            return
        }
        
        let newNode = {
            nodeType,
            location:[limitNodePostion(l +  clientX - x - offsetLeft,w,'left'),limitNodePostion(t + clientY - y - offsetTop,h,'top')],
            id: _id,
            nodeName,
            pid:null,
            hasChildNode:false,
            input:{...cloneDeep(NODE_DEFAULT_INPUTS[nodeType]),nodeId:_id}
        }

        setNodes([...nodes,newNode])

        setNodeIdCount(_id)
        setFocusNodeId(_id)
    }

    // 连线时，在画布上触发的临时路径
    const mouseMoveHandle = e => {
        e.preventDefault()

        if (workStatu === 'mouseDownStartPoint') {
            const {clientX,clientY} = e,
                  {left,top} = getPainterClientRect();

            setTempPath({
                ...tempPath,
                endPoint:[clientX - left,clientY - top],
                endNodeId:null
            })
        }
    }

    // 连线时，鼠标移出画布，取消临时路径
    const mouseLeaveHandle = e => {
        if (workStatu === 'mouseDownStartPoint') {
            setWorkStatu('default')
            setTempPath({})
        }
    }

    // 右键菜单；右键在节点或者连线上时，唤起删除按钮；其他位置，收起删除按钮
    const nodeContextMenuHandle = e => {
        e.preventDefault()

        const {clientX,clientY,target} = e;
              
        if(target.classList.contains('real-node') || target.parentNode.classList.contains('real-node')) {

            const {left,top} = getPainterClientRect();

            setMenuData({
                showMenu:true,
                menuLeft:clientX -left,
                menuTop:clientY - top,
                selectNodeIdToDelete: +target.id || +target.parentNode.id
            })
        } else if(target.classList.contains('path-link')) {

            const {id} = target.parentNode,
                  {left,top} = getPainterClientRect();

            setMenuData({
                showMenu:true,
                menuLeft:clientX -left,
                menuTop:clientY - top,
                selectLinkLineToDelete: id
            })
        } else {
            clearMenu()
        }
    }

    // 点击节点，节点被选中
    const clickHandle = e => {
        setFocusNode(null)

        if (showMenu) {
            clearMenu()
        }

        if (focusNodeId) {
            setFocusNode(null)
        }
    }

    // 按下节点的连接起始点，准备连线
    const recordStartPoint = (startDatas) => {
        const {left,top} = getPainterClientRect(),
              {startPoint} = startDatas,
              _startDatas = {...startDatas}

        _startDatas.startPoint = [
            startPoint[0] - left,
            startPoint[1] - top
        ]

        setTempPath({
            ...tempPath,
            ..._startDatas
        })
        setWorkStatu('mouseDownStartPoint')
    }

    // 对节点进行关联
    const addNewPath = (endDatas) => {
    const {endPoint,endNodeId} = endDatas || {},
          {startNodeId} = tempPath
          
        if (endNodeId && endNodeId !== startNodeId) {

            const {left,top} = getPainterClientRect(),
                  _endDatas = {...endDatas}

            _endDatas.endPoint = [
                endPoint[0] - left,
                endPoint[1] - top
            ]

            setPathsConfigs([
                ...pathsConfigs,
                {
                    ...tempPath,
                    ..._endDatas
                }
            ])

            changeNodeDataByIds([endNodeId,startNodeId],
                            [{
                                pid:startNodeId
                            },{
                                hasChildNode:true
                            }]
                            )
        } else {
            Notification({
                message:'节点连接错误'
            })
        }
        setWorkStatu('default')
        setTempPath({})
    }

    // 节点位置调整时，一起调整节点间的连线
    const changePathsByNodeId = (nodeId,clientRect) => {
        const {left,top,width,height} = clientRect,
              painterClientRect = getPainterClientRect()
          
        let _pathsConfigs = [...pathsConfigs].map(item => {
            let {startNodeId,endNodeId} = item;

            if (nodeId === startNodeId) {
                return {
                    ...item,
                    startPoint:[left + width / 2 - painterClientRect.left,top + height - painterClientRect.top]
                }
            } else if (nodeId === endNodeId) {
                return {
                    ...item,
                    endPoint:[left + width / 2 - painterClientRect.left,top - painterClientRect.top]
                }
            }

            return item
        })

        setPathsConfigs(_pathsConfigs)
    }

    // 删除节点或者连线
    const deleteNodeOrLinkLine = e => {
        e.stopPropagation()

        if (selectNodeIdToDelete) {
            let _nodes = nodes.filter(item => item.id !== selectNodeIdToDelete),
                _pathsConfigs = pathsConfigs.filter(item => {
                    let {startNodeId,endNodeId} = item

                    return ![startNodeId,endNodeId].includes(selectNodeIdToDelete)
                })

            _nodes = _nodes.map(item => {
                // TODO: 对hasChildNode字段进行修改？
                if(item.pid === selectNodeIdToDelete) {
                    return {...item,pid:null}
                }

                return item
            })

            setNodes(_nodes)
            setPathsConfigs(_pathsConfigs)
        }

        if (selectLinkLineToDelete) {
            const [_startNodeId,_endNodeId] = selectLinkLineToDelete.split('-').map(item => +item);
 
            let _nodes = [...nodes].map(item => {
 
                 let {id,pid} = item;
 
                 if (pid === _startNodeId && _endNodeId === id) {
                     return {
                         ...item,
                         pid:null
                     }
                 }
 
                 return item
            })
 
            let _pathsConfigs = [...pathsConfigs].filter(item => {
                let {startNodeId,endNodeId} = item;
 
                return !(startNodeId === _startNodeId && endNodeId === _endNodeId)
 
            })
 
            setNodes(_nodes)
            setPathsConfigs(_pathsConfigs)
        }

        setMenuData({
            showMenu:false,
            selectNodeIdToDelete:null
        })
    }

    let _pathsConfigs = [...pathsConfigs];

    if (Object.keys(tempPath).length > 2) {
        _pathsConfigs = [..._pathsConfigs,tempPath]
    }

    return (
        <section className="painter-wrapper"
                 ref={painter}
                 onDrop={dropHandle}
                 onDragOver={dragOverHandle}
                 onMouseMove={mouseMoveHandle}
                 onMouseLeave={mouseLeaveHandle}
                 onMouseUp={mouseLeaveHandle}
                 onContextMenu={nodeContextMenuHandle}
                 onClick={clickHandle}
            >
                {
                    nodes.map(node => {
                        let {id} = node

                        return <NodeFactory key={id}
                                            focusNodeId={focusNodeId}
                                            inWhere="painter"
                                            workStatu={workStatu}
                                            recordStartPoint={recordStartPoint}
                                            addNewPath={addNewPath}
                                            changePathsByNodeId={changePathsByNodeId}
                                            limitNodePostion={limitNodePostion}
                                            changeNodeDataByIds={changeNodeDataByIds}
                                            setFocusNode={setFocusNode}
                                            clearMenu={clearMenu}
                                            {...node}></NodeFactory>    
                    })
                }
                <SvgFLow pathsConfigs={_pathsConfigs}></SvgFLow>
                {
                    showMenu &&
                    <section style={{left:menuLeft,top:menuTop}} className="painter-menu-wrapper">
                        <span className="menu-item" onClick={deleteNodeOrLinkLine}>删除</span>
                    </section>
                }
        </section>
    )
}