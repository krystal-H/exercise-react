import ForLoop from "../../components/Content/Configuration/Configurations/ForLoop";
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

const forLoop: NodeControlProps = {
  id: "forLoop",
  name: "循环开始",
  nodeType: 206, // 节点类型，与后台相对应的数字
  iconCls: "forLoop",
  description:"循环开始节点",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: ForLoop,
  initData: () => {
    // 节点配置的初始化参数
    return {
      source: DataValueType.Value,
      sourceType: ValueType.Array,
      sourceValue: "",
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { source, sourceValue } = configuration;
    
    if (source === DataValueType.Value && sourceValue === "") {
      return "循环对象不能为空";
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
    // console.log("--111111---",configuration);
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
      a === DataValueType.Value ? ValueType.Array : 0,
      b
    );
    return {
      source,
      sourceType,
      sourceValue,
    };
  },
};
export default forLoop;
