import KeyValue from "../../components/Content/Configuration/Configurations/KeyValue";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  DataValueType,
  ValueType,
  KeyValueType,
} from "../types";
import { getCompareData, getCompareDataBack } from "../constants";

const keyValue: NodeControlProps = {
  id: "keyValue",
  name: "键值对操作",
  nodeType: 503, // 节点类型，与后台相对应的数字
  iconCls: "keyValue",
  description:
    "主键-存储值的存储方式，快速对主键对应的值进行增删改查，无需购买数据库",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: KeyValue,
  initData: () => {
    // 节点配置的初始化参数
    return {
      redis: undefined, // redis数据源

      opeType: undefined, // 操作选择

      key: DataValueType.Value,
      keyType: ValueType.String,
      keyValue: "",

      value: DataValueType.Value,
      valueType: ValueType.String,
      valueValue: "",
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { redis, opeType, key, keyValue, value, valueValue } = configuration;
    if (redis === undefined) {
      return "redis数据源不能为空";
    }
    if (opeType === undefined) {
      return "操作项不能为空";
    }
    if (key === DataValueType.Value && keyValue === "") {
      return "键(key)不能为空";
    }
    if (
      opeType === KeyValueType.Set &&
      value === DataValueType.Value &&
      valueValue === ""
    ) {
      return "值(value)不能为空";
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
    const {
      redis,
      opeType,
      key: a,
      keyType: b,
      keyValue: c,
      value: x,
      valueType: y,
      valueValue: z,
    } = configuration;
    const {
      target: keySource,
      // targetType: x1,
      targetValue: keySourceValue,
    } = getCompareData(a, b, c, idMaps, pId as string);
    const {
      target: source,
      // targetType: x2,
      targetValue: sourceValue,
    } = getCompareData(x, y, z, idMaps, pId as string);

    let config = {
      dsId: redis,
      opeType,
      keySource,
      keySourceValue,
      source,
      sourceValue,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      dsId: redis,
      opeType,
      keySource,
      keySourceValue,
      source,
      sourceValue,
    } = data;
    const {
      target: key,
      targetType: keyType,
      targetValue: keyValue,
    } = getCompareDataBack(
      keySource,
      keySource === DataValueType.Value ? ValueType.String : 0,
      keySourceValue
    );

    const {
      target: value,
      targetType: valueType,
      targetValue: valueValue,
    } = getCompareDataBack(
      source,
      source === DataValueType.Value ? ValueType.String : 0,
      sourceValue
    );

    return {
      redis,
      opeType,
      key,
      keyType,
      keyValue,
      value,
      valueType,
      valueValue,
    };
  },
};
export default keyValue;
