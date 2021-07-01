import {get, post, Paths} from '../../../../api';
import { fromJS } from 'immutable';
import { cloneDeep} from 'lodash';
import * as ActionTypes from './ActionTypes';
import { message } from 'antd';
import { Notification } from '../../../../components/Notification';

// 更新产品列表
export const updateProductListAction = (list) => {
  return {
    type: ActionTypes.UPDATE_PRODUCT_LIST,
    list: fromJS(list)
  }
}

// 获取当前账号下的产品列表
export const getProductListAction = (data) => {
  return (dispatch,getState) => {
    get(Paths.getProductList,{
        ...data,
        instanceId:2
    },{
      needVersion:1.2,loading:true
    }).then((res) => {
      let list = res.data,
          action = updateProductListAction(list);
      dispatch(action);
    });
  }
}


// 更新产品基本信息
export const updateProductBaseInfo = (info) => {
  return {
    type: ActionTypes.UPDATE_PRODUCT_BASE_INFO,
    info:fromJS(info)
  }
}

// 获取产品基本信息
export const getProductBaseInfo = (productId) => {
  return (dispatch,getState) => {
    get(Paths.getProductBaseInfo,{
      productId
    },{
      needVersion:1.1,
      loading:true
    }).then(data => {
      let action = updateProductBaseInfo(data.data);
      dispatch(action);
    })
  }
}

// 更新产品的协议列表
export const updateProtocolLists= (list) => {
  return {
    type: ActionTypes.UPDATE_PRODUCT_PROTOCOL_LISTS,
    list: fromJS(list)
  }
}

// 获取产品协议列表
export const getProtocolLists = (productId) => {
  return (dispatch,getState) => {
    get(Paths.getProtocolList,{
      productId
    },{
      needVersion:1.2,
      loading:true
    }).then(data => {
      let action = updateProtocolLists(data.data.list);
      dispatch(action);
    })
  }
}

// 更新产品页面配置步骤信息
export const updateConfigSteps = (configList) => {
   return {
     type: ActionTypes.UPDATE_CONFIG_STEPS,
     list: fromJS(configList)
   }
}

// 获取产品页面步骤配置信息
export const getConfigSteps = (productId) => {
  return (dispatch,getState) => {
    get(Paths.getConfigSteps,{
      productId
    }).then(data => {
      let action = updateConfigSteps(data.data);
      dispatch(action);
    })
  }
}

// 更新产品H5页面信息
export const updateH5Manages= (data) => {
   return {
     type: ActionTypes.UPDATE_H5MANAGE_PAGES,
     data: fromJS(data)
   }
}

// 获取产品H5页面信息
export const getH5Manages = (params) => {
  return (dispatch,getState) => {
    get(Paths.getH5Pages,{...params,date: +new Date()},{
      needVersion: '1.1'
    }).then(data => {
      let action = updateH5Manages(data.data);
      dispatch(action);
    })
  }
}

// 更新产品关联的APP
export const updateAppsByProductId= (list) => {
   return {
     type: ActionTypes.UPDATE_APPS_BY_PRODUCTID,
     list: fromJS(list)
   }
}

// 获取产品关联的APP
export const getAppsByProductId = (productId) => {
  return (dispatch,getState) => {
    get(Paths.getAppsByProductId,{
      productId
    },{
      needVersion: '1.1'
    }).then(data => {
          
      let _data = cloneDeep(data.data || []);

      let action = updateAppsByProductId(_data);
      dispatch(action);
    })
  }
}

// 更新云端定时列表
export const updateTimeServiceList= (data) => {
   return {
     type: ActionTypes.UPDATE_TIME_SERVICE_LIST,
     data: fromJS(data)
   }
}

// 获取云端定时列表
export const getTimeServiceList = (params) => {
  return (dispatch,getState) => {
    get(Paths.getTimeServiceList,params,{loading:true}).then(data => {
          
      let action = updateTimeServiceList(data.data);
      dispatch(action);
    })
  }
}

/**
 * 新建产品 start
 * aize-2019-09-10
 */ 
//产品三级类目list
export const updateCatalogListAction = (data) => { 
  return {
    type: ActionTypes.GET_CATALOG_LIST,
    data:fromJS(data)
  }
}
export const getCatalogListAction = () => {
  return (dispatch,getState) => {
    get(Paths.getCatalogList).then((data) => {
      let action = updateCatalogListAction(data);
      dispatch(action)
    });
  }
}
//获取产品基本数据类型列表 productBaseTypeList
export const updateProductBaseTypeListAction = (data) => {
  return {
    type: ActionTypes.PRODUCT_BASE_TYPE_LIST,
    data:fromJS(data)
  }
}
export const getProductBaseTypeListAction = () => {
  return (dispatch,getState) => {
    get(Paths.productBaseTypeList).then((data) => {
      let action = updateProductBaseTypeListAction(data);
      dispatch(action)
    });
  }
}
//获取产品基本数据类型列表 productBaseTypeList
export const updateAddProductAction = (data) => {
  return {
    type: ActionTypes.PRODUCT_BASE_TYPE_LIST,
    data:fromJS(data)
  }
}
export const getAddProductAction = (data) => {
  return (dispatch,getState) => {
    post(Paths.addProduct,data,{loading:true}).then((data) => {
      if(data.code==0){
        Notification({
          type:'success',
          message: "创建成功",
          description:'创建产品成功！'
        });
        // 创建成功返回产品列表页
        window.history.back();
        // window.location.hash='#/open/base/product/list'
      }
    });
  }
}

