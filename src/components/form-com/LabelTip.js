import * as React from 'react';
import { Tooltip, Icon } from 'antd';
import propsType from 'prop-types';

/**
 * 为label添加问号Icon和提示
 */
const LabelTip = ({label, tip, tipPlacement = "top", icon, colon = false,}) => {
    return (
        <span>
            <span>{label}</span>&nbsp;
            <Tooltip title={tip} placement={tipPlacement}><Icon type={icon || "question-circle-o"} /></Tooltip>
            &nbsp;
            <span>
                {
                    colon ? `:` : ""
                }
            </span>
        </span>
    )
}

LabelTip.prototype = {
    label: propsType.string,    // label
    tip: propsType.string,      // 提示
    icon: propsType.string      // icon 默认问号
}

export default LabelTip