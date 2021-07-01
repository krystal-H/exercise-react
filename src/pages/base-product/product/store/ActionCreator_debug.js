import {get, Paths} from '../../../../api';
import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';
import axios from 'axios';

import { notification } from 'antd';

// import { deviceDebuggerDataList, deviceDebuggerDataList2, deviceDebuggerException, deviceDebuggerException2, onlineDevice } from '../../../../configs/deviceBugger';
let deviceDebuggerDataList = []; //数据调试原始数据列表
let deviceDebuggerDataList2 = []; //升级数据原始数据列表
let deviceDebuggerException = ""; //数据调试中的异常信息列表
let deviceDebuggerException2 = ""; //升级数据中的异常信息列表
let onlineDevice = {}; //在线设备列表

//获取产品信息+获取token+获取websokcet的IP
function getQueryServerConfigAction_1(id) {
  return get(Paths.queryServerConfig,{productId: id})
}
function getProductIdentifierAction_1(id) {
  return get(Paths.productIdentifier,{productId: id});
}
function getAccessTokenAction_1(){
  return get(Paths.accessToken);
}
export const updateDeviceAction = (data) => {
  return {
    type: ActionTypes.DEVICE_ADN_WS,
    data:fromJS(data)
  }
}
export const getDeviceAndWsAction = (id) => {
  return (dispatch,getState) => {
    axios.all([getQueryServerConfigAction_1(id), getProductIdentifierAction_1(id),getAccessTokenAction_1()])
    .then(axios.spread(function (wsUrl, productInfo, token) {
      // 三个请求现在都执行完成
      let data = {
        wsUrl, productInfo, token
      }
      let action = updateDeviceAction(data);
      dispatch(action)
    }));
  }
}

//处理websocket返回数据
function setOnlineDevice(mac, packetStart) {
  onlineDevice[mac] = { time: new Date().getTime(), packetStart: packetStart };
}
export const updateWebsocketMessageAction = (data) => {
  return {
    type: ActionTypes.WEBSOCKET_MESSAGE,
    data:fromJS(data)
  }
}
export const getWebsocketMessageAction = (model) => {
  return (dispatch,getState) => {
    let dataTypeMap = {
      U: '上行数据',
      D: '下行数据',
      E: '调试异常信息',
    };
    model.dataTypeString = dataTypeMap[model.dataType];
    model.packetLengthString = model.packetLength + '字节';
    model.dataLengthString = model.dataLength + '字节';
    model.id = uuid(); //用uuid当做唯一标识
    // model.id=new Date().getTime();//用时间戳当做唯一标识
    if (model.bussinessType == 0 || model.bussinessType == 1) {
      if (model.command == "FF03") {
          deviceDebuggerException = model.parseData.exception + "\r\n" + deviceDebuggerException;
      } else {
          deviceDebuggerDataList.unshift(model);
      }
    } else if (model.bussinessType == 2 || model.bussinessType == 3) {
        if (model.command == "FF04" || model.command == "FF05") {
            deviceDebuggerException2 = model.parseData.exception + "\r\n" + deviceDebuggerException2;
        } else {
            deviceDebuggerDataList2.unshift(model);
        }
    } else {
        if (model.command == "FFFF" && model.parseData.info) {
            notification.open({
              message: '命令调试提示',
              description:model.parseData.info,
              style: {
                width: 500,
                marginLeft: 335 - 600,
              },
            });
        }
    }
    // console.log('---实时返回的mac-----------', model.macAddress, model.packetStart)
    setOnlineDevice(model.macAddress, model.packetStart);
    let devObj = ({
      devData: deviceDebuggerDataList,
      devData2: deviceDebuggerDataList2,
      onlineDevice: onlineDevice,
      deviceDebuggerException: deviceDebuggerException,
      deviceDebuggerException2: deviceDebuggerException2
    });
    function uuid() {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      var uuid = s.join("");
      return uuid;
    }
    let action = updateWebsocketMessageAction(devObj);
    dispatch(action)
  }
}

//获取token
export const updateTokenAction = (data) => {
  return {
    type: ActionTypes.TOKEN,
    data:fromJS(data)
  }
}
export const getTokenAction = (model) => {
  return (dispatch,getState) => {
    axios.all([getAccessTokenAction_1()])
    .then(axios.spread(function (token) {
      let action = updateTokenAction(token);
      dispatch(action)
    }));
  }
}

