import React, { useRef } from 'react'
import NodeFactory from '../nodes-container/nodeFactory'
import SvgFLow from './SvgFlow'

const PAINTER_MARGIN = 2;

export default function StaticPainter({
    nodes,
    pathsConfigs,
}) {

    const painter = useRef(null) // 画布实例

    // 对节点位置进行限制
    const limitNodePostion = (_num,_self,type) => {
        let {width,height} = painter ? painter.current.getBoundingClientRect() : {},
            _container = (type === 'left') ? width : height;
           
        if (_num + _self > _container - PAINTER_MARGIN) {
            _num = _container - _self - PAINTER_MARGIN
        }
    
        return _num > PAINTER_MARGIN ? _num : PAINTER_MARGIN
    }

    return (
        <section className="painter-wrapper"
            >
                {
                    nodes.map(node => {
                        let {id} = node

                        return <NodeFactory key={id}
                                            inWhere="staticPainter"
                                            limitNodePostion={limitNodePostion}
                                            {...node}></NodeFactory>    
                    })
                }
                <SvgFLow pathsConfigs={pathsConfigs}></SvgFLow>
        </section>
    )
}