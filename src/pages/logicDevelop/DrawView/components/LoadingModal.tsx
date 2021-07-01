import React, { Component } from "react";
import { Spin } from "antd";

interface LoadingModalProps {
  isLoading: boolean;
}

class LoadingModal extends Component<LoadingModalProps> {
  public render(): JSX.Element | null {
    const { isLoading } = this.props;
    if (!isLoading) return null;
    return (
      <Spin spinning={isLoading} wrapperClassName="draw-loading">
        <div className="draw-loading" />
      </Spin>
    );
  }
}

export default LoadingModal;
