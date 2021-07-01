export const UPDATE_PRODUCT_LIST = "UPDATE_PRODUCT_LIST"; // 产品列表
export const UPDATE_PRODUCT_BASE_INFO = "GET_PRODUCT_BASE_INFO"; // 获取产品详情
export const UPDATE_PRODUCT_BASE_INFO_DETAIL = "UPDATE_PRODUCT_BASE_INFO_DETAIL"; // 更新产品信息
export const UPDATE_PRODUCT_PROTOCOL_LISTS = "UPDATE_PRODUCT_PROTOCOL_LISTS"; // 获取产品的协议列表
export const UPDATE_CONFIG_STEPS = "UPDATE_CONFIG_STEPS"; 
export const UPDATE_H5MANAGE_PAGES = "UPDATE_H5MANAGE_PAGES"; // H5页面列表
export const UPDATE_APPS_BY_PRODUCTID = "UPDATE_APPS_BY_PRODUCTID"; // H5页面升级所需的APP列表
export const UPDATE_TIME_SERVICE_LIST = "UPDATE_TIME_SERVICE_LIST"; // 云端定时列表 

//调试工具--
export const DEVICE_ADN_WS = "DEVICE_ADN_WS"; //获取产品信息+获取token+获取websokcet的IP
export const WEBSOCKET_MESSAGE = 'WEBSOCKET_MESSAGE';//处理websocket返回数据
export const TOKEN = "TOKEN";//获取token 
export const RESET_DATA = "RESET_DATA";//初始化数据 
export const DATA_TYPE_LIST = "DATA_TYPE_LIST";// 获取数据类型 
export const PROPERTY_CONFIG = "PROPERTY_CONFIG";// 根据产品ID获取协议信息 
export const DEVICE_DEBUG_ACCOUNT_GRT_LIST = "DEVICE_DEBUG_ACCOUNT_GRT_LIST";//调试账号列表  
export const CHANGE_DEVICE_DEBUG_MAC_DATA = "CHANGE_DEVICE_DEBUG_MAC_DATA";//改变调试账号数据  
export const DEVICE_DEBUG_MAC_LIST = "DEVICE_DEBUG_MAC_LIST";//调试MAC列表
export const EDIT_DEVICE_DEBUG_MAC_DATA = "EDIT_DEVICE_DEBUG_MAC_DATA";//编辑录入mac 
export const ADD_DEVICE_DEBUG_MAC_LIST = "ADD_DEVICE_DEBUG_MAC_LIST";//新增输入框 
export const SELECTED_DATA_1 = "SELECTED_DATA_1";//选择一条报文数据 
export const SELECTED_DATA_2 = "SELECTED_DATA_2";//选择一条报文数据
export const CLEAR_EXCEPTION_1 = "CLEAR_EXCEPTION_1";//清空异常数据数据 
export const CLEAR_EXCEPTION_2 = "CLEAR_EXCEPTION_2";//清空异常数据数据 
export const COLAR_DEV_DATA1 = "COLAR_DEV_DATA1";//清空报文数据
export const COLAR_DEV_DATA2 = "COLAR_DEV_DATA2";//清空报文数据 

/**
 * 新建产品 start
 * aize-2019-09-10
 */ 
export const GET_CATALOG_LIST = "GET_CATALOG_LIST";//产品三级类目list
export const PRODUCT_BASE_TYPE_LIST = "PRODUCT_BASE_TYPE_LIST";//获取产品基本数据类型列表 productBaseTypeList

/**
 * 协议脚本
 *  */
export const TRIGGER_DEBUGGER_MODAL = "TRIGGER_DEBUGGER_MODAL"; // 协议脚本窗口显示关闭
export const SET_JS_CONTENT = "SET_JS_CONTENT"; // 设置协议脚本

/**
 * 硬件开发
 */
export const SWITCH_TAB = "hardware/SWITCH_TAB";
export const SET_MODULE_LIST = "hardware/SET_MODULE_LIST";
export const SET_MODULE_ITEM = "hardware/SET_MODULE_ITEM";
export const CHANGE_MODULE = "hardware/CHANGE_MODULE";
export const SET_HARDWARE_TYPE = "hardware/SET_HARDWARE_TYPE";
export const CHANGE_PRODUCT_INFO = "hardware/CHANGE_PRODUCT_INFO";
export const MODIFY_COM_FREQ = "hardware/MODIFY_COM_FREQ";
export const MCU_CODE_CHECK = "hardware/MCU_CODE_CHECK";