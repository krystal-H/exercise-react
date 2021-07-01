import OptionJudgment from "../../components/Content/Configuration/Configurations/OptionJudgment";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  DataValueType,
  ValueType,
} from "../types";
import {
  compareTypeWithNoTarget,
  getCompareData,
  getCompareDataBack,
  inputId,
} from "../constants";

const optionJudgment: NodeControlProps = {
  id: "optionJudgment",
  name: "路径选择",
  nodeType: 202, // 节点类型，与后台相对应的数字
  iconCls: "optionJudgment",
  description: "根据输入的数据进行if-else判断以分配后续路径",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [2, 0, 10], // 出口数量:默认值，最小值，最大值
  configuration: OptionJudgment,
  initData: () => {
    // 节点配置的初始化参数
    return {
      input: [], // 输入，虽然只有一个元素，单位了方便，这里使用数组的形式

      paths: [
        {
          id: -99,
          operate: compareTypeWithNoTarget[0],
          target: DataValueType.Value,
          targetType: ValueType.Number,
          targetValue: "",
        },
        {
          id: -98,
          operate: compareTypeWithNoTarget[1],
          target: DataValueType.Value,
          targetType: ValueType.Number,
          targetValue: "",
        },
      ], // 路径列表
      showPathModal: false, // 显示入参弹窗
      showPathId: undefined, // 入参id，若有值时，则标识入参弹窗为编辑模式，否则为添加模式
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { input, paths } = configuration;

    return input.length === 0
      ? "输入不能为空"
      : paths.length === 0
      ? "路径配置不能为空"
      : false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState,
    idMaps: object
  ) => {
    const {
      input: [input],
      paths,
    } = configuration;
    const { pId } = nodeItem;
    const { target: a, targetType: b, targetValue: c } = input;
    const { target, targetType, targetValue } = getCompareData(
      a,
      b,
      c,
      idMaps,
      pId as string
    );
    let config = {
      source: target,
      sourceType: targetType,
      sourceValue: targetValue,
      targets: paths.map(
        ({ operate, target: x, targetType: y, targetValue: z }: any) => {
          const { target, targetType, targetValue } = getCompareData(
            x,
            y,
            z,
            idMaps,
            pId as string
          );
          return { operate, target, targetType, targetValue };
        }
      ),
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { source: a, sourceType: b, sourceValue: c, targets } = data;
    const { target, targetType, targetValue } = getCompareDataBack(a, b, c);
    let id = -99;
    return {
      input: [{ id: inputId, target, targetType, targetValue }],
      paths: targets.map(
        ({ operate, target: x, targetType: y, targetValue: z }: any) => {
          const { target, targetType, targetValue } = getCompareDataBack(
            x,
            y,
            z
          );
          return { id: --id, operate, target, targetType, targetValue };
        }
      ),
    };
  },
};

export default optionJudgment;
