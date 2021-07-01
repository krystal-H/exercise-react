import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';

const defaultState = fromJS({
    newMessageNums:{}
});

export default (state = defaultState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_NEW_MESSAGE_NUMS:
      return state.set('newMessageNums',action.data || {})
    default:
      return state;
  }
}