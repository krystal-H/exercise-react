import React from 'react'
import {Icon} from 'antd'
import ProductIcon from '../../../../../components/product-components/product-icon/ProductIcon';
import { productStatusText } from '../../../../../configs/text-map';
import './ProductCard.scss';



function ProductCard(props) {
    let { productName, productId, productCode, bindTypeName, createTime, mode, productIcon,productClassName } = props.Info;
    let {copyFunction,deleteFunction} = props;
    return (
        <div className="product-item-card">
            <div className="product-info flex-column">
                <div className="product-info-header">
                    <span className="name" onClick={props.productInfo}>{productName}</span>
                    <span className={`status status-${mode}`}>{productStatusText['' + mode] || ''}</span>
                </div>
                <div className="product-cut flex1 flex-row">
                    <div className="flex1">
                        <div className="product-tags">
                            {
                                productClassName && 
                                <span className="gray-tag">
                                    {productClassName}
                                </span>
                            }
                            {
                                productClassName && 
                                <span className="gray-tag">
                                    {bindTypeName}
                                </span>
                            }
                        </div>
                        <div className="product-info-body flex1 flex-row">
                            <div className="infos flex1 flex-column">
                                <span className="id">{`产品ID：${productId}`}</span>
                                <span className="bind-typeName">{`通信技术：${bindTypeName}`}</span>
                                <span className="create-time">{`创建时间：${createTime}`}</span>
                            </div>
                        </div>
                    </div>
                    <ProductIcon icon={productIcon}></ProductIcon>
                </div>
            </div>
            <div className="btn-controls">
                <span className={"btn-base border-right " + (mode == '2' ? "disable" : "isOk")}
                      onClick={copyFunction}
                        ><Icon type="copy" /> 复制</span>|
                <span className={"btn-base " + (mode == '2' ? "disable" : "isOk")}
                      onClick={deleteFunction}  
                        ><Icon type="delete" /> 删除</span>
            </div>
        </div>
    )
}

export default React.memo(ProductCard)