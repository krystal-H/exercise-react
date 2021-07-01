import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';

const devDebugState = fromJS({
    deviceAndWs:{
      wsUrl:{
        data:{}
      }, 
      productInfo:{
        data:{}
      }, 
      token:{
        data:{}
      }
    },
    websocketMessage:{
      devData : [], //数据调试原始数据列表
      devData2 : [], //升级数据原始数据列表
      deviceDebuggerException : "", //数据调试中的异常信息列表
      deviceDebuggerException2 : "", //升级数据中的异常信息列表
      onlineDevice : {}, //在线设备列表
    },
    dataTypeList:{
        data:[]
    },//数据类型
    propertyConfig:{},//根据产品ID获取协议信息
    deviceDebugAccountList:{
      data:[]
    },
    deviceDebugMacList:{
      data:[]
    },
    selectedData1:{},
    selectedData2:{},
});

export default (state = devDebugState, action) => {
  switch (action.type) {
    case ActionTypes.DEVICE_ADN_WS:
      return state.set('deviceAndWs',action.data)
    case ActionTypes.WEBSOCKET_MESSAGE:
      return state.set('websocketMessage',action.data)
    case ActionTypes.TOKEN:
      return state.setIn(['deviceAndWs', 'wsUrl', 'data'],action.data)
    case ActionTypes.RESET_DATA:
      return state.set('websocketMessage',action.data)
    case ActionTypes.DATA_TYPE_LIST:
      return state.set('dataTypeList',action.data)
    case ActionTypes.PROPERTY_CONFIG:
      return state.set('propertyConfig',action.data)
    case ActionTypes.DEVICE_DEBUG_MAC_LIST://调试MAC列表  
      return state.set('deviceDebugMacList',action.data||[])
    case ActionTypes.CHANGE_DEVICE_DEBUG_MAC_DATA://改变调试MAC数据 
      return state.set('deviceDebugMacList',action.data)
    case ActionTypes.EDIT_DEVICE_DEBUG_MAC_DATA://保存调试MAC数据 
      return state.set('deviceDebugMacList',action.data)
    case ActionTypes.ADD_DEVICE_DEBUG_MAC_LIST://新建调试MAC输入框 
      return state.set('deviceDebugMacList',action.data)
    case ActionTypes.DEVICE_DEBUG_ACCOUNT_GRT_LIST://调试账号列表 
      return state.set('deviceDebugAccountList',action.data)
    case ActionTypes.SELECTED_DATA_1://调试账号列表 
      return state.set('selectedData1',action.data||{})
    case ActionTypes.SELECTED_DATA_2://调试账号列表 
      return state.set('selectedData2',action.data||{})
    case ActionTypes.CLEAR_EXCEPTION_1://清空异常数据1
      return state.setIn(['websocketMessage', 'deviceDebuggerException'],action.data)
    case ActionTypes.CLEAR_EXCEPTION_2://清空异常数据2
      return state.setIn(['websocketMessage', 'deviceDebuggerException2'],action.data)
    case ActionTypes.COLAR_DEV_DATA1://清空报文列表
      return state.setIn(['websocketMessage', 'devData'],action.data)
    case ActionTypes.COLAR_DEV_DATA2://清空报文列表
      return state.setIn(['websocketMessage', 'devData2'],action.data)
    default:
      return state;
  }
}