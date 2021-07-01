import React, { Component } from "react";
import { Tooltip } from "antd";

class DefaultView extends Component {
  public render(): JSX.Element {
    return (
      <div className="draw-PD">
        <div className="draw-PD-head">欢迎使用业务编排工作台</div>
        <div className="draw-PD-body">
          <p>完成一个业务逻辑的开发，您需要进行以下4个步骤：</p>
          <div className="draw-PD-intro">
            <div className="draw-PD-intro-item">
              <i className="draw-PD-icon draw-PD-icon-1"></i>
              <h5>选择触发节点</h5>
              <p>
                触发节点决定满足何种条件时开始执行该业务逻辑，如设备上报数据/固定时间/应用发起HTTP请求
              </p>
            </div>
            <div className="draw-PD-intro-item">
              <i className="draw-PD-icon draw-PD-icon-2"></i>
              <h5>编辑功能节点</h5>
              <p>
                各功能节点决定该业务逻辑具体执行的功能，可以在左侧面板拖拽节点进入画布之后在右侧栏编辑对应的配置项
              </p>
            </div>
            <div className="draw-PD-intro-item">
              <i className="draw-PD-icon draw-PD-icon-3"></i>
              <h5>调试</h5>
              <p>
                完成节点配置后，通过顶部栏数据流转视图查看各输入输出的流转路径是否正确，然后点击“调试”进行测试并查看日志
              </p>
            </div>
            <div className="draw-PD-intro-item">
              <i className="draw-PD-icon draw-PD-icon-4"></i>
              <h5>发布使用</h5>
              <p>
                调试完成后点击发布，即可完成业务逻辑的开发。随后您可以进入监控运维页查看其运行状况或对其进行再次开发
              </p>
            </div>
          </div>
          <p>
            如需更多帮助，请前往
            <Tooltip title="暂无文档">
              <a
                className="draw-PD-link"
                // href="javascript:void(0)"
                target="_blank"
              >
                帮助中心
              </a>
            </Tooltip>
          </p>
        </div>
      </div>
    );
  }
}

export default DefaultView;
