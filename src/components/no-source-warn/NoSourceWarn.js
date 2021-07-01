import React from 'react';
import './NoSourceWarn.scss';

import noSourceImg from '../../assets/images/common/no-source-tip.png';

function NoSourceWarn({tipText = '暂无数据',imgWidth,style = {}}) {
    return (
        <div className="no-source-wrapper" style={style}>
            <img style={{width:imgWidth}} src={noSourceImg} alt="暂无资源"/>
            <span className="no-source-tip">{tipText}</span>
        </div>
    )
}

export default React.memo(NoSourceWarn)

