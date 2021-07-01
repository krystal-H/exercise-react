import React from 'react';
import './FlowChart.scss';

import FlowArrowImg from '../../assets/images/flow-arrow.png';

/**
 * @param {array} flowLists 数组源
 * @param {number} type 流程图类型，目前有两种不同的样式
 * @param {number} activeItem 当前的流程index
 */
function FlowChart({flowLists = [],type = 1,activeItem,style={}}) {
    let listLength = flowLists.length;
    return (
        <div style={style} className={"app-flows style-" + type}>
        {
            flowLists.map((item, index) =>{
                let {title = '',desc} = item,
                    itemTitleClassName = "flow-item " + (activeItem >= index ? 'active' : '')
  
                return (
                        <React.Fragment key={index}>
                            <div className={itemTitleClassName}>
                                {    (type === 2) &&
                                     <span className="circle-number">{index + 1}</span>
                                }
                                <span>{title}</span>
                                {
                                    desc && 
                                    <div className="desc">{item.desc}</div>
                                }
                            </div>
                            {
                                (index < listLength - 1) &&
                                <div className="arrow-right-wrapper">
                                    {
                                        type === 3 ? <img alt="flow-arrow" src={FlowArrowImg}></img> :
                                        <div className="arrow-right need-arrow"></div>
                                    }
                                </div>
                            }
                    </React.Fragment>)
                }
            )
        }
    </div>
    )
}

export default React.memo(FlowChart)
