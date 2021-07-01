import React from 'react'
import { Collapse } from 'antd';

import {NODE_LISTS} from './configs'
import NodeFactory from './nodeFactory'

const { Panel } = Collapse;

export default React.memo(function NodesContainer() {
    return (
        <section className="nodes-select-wrapper">
            <Collapse defaultActiveKey={['1','2','3','4']}>
                {
                    NODE_LISTS.map((item,index) => {
                        const {title,nodelists} = item
                        return (
                            <Panel header={title} key={index + 1}>
                                {
                                    getNodePanel(nodelists)
                                }
                            </Panel>
                        )
                    })
                }
            </Collapse>
        </section>
    )
})

function getNodePanel(nodelists = []) {
    return (
        <div className="node-panel">
            {
                nodelists.map((item,index) => (
                    <NodeFactory key={item.nodeType + index} {...item}></NodeFactory>
                ))
            }
        </div>
    )
}
