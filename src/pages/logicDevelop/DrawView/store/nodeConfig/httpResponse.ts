import HTTPResponse from "../../components/Content/Configuration/Configurations/HTTPResponse";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  DataValueType,
  ValueType,
  ConnectNodeType,
} from "../types";
import { getCompareData, getCompareDataBack } from "../constants";
import fn from "../../tools/fn";

const httpResponse: NodeControlProps = {
  id: "httpResponse",
  name: "HTTP返回",
  nodeType: 701, // 节点类型，与后台相对应的数字
  iconCls: "httpResponse",
  description: "配置HTTP请求返回的数据，返回码等内容",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [0, 0, 0], // 出口数量:默认值，最小值，最大值
  configuration: HTTPResponse,
  initData: () => {
    // 节点配置的初始化参数
    return {
      source: DataValueType.Value, // 源数据类型1
      sourceType: ValueType.Number, // 源数据类型2
      sourceValue: "", // 源数据：默认值

      // 2020-06-22 去掉返回码编辑
      /*codes: [
        // { id: 1, code: 402, message: "向上", description: "" }
      ], // 新增返回码列表 {id,code,message,description}

      showCodeModal: false, // 是否显示code编辑弹窗
      showCodeId: undefined, // 当前修改的返回码id
      */
    };
  },
  afterConnect: (
    connectType: ConnectNodeType,
    configuration: ConfigurationProps,
    startNode: NodeItem,
    endNode: NodeItem,
    state: SystemState
  ) => {
    if (connectType === ConnectNodeType.EndPoint) {
      Object.assign(configuration, {
        source: DataValueType.Node, //
        sourceType: startNode.id, // 替换为上一节点
        sourceValue: "", // 默认为全部返回值
      });
    }
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { source, sourceType, sourceValue } = configuration;
    const isVal = source === DataValueType.Value;
    if (isVal) {
      if (sourceType === ValueType.Array && !fn.isArrayString(sourceValue)) {
        return "输出内容格式应为数组";
      }
      if (sourceType === ValueType.Object && !fn.isJsonString(sourceValue)) {
        return "输出内容格式应为结构体";
      }
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState,
    idMaps: object
  ) => {
    const { source: a, sourceType: b, sourceValue: c } = configuration;
    const { pId } = nodeItem;
    const {
      target: source,
      targetType: sourceType,
      targetValue: sourceValue,
    } = getCompareData(a, b, c, idMaps, pId as string);

    let config = {
      source,
      sourceType,
      value: sourceValue,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { source: a, sourceType: b, value: c } = data;
    const {
      target: source,
      targetType: sourceType,
      targetValue: sourceValue,
    } = getCompareDataBack(a, b, c);
    return { source, sourceType, sourceValue };
  },
};
export default httpResponse;
