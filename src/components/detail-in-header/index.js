import React from 'react'
import './style.scss'

/**
 * 带input search 等的header包裹层
 * @param children
 * @returns {XML}
 * @constructor
 */
export default function DetailInHeader({ children }) {
    return (
        <div className="header-detail">
            {
                children
            }
        </div>
    )
}
