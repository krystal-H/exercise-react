import React from 'react';
import {Icon} from 'antd';

import './DescWrapper.scss';

/**
 * const desc = [
        '温馨提示：',
        '1. 根据产品的硬件方案，可添加对应的固件程序；',
        '2. 添加的固件经过验证后，可正式发布；',
        '3. 每个固件有唯一的内部版本号；',
        '4. 若固件的版本号高于设备端的版本号，将触发固件升级；'
    ];
 */ 

function DescWrapper ({style = {},desc = []}) {

    return (<div style={style} className="desc-wrapper">
        <Icon type="exclamation-circle" theme="twoTone"/>
        {
            desc.map((item,index)=>{
                if(index){//区分第一个标题跟后面得说明
                    return <div key={'desc'+index} className='list_text'>{item}</div>
                }else{
                    return <span key={'desc'+index}>{item}</span>
                }
            })
        }
    </div>)
}

export default React.memo(DescWrapper)