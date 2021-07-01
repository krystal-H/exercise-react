/* 最外层包裹  预制布局样式 */
/* 具体见 ./outsideWrapper.scss */
import React from 'react'
import './outsideWrapper.scss'

export default function OutsideWrapper({children,limitWidthAndHeight=true}) {
    return (
        <div className={'body-container ' + (limitWidthAndHeight ? 'limit-w-h' : '')}>
            {
                children
            }
        </div>
    )
}
