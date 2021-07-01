import {
  OutputType,
  ValueType,
  DataValueType,
  ParentItemProps,
  NodeJsTemplateType,
  ContentType,
  ChooseType,
  KeyValueType,
  QueueType,
  RequireType,
  ParamType,
  authCheckType,
  messageDataType,
} from "./types";
import moment from "moment";

export const inputId = -1; // 输入源固定id
export const intervalWithNK = "@"; // 节点id与节点属性的中间间隔符
export const format = "YYYY-MM-DD HH:mm:ss";
const getMaps = (list: any[]) => {
  let maps = {};
  list.forEach((d) => {
    maps[d.id] = d;
  });
  return maps;
};

export const defaultList = [{ id: "", value: "全部" }];
export const prevNodeId = -1; // 特指上一节点，即父节点
export const parentsDefaultList = [
  {
    id: prevNodeId, // -1 特指上一节点，即父节点
    value: "上一节点", // 上一节点(payload)
    type: OutputType.AUTO,
    list: defaultList,
  },
];

export const valueTypeList = [
  { id: DataValueType.Value, value: "固定值", disabled: false },
  { id: DataValueType.Node, value: "来自节点", disabled: false },
  { id: DataValueType.Param, value: "变量", disabled: true },
];
export const valueTypeMaps = getMaps(valueTypeList);

export const requireTypeList = [
  { id: RequireType.Required, value: "必填项" },
  { id: RequireType.Unrequired, value: "非必填项" },
];

export const paramTypeList = [
  { id: ParamType.String, value: "String（字符型）", text: "字符型" },
  { id: ParamType.Int, value: "Int（整数型）", text: "整数型" },
  { id: ParamType.Long, value: "Long（长整型）", text: "长整型" },
  { id: ParamType.Float, value: "Float（浮点型）", text: "浮点型" },
  { id: ParamType.Double, value: "Double（双精度）", text: "双精度" },
  { id: ParamType.Boolean, value: "Boolean（布尔型）", text: "布尔型" },
  // { id: ParamType.Enum, value: "Enum（枚举型）", text: "枚举型" },
];
export const paramTypeMaps = getMaps(paramTypeList);

// export const topicTypeList = [
//   { id: 1, value: "控制数据Topic" },
//   { id: 2, value: "运行数据Topic" },
//   { id: 3, value: "故障数据Topic" },
//   { id: 4, value: "配置数据Topic" },
// ];

export const eventTypeList = [
  { id: 0, value: "事件上报" },
  { id: 1, value: "属性上报" },
  { id: 2, value: "告警上报" },
  { id: 3, value: "故障上报" },
];

// 这里居然不需要了。。。
// export const protocolList = [
//   { id: 1, value: "控制数据协议" },
//   { id: 2, value: "运行数据协议" },
//   { id: 3, value: "故障数据协议" },
//   { id: 4, value: "配置数据协议" },
// ];

export const NodeJsTemplateList = [
  { id: NodeJsTemplateType.BLANK, value: "空白模板" },
  { id: NodeJsTemplateType.DEVICEACCESS, value: "设备接入" },
];
export const NodeJsTemplateMaps = getMaps(NodeJsTemplateList);

export const logicList = [
  { id: "&&", value: "AND" },
  { id: "||", value: "OR" },
];
export const logicMaps = getMaps(logicList);

export const methodList = [
  { id: "GET", value: "GET" },
  { id: "POST", value: "POST" },
];

export const encodeTypeList = [
  { id: "UTF-8", value: "UTF-8" },
  { id: "GBK", value: "GBK" },
];

export const contentTypeList = [
  { id: ContentType.Node, value: "选择节点输出" },
  { id: ContentType.Value, value: "直接输入内容" },
];
export const authCheckTypeList = [
  { id: authCheckType.NoNeed, value: "不鉴权" },
  { id: authCheckType.Need, value: "鉴权" },
];
export const messageDataTypeList = [
  { id: messageDataType.Stream, value: "流" },
  { id: messageDataType.String, value: "字符串" },
];

export const chooseTypeList = [
  { id: ChooseType.ProductMode, value: "产品数据模型" },
  { id: ChooseType.Node, value: "节点输出" },
];

export const queueTypeList = [
  { id: QueueType.ProductProtocol, value: "产品协议队列" },
  { id: QueueType.UserDefine, value: "自定义队列" },
];

export const logicalOperationList = [
  { id: 0, value: "相加（输出值为数据源加上各参数的结果）" },
  { id: 1, value: "相减（输出值为数据源依次减去各参数的结果）" },
  { id: 2, value: "相乘（输出值为数据源依次乘以各参数的结果）" },
  { id: 3, value: "相除（输出值为数据源依次除以各参数的结果）" },
  { id: 4, value: "最大值（输出值为数据源与各参数中的较大值）" },
  { id: 5, value: "最小值（输出值为数据源与各参数中的较小值）" },
  { id: 6, value: "均值（输出值为数据源与各参数的均值）" },
];
export const logicalOperationMaps = getMaps(logicalOperationList);

