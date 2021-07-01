import axios from "axios";
import { cloneDeep } from "lodash";
import { Notification } from "../components/Notification";
import Qs from "qs";
import { objToFormdata } from "../util/util";
import store from "../store/index";
import { changeLoginModalStatu } from "../pages/user-center/store/ActionCreator";
import { loadingShowStatu } from "../components/loading/store/ActionCreator";

let loadingList = [],
  NoNotification = [];

// 创建axios实例，并传入默认配置
const instance = axios.create({
  method: "get",
  timeout: 30000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "X-Requested-With": "XMLHttpRequest", // 此字段是为了未登录时能拿到特定code值而添加的
  },
  transformRequest: function (data, headers) {
    if (
      headers["Content-Type"].indexOf("application/x-www-form-urlencoded") > -1
    ) {
      return Qs.stringify(data);
    }

    return data;
  },
});

// 判断是否需要关闭loading
function closeLoading(config = {}) {
  loadingList = loadingList.filter((item) => item !== config.url);

  if (loadingList.length === 0) {
    // TODO: 不使用redux管理
    store.dispatch(loadingShowStatu(false));
  }
}

// 判断是否需要自动进行异常提示
function _notification(
  { type = "warn", message = "请求异常", description },
  config = {}
) {
  if (NoNotification.includes(config.url)) {
    NoNotification.filter((item) => item !== config.url);
    return;
  }
  Notification({
    type,
    message,
    description,
  });
}

// 请求拦截器
instance.interceptors.request.use(
  function (config) {
    // 这里可以做些什么
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  function (response) {
    let { data, status, statusText, config } = response;

    closeLoading(config);

    if (data) {
      // 有数据返回时，判断code值
      let { code, msg } = data;
      if (code !== undefined && code !== 0) {
        if(code === 100010110) { // 未登录的特定code
          // 未登录的特定code
          // 打开登录提示框
          store.dispatch(changeLoginModalStatu(true));
        } else {
          _notification(
            {
              description: msg,
            },
            config
          );
        }

        return Promise.reject(data);
      }
      return data;
    }

    // 无数据返回的异常状态码提示
    _notification(
      {
        type: "error",
      },
      config
    );

    return Promise.reject({
      status,
      statusText,
    });
  },
  function (error) {
    let { response, config } = error,
      errorMsg = null;

    closeLoading(config);

    if (response && response.data) {
      // 响应中有错误信息
      let { code, msg } = response.data;
      if (code && msg) {
        errorMsg = `code : ${code} ; msg : ${msg}`;
      }
    }

    _notification(
      {
        type: "error",
        message: "请求失败",
        description: errorMsg || "请稍后重试！",
      },
      config
    );

    return Promise.reject(error);
  }
);

/**
 * 发起请求
 * @param {object} configs 请求配置，除官网配置外，还有功能配置字段{needVersion:number,needFormData:boolean,needJson:boolean,loading:boolean,noNotification:boolean}
 */
function _axios(configs) {
  let _configs = cloneDeep(configs),
    {
      method = "get",
      needVersion,
      needFormData,
      needJson,
      loading,
      noNotification,
      url,
      data,
    } = _configs;

  if (loading) {
    if (loadingList.length === 0) {
      store.dispatch(loadingShowStatu(true));
    }

    loadingList.push(url);
  }

  if (noNotification) {
    NoNotification.push(url);
  }

  delete _configs.loading;

  const dataName = method === "get" ? "params" : "data";
  if (needVersion) {
    _configs[dataName].version = needVersion;
  }
  delete _configs.needVersion;

  // 如果需要去除superInstanceId 参数
  if (_configs.noInstance) {
    delete _configs[dataName].superInstanceId ;
    delete _configs.noInstance;
  }

  if (method === "get") {
    delete _configs.data;
  }

  if (method === "post" && needFormData) {
    let _data = objToFormdata(data);
    _configs = Object.assign(_configs, {
      data: _data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
  delete _configs.needFormData;

  if (method === "post" && needJson) {
    let _data = JSON.stringify(data);
    _configs = Object.assign(_configs, {
      data: _data,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  delete _configs.needJson;

  //TODO: 添加“安全防护”相关内容？？？

  return instance(_configs);
}

/**
 * 发起get请求
 * @param {string} url 必要 | 请求链接
 * @param {Object} data 可选 | 参数
 * @param {Object} options 可选 | 功能配置项{needVersion:number,loading:boolean,noNotification:boolean}
 * @param {Object} configs 可选 | axios配置项，可配置内容同官网
 */
function get(url, data = {}, options = {}, configs = {}) {
  if (!data.superInstanceId ) {
    data.superInstanceId  = localStorage.getItem("superInstanceId");
  }

  return _axios({
    url,
    params: data,
    ...options,
    ...configs,
  });
}

/**
 * 发起post请求
 * @param {string} url 必要 | 请求链接
 * @param {Object} data 可选 | 参数
 * @param {Object} options 可选 | 功能配置项{needVersion:number,needFormData:boolean,needJson:boolean,loading:boolean,noNotification:boolean}
 * @param {Object} configs 可选 | axios配置项，可配置内容同官网
 */
function post(url, data = {}, options = {}, configs = {}) {
  if (!data.superInstanceId ) {
    data.superInstanceId  = localStorage.getItem("superInstanceId");
  }
  return _axios({
    url,
    method: "post",
    data,
    ...options,
    ...configs,
  });
}

export { _axios, get, post, axios };
