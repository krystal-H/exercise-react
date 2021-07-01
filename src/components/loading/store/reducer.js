import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';

const defaultState = fromJS({
  loadingShow:false
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case ActionTypes.LOADING_TEST:
      return state.set('loadingShow',action.statu || false)
    default:
      return state;
  }
}