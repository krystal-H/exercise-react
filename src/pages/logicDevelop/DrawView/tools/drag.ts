import fn from "./fn";
import store from "../../../../store";
import {
  drop as dropAction,
  move as moveAction,
  createLine as createLineAction,
  lineTo as lineToAction,
  connectCancel as connectCancelAction,
  connectOK as connectOKAction,
  showContextMenu as showContextMenuAction,
  hideContextMenu as hideContextMenuAction,
  changeChooseId as changeChooseIdAction,
  changeLogHeight as changeLogHeightAction,
} from "../store/action";
import { DragType, ContextMenuType } from "../store/types";
import draw from "./draw";
import { message } from "antd";

export const debug = "false";

const doc = document,
  body = doc.body,
  noPopoverCls = "draw-no-popover";

/*** just for drag --- start ***/

let dragType: DragType = DragType.NULL, // 拖拽的起因
  currentNodeType: string | null = null,
  dist = { x: 0, y: 0 },
  hideTime: NodeJS.Timeout;

const log = (...msg: any) => debug && console.log(...msg);

/** 节点一开始拖进容器池中 start */
export function drag(e: React.DragEvent<HTMLDivElement>, nodeId: string) {
  clearTimeout(hideTime);
  fn.addClass(body, noPopoverCls); // 将拖拽节点的解释弹层隐藏
 
  dragType = DragType.PUTIN; // 锁定拖拽的起因
  currentNodeType = nodeId; // 当前拖拽节点有且仅有一个

  log("currentNodeType---：", currentNodeType);

  const { pageX, pageY } = e; // 计算落点
  const { left, top } = (e.target as HTMLElement).getBoundingClientRect();
  dist = {
    x: pageX - left,
    y: pageY - top,
  };
  log("【计算】拖拽初始距离差值：", dist.x, dist.y);
}

export function dragEnd(e: React.DragEvent<HTMLDivElement>) {
  dragType = DragType.NULL; // 重置拖拽起因

  // 将拖拽节点的解释弹层隐藏（弹层的隐藏有动画效果，所以延时执行）
  hideTime = setTimeout(() => {
    fn.removeClass(body, noPopoverCls);
  }, 1200);
}

export function drop(e: React.DragEvent<HTMLDivElement>) {
  // 处理放置式拖拽产出
  if (currentNodeType !== null && dragType === DragType.PUTIN) {
    dragType = DragType.NULL; // 重置拖拽起因

    const { pageX, pageY } = e; // 计算落点
    const x = pageX - dist.x,
      y = pageY - dist.y;
    log("【计算】拖拽结束节点应放置位置(相对于窗口)：", x, y);

    store.dispatch(dropAction(currentNodeType, x, y));
  }
}

export function allowDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
}
/** 节点一开始拖进容器池中 end */

/*** just for drag --- end ***/

// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------

/*** just for move --- start ***/

/*** 已放置节点的移动行为 ***/

let moveStartPoint = { x: 0, y: 0 }, // 鼠标移动起始点
  sourcePoint = { x: 0, y: 0 }, // 节点移动起始点
  moveEndPoint = { x: -1, y: -1 }, // 节点的最终位置
  moveStartScroll = { left: 0, top: 0 }, // 节点移动起始点的滚动条位置
  currentNodeId: string | null = null; // 当前移动的节点

export function moveStart(
  e: React.MouseEvent,
  nodeUniqueId: string,
  x: number,
  y: number
) {
  dragType = DragType.MOVE; // 锁定移动的起因
  currentNodeId = nodeUniqueId; // 当前移动节点有且仅有一个
  const { pageX, pageY } = e; // 计算起点

  sourcePoint = { x, y };
  moveStartPoint = { x: pageX, y: pageY };
  moveEndPoint = { x: -1, y: -1 }; // 记录当前点击未移动
  moveStartScroll = {
    left: draw.wrap ? draw.wrap.scrollLeft : 0,
    top: draw.wrap ? draw.wrap.scrollTop : 0,
  };

  log(
    "【计算】【节点" + nodeUniqueId + "】初始移动的位置：",
    moveStartPoint.x,
    moveStartPoint.y
  );

  clearTimeout(hideTime);
  fn.addClass(body, noPopoverCls); // 将拖拽节点的解释弹层隐藏

  fn.addEvent(doc, "mousemove", move);
  fn.addEvent(doc, "mouseup", moveEnd);
}

export function move(e: React.MouseEvent) {
  // 实时处理节点的移动
  if (currentNodeId !== null && dragType === DragType.MOVE) {
    const { pageX, pageY } = e; // 计算落点
    let x = sourcePoint.x + pageX - moveStartPoint.x,
      y = sourcePoint.y + pageY - moveStartPoint.y;

    // 计算滚动条的差值
    const left = draw.wrap ? draw.wrap.scrollLeft : 0,
      top = draw.wrap ? draw.wrap.scrollTop : 0;
    x += left - moveStartScroll.left;
    y += top - moveStartScroll.top;

    x = x < 0 ? 0 : x;
    y = y < 0 ? 0 : y;

    const isStart = moveEndPoint.x === -1 && moveEndPoint.y === -1;
    // 如果是刚开始且未移动时， ------此处处理掉右键点击节点的异常移动行为
    if (isStart && x === sourcePoint.x && y === sourcePoint.y) {
      return;
    }

    /*log(
      "【计算】【" + currentNodeId + "】当前移动结束节点应放置位置：",
      x,
      y
    );*/

    store.dispatch(moveAction(currentNodeId, x, y, isStart));

    moveEndPoint = { x, y };
  }
}

