import { get, Paths } from '../../../../api';
import { fromJS } from 'immutable';
import * as actionTypes from './actionTypes';

const changeMethodList = (result) => ({
    type: actionTypes.CHANGE_METHOD_LIST,
    methodList: fromJS(result.list),
    pager: fromJS(result.pager),
});

const getApi = (result) => ({
    type: actionTypes.GET_API,
    curApi: fromJS(result),
});

const changeProductList = (result) => ({
    type: actionTypes.CHANGE_PRODUCT_LIST,
    productList: fromJS(result),
});

const changeProtocolList = (result, param) => ({
    type: actionTypes.CHANGE_PROTOCOL_LIST,
    protocolList: fromJS(result),
    productId: param.productId,
});

export const changeCurApi = (key, value) => {
    return {
        type: actionTypes.CHANGE_CUR_API,
        key,
        value,
    }
};

export const getMethodList = (param) => {
    return (dispatch) => {
        get(Paths.getMethodList, param).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch(changeMethodList(result));
            }
        });
    }
};

export const getMethodNums = () => {
    return (dispatch) => {
        get(Paths.getMethodLimit).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch({
                    type: actionTypes.CHANGE_METHOD_NUMS,
                    MethodNums:fromJS(result) 
                });
            }
        });
    }
};

export const getCurApi = (apiId) => {
    return (dispatch) => {
        if (apiId) {
            get(Paths.getMethodDetail, {
                apiId
            }).then((res) => {
                const result = res.data;
                const code = res.code;
                if (code === 0) {
                    dispatch(getApi(result));
                }
            });
        } else {
            dispatch(getApi({
                apiName: '',
                productId: undefined,
                reportFormsType: 4,
                cityTimeZone: 8,
                ruleType: 1,
            }));
        }
    }
};

export const getProductList = () => {
    return (dispatch) => {
        get(Paths.getMethodProductList).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch(changeProductList(result));
            }
        });
    }
};

export const getProtocolListByProductId = (param) => {
    return (dispatch) => {
        get(Paths.getProtocolListByProductId, param).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch(changeProtocolList(result, param));
            }
        });
    }
};
