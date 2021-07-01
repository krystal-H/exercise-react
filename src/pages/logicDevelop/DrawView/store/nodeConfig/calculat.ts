import Calculat from "../../components/Content/Configuration/Configurations/Calculat";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  OutputType,
} from "../types";
import {
  logicalOperationList,
  getCompareData,
  getCompareDataBack,
  inputId,
} from "../constants";

const defaultLogic = logicalOperationList[0].id;

const calculat: NodeControlProps = {
  id: "calculat",
  name: "数值计算",
  nodeType: 203, // 节点类型，与后台相对应的数字
  iconCls: "calculat",
  description: "对来自设备，API等的数据进行数值计算并输出结果",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: Calculat,
  outputType: OutputType.LIST, // 列表
  outputValue: (configuration: ConfigurationProps, nodeItem: NodeItem) => {
    return [{ id: "", value: "计算节点-计算结果" }];
  },
  initData: () => {
    // 节点配置的初始化参数
    return {
      input: [], // 数据源 - 源参数，虽然只有一个元素，单位了方便，这里使用数组的形式

      logic: defaultLogic, // 逻辑运算方法
      // 0-+ 1-- 2-* 3-/ 4-max 5-min 6-avg

      list: [], // 参数列表 {id,source,sourceType,sourceValue,operate,target,targetType,targetValue,logic}
      showListModal: false, // 显示列表新增/编辑弹窗
      showListId: undefined, // 列表子项id，若有值时，则标识弹窗为编辑模式，否则为添加模式
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { input, list } = configuration;
    if (input.length === 0) return "数据源配置不能为空";
    if (list.length === 0) return "参数配置不能为空";
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
      input: [entry],
      logic,
      list,
    } = configuration;
    const { target: a, targetType: b, targetValue: c } = entry;
    const {
      target: source,
      targetType: sourceType,
      targetValue: sourceValue,
    } = getCompareData(a, b, c, idMaps, pId as string);
    let config = {
      source,
      sourceType,
      sourceValue,
      operateSign: logic,
      targets: list.map(({ target: x, targetType: y, targetValue: z }: any) => {
        const { target, targetType, targetValue } = getCompareData(
          x,
          y,
          z,
          idMaps,
          pId as string
        );
        return {
          target,
          targetType,
          targetValue,
        };
      }),
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      source: a,
      sourceType: b,
      sourceValue: c,
      operateSign: logic,
      targets,
    } = data;
    const { target, targetType, targetValue } = getCompareDataBack(a, b, c);
    let id = -99;
    return {
      input: [{ id: inputId, target, targetType, targetValue }],
      logic,
      list: targets.map(({ target: x, targetType: y, targetValue: z }: any) => {
        const { target, targetType, targetValue } = getCompareDataBack(x, y, z);
        return { id: --id, target, targetType, targetValue };
      }),
    };
  },
};
export default calculat;
