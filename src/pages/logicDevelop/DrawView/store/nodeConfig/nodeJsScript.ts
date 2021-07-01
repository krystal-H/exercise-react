import NodeJsScript from "../../components/Content/Configuration/Configurations/NodeJsScript";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
  NodeJsTemplateType,
} from "../types";
import fn from "../../tools/fn";

const blankScript: string = `/**
* @param {Object} payload 上一节点的输出
*/
module.exports = async function(payload) {
  // Insert your decryption code
  return payload;
}`;

const nodeJsScript: NodeControlProps = {
  id: "nodeJsScript",
  name: "NodeJS脚本",
  nodeType: 204, // 节点类型，与后台相对应的数字
  iconCls: "nodeJsScript",
  description: "支持JavaScript进行业务开发，可进行参数解析处理等",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: NodeJsScript,
  initData: () => {
    // 节点配置的初始化参数
    return {
      dependency: [], // 依赖库列表，暂时无处可填，这里为空数组

      jsType: NodeJsTemplateType.BLANK,
      js: blankScript,

      productId: undefined,
      eventType: undefined,
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { jsType, js, productId, eventType } = configuration;
    if (fn.toTrim(js) === "") {
      return "NodeJs脚本不能为空";
    }
    if (jsType === NodeJsTemplateType.DEVICEACCESS) {
      return productId === undefined
        ? "产品不能为空"
        : eventType === undefined
        ? "协议不能为空"
        : false;
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { dependency, jsType, js, productId, eventType } = configuration;
    let config = {
      dependency,
      jsType,
      js,

      productId: jsType === NodeJsTemplateType.BLANK ? null : productId,
      eventType: jsType === NodeJsTemplateType.BLANK ? null : eventType,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const { dependency, jsType, js, productId, eventType } = data;
    return {
      dependency,
      jsType,
      js,
      productId: productId === null ? undefined : productId,
      eventType: eventType === null ? undefined : eventType,
    };
  },
};
export default nodeJsScript;
