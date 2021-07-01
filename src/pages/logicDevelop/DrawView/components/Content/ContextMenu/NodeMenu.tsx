import React from "react";
import { ContextMenuComponentProps } from "./index";
import { entryList } from "../../../store/params";

export default function NodeMenu(props: ContextMenuComponentProps) {
  const {
    contextMenu: { id },
    nodeMap,
    deleteNode,
    cutNode,
    copyNode,
  } = props;
  const node = nodeMap[id as string],
    canCopy = node ? entryList.indexOf(node.nodeType) === -1 : false,
    copyCls = "draw-ctx-btn" + (canCopy ? "" : " draw-ctx-btn-disabled");
  return (
    <>
      <div className={copyCls} onClick={canCopy ? cutNode : undefined}>
        剪切
      </div>
      <div className={copyCls} onClick={canCopy ? copyNode : undefined}>
        复制
      </div>
      <div className="draw-ctx-btn" onClick={deleteNode}>
        删除
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
