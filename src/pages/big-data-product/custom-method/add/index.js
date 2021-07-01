import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { actionCreators } from '../store';
import { WrappedAddMethodForm } from './form/addMethodForm';
import { Notification } from '../../../../components/Notification';
import { get, Paths } from '../../../../api';
import PageTitle from '../../../../components/page-title/PageTitle';

import './style.scss'

class CustomMethodAdd extends PureComponent {

    componentDidMount = () => {
        this.props.getCurApi();
        this.props.getProductList();
    };

    changeCurApi = (changedFields) => {
        let key = Object.keys(changedFields)[0];
        let value = Object.values(changedFields)[0];
        if (key === 'productId') {
            this.props.getProtocolListByProductId({
                productId: value.value,
            });
        }
        this.props.changeCurApi(key, value.value);
    };

    addMethod = (param) => {
        get(Paths.addMethod, param).then((res) => {
            const code = res.code;
            if (code === 0) {
                let { history } = this.props;
                Notification({
                    type:'success',
                    description:'新增统计方法成功',
                });
                history.replace({
                    pathname: 'open/bigData/customMethod',
                })
            }
        });
    };

    render() {
        let { curApi, productList, bindType, protocolList } = this.props;
        return (
            <div className="add-method-wrapper">
                <PageTitle backHandle={() => this.props.history.goBack()} title="自定义统计方法" />
                <div className="add-content-wrapper">
                    <WrappedAddMethodForm
                        curApi={curApi}
                        productList={productList}
                        protocolList={protocolList}
                        bindType={bindType}
                        changeCurApi={this.changeCurApi}
                        addMethod={this.addMethod}
                    />
                </div>
            </div>
        );
    }
}

const mapState = (state) => ({
    curApi: state.getIn(['customMethod', 'curApi']).toJS(),
    productList: state.getIn(['customMethod', 'productList']).toJS(),
    protocolList: state.getIn(['customMethod', 'protocolList']).toJS(),
    bindType: state.getIn(['customMethod', 'bindType']),
});

const mapDispatch = (dispatch) => {
    return {
        getCurApi() {
            const action = actionCreators.getCurApi();
            dispatch(action);
        },
        getProductList() {
            const action = actionCreators.getProductList();
            dispatch(action);
        },
        getProtocolListByProductId(param){
            const action = actionCreators.getProtocolListByProductId(param);
            dispatch(action);
        },
        changeCurApi(key, value){
            const action = actionCreators.changeCurApi(key, value);
            dispatch(action);
        },
    }
};

export default connect(mapState, mapDispatch)(CustomMethodAdd);
