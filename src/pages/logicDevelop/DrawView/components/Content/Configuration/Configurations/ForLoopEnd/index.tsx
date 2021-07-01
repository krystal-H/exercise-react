import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import {
  NodeItem,
  formType,
} from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";

interface KeyValueProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class ForLoopEnd extends Component<KeyValueProps> {
  

  getChildren = (form: formType) => {

    return (
      <>
        

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

export default ForLoopEnd;
