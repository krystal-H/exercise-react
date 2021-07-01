import MySQL from "../../components/Content/Configuration/Configurations/MySQL";
import {
  ConfigurationProps,
  NodeItem,
  SystemState,
  AnyData,
  NodeControlProps,
} from "../types";
import fn from "../../tools/fn";

const defaultSql = `SELECT * FROM tb_flow_definition
where flow_id in (:flow_id)
and version = :version;`;
const defaultValues = `{
}`;

const mySql: NodeControlProps = {
  id: "mySql",
  name: "数据库MySQL",
  nodeType: 502, // 节点类型，与后台相对应的数字
  iconCls: "mySql",
  description: "暂无描述",
  apiDocumentLink: "", // 该节点类型的文档地址
  entryNum: 1, // 入口数量
  output: [1, 1, 1], // 出口数量:默认值，最小值，最大值
  configuration: MySQL,
  initData: () => {
    // 节点配置的初始化参数
    return {
      dsId: undefined, // 所选数据源

      exeSql: defaultSql, // sql语句

      values: defaultValues, // 入参
    };
  },
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { dsId, exeSql, values } = configuration;
    if (dsId === undefined) {
      return "MySQL数据库不能为空";
    }
    if (fn.toTrim(exeSql) === "") {
      return "SQL输入不能为空";
    }
    if (fn.toTrim(values) === "") {
      return "入参不能为空";
    }
    if (!fn.isJsonString(values)) {
      return "入参格式应为结构体";
    }
    return false;
  }, // 验证配置参数是否正确，如有错误，则返回true
  toData: (
    // 提交数据时，根据该方法来处理成提交给后台的参数形式，该方法每个节点类型都不同
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => {
    const { dsId, exeSql, values } = configuration;
    let config = {
      dml: {
        exeSql,
        values,
      },
      dsId: dsId === undefined ? null : dsId,
    };
    return config;
  },
  toConfiguration: (data: AnyData) => {
    // 编辑时，拉取流程图的数据时，将数据转化为本地
    const {
      dml: { exeSql, values },
      dsId,
    } = data;
    return { dsId: dsId === null ? undefined : dsId, exeSql, values };
  },
};
export default mySql;
