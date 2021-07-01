import HTTPEvent from "../../components/Content/Configuration/Configurations/HTTPEvent";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  NodeControlProps,
  AnyData,
  OutputType,
} from "../types";
import { entry_canDrop } from "./fn";
import { defaultList } from "../constants";

const httpEvent: NodeControlProps = {
  id: "httpEvent",
  name: "HTTP事件",
  nodeType: 101, // 节点类型，与后台相对应的数字
  iconCls: "httpEvent",
  description: "通过HTTP请求触发规则",
  apiDocumentLink: "", // 该节点类型的文档地址
  canDrop: entry_canDrop, // 节点是否可放置判断
  entryNum: 0, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: HTTPEvent,
  outputType: OutputType.LIST, // 列表
  outputValue: (configuration: ConfigurationProps, nodeItem: NodeItem) => {
    return defaultList.concat(
      (configuration.params || []).map(({ name }: any) => ({
        id: name,
        value: name,
      }))
    );
  },
  initData: () => {
    // 节点配置的初始化参数
    return {
      action: "", // 使用SDK调用时作为API的参数“action”进行调用。使用Web或移动工作台调用的时候无需在相关工作台输入该参数。只支持字母数字下划线斜线，不能以斜线结尾

      params: [], // 入参列表     {}
      showParamModal: false, // 显示入参弹窗
      showParamId: undefined, // 入参id，若有值时，则标识入参弹窗为编辑模式，否则为添加模式
      authCheck:0,//0 不鉴权 1 鉴权
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    // return false;
    const { action } = configuration;
    return action === "" ? "action不能为空" : false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { action, params,authCheck } = configuration;
    return {
      action,
      authCheck,
      input: params.map(
        ({ name, type, isRequire, defaultValue, description }: any) => ({
          param_name: name,
          param_typ: type,
          param_required: isRequire,
          param_default: defaultValue,
          param_desc: description,
        })
      ),
    };
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { action, input,authCheck } = data;
    let id = -99;
    return {
      action: action || "",
      authCheck:authCheck || 0,
      params: input.map(
        ({
          param_name: name,
          param_typ: type,
          param_required: isRequire,
          param_default: defaultValue,
          param_desc: description,
        }: any) => ({
          id: --id,
          name,
          type,
          isRequire,
          defaultValue,
          description,
        })
      ),
    };
  },
};

export default httpEvent;