export function moveEnd(e: React.MouseEvent) {
  if (currentNodeId !== null && dragType === DragType.MOVE) {
    if (moveEndPoint.x === -1 && moveEndPoint.y === -1) {
      store.dispatch(changeChooseIdAction(currentNodeId));
    }
  }

  // 将拖拽节点的解释弹层隐藏（弹层的隐藏有动画效果，所以延时执行）
  hideTime = setTimeout(() => {
    fn.removeClass(body, noPopoverCls);
  }, 1200);

  currentNodeId = null;
  dragType = DragType.NULL;
  fn.removeEvent(doc, "mousemove", move);
  fn.removeEvent(doc, "mouseup", moveEnd);

  draw.initWH();
}

/*** just for move --- end ***/

// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------

/*** just for connect --- start ***/

let currentOutputId: string | null = null; // 当前出口唯一标识

export function connectStart(
  e: React.MouseEvent,
  nodeUniqueId: string,
  outputId: string
) {
  dragType = DragType.CONNECT; // 锁定移动的起因
  currentNodeId = nodeUniqueId; // 当前连接的起始节点
  currentOutputId = outputId;
  // const { pageX, pageY } = e; // 计算起点

  sourcePoint = fn.countCenterPoint(outputId); // 线条的起始点

  // 开始创建line等视图
  store.dispatch(createLineAction(sourcePoint, nodeUniqueId, outputId));

  log("【计算】【Line】初始移动的位置：", sourcePoint.x, sourcePoint.y);

  fn.addEvent(doc, "mousemove", connectMove);
  fn.addEvent(doc, "mouseup", connectEnd);
}

export function connectMove(e: React.MouseEvent) {
  // 实时处理节点的移动
  if (currentOutputId !== null && dragType === DragType.CONNECT) {
    const { pageX, pageY } = e; // 计算落点

    /*log(
      "【计算】【Line】当前移动结束节点应放置位置：",
      pageX,
      pageY
    );*/

    store.dispatch(lineToAction(currentOutputId, pageX, pageY));
  }
}

export function connectEnd(e: React.MouseEvent) {
  // 如果需要销毁当前连线
  if (currentOutputId) {
    store.dispatch(connectCancelAction(currentOutputId));
  }

  currentNodeId = null;
  currentOutputId = null;
  dragType = DragType.NULL;
  fn.removeEvent(doc, "mousemove", connectMove);
  fn.removeEvent(doc, "mouseup", connectEnd);
}

export function connectOK(
  e: React.MouseEvent,
  nodeId: string,
  entryId: string | null,
  pId: string | null,
  nodeType:string ,
) {
  // 当且仅当则确认为添加该条Line
  if (
    currentOutputId !== null && // 有出口
    dragType === DragType.CONNECT // 当前模式时连接模式
  ) {
    // 如果已连线
    if (pId && nodeType!=="forLoopEnd") {
      message.warn("无法连接到已有连线的节点");
    } else if (entryId === null) {
      message.warn("目标节点不允许连接");
    } else if (currentNodeId === nodeId) {
      message.warn("节点无法连接自己");
    } else {
      store.dispatch(connectOKAction(currentOutputId, nodeId, entryId,nodeType));

      currentOutputId = null;
    }
  } else if (moveEndPoint.x === -1 && moveEndPoint.y === -1) {
    // 如果节点未移动，则认为是节点的点击事件
    store.dispatch(changeChooseIdAction(nodeId));
  }
}

// ContextMenu
export function showContextMenu(
  e: React.MouseEvent,
  cmt: ContextMenuType,
  id: string
) {
  e.stopPropagation(); // 阻止触发父层的右键
  e.preventDefault(); // 阻止浏览器默认的右键行为

  const { pageX, pageY } = e;
  store.dispatch(showContextMenuAction(cmt, id, pageX, pageY));

  fn.addEvent(doc, "mousedown", hideContextMenu);
}

export function hideContextMenu() {
  fn.removeEvent(doc, "mousedown", hideContextMenu);
  fn.removeEvent(doc, "click", hideContextMenu);

  store.dispatch(hideContextMenuAction());
}

export function delayHideContextMenu() {
  fn.removeEvent(doc, "mousedown", hideContextMenu);
  fn.addEvent(doc, "click", hideContextMenu);
}

/*** just for connect --- end ***/

/*** 日志栏的移动行为 ***/

let logCurrentY = 0, // 日志栏当前Y轴高度
  logMoveStartY = 0; // 鼠标移动起始点Y轴距离

export function logMoveStart(e: React.MouseEvent, y: number) {
  dragType = DragType.LOG; // 锁定移动的起因
  const { pageY } = e; // 计算起点

  logCurrentY = y;
  logMoveStartY = pageY;

  log("【计算】【日志栏移动】初始移动的Y轴位置：", logMoveStartY);

  clearTimeout(hideTime);
  fn.addClass(body, noPopoverCls); // 将拖拽节点的解释弹层隐藏

  fn.addEvent(doc, "mousemove", logMove);
  fn.addEvent(doc, "mouseup", logMoveEnd);
}

export function logMove(e: React.MouseEvent) {
  // 实时处理移动
  if (dragType === DragType.LOG) {
    const { pageY } = e; // 计算落点
    let y = logCurrentY + -(pageY - logMoveStartY);

    // log("【计算】【日志栏移动】当前移动的Y轴位置：", y);

    store.dispatch(
      changeLogHeightAction(Math.min(Math.max(y, 0), draw.logMaxHeight))
    );
  }
}

export function logMoveEnd(e: React.MouseEvent) {
  // 将拖拽节点的解释弹层隐藏（弹层的隐藏有动画效果，所以延时执行）
  hideTime = setTimeout(() => {
    fn.removeClass(body, noPopoverCls);
  }, 1200);

  dragType = DragType.NULL;
  fn.removeEvent(doc, "mousemove", logMove);
  fn.removeEvent(doc, "mouseup", logMoveEnd);
}
