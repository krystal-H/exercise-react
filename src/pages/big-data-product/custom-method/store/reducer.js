import { fromJS } from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = fromJS({
    methodList: [],
    MethodNums:{},
    pager: {},
    curApi: {},
    productList: [],
    protocolList: [],
    bindType: null,
});

const getBindType = (state, action) => {
    const productList = state.get('productList').toJS();
    return productList.find((product, index) => {
        return product.productId === action.productId;
    }).bindType;
};

export default (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_METHOD_LIST:
            return state.merge({
                methodList: action.methodList,
                pager: action.pager,
            });
        case actionTypes.CHANGE_METHOD_NUMS:
            return state.set('MethodNums', action.MethodNums);
        case actionTypes.GET_API:
            return state.set('curApi', action.curApi);
        case actionTypes.CHANGE_PRODUCT_LIST:
            return state.set('productList', action.productList);
        case actionTypes.CHANGE_PROTOCOL_LIST:
            let bindType = getBindType(state, action);
            return state.merge({
                protocolList: action.protocolList,
                bindType,
            });
        case actionTypes.CHANGE_CUR_API:
            // 选择产品时需要将协议类型、协议列表置成未选择状态
            if (action.key === 'productId') {
                return state.setIn(['curApi', action.key], action.value).setIn(['curApi', 'dataType'], undefined).setIn(['curApi', 'property'], undefined);
            }
            if (action.key === 'dataType') {
                return state.setIn(['curApi', action.key], action.value).setIn(['curApi', 'property'], undefined);
            }
            return state.setIn(['curApi', action.key], action.value);
        default:
            return state;
    }
}
