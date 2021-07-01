import React, { useEffect } from 'react'
import {connect} from 'react-redux';

import {getProductBaseInfo,getProtocolLists} from '../store/ActionCreator';
import NoSourceWarn from '../../../../components/no-source-warn/NoSourceWarn';
// import ProductInfo from '../../../../components/product-components/product-info/ProductInfo';
import PageTitle from '../../../../components/page-title/PageTitle';
import ProductTabs from './product-tabs/ProductTabs';

import './ProductDetails.scss'

const mapStateToProps = state => {
    return {
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
        protocolLists:state.getIn(['product','productProtocolLists']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getProductBaseInfo: id => dispatch(getProductBaseInfo(id)), // 获取产品基本信息
        getProtocolLists: id => dispatch(getProtocolLists(id))
    }
}

// 获取路由中的ID参数
const getProductIdFromPath = (match) => +match.params.id;

function ProductDetails ({productBaseInfo,match,getProductBaseInfo,getProtocolLists,protocolLists}) {

    let productIdInRoutePath = getProductIdFromPath(match);

    useEffect( () => {
        // 产品ID更新后，重新获取数据
        if (productIdInRoutePath) {
            getProductBaseInfo(productIdInRoutePath)
            getProtocolLists(productIdInRoutePath)
        }
    },[getProductBaseInfo, getProtocolLists,productIdInRoutePath])

    if (!productIdInRoutePath) {
        return <NoSourceWarn tipText="没有传入产品ID哦"></NoSourceWarn>
    }

    return (
        <div className="eidt-wrapper">
            {/* <ProductInfo info={productBaseInfo}></ProductInfo> */}
            <PageTitle title={productBaseInfo.productName}></PageTitle>
            <div className={'edit-content-wrapper no-padding'}>
                <ProductTabs productId={productIdInRoutePath} protocolLists={protocolLists} productBaseInfo={productBaseInfo}
                ></ProductTabs>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductDetails)
