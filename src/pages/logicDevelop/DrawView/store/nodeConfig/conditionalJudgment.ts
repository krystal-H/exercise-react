import ConditionalJudgment from "../../components/Content/Configuration/Configurations/ConditionalJudgment";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  DataValueType,
  ValueType,
  OutputType,
} from "../types";
import {
  getCompareData,
  getCompareDataBack,
  compareTypeWithNoTarget,
} from "../constants";

const conditionalJudgment: NodeControlProps = {
  id: "conditionalJudgment",
  name: "条件判断",
  nodeType: 201, // 节点类型，与后台相对应的数字
  iconCls: "conditionalJudgment",
  description: "满足指定条件则输出True，否则输出False",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [2, 2, 2], // 出口数量:默认值，最小值，最大值
  configuration: ConditionalJudgment,
  outputType: OutputType.LIST, // 列表
  outputValue: (configuration: ConfigurationProps, nodeItem: NodeItem) => {
    return [{ id: "", value: "判断节点-判断结果" }];
  },
  initData: () => {
    // 节点配置的初始化参数
    return {
      list: [], // 条件列表 {id,source,sourceType,sourceValue,operate,target,targetType,targetValue,logic}
      showListModal: false, // 显示列表新增/编辑弹窗
      showListId: undefined, // 列表子项id，若有值时，则标识弹窗为编辑模式，否则为添加模式
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { list } = configuration;
    return list.length === 0 ? "条件配置不能为空" : false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState,
    idMaps: object
  ) => {
    const { list } = configuration;
    const { pId } = nodeItem;
    let config = {
      conditions: list.map(
        ({
          source: a,
          sourceType: b,
          sourceValue: c,
          operate,
          target: x,
          targetType: y,
          targetValue: z,
          logic,
        }: any) => {
          const {
            target: source,
            targetType: sourceType,
            targetValue: sourceValue,
          } = getCompareData(a, b, c, idMaps, pId as string);
          // 如果是“（非）为空”的判断情况
          const isNullOperate = compareTypeWithNoTarget.indexOf(operate) > -1;
          const { target, targetType, targetValue } = getCompareData(
            x,
            y,
            z,
            idMaps,
            pId as string
          );
          return {
            source,
            sourceType,
            sourceValue,
            operate,
            target: isNullOperate ? DataValueType.Value : target,
            targetType: isNullOperate ? ValueType.Number : targetType,
            targetValue: isNullOperate ? "" : targetValue,
            logicOperate: logic,
          };
        }
      ),
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { conditions } = data;
    let id = -99;
    return {
      list: conditions.map(
        ({
          source: a,
          sourceType: b,
          sourceValue: c,
          operate,
          target: x,
          targetType: y,
          targetValue: z,
          logicOperate,
        }: any) => {
          const {
            target: source,
            targetType: sourceType,
            targetValue: sourceValue,
          } = getCompareDataBack(a, b, c);
          const { target, targetType, targetValue } = getCompareDataBack(
            x,
            y,
            z
          );
          return {
            id: --id,
            source,
            sourceType,
            sourceValue,
            operate,
            target,
            targetType,
            targetValue,
            logic: logicOperate,
          };
        }
      ),
    };
  },
};
export default conditionalJudgment;
