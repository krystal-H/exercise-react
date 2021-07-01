import TCPEvent from "../../components/Content/Configuration/Configurations/TCPEvent";
import {
  ConfigurationProps,
  NodeControlProps,
  AnyData,
  messageDataType,
} from "../types";
import { entry_canDrop } from "./fn";

const tcpEvent: NodeControlProps = {
  id: "tcpEvent",
  name: "TCP事件",
  nodeType: 103, // 节点类型，与后台相对应的数字
  iconCls: "tcpEvent",
  description: "接收TCP上报的设备消息，并触发TCP事件",
  apiDocumentLink: "", // 该节点类型的文档地址
  canDrop: entry_canDrop, // 节点是否可放置判断
  entryNum: 0, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: TCPEvent,
  initData: () => {
    // 节点配置的初始化参数
    return {
      productId: undefined, // 产品Id
      dataType:1,
      maximumMessageLength:undefined,
      startIndex:undefined,
      dataLength:undefined,
      encode:"UTF-8",
      STR_DELIMITER:undefined,
      BYTE_ADJUSTMENT:0,
    };
  },
  validate: (
    configuration: ConfigurationProps
  ) => {
    const { productId,dataType,maximumMessageLength,startIndex,dataLength } = configuration;
    if (productId === undefined) return "产品不能为空";
    if (maximumMessageLength === undefined) return "消息最大长度不能为空";
    if(dataType === messageDataType.Stream){
      if (startIndex === undefined) return "数据长度起始下标不能为空";
      if (dataLength === undefined) return "数据长度不能为空";
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps
  ) => {
    let {
      productId, dataType, maximumMessageLength, startIndex, dataLength,STR_DELIMITER,BYTE_ADJUSTMENT=0,
    } = configuration;
    if(dataType===messageDataType.String){
      startIndex = 0;
      dataLength = 0;
      BYTE_ADJUSTMENT = 0;
    }
    if(dataType===messageDataType.Stream){
      STR_DELIMITER = ''
    }
    
    return { 
      productId, 
      dataType, 
      maximumMessageLength:maximumMessageLength-0, 
      startIndex:startIndex-0, 
      dataLength:dataLength-0,
      BYTE_ADJUSTMENT:BYTE_ADJUSTMENT-0,
      STR_DELIMITER 
    };
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      productId,dataType,maximumMessageLength,startIndex,dataLength,STR_DELIMITER,BYTE_ADJUSTMENT
    } = data;
    return {
      productId: productId === null ? undefined : productId,
      dataType:dataType || messageDataType.Stream,
      maximumMessageLength,startIndex,dataLength,STR_DELIMITER,BYTE_ADJUSTMENT
    };
  },
};

export default tcpEvent;
