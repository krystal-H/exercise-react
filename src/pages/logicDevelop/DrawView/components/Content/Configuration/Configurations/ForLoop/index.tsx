import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import {
  NodeItem,
  formType,
  DataValueType,
} from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Input } from "antd";
import ValueMatch from "../comm/ValueMatch";
import rules from "../../rules";

interface ForLoopProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class ForLoop extends Component<ForLoopProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  get__ = (source: any, sourceValue: any) => {
    return source === DataValueType.Value && sourceValue === "" ? "" : "1";
  };
  onChangeKey = (_data: any, form: formType) => {
    const {
      nodeItem: {
        configuration: { source:_source },
      },
    } = this.props;
    const { source, sourceType, sourceValue } = _data;
    let data: any = {};
    "source" in _data && (data.source = source);
    "sourceType" in _data && (data.sourceType = sourceType);
    "sourceValue" in _data && (data.sourceValue = sourceValue);
    form.setFieldsValue({
      __loopobj__: this.get__("source" in _data ? source : _source, sourceValue),
    });
    form.validateFields(["__loopobj__"]);
    this.onChange(data);
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      parents,
      nodeItem: { configuration }
    } = this.props;
    const { getFieldDecorator } = form;
    const {
      source,
      sourceType,
      sourceValue,
    } = configuration;

    const defaultKey = this.get__(source, sourceValue);

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数配置</div>
        </div>
        
          <Form.Item
            label={getNameCom("循环对象", "一个数组")}
            required
          >
            <ValueMatch
              readonly={readonly}
              onlyArray={true}
              // moreValueType={true}
              parents={parents}
              source={source}
              sourceType={sourceType}
              sourceValue={sourceValue}
              onChange={(data: any) => this.onChangeKey(data, form)}
            />
            {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
            {getFieldDecorator("__loopobj__", {
              initialValue: defaultKey,
              rules: [rules.isRequire("循环对象")],
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

export default ForLoop;
