import * as ActionTypes from './ActionTypes';
import {get,Paths} from '../../../api';
import { fromJS } from 'immutable';


export const updateNewMessageNums= (data) => {
  return {
    type: ActionTypes.UPDATE_NEW_MESSAGE_NUMS,
    data:fromJS(data)
  }
}

export const getNewMessageNums= () => {
  return (dispatch,getState) => {
    get(Paths.getUnreadQuantity,{},{
      needVersion:1.1
    }).then((res) => {
      let data = res.data,
          action = updateNewMessageNums(data);
      dispatch(action);
    });
  }
}