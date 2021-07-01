import React, { Component } from "react";
import {
  ContextMenuProps,
  ContextMenuType,
  NodeItem,
  LineItem,
  CopyItem,
} from "../../../store/types";
import LineMenu from "./LineMenu";
import NodeMenu from "./NodeMenu";
import ContextMenuDetail from "./ContextMenuDetail";
import { delayHideContextMenu } from "../../../tools/drag";

export interface ContextMenuComponentProps {
  deleteNode: () => void;
  deleteLine: () => void;
  cutNode: () => void;
  copyNode: () => void;
  pasteNode: () => void;
  clearNode: () => void;
  undo: () => void;

  nodeList: NodeItem[]; // 当前所画节点列表
  nodeMap: object; //  当前所画全部节点映射
  lineList: LineItem[]; // line列表
  lineMap: object; // 当前所画全部line映射
  contextMenu: ContextMenuProps; // 右键菜单属性
  stackHistory: string[]; // 回滚历史操作堆栈
  copy: CopyItem | null; // 当前剪切或复制的节点信息
}

const w = 135,
  h = 33;
const ws = {
  [ContextMenuType.NULL]: [0, 0],
  [ContextMenuType.LINE]: [w, h * 1],
  [ContextMenuType.NODE]: [w, h * 3],
  [ContextMenuType.CONTEXT]: [w, h * 3],
};

const countSty = (type: ContextMenuType, x: number, y: number) => {
  const { clientWidth, clientHeight } = document.documentElement;
  const [ww, hh] = ws[type];
  let left = x,
    top = y;
  if (left + ww > clientWidth) {
    left = x - ww;
  }
  if (top + hh > clientHeight) {
    top = y - hh;
  }
  return { left, top };
};

const contextMenuMaps = {
  [ContextMenuType.NULL]: () => <></>,
  [ContextMenuType.LINE]: LineMenu,
  [ContextMenuType.NODE]: NodeMenu,
  [ContextMenuType.CONTEXT]: ContextMenuDetail,
};

class ContextMenu extends Component<ContextMenuComponentProps> {
  public render(): JSX.Element | null {
    const {
      contextMenu: { show, type, x, y },
    } = this.props;
    if (!show) return null;

    const sty = countSty(type, x, y);
    const Com = contextMenuMaps[type];
    return (
      <div
        className="draw-ctx-wrap"
        style={sty}
        onMouseDown={delayHideContextMenu}
      >
        <div className="draw-ctx-group">
          <Com {...this.props} {...sty} />
        </div>
      </div>
    );
  }
}

export default ContextMenu;
