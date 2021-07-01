import { fromJS } from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = fromJS({
    curDataDimension: {},
    apiList: [],
    pager: {},
});

export default (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_CUR_DATA_DIMENSION:
            return state.set('curDataDimension', action.curDataDimension);
        case actionTypes.CHANGE_API_LIST:
            return state.merge({
                apiList: action.apiList,
                pager: action.pager,
            });
        default:
            return state;
    }
}
