import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";

interface DeviceProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class Device extends Component<DeviceProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  getChildren = (form: formType) => {
    const {
      nodeItem: { configuration },
    } = this.props;
    const { name } = configuration;
    const { getFieldDecorator } = form;

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">XX配置</div>
        </div>
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

export default Device;
