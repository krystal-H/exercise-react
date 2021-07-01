import React from 'react'
import MyIcon from '../../my-icon/MyIcon';
import './ProductIcon.scss';

function ProductIcon({icon}) {
    return (
        <div className={"icon-wrapper" + (icon ? ' show-img' : '')}>
        {
            icon 
            ? <img src={icon} alt="产品图标"/>
            : <MyIcon type="icon-tupian"></MyIcon>
        }  
    </div>
    )
}

export default React.memo(ProductIcon)
