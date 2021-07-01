import React , {useEffect} from 'react';
import { connect} from 'react-redux';
import {getH5Manages,getAppsByProductId,getConfigSteps} from '../../../store/ActionCreator';
import H5Manage from './H5Manage/H5Manage';
import './AppControl.scss';
import PageTitle from '../../../../../../components/page-title/PageTitle';

const mapStateToProps = state => {    
    return {
        productH5Pages: state.getIn(['product','productH5Pages']).toJS(),
        productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
        appsByProductId: state.getIn(['product','appsByProductId']).toJS(),
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getH5Manages: params => dispatch(getH5Manages(params)), // 更新当前操作的产品ID
        getAppsByProductId: productId => dispatch(getAppsByProductId(productId)), // 更新当前操作的产品ID
        getConfigSteps: id => dispatch(getConfigSteps(id)) // 获取产品页面步骤配置
    }
}

function AppControl ({
    productId,
    getH5Manages,
    productH5Pages,
    getAppsByProductId,
    appsByProductId,
    getConfigSteps,
    productBaseInfo,
    noNeedTitle,
    canOperate,
    history}) {

        let {productName,deviceTypeId,deviceSubtypeId,allCategoryName} = productBaseInfo,
            deviceTypeName = allCategoryName || '';

        useEffect(() => {
            if (productId) {
                getH5Manages({productId})
                getAppsByProductId(productId)
                // getConfigSteps(productId)
            }
        },[productId,getH5Manages,getAppsByProductId,getConfigSteps])

        const goBackServiceSelect  = () => {
            history.goBack();
        }


        return (
            <div className="app-control">
                {
                    !noNeedTitle &&
                    <PageTitle backHandle={goBackServiceSelect} title="APP控制服务"></PageTitle>
                }
                <H5Manage productId={productId}
                            productName={productName}
                            deviceTypeId={deviceTypeId}
                            deviceSubtypeId={deviceSubtypeId}
                            productH5Pages={productH5Pages} 
                            appsByProductId={appsByProductId}
                            deviceTypeName={deviceTypeName}
                            noNeedTitle={noNeedTitle}
                            canOperate={canOperate}
                            getH5Manages={getH5Manages}></H5Manage>
                
            </div>
        )
}

export default connect(mapStateToProps,mapDispatchToProps)(AppControl)