import React, { Component } from "react";
import { drop, allowDrop } from "../../../tools/drag";
import draw from "../../../tools/draw";
import ConnectNodeList from "../../../containers/ConnectNodeList";
import ConnectLineArrow from "../../../containers/ConnectLineArrow";
import ConnectLineList from "../../../containers/ConnectLineList";
import ConnectTools from "../../../containers/ConnectTools";
import ConnectLog from "../../../containers/ConnectLog";
import { defaultToolsHeight } from "../../../store/params";

interface ViewProps {
  readonly: boolean; // 是否是只读模式

  showChooser: boolean; // 显示开发节点选择器
  showConfiguration: boolean; // 显示当前开发节点配置信息
  showLog: boolean; // 显示日志栏
  showLogHeight: number; // 日志栏高度
}

class View extends Component<ViewProps> {
  componentDidMount() {
    draw.init("drawView-wrap", "drawView-inner", "drawView-Line");
  }
  public render(): JSX.Element {
    const {
      readonly,
      showChooser,
      showConfiguration,
      showLog,
      showLogHeight,
    } = this.props;
    let cls = showChooser ? "" : " draw-no-chooser",
      sty;
    cls += showConfiguration ? "" : " draw-no-configuration";
    cls += readonly ? " draw-readonly" : "";
    if (showLog) {
      sty = {
        bottom: Math.min(showLogHeight + defaultToolsHeight, draw.logMaxHeight),
      };
    }
    return (
      <div className={"draw-content" + cls}>
        <div
          className="draw-inner"
          id="drawView-wrap"
          style={sty}
          onDrop={readonly ? undefined : drop}
          onDragOver={readonly ? undefined : allowDrop}
        >
          <div id="drawView-inner" className="draw-list">
            <ConnectNodeList />
            <ConnectLineArrow />
            <ConnectLineList />
          </div>
        </div>
        <ConnectTools />
        <ConnectLog />
      </div>
    );
  }
}

export default View;
