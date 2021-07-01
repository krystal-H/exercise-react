import React, { Component } from "react";
import { connect } from "react-redux";
import ConnectView from "../DrawView/containers/ConnectView";
import ConnectConfiguration from "../DrawView/containers/ConnectConfiguration";
import ConnectLoadingModal from "../DrawView/containers/ConnectLoadingModal";
import { init } from "../DrawView/store/action";

import "../DrawView/drawView.less";

interface ReadonlyAppProps {
  projectId: number;
  serviceId: number;
}

interface AppProps {
  init: Function;
}

let projectId: any, serviceId: any;

class App extends Component<AppProps> {
  constructor(props: AppProps) {
    super(props);
    props.init(projectId, serviceId, true);
  }
  render() {
    return (
      <div className="draw-wrap">
        <ConnectView />
        <ConnectConfiguration />
        <ConnectLoadingModal />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Function) => ({
  init: (projectId: string, serviceId: string, readonly: boolean) =>
    dispatch(init(projectId, serviceId, readonly)),
});

const ConnectAPP = connect(undefined, mapDispatchToProps)(App);

const ReadonlyView = function (props: ReadonlyAppProps) {
  projectId = props.projectId;
  serviceId = props.serviceId;
  return <ConnectAPP />;
};

export default ReadonlyView;
