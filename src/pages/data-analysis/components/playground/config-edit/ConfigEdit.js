import React from 'react'
import {NODE_NAMES} from '../nodes-container/configs'
import FormFactory from './FormFactory'

export default React.memo(function ConfigEdit({ service = {}, selectedNode, ...otherProps }) {
    const {id,nodeType} = selectedNode

    const {desc} = service

    return (
        <section className="config-edit-wrapper">
            <div className="title">{nodeType ? NODE_NAMES[nodeType] : '服务详情'}</div>
            {
                id 
                ? <div className="form-wrapper">
                    <FormFactory {...selectedNode} {...otherProps}></FormFactory>
                  </div>
                : (<ul className="service-wrapper">
                    <li><span className="label">服务类型:</span> <span className="content">{`数据分析服务`}</span></li>
                    <li><span className="label">服务描述:</span> <span className="content">{desc || '--'}</span></li>
                </ul>)
            }
            
        </section>
    )
})
