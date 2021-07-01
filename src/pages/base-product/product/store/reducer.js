import { fromJS } from 'immutable';
import * as ActionTypes from './ActionTypes';



const defaultState = fromJS({
    productList:{
      list:[],
      pager:{}
    },
    productBaseInfo:{},
    productProtocolLists:[],
    productConfigSteps:[],
    productH5Pages:{},
    appsByProductId:[],
    timeServiceList:[],
    optionsList:{},//产品三级类目list
    productBaseTypeList:{},//获取产品基本数据类型列表 productBaseTypeList
    visibleDebugger: false, // 是否显示协议脚本窗口
    jsContent: "",  // 协议脚本内容
    // 硬件开发
    tabIndex: 1,   // 当前页面，1： 选择模组类型页面； 2： 模组选择和详情页面
    moduleList: [],  // 模组列表
    hardwareType: null, //硬件类型： 0：MCU ; 1: SoC
    moduleItem: {}, // 选择模组
    commFreq: 10, // 上报频率
    mcuCodeCheck:false // 是否有可导出的mcu sdk
});


export default (state = defaultState, action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_PRODUCT_LIST:
      return state.set('productList',action.list)
    case ActionTypes.UPDATE_PRODUCT_BASE_INFO:
      return state.set('productBaseInfo',action.info)
    case ActionTypes.UPDATE_PRODUCT_BASE_INFO_DETAIL:
      const productBaseInfo = state.getIn(['productBaseInfo']).toJS();
      return state.merge({
        'productBaseInfo': {...productBaseInfo, ...action.info}
      })  
    case ActionTypes.UPDATE_PRODUCT_PROTOCOL_LISTS:
      return state.set('productProtocolLists',action.list)
    case ActionTypes.UPDATE_CONFIG_STEPS:
      return state.set('productConfigSteps',action.list)
    case ActionTypes.UPDATE_H5MANAGE_PAGES:
      return state.set('productH5Pages',action.data)
    case ActionTypes.UPDATE_APPS_BY_PRODUCTID:
      return state.set('appsByProductId',action.list)
    case ActionTypes.UPDATE_TIME_SERVICE_LIST:
      return state.set('timeServiceList',action.data)
    /**
     * 新建产品 start
     * aize-2019-09-10
     */ 
    case ActionTypes.GET_CATALOG_LIST://产品三级类目list
      return state.set('optionsList',action.data)
    case ActionTypes.PRODUCT_BASE_TYPE_LIST://获取产品基本数据类型列表 productBaseTypeList
      return state.set('productBaseTypeList',action.data) 
    /**
     * 协议脚本 
     */
    case ActionTypes.TRIGGER_DEBUGGER_MODAL:
      return state.set('visibleDebugger', action.visible);
    case ActionTypes.SET_JS_CONTENT:
      return state.set('jsContent', action.jsContent);

    /**
     * 硬件开发
     *  */  
    case ActionTypes.SWITCH_TAB:
      return state.set('tabIndex', action.tabIndex);
    case ActionTypes.SET_MODULE_LIST:
      return state.set('moduleList', action.list);
    case ActionTypes.SET_MODULE_ITEM:
      return state.set('moduleItem', action.moduleItem);
    case ActionTypes.CHANGE_MODULE:
      return state.merge({
        tabIndex: 2,
        moduleItem: {}
      })
    case ActionTypes.MCU_CODE_CHECK:
      return state.set('mcuCodeCheck',action.bl)
    case ActionTypes.SET_HARDWARE_TYPE:
      return state.set('hardwareType', action.hardwareType);
    case ActionTypes.MODIFY_COM_FREQ:
      return state.set('commFreq', action.commFreq);
    case ActionTypes.CHANGE_PRODUCT_INFO:
      return state.merge({
        productBaseInfo: {...state.getIn(['productBaseInfo']).toJS(), ...action.params}
      })
    default:
      return state;
  }
}