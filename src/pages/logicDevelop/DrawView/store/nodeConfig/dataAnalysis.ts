import DataAnalysis from "../../components/Content/Configuration/Configurations/DataAnalysis";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
} from "../types";

const dataAnalysis: NodeControlProps = {
  id: "dataAnalysis",
  name: "数据分析",
  nodeType: -1, // 节点类型，与后台相对应的数字
  iconCls: "dataAnalysis",
  description: "用于对接物联网平台数据分析开发的API",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: DataAnalysis,
  initData: () => {
    // 节点配置的初始化参数
    return {};
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => false, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    let config = {};
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    return {};
  },
};
export default dataAnalysis;
