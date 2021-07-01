import ForLoopEnd from "../../components/Content/Configuration/Configurations/ForLoopEnd";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
} from "../types";

const forLoopEnd: NodeControlProps = {
  id: "forLoopEnd",
  name: "循环结束",
  nodeType: 207, // 节点类型，与后台相对应的数字
  iconCls: "forLoopEnd",
  description:"循环结束节点",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: ForLoopEnd,
  initData: () => {
    // 节点配置的初始化参数
    return {};
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState,
    idMaps: object
  ) => {
    return {};
  },
  toConfiguration: (data: AnyData) => {
    
    return {};
  },
};
export default forLoopEnd;
