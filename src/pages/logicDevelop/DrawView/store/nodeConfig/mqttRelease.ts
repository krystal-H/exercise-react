import MQTTRelease from "../../components/Content/Configuration/Configurations/MQTTRelease";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  ContentType,
  QueueType,
} from "../types";
import { prevNodeId } from "../constants";

const mqttRelease: NodeControlProps = {
  id: "mqttRelease",
  name: "MQTT发布",
  nodeType: 401, // 节点类型，与后台相对应的数字
  iconCls: "mqttRelease",
  description: "通过MQTT Topic发布消息到设备，无需定义物模型",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: MQTTRelease,
  initData: () => {
    // 节点配置的初始化参数
    return {
      type: QueueType.ProductProtocol, // 默认选择产品协议队列，1为产品协议队列，2为自定义队列

      // 产品协议参数
      productId: undefined, // 产品Id
      protocolType: undefined, // 协议类型

      // 自定义队列参数
      queueId: undefined, // 队列唯一标识
      params: [], // 入参列表
      showParamModal: false, // 显示入参弹窗
      showParamId: undefined, // 入参id，若有值时，则标识入参弹窗为编辑模式，否则为添加模式

      msgType: ContentType.Node, // 0-节点输出；1-自定义输出
      message: prevNodeId, // msgType为0时，内容为节点id，msgType为1时，内容为自定义内容
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { type, productId, protocolType, queueId, message } = configuration;
    if (type === QueueType.ProductProtocol) {
      if (productId === undefined) return "产品不能为空";
      if (protocolType === undefined) return "Topic不能为空";
    } else {
      if (queueId === undefined) return "监听Topic的选择队列不能为空";
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
    const {
      type,
      productId,
      protocolType,
      queueId,
      msgType,
      message,
    } = configuration;
    const { pId } = nodeItem;
    let config = {
      msgType,
      message:
        msgType === ContentType.Node && message === prevNodeId ? pId : message,

      dsType: type, //  产品协议队列  自定义队列
      productId: productId === undefined ? null : productId,
      eventType: protocolType === undefined ? null : protocolType,

      dsId: queueId === undefined ? null : queueId,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      msgType,
      message,

      dsType: type, //  产品协议队列  自定义队列
      productId,
      eventType: protocolType,

      dsId: queueId,
    } = data;
    return {
      type,
      productId: productId === null ? undefined : productId,
      protocolType: protocolType === null ? undefined : protocolType,
      queueId: queueId === null ? undefined : queueId,

      msgType,
      message,
    };
  },
};
export default mqttRelease;
