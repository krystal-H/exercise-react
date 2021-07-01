import RocketMQRelease from "../../components/Content/Configuration/Configurations/RocketMQRelease";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  ContentType,
} from "../types";
import { prevNodeId } from "../constants";

const rocketMQRelease: NodeControlProps = {
  id: "rocketMQRelease",
  name: "RocketMQ发布",
  nodeType: 402, // 节点类型，与后台相对应的数字
  iconCls: "rocketMQRelease",
  description: "通过RocketMq发布消息到指定Topic",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: RocketMQRelease,
  initData: () => {
    // 节点配置的初始化参数
    return {
      msgType: ContentType.Node, // 0-节点输出；1-自定义输出
      message: prevNodeId, // msgType为0时，内容为节点id，msgType为1时，内容为自定义内容
      dsId: undefined, // 数据源id
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { dsId, message } = configuration;
    if (dsId === undefined) {
      return "下发Topic不能为空";
    }
    if (message === undefined || message === "") {
      return "下发内容不能为空";
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { dsId, msgType, message } = configuration;
    const { pId } = nodeItem;
    let config = {
      dsId: dsId === undefined ? null : dsId,
      msgType,
      message:
        msgType === ContentType.Node && message === prevNodeId ? pId : message,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { dsId, msgType, message } = data;
    return {
      dsId: dsId === null ? undefined : dsId,
      msgType,
      message,
    };
  },
};
export default rocketMQRelease;
