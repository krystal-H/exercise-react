import React, { Component } from "react";
import { Button } from "antd";
import { Pop } from "../../Head";
import draw from "../../../tools/draw";
import SvgView, { MyIcon } from "../../../../../../components/SvgView";
import { logMoveStart } from "../../../tools/drag";

interface ToolsProps {
  readonly: boolean; // 是否是只读模式

  showChooser: boolean; // 显示开发节点选择器
  showConfiguration: boolean; // 显示当前开发节点配置信息
  showLog: boolean; // 显示日志栏
  showLogHeight: number; // 日志栏高度

  toggleChooserView: () => void;
  toggleConfigurationView: () => void;
  toggleLogView: () => void;
}

const svgColor = "#333",
  svgDisColor = "#c1c1c1";

class Tools extends Component<ToolsProps> {
  componentDidUpdate() {
    // 当任何一个显示值发生变化时，都重新计算drawView主体
    draw.initWH();
  }
  public render(): JSX.Element | null {
    const {
      readonly,
      showChooser,
      showConfiguration,
      showLog,
      showLogHeight,
      toggleChooserView,
      toggleConfigurationView,
      toggleLogView,
    } = this.props;

    if (readonly) {
      return null;
    }

    const cls = "draw-toolBox",
      sty = { bottom: showLogHeight },
      t1 = (showChooser ? "隐藏" : "显示") + "左侧栏",
      t2 = (showLog ? "隐藏" : "显示") + "日志栏",
      t3 = (showConfiguration ? "隐藏" : "显示") + "右侧栏",
      c1 = showChooser ? svgColor : svgDisColor,
      c2 = showLog ? svgColor : svgDisColor,
      c3 = showConfiguration ? svgColor : svgDisColor;
    return (
      <div className={cls} style={sty}>
        <div className="draw-toolBox-group">
          <Pop content={t1}>
            <Button type="link" onClick={toggleChooserView}>
              <SvgView icon={MyIcon.LeftView} fill={c1} />
            </Button>
          </Pop>

          <Pop content={t2}>
            <Button type="link" onClick={toggleLogView}>
              <SvgView icon={MyIcon.LogView} fill={c2} />
            </Button>
          </Pop>

          <Pop content={t3}>
            <Button type="link" onClick={toggleConfigurationView}>
              <SvgView icon={MyIcon.RightView} fill={c3} />
            </Button>
          </Pop>
        </div>
        <div
          className="draw-toolBox-resize"
          onMouseDown={(e: React.MouseEvent) => logMoveStart(e, showLogHeight)}
        />
      </div>
    );
  }
}

export default Tools;
