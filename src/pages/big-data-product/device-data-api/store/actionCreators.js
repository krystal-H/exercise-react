import { get, Paths } from '../../../../api';
import { fromJS } from 'immutable';
import * as actionTypes from './actionTypes';

const changeCurDataDimension = (result) => ({
    type: actionTypes.CHANGE_CUR_DATA_DIMENSION,
    curDataDimension: fromJS(result),
});

const changeApiList = (result) => ({
    type: actionTypes.CHANGE_API_LIST,
    apiList: fromJS(result.list),
    pager: fromJS(result.pager),
});

export const getDimensionList = (param) => {
    return (dispatch) => {
        get(Paths.getDimensionList, param).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch(changeCurDataDimension(result));
            }
        });
    }
};

export const getApiList = (param) => {
    return (dispatch) => {
        get(Paths.getApiList, param).then((res) => {
            const result = res.data;
            const code = res.code;
            if (code === 0) {
                dispatch(changeApiList(result));
            }
        });
    }
};
