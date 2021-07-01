import React, { Component } from "react";
import { connect } from "react-redux";
import ConnectHead from "../containers/ConnectHead";//顶部栏
import ConnectChooser from "../containers/ConnectChooser";//左侧 控件栏
import ConnectView from "../containers/ConnectView";//中间 画布区
import ConnectConfiguration from "../containers/ConnectConfiguration";//右侧 配置区
import ConnectContextMenu from "../containers/ConnectContextMenu";//鼠标右键 编辑框
import ConnectLoadingModal from "../containers/ConnectLoadingModal";//loading 层
import { init } from "../store/action";
import { withRouter } from "react-router-dom";

import "../drawView.less";

interface AppProps {
  init: Function;
  match: any;
}

class App extends Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
    const {
      match: {
        params: { projectId, serviceId },
      },
    } = props;
    props.init(projectId, serviceId);
  }
  render() {
    return (
      <div className="draw-wrap">
        <ConnectHead />
        <ConnectChooser />
        <ConnectView />
        <ConnectConfiguration />
        <ConnectContextMenu />
        <ConnectLoadingModal />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  init: (projectId: string, serviceId: string) =>
    dispatch(init(projectId, serviceId)),
});

export default withRouter(connect(undefined, mapDispatchToProps)(App));
