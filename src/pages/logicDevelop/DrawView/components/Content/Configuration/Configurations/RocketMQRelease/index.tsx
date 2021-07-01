import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { NodeItem, formType, ContentType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Select, Radio } from "antd";
import rules from "../../rules";
import { contentTypeList, prevNodeId } from "../../../../../store/constants";
import { RadioChangeEvent } from "antd/lib/radio";
import CodeView from "../../../../../../../../components/CodeView2";

interface RocketMQReleaseProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

const defaultMsg = `//支持透传数据，最大不超过256KB
[101010]`;

class RocketMQRelease extends Component<RocketMQReleaseProps> {
  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  changeType = (e: RadioChangeEvent) => {
    const msgType = parseInt(e.target.value);
    this.onChange({
      msgType,
      message: msgType === ContentType.Node ? prevNodeId : defaultMsg,
    });
  };
  changeMsg = (message: string | number) => {
    this.onChange({ message });
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: {
        configuration: { dsId, msgType, message },
      },
      parents,
      rocketMQTopic: { isLoading, isError, list },
    } = this.props;
    const { getFieldDecorator } = form;

    const isNull = isError || list.length === 0;

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数配置</div>
        </div>
        <Form.Item label="下发Topic">
          {getFieldDecorator("dsId", {
            initialValue: dsId,
            rules: [rules.isRequire("下发Topic")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用Topic" : "请选择Topic"}
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
        <a className="goto-dataasset" href="#/userCenter/dataasset" target='_blank'>数据资产知识库管理</a>
        <Form.Item label="下发内容类型" required>
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

export default RocketMQRelease;