export const booleanList = [
  { id: "1", value: "true", id2: 1, value2: true },
  { id: "0", value: "false", id2: 0, value2: false },
];
export const booleanMaps = getMaps(booleanList);

export const compareParamTypeList = [
  { id: ValueType.Number, value: "数值型" },
  { id: ValueType.Boolean, value: "布尔值" },
  { id: ValueType.String, value: "字符串" },
  { id: ValueType.Time, value: "时间型" },
];

export const compareParamTypeAddList = [
  { id: ValueType.Array, value: "数组" },
  { id: ValueType.Object, value: "结构型" },
];

export const opeTypeList = [
  { id: KeyValueType.Get, value: "KV存储获取" },
  { id: KeyValueType.Set, value: "KV存储写入" },
  { id: KeyValueType.Delete, value: "KV存储删除" },
];

export const compareTypeList = [
  { id: 0, value: "==" },
  { id: 1, value: "!=" },
  { id: 2, value: "<" },
  { id: 3, value: "<=" },
  { id: 4, value: ">" },
  { id: 5, value: ">=" },
  { id: 6, value: "null", value2: "为空" },
  { id: 7, value: "!null", value2: "不为空" },
];
export const compareTypeWithNoTarget = [6, 7]; // 这里是两种不需要比较的数据源的情况
export const compareTypeMaps = getMaps(compareTypeList);

export const systemCodeList = [
  { code: 200, message: "success" },
  { code: 400, message: "request error." },
  { code: 401, message: "request auth error." },
  { code: 403, message: "request forbidden." },
  { code: 404, message: "service not found." },
  { code: 429, message: "too many requests." },
  { code: 460, message: "request parameter error." },
  { code: 500, message: "service error." },
  { code: 503, message: "service not available." },
];

// 根据选值确认显示的文本内容
export const getCompareName = (
  source: DataValueType,
  sourceType: number | string,
  sourceValue: string | moment.Moment,
  parents: ParentItemProps[]
) => {
  let name = valueTypeMaps[source].value + " - ";
  if (source === DataValueType.Value) {
    name = "";
    if (sourceType === ValueType.Boolean) {
      name += booleanMaps[sourceValue as string].value;
    } else if (sourceType === ValueType.Time) {
      name += (sourceValue as moment.Moment).format(format);
    } else {
      name += sourceValue;
    }
  } else if (source === DataValueType.Node) {
    name = "";
    name += (
      parents.find((d) => d.id === sourceType) || {
        value: "node.node_" + sourceType,
      }
    ).value;
    if (sourceValue) {
      name += "<" + sourceValue + ">";
    }
  }
  return name;
}; //计算节点-计算结果

// 根据值计算对应的提交数据
export const getCompareData = (
  source: DataValueType,
  sourceType: number | string,
  sourceValue: string | moment.Moment,
  idMaps: object,
  pId: string
) => {
  let data: any = {
    target: source,
    targetType: undefined,
    targetValue: undefined,
  };
  if (source === DataValueType.Value) {
    data.targetType = sourceType;
    if (sourceType === ValueType.Time) {
      data.targetValue = (sourceValue as moment.Moment).format(format);
    } else if (sourceType === ValueType.Number) {
      data.targetValue = (parseFloat(sourceValue as string) || 0) + "";
    } else if (sourceType === ValueType.Array) {
      data.targetValue = sourceValue || "[]";
    } else if (sourceType === ValueType.Object) {
      data.targetValue = sourceValue || "{}";
    } else {
      data.targetValue = sourceValue;
    }
  } else if (source === DataValueType.Node) {
    data.targetType = 0;
    const _pId = sourceType === prevNodeId ? pId : sourceType; // 处理如果是上一节点的情况
    // 这里针对消失的节点做处理，强制更改成读取上一节点
    data.targetValue =
      (idMaps[_pId] || idMaps[pId]) +
      (sourceValue ? intervalWithNK + sourceValue : "");
  }
  return data;
};

// 根据保存的数据反推算当时数据的状态
export const getCompareDataBack = (
  source: DataValueType,
  sourceType: number | string,
  sourceValue: string
) => {
  let data: any = {
    target: source,
    targetType: undefined,
    targetValue: undefined,
  };
  if (source === DataValueType.Value) {
    data.targetType = sourceType;
    if (sourceType === ValueType.Time) {
      data.targetValue = moment(sourceValue);
    } else {
      data.targetValue = sourceValue;
    }
  } else if (source === DataValueType.Node) {
    const idx = sourceValue.search(intervalWithNK); // 查询@的
    // 如果选择了属性
    if (idx > -1) {
      data.targetType = sourceValue.slice(0, idx);
      data.targetValue = sourceValue.slice(idx + 1);
    } else {
      data.targetType = sourceValue;
      data.targetValue = "";
    }
  }
  return data;
};
