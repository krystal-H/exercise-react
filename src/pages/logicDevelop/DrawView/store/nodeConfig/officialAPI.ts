import OfficialAPI from "../../components/Content/Configuration/Configurations/OfficialAPI";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
} from "../types";
import fn from "../../tools/fn";

const defaultParams = `{
}`;

const officialAPI: NodeControlProps = {
  id: "officialAPI",
  name: "项目内API调用",
  nodeType: 302, // 节点类型，与后台相对应的数字
  iconCls: "officialAPI",
  description: "支持调用项目内其他API，支持返回body解析",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: OfficialAPI,
  initData: () => {
    // 节点配置的初始化参数
    return {
      apiId: undefined, // 选择的项目内api的id
      params: defaultParams, // 默认值是从选中的apiId中的入参列表中计算出来的
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { apiId, params } = configuration;
    if (apiId === undefined) {
      return "项目内API不能为空";
    }
    if (!fn.isJsonString(params)) {
      return "参数格式应为结构体";
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    
    const { apiId, params } = configuration;
    const choose: any = state.api.list.find((d) => d.id === apiId);
    let config = {
      flowId: apiId,
      apiUrl: (choose || {}).invokeUrl || "",
      params,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { flowId: apiId, params } = data;
    return { apiId: apiId === null ? undefined : apiId, params };
  },
};
export default officialAPI;