// 打开关闭协议脚本窗口
export const triggerDebugger = (visible, productId = "") => {
  return (dispatch) => {
    if(visible && productId){
      dispatch(getJsContent(productId));
    }else{
      dispatch(setJsContent(""));
    }
    return dispatch({
      type: ActionTypes.TRIGGER_DEBUGGER_MODAL,
      visible
    })
  }
};

// 获取协议脚本
export const getJsContent = (productId) => {
  return (dispatch) => {
    return get(Paths.getJsContent, {productId}, {loading: true}).then((data) => {
      let result = data.data;
      if(data.code === 0){
        dispatch(setJsContent(result ? result.scriptContent : ""))
      }
    });
  };
}

// 设置协议脚本
export const setJsContent = (jsContent) => ({
    type: ActionTypes.SET_JS_CONTENT,
    jsContent
});

// 提交协议脚本
export const submitJsContent = (productId, javascript) => {
  return (dispatch) => {
    return post(Paths.sumbitJsContent, {productId, javascript}, {loading: true}).then((data) => {
      if(data.code === 0){
        Notification({
          type:'success',
          duration: 3,
          message: "保存成功"
        });
        dispatch(triggerDebugger(false));
      }
    });
  };
}

// 更新产品信息
export const updateInfo = (params) => {
  return (dispatch) => {
    return post(Paths.updateProductBaseInfo, params, {
      needFormData:true,
      loading:true
    }).then(res => {
      if(res.code === 0){
        message.success("保存成功");
        dispatch(updateInfoDetail(params));
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    })
  }
}

export const updateInfoDetail = (info) => ({
  type: ActionTypes.UPDATE_PRODUCT_BASE_INFO_DETAIL,
  info
})

// 切换当前模块
export const switchTab = (tabIndex) => {
  return (dispatch) => {
    if(tabIndex === 1){
      dispatch(setModuleItem({}))
    }
    return dispatch({
      type: ActionTypes.SWITCH_TAB,
      tabIndex
    })
  }
};

// 根据hardwareType获取模组列表
export const getModuleList = (params) => {
  return (dispatch) => {
    dispatch(setHardwareTypeAction(params.hardwareType));
    return get(Paths.getModuleList, params, {loading: true}).then(res => {
      if(res.code === 0){
        dispatch(setModuleList(res.data));
        return Promise.resolve(res.data);
      }
      return Promise.resolve(0);
    })
  }
};

// 设置方案类型
export const setHardwareTypeAction = (hardwareType) => ({
  type: ActionTypes.SET_HARDWARE_TYPE,
  hardwareType
});
export const setHardwareType = (typ) => {
  return (dispatch) => {
    dispatch(setHardwareTypeAction(typ))
  }
}

// 设置模组列表
export const setModuleList = (list) => ({
  type: ActionTypes.SET_MODULE_LIST,
  list: fromJS(list)
});

// 设置模组
export const setModuleItem = (moduleItem) => ({
    type: ActionTypes.SET_MODULE_ITEM,
    moduleItem: fromJS(moduleItem)
});

// 修改模组
export const changeModule = () => ({
  type: ActionTypes.CHANGE_MODULE,
});

// 保存模组数据
export const saveModule = (_params = {}) => {
  return (dispatch, getState) => {
    const { hardwareType, commFreq, moduleItem, productBaseInfo } = getState().getIn(['product']).toJS();
    let params = {
      productId: productBaseInfo.productId,
      hardwareType,
      commFreq: +commFreq,
	  moduleId: moduleItem.moduleId,
	  ..._params
    };

    return get(Paths.saveModule, params, {loading: true}).then(res => {
      if(res.code === 0){
        Notification({
          type:'success',
          message: "保存信息成功！",
          duration: 3
        })
        dispatch(setProductInfo(params))
        return Promise.resolve(1);
      }
      return Promise.resolve(0);
    })
  }
}

// 修改产品基础信息
export const setProductInfo = (params) => ({
  type: ActionTypes.CHANGE_PRODUCT_INFO,
  params
})

// 修改上报频率
export const modifyCommFreq = (commFreq) => ({
  type: ActionTypes.MODIFY_COM_FREQ,
  commFreq
})

// 设置硬件开发参数
export const setHardwareParam = (params) => {
  const { hardwareType, commFreq } = params;
  debugger;
  return (dispatch) => {
    dispatch(setHardwareType(hardwareType));
    dispatch(modifyCommFreq(commFreq));
  }
}

export const updateMcuCodeCheck = (bl) => {
	return {
		type: ActionTypes.MCU_CODE_CHECK,
		bl: fromJS(bl)
	}
}

export const getMcuCodeCheck = (productId) => {
	return (dispatch) => {
		return get(Paths.mcuCodeCheck,{productId},{noNotification:true}).then((model) => {
			if(model.code === 0){//检测成功
				dispatch(updateMcuCodeCheck(true))
			}
		});
	}
}