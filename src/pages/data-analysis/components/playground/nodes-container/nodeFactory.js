import React, { useState, useRef } from 'react'
import {Tooltip } from 'antd';
import { NO_LINKED, NO_LAUNCHLINK ,NODE_IMGS,NODE_NAMES} from './configs'
import { Notification } from '../../../../../components/Notification'
/**
 * 
 * @param {string} inWhere 'select' |  'painter'
 */
export default function NodeFactory({
    inWhere = 'select', ...rest
}) {
    switch (inWhere) {
        case 'painter':
            return <NodeInPainter {...rest}></NodeInPainter>
        case 'staticPainter':
            return <NodeInStaticPainter {...rest}></NodeInStaticPainter>
        case 'select':
        default:
            return <NodeInSelect {...rest}></NodeInSelect>

    }
}

function NodeInSelect({ nodeType, nodeName }) {
    // 开始拖拽
    const nodeDragStartHandle = e => {
        e.stopPropagation()
        // 给出反馈，修改目标透明度
        e.currentTarget.style.opacity = 0.5

        const { currentTarget, clientX, clientY } = e,
              { offsetLeft, offsetTop, offsetWidth, offsetHeight } = currentTarget,
              _data = {
                    l: offsetLeft,
                    t: offsetTop,
                    x: clientX,
                    y: clientY,
                    w: offsetWidth,
                    h: offsetHeight,
                    nodeType,
                    nodeName
                }
        e.dataTransfer.setData('text/plain', JSON.stringify(_data))
    }

    const nodeDragEndHandle = e => {
        e.currentTarget.style.opacity = 1
    }

    return (
        <div className="real-node in-select"
            draggable={true}
            onDragStart={nodeDragStartHandle}
            onDragEnd={nodeDragEndHandle}
        >
            <img src={NODE_IMGS[nodeType]} alt="icon"/>
            <span className="node-name">
                {nodeName}
            </span>
        </div>
    )
}

function NodeInPainter({
    nodeType,
    id,
    location,
    pid,
    input,
    hasChildNode,
    focusNodeId,
    limitNodePostion,
    workStatu,
    recordStartPoint,
    addNewPath,
    changePathsByNodeId,
    changeNodeDataByIds,
    setFocusNode,
    clearMenu
}) {
    const   [nodeStatu, setNodeStatu] = useState(null), // 节点的移动状态 用于画布中调整位置的标记
            [mouseDownPostion, setMouseDownPostion] = useState(null)

    const nodeRef = useRef(null)

    const nodeClickHandle = e => {
        e.stopPropagation()
        setFocusNode(id)
        clearMenu()
    }

    const nodeMouseMoveHandle = (e) => {
        if (['mouseDown', 'moving'].includes(nodeStatu)) {
            (nodeStatu === 'mouseDown') && setNodeStatu('moving')

            const { clientX, clientY, currentTarget } = e,
                { width, height, top, left } = currentTarget.getBoundingClientRect(),
                [oldX, oldY, oldLeft, oldTop] = mouseDownPostion,
                _left = clientX - oldX + oldLeft,
                _top = clientY - oldY + oldTop;

            if ( hasChildNode|| pid) {
                changePathsByNodeId(id, { width, height, top, left })
            }

            changeNodeDataByIds([id],[{
                location: [
                    limitNodePostion(_left, width, 'left'),
                    limitNodePostion(_top, height, 'top')
                ]
            }])
        }
    }

    const nodeMouseDownHandle = (e) => {
        e.preventDefault();
        const { clientX, clientY } = e;

        setNodeStatu('mouseDown')
        setMouseDownPostion([clientX, clientY, ...location])
    }

    const nodeMouseUpHandle = (e) => {
        if (workStatu === 'mouseDownStartPoint' && nodeStatu === 'mouseenter') {

            if (pid) {
                Notification({
                    description: '节点不可以有多个输入'
                })
                return
            }

            if (NO_LINKED.includes(nodeType)) {
                Notification({
                    description: '输入节点不能被链接'
                })
                return
            }

            e.stopPropagation()

            const { currentTarget } = e,
            { left, top, width } = currentTarget.getBoundingClientRect();

            addNewPath({
                endPoint: [left + width / 2, top],
                endNodeId: id
            })
        } else {
            stopMove()
        }
    }

    const stopMove = () => {
        setNodeStatu(preState => null)
        setMouseDownPostion(null)
    }

    const nodeMouseEnterHandle = () => {
        if (workStatu === 'mouseDownStartPoint') {
            setNodeStatu(preState => 'mouseenter')
        }
    }

    const linkBoxMouseDownHandle = e => {
        e.stopPropagation()

        const { target } = e,
              { left, top, width, height } = target.getBoundingClientRect();

        recordStartPoint({
            startPoint: [left + width / 2, top + height / 2],
            startNodeId: id
        })
    }

    const nodeContextMenuHandle = e => {
        e.preventDefault()
    }

    const _style = {
        left: `${location[0]}px`,
        top: `${location[1]}px`
    }

    const isFocus = (id === focusNodeId)

    return (
        <Tooltip placement="left" title={
            <div style={{padding:'8px'}}>
                <div>{`节点ID：${id}`}</div>
                <div>{`节点类型：${NODE_NAMES[nodeType]}`}</div>
            </div>
        }>
            <div  id={id} className={`real-node in-painter ${pid ? 'linked' : ''} ${isFocus ? 'focus' : ''}` }
                style={_style}
                ref={nodeRef}
                onClick={nodeClickHandle}
                onMouseDown={nodeMouseDownHandle}
                onMouseUp={nodeMouseUpHandle}
                onMouseLeave={stopMove}
                onMouseEnter={nodeMouseEnterHandle}
                onMouseMove={nodeMouseMoveHandle}
                onContextMenu={nodeContextMenuHandle}>
                    <img src={NODE_IMGS[nodeType]} alt="icon"/>
                    <span className="node-name">
                        {input.nodeName}
                    </span>
                {
                    !NO_LAUNCHLINK.includes(nodeType) && (
                        <div className="link-blocks-wrapper bottom"
                            onMouseDown={linkBoxMouseDownHandle}>
                            <div className="link-block"></div>
                        </div>
                    )
                }
                {
                    !NO_LINKED.includes(nodeType) && (
                        <div className="link-blocks-wrapper top">
                            <div className="link-block"></div>
                        </div>
                    )
                }
            </div>
        </Tooltip>
    )
}

function NodeInStaticPainter ({
    nodeType,
    id,
    location,
    pid,
    input
}) {
    const _style = {
        left: `${location[0]}px`,
        top: `${location[1]}px`
    }

    return (
        <Tooltip placement="left" title={
            <div style={{padding:'8px'}}>
                <div>{`节点ID：${id}`}</div>
                <div>{`节点类型：${NODE_NAMES[nodeType]}`}</div>
            </div>
        }>
            <div  id={id} className={`real-node in-painter ${pid ? 'linked' : ''}` }
                style={_style}
                >
                    <img src={NODE_IMGS[nodeType]} alt="icon"/>
                    <span className="node-name">
                        {input.nodeName}
                    </span>
                {
                    !NO_LAUNCHLINK.includes(nodeType) && (
                        <div className="link-blocks-wrapper bottom">
                            <div className="link-block"></div>
                        </div>
                    )
                }
                {
                    !NO_LINKED.includes(nodeType) && (
                        <div className="link-blocks-wrapper top">
                            <div className="link-block"></div>
                        </div>
                    )
                }
            </div>
        </Tooltip>
    )
}