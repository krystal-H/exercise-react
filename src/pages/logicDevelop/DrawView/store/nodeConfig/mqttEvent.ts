import MQTTEvent from "../../components/Content/Configuration/Configurations/MQTTEvent";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  NodeControlProps,
  AnyData,
  QueueType,
} from "../types";
import { entry_canDrop } from "./fn";

const mqttEvent: NodeControlProps = {
  id: "mqttEvent",
  name: "MQTT事件",
  nodeType: 102, // 节点类型，与后台相对应的数字
  iconCls: "mqttEvent",
  description: "侦听MQTT Topic上报的设备消息并触发服务，无需定义物模型",
  apiDocumentLink: "", // 该节点类型的文档地址
  canDrop: entry_canDrop, // 节点是否可放置判断
  entryNum: 0, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: MQTTEvent,
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
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { type, productId, protocolType, queueId } = configuration;
    if (type === QueueType.ProductProtocol) {
      if (productId === undefined) return "产品不能为空";
      if (protocolType === undefined) return "Topic不能为空";
    } else {
      if (queueId === undefined) return "监听Topic的选择队列不能为空";
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
      productId, // 产品Id
      protocolType, // 协议类型

      // 自定义队列参数
      queueId, // 队列唯一标识
      // params, // 入参列表
    } = configuration;
    return {
      dsType: type, //  产品协议队列  自定义队列
      productId: productId === undefined ? null : productId,
      eventType: protocolType === undefined ? null : protocolType,

      dsId: queueId === undefined ? null : queueId,
    };
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
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
    };
  },
};

export default mqttEvent;