//初始化
export const resetDataActionAction = (data) => {
  return {
    type: ActionTypes.RESET_DATA,
    data:fromJS(data)
  }
}
export const resetDataAction = (model) => {
  return (dispatch,getState) => {
    let data = {
      deviceDebuggerDataList: [], //初始化列表
      deviceDebuggerDataList2: [], //初始化列表
      deviceDebuggerException: "", //初始化列表
      deviceDebuggerException2: "", //初始化列表
      onlineDevice: {}, //在线设备列表
    }
    let action = resetDataActionAction(data);
    dispatch(action)
  }
}

//获取数据类型
export const updateDataTypeListAction = (data) => {
  return {
    type: ActionTypes.DATA_TYPE_LIST,
    data:fromJS(data)
  }
}
export const getDataTypeListAction = (id) => {
  return (dispatch,getState) => {
    get(Paths.dataTypeList,{productId: id}).then((data) => {
      let action = updateDataTypeListAction(data);
      dispatch(action)
    });
  }
}

//根据产品ID获取协议信息
export const updatePropertyConfigAction = (data) => {
  return {
    type: ActionTypes.PROPERTY_CONFIG,
    data:fromJS(data)
  }
}
export const getPropertyConfigAction = (id) => {
  return (dispatch,getState) => {
    get(Paths.propertyConfig,{productId: id},{
      needVersion:1.1
    }).then((data) => {
      // propertyConfigId: result,
      // propertyConfig: model.protocolList
      let model = data.data;
      let idMap = model.idList;
      let result = {};
      for (let id in idMap) {
        let ps = idMap[id];
        ps.forEach(v => {
            result[v] = id;
        });
      }
      let obj = {
        propertyConfigId: result,
        propertyConfig: model.protocolList
      }
      let action = updatePropertyConfigAction(obj);
      dispatch(action)
    });
  }
}

//调试MAC列表 debugSecretList
export const getDeviceDebugMacList = (id) => {
  return (dispatch,getState) => {
    // get(Paths.deviceDebugMacGetList,{productId: id}).then((data) => {
    //   let action = updateDeviceDebugMacListAction(data);
    //   dispatch(action)
    // });
    get(Paths.debugSecretList,{productId: id},{loading:true}).then((data) => {
      console.log('data--------', data);
      let action = updateDeviceDebugMacListAction(data);
      dispatch(action)
    });
  }
}
export const updateDeviceDebugMacListAction = (data) => {
  return {
    type: ActionTypes.DEVICE_DEBUG_MAC_LIST,
    data:fromJS(data)
  }
}

