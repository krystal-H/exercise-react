import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import {
  NodeItem,
  formType,
  NodeJsTemplateType,
} from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import CodeView from "../../../../../../../../components/CodeView2";
import { Form, Button, Select, Input } from "antd";
import {
  NodeJsTemplateList,
  eventTypeList,
} from "../../../../../store/constants";
import rules from "../../rules";
import fn from "../../../../../tools/fn";

interface NodeJsScriptProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class NodeJsScript extends Component<NodeJsScriptProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  changeTemplate = (jsType: number) => {
    this.onChange({ jsType });
  };
  setCode = (js: string, form: formType) => {
    this.onChange({ js });
    form.setFieldsValue({
      __js__: fn.toTrim(js),
    });
    form.validateFields(["__js__"]);
  };
  fullScreen = () => {
    this.props.fullScreen();
  };

  getDevice = (form: formType) => {
    const {
      readonly,
      product: { isLoading, isError, list },
      nodeItem: {
        configuration: { productId, eventType },
      },
    } = this.props;
    const { getFieldDecorator } = form;
    const isNull = isError || list.length === 0;
    return (
      <>
        <Form.Item label="选择产品">
          {getFieldDecorator("productId", {
            initialValue: productId,
            rules: [rules.isRequire("产品")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用产品" : "请选择产品"}
              notFoundContent="未找到相应记录"
              optionFilterProp="children"
              loading={isLoading}
              disabled={isNull || readonly}
            >
              {list.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="选择协议">
          {getFieldDecorator("eventType", {
            initialValue: eventType,
            rules: [rules.isRequire("协议")],
          })(
            <Select
              showSearch
              placeholder="请选择协议"
              notFoundContent="未找到相应记录"
              optionFilterProp="children"
              disabled={readonly}
            >
              {eventTypeList.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
      </>
    );
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      isFullScreen,
      nodeItem: { configuration },
    } = this.props;
    const { jsType, js } = configuration;

    const device =
      jsType === NodeJsTemplateType.DEVICEACCESS ? this.getDevice(form) : null;
    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">Node.js（Node v6.10）</div>
        </div>
        <Form.Item label="脚本" required>
          {readonly ? null : (
            <div className="draw-del">
              <div className="draw-del-group">
                <Button type="link" onClick={this.fullScreen}>
                  {isFullScreen ? "退出全屏" : "全屏"}
                </Button>
                {/* <Button type="link">扩展屏管理</Button> */}
              </div>
            </div>
          )}
          <Select
            placeholder="请选择"
            value={jsType}
            onChange={this.changeTemplate}
            disabled={readonly}
          >
            {NodeJsTemplateList.map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {device}
        <Form.Item>
          <CodeView
            readOnly={readonly}
            code={js}
            onChange={(js: string) => this.setCode(js, form)}
          />
          {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
          {form.getFieldDecorator("__js__", {
            initialValue: js,
            rules: [rules.isRequire("NodeJS脚本")],
          })(<Input type="hidden" />)}
        </Form.Item>
      </>
    );
  };
  public render(): JSX.Element {
    const {
      nodeItem: { id },
    } = this.props;

    // 配置传递给高阶组件的参数
    const baseProps = {
      ...this.props,

      // 一些额外参数
      log: undefined, // 日志组件，暂无需求，不知道咋做
      render: this.getChildren,
    };
    return <BaseConfiguration {...baseProps} key={id} />;
  }
}

export default NodeJsScript;
