import React from 'react';
import {Button} from 'antd';

import './DoubleBtns.scss'

function DoubleBtns({
    preBtn = true,
    preText = '上一步',
    preType = 'default',
    preHandle = null,
    preLoading = false,
    nextBtn = true,
    nextText = '下一步',
    nextType = 'primary',
    nextHandle = null,
    nextLoading = false,
    nextDisable = false,
    style = {}
}) {
    return (
        <div>
            <section style={style} className="next-btn">
                <span>
                    {
                        preBtn && 
                        <Button type={preType} loading={preLoading} onClick={preHandle}>{preText}</Button> 
                    }
                    {
                        nextBtn && 
                        <Button disabled={nextDisable} type={nextType} loading={nextLoading} onClick={nextHandle}>{nextText}</Button> 
                    }
                </span>
            </section>
        </div>
    )
}

export default React.memo(DoubleBtns)
