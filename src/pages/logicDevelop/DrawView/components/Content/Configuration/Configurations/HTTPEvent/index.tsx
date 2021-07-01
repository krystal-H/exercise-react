import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { Form, Input,Radio } from "antd";
import { NodeItem, formType } from "../../../../../store/types";
import Params from "../comm/Params";
import rules from "../../rules";
import { ConfigurationProps } from "../../../Configuration";
import {
  authCheckTypeList
} from "../../../../../store/constants";
const ActionName = "Action";

interface HTTPEventProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class HTTPEvent extends Component<HTTPEventProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: { configuration },
    } = this.props;
    const { action, authCheck } = configuration;
    const { getFieldDecorator } = form;

    // 读取相关节点配置参数
    const actionTitle = getNameCom(ActionName, rules.actionExplain);
    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">请求配置</div>
        </div>

        <Form.Item label={actionTitle}>
          {getFieldDecorator("action", {
            initialValue: action,
            rules: rules.action(ActionName),
          })(<Input placeholder={ActionName + "为外部调用API的一个参数"} />)}
        </Form.Item>
        
        <Form.Item label="是否鉴权" required>
          {getFieldDecorator("authCheck", { initialValue: authCheck })(
            <Radio.Group disabled={readonly} >
              {authCheckTypeList.map(({ id, value }) => (
                <Radio value={id} key={id}>
                  {value}
                </Radio>
              ))}
            </Radio.Group>
          )}
        </Form.Item>

        <Params
          readonly={readonly}
          configuration={configuration}
          change={this.onChange}
        />
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

export default HTTPEvent;
