import React from "react";
import { ContextMenuComponentProps } from "./index";

export default function ContextMenuDetail(props: ContextMenuComponentProps) {
  const { clearNode, copy, pasteNode, stackHistory, undo } = props;
  const canPaste = copy !== null,
    pasteCls = "draw-ctx-btn" + (canPaste ? "" : " draw-ctx-btn-disabled"),
    pasteFunc = canPaste ? pasteNode : undefined;
  const canUndo = stackHistory.length > 0,
    undoCls = "draw-ctx-btn" + (canUndo ? "" : " draw-ctx-btn-disabled"),
    undoFunc = canUndo ? undo : undefined;
  return (
    <>
      <div className={pasteCls} onClick={pasteFunc}>
        粘贴
      </div>
      <div className={undoCls} onClick={undoFunc}>
        撤销
      </div>
      <div className="draw-ctx-btn" onClick={clearNode}>
        整理节点位置
      </div>
      {/* <div className="draw-ctx-btn draw-ctx-btn-disabled">复制</div>
          <div className="draw-ctx-btn">
            剪切<span className="draw-ctx-add">Ctrl/cmd + Z</span>
          </div>
          <div className="draw-ctx-btn">粘贴</div>
          <div className="draw-ctx-btn">撤销</div>
          <div className="draw-ctx-btn">整理节点位置</div> */}
    </>
  );
}
