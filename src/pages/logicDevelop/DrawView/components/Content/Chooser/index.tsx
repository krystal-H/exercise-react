import React, { Component } from "react";
import ConnectSearch from "../../../containers/ConnectSearch";
import ConnectChooserList from "../../../containers/ConnectChooserList";

interface ChooserProps {
  showChooser: boolean;
}

class Chooser extends Component<ChooserProps> {
  public render(): JSX.Element | null {
    const { showChooser } = this.props;
    if (!showChooser) {
      return null;
    }
    return (
      <div className="draw-left">
        <ConnectSearch />
        <ConnectChooserList />
      </div>
    );
  }
}

export default Chooser;
