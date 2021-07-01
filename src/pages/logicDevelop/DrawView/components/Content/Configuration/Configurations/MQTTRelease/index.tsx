import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import {
  NodeItem,
  formType,
  ContentType,
  QueueType,
} from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { RadioChangeEvent } from "antd/lib/radio";
import {
  prevNodeId,
  contentTypeList,
  queueTypeList,
  eventTypeList,
} from "../../../../../store/constants";
import { Form, Radio, Select, Divider } from "antd";
import CodeView from "../../../../../../../../components/CodeView2";
import rules from "../../rules";
// import Params from "../comm/Params";

interface MQTTReleaseProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

const defaultMsg = `//支持透传数据，最大不超过256KB
[101010]`;

class MQTTRelease extends Component<MQTTReleaseProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  tab = (form: formType) => {
    if (this.props.nodeItem.isError) {
      setTimeout(() => {
        form.validateFields();
      }, 200);
    }
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

  // 产品协议列表
  getProtocolComponent = (form: formType) => {
    const {
      readonly,
      nodeItem: {
        configuration: { productId, protocolType },
      },
      product: { isLoading, isError, list },
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
              {list.map(({ id, value }) => {
                return (
                  <Select.Option value={id} key={id}>
                    {value}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="选择Topic" required>
          {getFieldDecorator("protocolType", {
            initialValue: protocolType,
            rules: [rules.isRequire("Topic")],
          })(
            <Select
              showSearch
              placeholder="请选择Topic"
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

  // 自定义列表
  getUserDefined = (form: formType) => {
    const {
      readonly,
      mqTopic: { isError, isLoading, list },
      nodeItem: { /*id,*/ configuration },
      // changeNodeConfiguration,
    } = this.props;
    const isNull = isError || list.length === 0;
    const { queueId } = configuration;
    const { getFieldDecorator } = form;
    return (
      <>
        <Form.Item label="监听Topic">
          {/* <div className="draw-del">
            <a
              href="javascript:void 0;"
              target="_blank"
              rel="noreferrer"
              className="draw-use-node"
            >
              数据资产管理
            </a>
          </div> */}
          {getFieldDecorator("queueId", {
            initialValue: queueId,
            rules: [rules.isRequire("自定义队列")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用队列" : "请选择自定义队列"}
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

        {/* <Params
          readonly={readonly}
          configuration={configuration}
          change={this.onChange}
          isRequire={true}
          form={form}
        /> */}
      </>
    );
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: { configuration },
      parents,
    } = this.props;
    const { type, msgType, message } = configuration;
    const { getFieldDecorator } = form;

    const content =
      type === QueueType.ProductProtocol
        ? this.getProtocolComponent(form)
        : this.getUserDefined(form);
    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">Topic配置</div>
        </div>

        <Form.Item label="订阅Topic类型" required>
          {getFieldDecorator("type", { initialValue: type })(
            <Radio.Group disabled={readonly} onChange={() => this.tab(form)}>
              {queueTypeList.map(({ id, value }) => (
                <Radio value={id} key={id}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>
        <div className="draw-line" />
        {content}

        <Divider />

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
              mode=""
              readOnly={readonly}
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

export default MQTTRelease;
