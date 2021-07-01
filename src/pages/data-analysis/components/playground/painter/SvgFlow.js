import React, { useRef } from 'react'

export default function SvgFlow({pathsConfigs = []}) {
    const svgRef = useRef(null);

    return (
        <section className="svg-wrapper">
            <svg ref={svgRef}>
                {
                    pathsConfigs.map((item,index) => {

                        if (!item) {
                            return null
                        }

                        const {startPoint,endPoint,startNodeId,endNodeId} = item,
                              d = calcSvgPath(startPoint,endPoint),
                              _id = `${startNodeId}-${endNodeId}`
                        return (
                            <g key={_id} id={_id}>
                                <path className="path-link" d={d} stroke="rgba(255,0,0,.0)" strokeWidth="20" fill="none"></path>
                                <path className="path-link" d={d} stroke="rgba(153,153,153,.5)" strokeWidth="1" fill="none"></path>
                            </g>
                        )
                    })
                }
            </svg>
        </section>
    )
}

function calcSvgPath(startPoint,endPoint) {

    let   [sx,sy] = startPoint,
          [ex,ey] = endPoint,
          Qx1,
          Qy1;

    const  Qx2 = (sx + ex) / 2,
           Qy2 = (sy + ey) / 2;

    if (ey >= sy) {
        Qy1 = sy + 0.9 * (Qy2 - sy)
        Qx1 = sx
    } else {
        Qy1 = sy + (sy - ey) * 1.6
        Qx1 = sx
    }

    return `M ${sx} ${sy} Q ${Qx1} ${Qy1} ${Qx2} ${Qy2} T ${ex} ${ey}`
}