//改变调试MAC数据
export const changeDeviceDebugMacData = (data) => {
  return {
    type: ActionTypes.CHANGE_DEVICE_DEBUG_MAC_DATA,
    data:fromJS(data)
  }
}
export const changeDeviceDebugMACDataAction = (data) => {
  return (dispatch,getState) => {
    let action = changeDeviceDebugMacData(data);
    dispatch(action)
  }
}
//删除调试MAC数据
export const deleteDeviceDebugMacDataAction = (pid,deleteId,data) => {
  return (dispatch,getState) => {
    if(data){
      let action = changeDeviceDebugMacData(data);//改变调试MAC数据
      dispatch(action)
    }else{
      // get(Paths.deviceDebugMacDelete,{productId: pid,debugMacId:deleteId}).then((data) => {
      //   if(data.code==0){//删除成功调用mac列表请求
      //     get(Paths.deviceDebugMacGetList,{productId: pid}).then((data) => {
      //       let action = updateDeviceDebugMacListAction(data);
      //       dispatch(action)
      //     });
      //   }
      // });
      get(Paths.delDebugMac,{id:deleteId},{loading:true}).then((data) => {
        if(data.code==0){//删除成功调用mac列表请求
          get(Paths.debugSecretList,{productId: pid},{loading:true}).then((data) => {
            let action = updateDeviceDebugMacListAction(data);
            dispatch(action)
          });
        }
      });
    }
  }
}
//保存mac
export const getDeviceDebugMacInsertAction = (productId,account,macId='') => {
  return (dispatch,getState) => {
    let data = macId?{productId, account}:{productId, account, macId};//新建保存跟编辑保存区分---有无macId
    get(Paths.deviceDebugAccountInsert,data).then((data) => {
      if(data.code==0){//保存成功调用mac列表请求
        get(Paths.deviceDebugAccountGetList,{productId}).then((data) => {
          let action = updateDeviceDebugMacListAction(data);
          dispatch(action)
        });
      }
    });
  }
}
//编辑录入mac
export const editDeviceDebugMacData = (data) => {
  return {
    type: ActionTypes.EDIT_DEVICE_DEBUG_MAC_DATA,
    data:fromJS(data)
  }
}
export const editDeviceDebugMacDataAction = (data) => {
  return (dispatch,getState) => {
      let action = editDeviceDebugMacData(data);
      dispatch(action)
  }
}
//新增输入框
export const addDeviceDebugMacList = (data) => {
  return {
    type: ActionTypes.ADD_DEVICE_DEBUG_MAC_LIST,
    data:fromJS(data)
  }
}
export const addDeviceDebugMacListAction = (data) => {
  return (dispatch,getState) => {
      let action = addDeviceDebugMacList(data);
      dispatch(action)
  }
}
//调试账号列表
export const updateDeviceDebugAccountListAction = (data) => {
  return {
    type: ActionTypes.DEVICE_DEBUG_ACCOUNT_GRT_LIST,
    data:fromJS(data)
  }
}
export const getDeviceDebugAccountListAction = (id) => {
  return (dispatch,getState) => {
    get(Paths.deviceDebugAccountGetList,{productId: id}).then((data) => {
      let action = updateDeviceDebugAccountListAction(data);
      dispatch(action)
    });
  }
}
//保存调试账号
export const getDeviceDebugAccountInsertAction = (productId,account) => {
  return (dispatch,getState) => {
    get(Paths.deviceDebugAccountInsert,{productId,account}).then((data) => {
      if(data.code==0){//保存成功调用账号列表请求
        get(Paths.deviceDebugAccountGetList,{productId}).then((data) => {
          let action = updateDeviceDebugAccountListAction(data);
          dispatch(action)
        });
      }
    });
  }
}
//更新账号列表数据
export const getRenewalAccountAction = (data) => {
  return (dispatch,getState) => {
    let action = updateDeviceDebugAccountListAction(data);//更新账号列表
    dispatch(action)
  }
}
//选择一条报文数据 selectedData1
export const update_SelectedData1_Action = (data) => {
    return {
      type: ActionTypes.SELECTED_DATA_1,
      data:fromJS(data)
    }
  }
export const get_SelectedData1_Action = (data) => {
    return (dispatch,getState) => {
        let action = update_SelectedData1_Action(data);
        dispatch(action)
    }
}
//选择一条报文数据 selectedData2
export const update_SelectedData2_Action = (data) => {
  return {
    type: ActionTypes.SELECTED_DATA_2,
    data:fromJS(data)
  }
}
export const get_SelectedData2_Action = (data) => {
  return (dispatch,getState) => {
      let action = update_SelectedData2_Action(data);
      dispatch(action)
  }
}
//清空异常数据 clearException
export const update_clearException1_Action = (data) => {
  data = deviceDebuggerException;
  return {
    type: ActionTypes.CLEAR_EXCEPTION_1,
    data:fromJS(data)
  }
}
export const get_clearException1_Action = () => {
  return (dispatch,getState) => {
      deviceDebuggerException='';
      let action = update_clearException1_Action();
      dispatch(action)
  }
}
//清空异常数据 clearException_2
export const update_clearException2_Action = (data) => {
  data = deviceDebuggerException;
  return {
    type: ActionTypes.CLEAR_EXCEPTION_2,
    data:fromJS(data)
  }
}
export const get_clearException2_Action = () => {
  deviceDebuggerException='';
  return (dispatch,getState) => {
      let action = update_clearException2_Action();
      dispatch(action)
  }
}
//清空数据  DevData SelectedData1
export const update_clearDevData1_Action = () => {
  deviceDebuggerDataList=[];
  return {
    type: ActionTypes.COLAR_DEV_DATA1,
    data:fromJS(deviceDebuggerDataList)
  }
}
//清空数据  DevData SelectedData2
export const update_clearDevData2_Action = () => {
  deviceDebuggerDataList2=[];
  return {
    type: ActionTypes.COLAR_DEV_DATA2,
    data:fromJS(deviceDebuggerDataList)
  }
}
export const get_clearDevData1_Action = () => {
  return (dispatch,getState) => {
      let action = update_clearDevData1_Action();
      let action1 = update_SelectedData1_Action({});
      dispatch(action);
      dispatch(action1);
  }
}
export const get_clearDevData2_Action = () => {
  return (dispatch,getState) => {
      let action = update_clearDevData2_Action();
      let action1 = update_SelectedData2_Action({});
      dispatch(action);
      dispatch(action1);
  }
}
