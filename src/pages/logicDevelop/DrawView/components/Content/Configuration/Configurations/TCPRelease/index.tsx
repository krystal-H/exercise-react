import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { NodeItem, formType,DataValueType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Input } from "antd";
// import { contentTypeList, prevNodeId } from "../../../../../store/constants";
// import { RadioChangeEvent } from "antd/lib/radio";
// import CodeView from "../../../../../../../../components/CodeView2";
import ValueMatch from "../comm/ValueMatch";
import rules from "../../rules";

interface RocketMQReleaseProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

// const defaultMsg = `//支持透传数据，最大不超过256KB
// [101010]`;

class RocketMQRelease extends Component<RocketMQReleaseProps> {
  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  // changeType = (e: RadioChangeEvent) => {
  //   const msgType = parseInt(e.target.value);
  //   this.onChange({
  //     msgType,
  //     message: msgType === ContentType.Node ? prevNodeId : defaultMsg,
  //   });
  // };
  // changeMsg = (message: string | number) => {
  //   this.onChange({ message });
  // };
  onChangeKey = (_data: any, form: formType) => {
    const {
      nodeItem: {
        configuration: { source:_source },
      },
    } = this.props;
    // console.log(888888,this.props);
    const { source, sourceType, sourceValue } = _data;
    let data: any = {};
    "source" in _data && (data.source = source);
    "sourceType" in _data && (data.sourceType = sourceType);
    "sourceValue" in _data && (data.sourceValue = sourceValue);
    form.setFieldsValue({
      __tcpdata__: this.get__("source" in _data ? source : _source, sourceValue),
    });
    form.validateFields(["__tcpdata__"]);
    this.onChange(data);
  };
  get__ = (source: any, sourceValue: any) => {
    return source === DataValueType.Value && sourceValue === "" ? "" : "1";
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      parents,
      nodeItem: { configuration:{source,sourceType,sourceValue} }
    } = this.props;

    const { getFieldDecorator } = form;
    const defaultKey = this.get__(source, sourceValue);

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数配置</div>
        </div>
        <Form.Item
            label="下发内容"
            required
          >
            <ValueMatch
              readonly={readonly}
              onlyString={true}
              parents={parents}
              source={source}
              sourceType={sourceType}
              sourceValue={sourceValue}
              onChange={(data: any) => this.onChangeKey(data, form)}
            />
            {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
            {getFieldDecorator("__tcpdata__", {
              initialValue: defaultKey,
              rules: [rules.isRequire("下发内容")],
            })(<Input type="hidden" />)}
          </Form.Item>
        
        {/* <Form.Item label="下发内容类型">
          <Radio.Group
            value={msgType}
            onChange={this.changeType}
            disabled={readonly}
          >
            {contentTypeList.map(({ id, value }) => (
              <Radio value={id} key={id}>
                {value}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <div className="draw-group">
          <div className="draw-group-inner">message</div>
        </div>
        <Form.Item>
          {msgType === ContentType.Node ? (
            <Select
              placeholder="请选择节点"
              value={message}
              onChange={this.changeMsg}
              disabled={readonly}
            >
              {parents.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value + " 输出内容"}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <CodeView
              readOnly={readonly}
              mode=""
              height={280}
              code={message}
              onChange={this.changeMsg}
            />
          )}
        </Form.Item> */}
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

export default RocketMQRelease;
