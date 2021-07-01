import React from 'react';
import './SafetySelectionTips.scss';

export default function SafetySelectionTips({flowLists = [],type = 1,activeItem}) {
    let listLength = flowLists.length;
    return (
        <div className='safety-selection-box'>
        {
            flowLists.map((item, index) =>{
                let {title,desc} = item,
                    explain = item.explain?'_explain':'onExplain';
  
                return (
                        <React.Fragment key={index}>
                        <div className='title-box'>
                            <div><span className="circle-number">{index + 1}</span>{title}</div>
                            {
                                desc && 
                                <div className="item-desc">{item.desc}</div>
                            }
                        </div>
                        {
                            (index < listLength - 1) &&
                            <div className={'arrow-right-wrapper '+explain}>
                                <span className='explainStyle'>{item.explain}</span>
                                <div className="arrow-right"></div>
                            </div>
                        }
                    </React.Fragment>)
                }
            )
        }
    </div>
    )
}
