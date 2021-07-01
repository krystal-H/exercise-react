import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';



const defaultState = fromJS({
    productList:[],
    deviceStat:{},
    deviceList:{},
    deviceLabel:{
      list:[],
      pager:{}
    },
    deviceLabelBase:[],
    defaultLabel: [],
    freshStatu:true,
});


export default (state = defaultState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_PRODUCT_LIST:
      return state.set('productList',action.list)
    case ActionTypes.UPDATE_DEVICE_STAT:
      return state.set('deviceStat',action.data)
    case ActionTypes.UPDATE_DEVICE_LIST:
      return state.set('deviceList',action.data)
    case ActionTypes.UPDATE_DEVICE_LABEL:
      return state.set('deviceLabel',action.data)
    case ActionTypes.UPDATE_DEVICE_LABELBASE:
      return state.set('deviceLabelBase',action.data)
    case ActionTypes.UPDATE_DEFAULT_DEVICE_LABEL:
        return state.set('defaultLabel', action.data)
    case ActionTypes.UPDATE_DEVICE_COUNT_STATU:
      return state.set('freshStatu', action.statu)
      
    
    default:
      return state;
  }
}