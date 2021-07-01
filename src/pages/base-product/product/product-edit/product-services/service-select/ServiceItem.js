import React from 'react'
import {withRouter} from 'react-router-dom'
import {Button} from 'antd'



function ServiceItem({
    itemData = {},
    setDetailType,
    setDetailVisiable,
    productId,
    history
}) {

    let {isActive,img,title,type,desc,path,control,} = itemData;

    const detailClick = () => {
        setDetailType(type)
        setDetailVisiable(true)
    }

    return (
        <div className={'service-item ' + (isActive ? 'active' : '')}>
            <div className="item-content">
                <img src={img} alt="" />
                <h4 className="name">
                    {title}
                </h4>
                <span className="desc">{desc}</span>
                {
                    isActive ?
                    <a onClick={detailClick} className="detail">{'详情 >>'}</a>:
                    <div className="detail"></div>
                }
            </div>
            <div className="item-control">
                {
                    itemData.isActive
                    ? <Button   onClick={ () => history.push(path.replace(':id',productId))}
                                type="default">{control}</Button> 
                    : <span>{control}</span>
                }
            </div>
        </div>
    )
}

export default withRouter(ServiceItem)
