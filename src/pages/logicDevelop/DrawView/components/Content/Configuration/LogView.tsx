import React, { Component } from "react";
import { DebugItemObject, CodeType, NodeItem } from "../../../store/types";
import ObjectView from "../../../../../../components/ObjectView";

interface LogViewProps {
  nodeItem: NodeItem;
  data: DebugItemObject;
}

class LogView extends Component<LogViewProps> {
  public render(): JSX.Element {
    const { code, data } = this.props.data || {};
    const {
      configuration: { name },
    } = this.props.nodeItem;

    const isSuccess = code === CodeType.Success,
      title = `"${name}"日志`,
      cls = !isSuccess ? "draw-debug-error" : undefined;
    return (
      <div className="draw-debug">
        <span>{title}</span>
        {isSuccess ? (
          <ObjectView keyName={name} data={data as Object} />
        ) : (
          <>
            <br />
            <span className={cls}>{data + ""}</span>
          </>
        )}
      </div>
    );
  }
}

export default LogView;
