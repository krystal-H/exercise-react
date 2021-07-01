import TCPRelease from "../../components/Content/Configuration/Configurations/TCPRelease";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  DataValueType,
  ValueType,
} from "../types";
import { getCompareData, getCompareDataBack } from "../constants";

const tcpRelease: NodeControlProps = {
  id: "tcpRelease",
  name: "TCP发布",
  nodeType: 403, // 节点类型，与后台相对应的数字
  iconCls: "tcpRelease",
  description: "响应TCP事件，发送TCP消息",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: TCPRelease,
  initData: () => {
    // 节点配置的初始化参数
    return {
      source: DataValueType.Value,
      sourceType: ValueType.String,
      sourceValue: "",
    };
  },
  
  validate: (
    configuration: ConfigurationProps
  ) => {
    const { source, sourceValue } = configuration;
    if (source === DataValueType.Value && sourceValue === "") {
      return "下发内容不能为空";
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
    const { pId } = nodeItem;
    const { source:a, sourceType:b, sourceValue:c} = configuration;
    const {
      target: source,
      targetValue: sourceValue,
    } = getCompareData(a, b, c, idMaps, pId as string);
    let config = {
      source,
      sourceValue,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      source:a,
      sourceValue:b,
    } = data;
    const {
      target: source,
      targetType: sourceType,
      targetValue: sourceValue,
    } = getCompareDataBack(
      a,
      a === DataValueType.Value ? ValueType.String : 0,
      b
    );
    return {
      source,
      sourceType,
      sourceValue,
    };
  },
};
export default tcpRelease;
