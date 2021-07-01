import React, { Component } from "react";
import { Button, Tabs } from "antd";
import { Pop } from "../../Head";
import SvgView, { MyIcon } from "../../../../../../components/SvgView";
import ObjectView from "../../../../../../components/ObjectView";
import draw from "../../../tools/draw";

const { TabPane } = Tabs;

enum TabType {
  RETURN = "0",
  RESULT = "1",
}

interface LogProps {
  isShow: boolean; // 显示日志栏
  height: number; // 日志栏高度

  debuggedResult: object | null; // 整个返回的结果（根据debuggedData解析得出）
  debuggedOutput: any[] | null; // 全局日志节点（根据debuggedData解析得出）

  toggle: () => void;
  toFullscreen: () => void;
}

class Log extends Component<LogProps> {
  state = {
    tab: TabType.RETURN,
  };
  animated = { inkBar: true, tabPane: false };
  tab = (tab: TabType) => this.setState({ tab });

  public render(): JSX.Element | null {
    const {
      isShow,
      height,
      debuggedResult,
      debuggedOutput,
      toggle,
      toFullscreen,
    } = this.props;
    // 如果不显示日志栏，则直接返回null
    if (!isShow) {
      return null;
    }

    const { tab } = this.state;
    const cls = "draw-log",
      sty = { height: height },
      isFullscreen = height === draw.logMaxHeight,
      icon = isFullscreen ? MyIcon.FullscreenBack : MyIcon.Fullscreen;

    const btns = (
      <>
        <Pop content={isFullscreen ? "关闭全屏显示" : "全屏显示"}>
          <Button type="link" onClick={toFullscreen}>
            <SvgView icon={icon} />
          </Button>
        </Pop>
        <Pop content="关闭日志栏">
          <Button type="link" onClick={toggle}>
            <SvgView icon={MyIcon.Close} />
          </Button>
        </Pop>
      </>
    );

    return (
      <div className={cls} style={sty}>
        <Tabs
          activeKey={tab}
          animated={this.animated}
          onChange={this.tab}
          tabBarExtraContent={btns}
        >
          <TabPane tab="API调用结果" key={TabType.RETURN}>
            {debuggedResult ? (
              <ObjectView keyName="日志" data={debuggedResult} />
            ) : null}
          </TabPane>
          <TabPane tab="全局日志" key={TabType.RESULT}>
            {debuggedOutput ? (
              <ObjectView keyName="全节点日志" data={debuggedOutput} />
            ) : null}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Log;
