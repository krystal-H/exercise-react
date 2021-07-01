import fn from "./fn";
import { NodeItem, Point, LineItem, OutputProps } from "../store/types";
import {
  nodeWM,
  nodeWidth,
  getEntryPoint,
  defaultToolsHeight,
  topH,
} from "../store/params";
import { getNodeHeight } from "../store/action";

/*** 该文件主要用来处理线条的计算和绘画问题  ***/

const doc = document,
  win = window,
  padding = 20;

class Draw {
  wrap: HTMLElement | null; // 外部所处容器
  inner: HTMLElement | null; // 节点容器
  svg: HTMLElement | null; // 内壳 - svg本体

  width: number; // 当前容器可视窗口的宽度
  height: number; // 当前容器可视窗口的高度

  logMaxHeight: number =
    doc.documentElement.clientHeight - topH - defaultToolsHeight; // 日志栏最大高度

  viewMinWidth: number = 0; // 节点流程图最小可视窗口宽度
  viewMinHeight: number = 0; // 节点流程图最小可视窗口高度

  init = (wrapId: string, innerId: string, svgId: string) => {
    this.setDom(wrapId, innerId, svgId);
    if (this.wrap) {
      this.initWH();
      this.bindResize();
    }
  };
  setDom = (wrapId: string, innerId: string, svgId: string) => {
    this.wrap = doc.getElementById(wrapId);
    this.inner = doc.getElementById(innerId);
    this.svg = doc.getElementById(svgId);
  };
  initWH = () => {
    if (this.wrap) {
      this.width = this.wrap.offsetWidth + padding;
      this.height = this.wrap.offsetHeight + padding;
      this.logMaxHeight =
        doc.documentElement.clientHeight - topH - defaultToolsHeight;
      const { svg, inner, width, height, viewMinWidth, viewMinHeight } = this;
      if (svg && inner) {
        const w = Math.max(width, viewMinWidth) + "px";
        const h = Math.max(height, viewMinHeight) + "px";
        svg.setAttribute("height", h);
        inner.style.width = w;
        inner.style.height = h;
      }
    }
  };
  checkMin = (nodeList: NodeItem[]) => {
    const minW = Math.max(...nodeList.map((d) => d.x)) + nodeWM,
      minH = Math.max(
        ...nodeList.map(({ y, configuration: { output } }) => {
          const outNum = output.length;
          return y + (outNum <= 1 ? 32 : 18 * outNum);
        })
      );
    this.viewMinWidth = minW; // 节点流程图最小可视窗口宽度
    this.viewMinHeight = minH; // 节点流程图最小可视窗口高度

    this.initWH();
  };
  bindResize = () => {
    fn.addEvent(win, "resize", this.checkSize);
  };
  checkSize = () => {
    if (this.svg) {
      this.initWH(); // 重新计算svg宽度
    }
  };

  // svg的绘图功能
  countPath = (p1: Point, p2?: Point) => {
    let _p1 = p1,
      _p2 = p2 || p1;
    let path = this.getLineString(_p1, _p2);
    return path;
  };

  getLineString = (p1: Point, p2: Point) => {
    let pathString = ["M" + p1.x, p1.y].join(" ");

    const centerPoint = this.getCenterPoint(p1, p2);
    let Q = this.getQPoint(p1, centerPoint);

    /*
    M 186 216.5   // 正常模式    x1 + 0.1*dist + y
    Q 195.9 216.5 202.5 216.5
    T 219 216.5

    M 196 481.5   // 正常模式
    Q 238.9 481.5 267.5 430
    T 339 378.5

    M 196 517.5   // 正常模式
    Q 247.3 517.5 281.5 567
    T 367 616.5


    M 474 364.5   // 左转模式    x1 + 0.6*dist + y
    Q 509.7 364.5 414.5 444.5
    T 355 524.5

    M 430 265.5   // 左转模式    x1 + 0.6*dist + y
    Q 460.9 265.5 378.5 315
    T 327 364.5
    */

    pathString += ["Q" + Q.x, Q.y, centerPoint.x, centerPoint.y].join(" ");
    pathString += ["T" + p2.x, p2.y].join(" ");

    return pathString;
  };
  // 获取两点之间的中间点
  getCenterPoint = (p1: Point, p2: Point) => {
    return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  };
  // 获取 quadratic Bézier curve 的弯曲点
  getQPoint = (p1: Point, p2: Point) => {
    let x = p1.x;
    if (p1.x <= p2.x) {
      x = (p1.x + p2.x) / 2 + (p2.x - p1.x) / 10;
    } else {
      x = p1.x + (Math.abs(p1.x - p2.x) * 3) / 5;
    }
    return { x, y: p1.y };
  };

  // 检查线条的同步变化
  checkLine = (
    nodeItem: NodeItem,
    nodeMap: object,
    lineList: LineItem[],
    lineMap: object
  ) => {
    const {
      entryId,
      pOutputId,
      configuration: { output },
      pIdpOutputIdSpare,
    } = nodeItem;
    // 如果有父节点，则重画与父节点的连线
    if (pOutputId && entryId) {
      this.resetLine(lineMap[pOutputId], nodeMap);
    }
    if(pIdpOutputIdSpare.length>0){
      pIdpOutputIdSpare.forEach((_arr:(number|string)[]) => {
        this.resetLine(lineMap[_arr[1]], nodeMap); 
      });
    }
    // 第二部：检测其下出口列表是否有连接线
    output.forEach(({ id, connectEntryId }) => {
      // 如果有连线
      if (connectEntryId) {
        this.resetLine(lineMap[id], nodeMap);
      }
    });
  };

  // 调整单线条的位置
  resetLine = (line: LineItem, nodeMap: object) => {
    const { id, outputId, toId } = line;
    if (toId) {
      const {
          x,
          y,
          configuration: { output },
        } = nodeMap[id],
        height1 = getNodeHeight(nodeMap[id]),
        length = output.length,
        idx = output.findIndex((d: OutputProps) => d.id === outputId);
      line.startPoint = {
        x: x + nodeWidth,
        y: length === 1 ? y + height1 / 2 : y + 18 * idx + 2.5 + 6.5,
      };
      line.path = this.countPath(line.startPoint, getEntryPoint(nodeMap[toId]));
    }
  };
}

const draw = new Draw();
export default draw;
