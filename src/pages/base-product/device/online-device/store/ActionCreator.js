import {get, post, Paths} from '../../../../../api';
import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';

// 更新产品列表
export const updateUserProductListAction = (list) => {
  return {
    type: ActionTypes.UPDATE_PRODUCT_LIST,
    list: fromJS(list)
  }
}

// 获取当前账号下的产品列表
export const getUserProductListAction = (data) => {
  return (dispatch,getState) => {
    get(Paths.getDownProduct,data,{
      loading:true
    }).then((res) => {
      let list = res.data && res.data.list || [],
          action = updateUserProductListAction(list);
      dispatch(action);
    });
  }
}

// 获取当前产品（可能是全部产品）下的设备入网统计
export const getDeviceStatAction = (data) => {
  return (dispatch) => {
    dispatch({
      type:ActionTypes.UPDATE_DEVICE_COUNT_STATU,
      statu:false
    });
    get(Paths.getDeviceStat,data).then((res) => {
      dispatch({
        type:ActionTypes.UPDATE_DEVICE_STAT,
        data:fromJS(res.data)
      });
    }).finally(()=>{
      dispatch({
        type:ActionTypes.UPDATE_DEVICE_COUNT_STATU,
        statu:true
      });
    });
  }
}

// 获取当前产品（可能是全部产品）下的设备列表
export const getDeviceListAction = (data) => {
  return (dispatch) => {
    get(Paths.getDeviceList,data,{loading:true}).then((res) => {
      dispatch({
        type:ActionTypes.UPDATE_DEVICE_LIST,
        data:fromJS(res.data)
      });
    });
  }
}

// 获取设备标签列表
export const getDeviceLabelListAction = (data) => {
  return (dispatch) => {
    get(Paths.getDeviceLabelList,data).then((res) => {
      // console.log(9999,res.data);
      dispatch({
        type:ActionTypes.UPDATE_DEVICE_LABEL,
        data:fromJS(res.data)
      });
    });
  }
}

// 获取默认设备标签
export const getDefaultLabelAction = (data) => {
  return (dispatch) => {
    get(Paths.getDeviceLabelList, data).then(res => {
      dispatch({
        type: ActionTypes.UPDATE_DEFAULT_DEVICE_LABEL,
        data: fromJS(res.data)
      })
    })
  }
}

// 获取标签库列表
export const getLabelBaseListAction = (data) => {
  return (dispatch) => {
    post(Paths.getLabelBaseList,data).then((res) => {
      dispatch({
        type:ActionTypes.UPDATE_DEVICE_LABELBASE,
        data:fromJS(res.data||[])
      });
    });
  }
}


