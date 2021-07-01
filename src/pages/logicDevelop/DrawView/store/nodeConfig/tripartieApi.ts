import TripartieApi from "../../components/Content/Configuration/Configurations/TripartieApi";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
} from "../types";
import { methodList, encodeTypeList } from "../constants";
import rules from "../../components/Content/Configuration/rules";
import fn from "../../tools/fn";

const defaultMethod = methodList[1].id,
  defaultEncode = encodeTypeList[0].id,
  defaultParams = `{
  "param1": "",
  "param2": ""
}`;

const tripartieApi: NodeControlProps = {
  id: "tripartieApi",
  name: "API服务调用",
  nodeType: 301, // 节点类型，与后台相对应的数字
  iconCls: "tripartieApi",
  description:
    "支持调用外部的API，返回body将完整传递，需要后续添加脚本节点进行解析",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: TripartieApi,
  initData: () => {
    // 节点配置的初始化参数
    return {
      method: defaultMethod,
      apiUrl: "",
      encode: defaultEncode,
      params: defaultParams,
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { apiUrl, params } = configuration;
    if (apiUrl === "") {
      return "API地址不能为空";
    }
    if (!rules.urlTest.test(apiUrl)) {
      return "API地址格式不正确";
    }
    if (!fn.isJsonString(params)) {
      return "参数格式应为结构体";
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { method, apiUrl, encode, params } = configuration;
    let config = { method, apiUrl, encode, params };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { method, apiUrl, encode, params } = data;
    return { method, apiUrl, encode, params };
  },
};
export default tripartieApi;
