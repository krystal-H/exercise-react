import React, { Component } from "react";
import { Tabs, Popover, Icon, Form, Input } from "antd";
import { NodeItem, formType, DebugObject, Status } from "../../../store/types";
import rules from "./rules";
import { configurationMap } from "../../../store/params";
import { FormComponentProps } from "antd/lib/form";
import LogView from "./LogView";

const { TabPane } = Tabs;

enum TabType {
  CONFIG = "0",
  LOG = "1",
}

export const formItemLayout: any = {
  layout: "vertical",
  labelCol: { xs: { span: 24 }, sm: { span: 24 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 24 } },
};
export const getNameCom = (
  name: string,
  explain: string | React.ReactNode = undefined,
  btn: React.ReactNode = undefined
) => {
  return (
    <>
      {name}
      {explain ? (
        <Popover content={explain} overlayClassName="draw-popover">
          <Icon type="question-circle" />
        </Popover>
      ) : null}
      {btn ? btn : null}
    </>
  );
};
export const nameTit = getNameCom(rules.nameStr, rules.nameExplain);

// 临时存储错误状态，仅存储本次编辑状态
let ErrorMaps = {};

interface BaseConfigurationProps extends FormComponentProps {
  render: (form: formType) => React.ReactNode | null | string;

  readonly: boolean; // 是否是只读模式

  changeNodeConfiguration: (nodeId: string, config: object) => void;
  nodeError: (nodeId: string, isError?: boolean) => void;

  nodeItem: NodeItem;

  testEnv: Status; // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除  999-调试中
  debuggedData: object | null; // 当前已调试的节点数据（树结构）
  debuggedMap: DebugObject; // 当前已调试的每个节点情况,以节点id为key的平面结构

  log?: string | React.ReactNode; // 日志组件，暂无需求，不知道咋做
}

interface BaseConfigurationState {
  tab: TabType;
}

class BaseConfiguration extends Component<
  BaseConfigurationProps,
  BaseConfigurationState
> {
  constructor(props: BaseConfigurationProps) {
    super(props);
    this.state = {
      tab: TabType.CONFIG,
    };
  }
  animated = { inkBar: true, tabPane: false };
  tab = (tab: TabType) => this.setState({ tab });
  itemError = false;

  componentDidMount() {
    // 从临时存储中读取错误列表，选择是否进入放入
    const {
      form,
      nodeItem: { id, isError },
    } = this.props;
    if (ErrorMaps[id]) form.setFields(ErrorMaps[id]);
    this.itemError = isError;
    // 如果进入配置时就有错误，则默认检查一遍
    if (isError) {
      form.validateFields();
    }
  }
  // 当点击保存时，当前节点是错误的那个的时候，即时检测错误信息
  componentDidUpdate() {
    const {
      form,
      nodeItem: {
        isError,
        configuration: { name },
      },
    } = this.props;

    // 当全部进行保存检测时才发现错误
    if (isError !== this.itemError) {
      this.itemError = isError;
      isError && form.validateFields();
    }

    // 检测到相同节点类型时，name不会变的情况
    if (name !== form.getFieldValue("name")) {
      form.setFieldsValue({ name });
    }
  }
  // 得到当前错误列表，存储进临时列表中
  componentWillUnmount() {
    const {
      form,
      nodeItem: { id },
    } = this.props;
    const errors = form.getFieldsError();
    let isError = false,
      errorObj = {};
    Object.keys(errors).forEach((key) => {
      if (errors[key]) {
        isError = true;
        errorObj[key] = {
          errors: (errors[key] || []).map((d: string) => ({
            field: key,
            message: d,
          })),
        };
      }
    });
    if (isError) {
      ErrorMaps[id] = errorObj;
    } else {
      ErrorMaps[id] = undefined;
    }
  }

  public render(): JSX.Element {
    const { tab } = this.state;
    const {
      readonly,
      render,
      form,
      nodeItem,
      log: _log,
      // testEnv,
      debuggedMap,
    } = this.props;
    const { id, nodeType, configuration } = nodeItem;
    const { name } = configuration;
    const { getFieldDecorator } = form;

    // 读取相关节点配置参数
    const { apiDocumentLink } = configurationMap[nodeType];
    const moreApi = apiDocumentLink ? (
      <div className="draw-del">
        <a
          href={apiDocumentLink}
          target="_blank"
          rel="noreferrer"
          className="draw-use-node"
        >
          {rules.nameMore}
        </a>
      </div>
    ) : null;

    // 只要有调试数据，就显示log数据（优先使用单个配置自己的日志显示）
    const log = debuggedMap[id]
      ? _log || <LogView nodeItem={nodeItem} data={debuggedMap[id]} />
      : null;

    return (
      <div className="draw-config-inner">
        <Tabs activeKey={tab} animated={this.animated} onChange={this.tab}>
          <TabPane tab="节点配置" key={TabType.CONFIG}>
            <Form {...formItemLayout}>
              {/* 节点名称   -   通用属性 */}
              <Form.Item label={nameTit}>
                {moreApi}
                {getFieldDecorator("name", {
                  initialValue: name,
                  rules: rules.name(),
                })(
                  <Input
                    placeholder={"请输入" + rules.nameStr}
                    disabled={readonly}
                  />
                )}
              </Form.Item>

              {render(form)}
            </Form>
          </TabPane>
          <TabPane tab="节点日志" key={TabType.LOG}>
            {log || <p>暂无日志</p>}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default Form.create<BaseConfigurationProps>({
  name: "BaseConfiguration",

  // NOTE Tips: 若不在formItem中用getFieldDecorator创建的表单元素，亲，要自行使用changeNodeConfiguration方法进行值导入哦
  onValuesChange(props: any, changedValues, allValues) {
    
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = props;
    console.log(888888,id,changedValues);
    let canChange = false,
      changeData = {};
    Object.keys(changedValues).forEach((key) => {
      // 过滤掉辅助表单数据
      if (!/^__.*__$/.test(key)) {
        canChange = true;
        changeData[key] = changedValues[key];
      }
    });
    if (canChange) {
      changeNodeConfiguration(id, changeData);
    }
  },
})(BaseConfiguration);
