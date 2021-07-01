import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Select, Input } from "antd";
import { methodList, encodeTypeList } from "../../../../../store/constants";
import rules from "../../rules";
import CodeView from "../../../../../../../../components/CodeView2";

interface TripartieApiProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class TripartieApi extends Component<TripartieApiProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  setParams = (params: string) => {
    this.onChange({ params });
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: { configuration },
    } = this.props;
    const { method, apiUrl, encode, params } = configuration;
    const { getFieldDecorator } = form;

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">API配置</div>
        </div>
        <Form.Item label="请求方式" required>
          {getFieldDecorator("method", { initialValue: method })(
            <Select disabled={readonly}>
              {methodList.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label={getNameCom("API地址", rules.urlExplain)}>
          {getFieldDecorator("apiUrl", {
            initialValue: apiUrl,
            rules: rules.url,
          })(<Input placeholder="请输入API地址" disabled={readonly} />)}
        </Form.Item>
        <Form.Item label="编码" required>
          {getFieldDecorator("encode", { initialValue: encode })(
            <Select disabled={readonly}>
              {encodeTypeList.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="参数编写">
          <CodeView
            readOnly={readonly}
            mode="json"
            code={params}
            onChange={this.setParams}
          />
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

export default TripartieApi;
