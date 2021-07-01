import React from "react";
import { ContextMenuComponentProps } from "./index";

export default function LineMenu(props: ContextMenuComponentProps) {
  const { deleteLine } = props;
  return (
    <>
      <div className="draw-ctx-btn" onClick={deleteLine}>
        删除
      </div>
    </>
  );
}
