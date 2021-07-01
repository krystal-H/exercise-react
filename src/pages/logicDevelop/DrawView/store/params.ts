import fn from "../tools/fn";
import { SystemState, NodeItem, Point, LineItem, OutputProps } from "./types";
import draw from "../tools/draw";
import { getNodeHeight } from "./action";
import { message } from "antd";
import nodeConfigList, {
  nodeConfigurationMaps,
  entryList as _entryList,
} from "./nodeConfig";

export const topH = 52;
export const leftW = 220;
export const nodeWidth = 136;
export const nodeWM = 136 + 8;
export const defaultToolsHeight = 30;
export const defaultLogHeight = 196;

// 节点选择器列表结构
export const nodeConfigrationList = nodeConfigList;
// 节点配置映射表
export const configurationMap = nodeConfigurationMaps;
// 触发事件id列表
export const entryList = _entryList;

export const getEntryPoint = (node: NodeItem, noLeftDist: boolean = false) => {
  const { x, y } = node,
    height2 = getNodeHeight(node);
  return {
    x: x - (noLeftDist ? 0 : 11),
    y: y + height2 / 2,
  };
};

export const getRelativePoint = (
  state: SystemState,
  _x: number,
  _y: number,
  mustOverZero: boolean = false
) => {
  const { showChooser } = state;
  let x =
      (draw.wrap ? draw.wrap.scrollLeft : 0) + (showChooser ? _x - leftW : _x),
    y = (draw.wrap ? draw.wrap.scrollTop : 0) + _y - topH;
  if (mustOverZero) {
    x = x < 0 ? 0 : x;
    y = y < 0 ? 0 : y;
  }
  return { x, y };
};

// 如何创建一个output
export const createOutputObject = (): OutputProps => ({ id: fn.getUnique() });

// 如何创建一个nodeItem
export const createNodeObject = (
  state: SystemState,
  nodeType: string,
  x: number,
  y: number
): NodeItem => {
  const {
    name,
    entryNum,
    output: [outNum],
    initData,
  } = configurationMap[nodeType];
  const relativePoint = getRelativePoint(state, x, y, true);

  // console.log("-node--outNum-",outNum);
  
  let node = {
    id: fn.getUnique(),
    nodeType,
    ...relativePoint,

    entryId: entryNum > 0 ? fn.getUnique() : null,

    pId: null,
    pOutputId: null,

    isError: false,
    pIdpOutputIdSpare:[],
    configuration: {
      name,
      output: Array(outNum)
        .fill(null)
        .map(() => createOutputObject()),
      ...initData(),
    },
  };
  // console.log("new-node---",node);
  return node;
};

// 如何拷贝一个nodeItem
export const copyNodeObject = (node: NodeItem): NodeItem => {
  let { nodeType, entryId, isError, configuration } = node;
  configuration = fn.getCopyByPure(configuration);
  configuration.output = configuration.output.map((d) => ({
    ...d,
    id: "",
    connectId: undefined,
    connectEntryId: undefined,
  }));
  return {
    id: "", // 节点的唯一标识
    nodeType, // 节点类型标识
    x: 0, // 相对于画布的x轴距离
    y: 0, // 相对于画布的y轴距离

    entryId: entryId ? "" : null, // 本节点入口Id

    pId: null, // 父节点唯一标识
    pOutputId: null, // 父节点出口Id

    isError, // 是否配置参数有错误

    configuration, // 节点的配置项数据
  };
};

// 如何粘贴实现新增一个nodeItem
export const pasteNodeObject = (
  node: NodeItem,
  _x: number,
  _y: number,
  state: SystemState
): NodeItem | false => {
  let { nodeType, entryId, isError, configuration } = node;
  const { x, y } = getRelativePoint(state, _x, _y, true);
  // 如果不允许放置
  const canDropMsg = configurationMap[nodeType].canDrop(state, nodeType, x, y);
  if (canDropMsg) {
    message.error(canDropMsg);
    return false;
  }

  configuration = fn.getCopyByPure(configuration);
  configuration.output = configuration.output.map((d) => ({
    ...d,
    id: fn.getUnique(),
    connectId: undefined,
    connectEntryId: undefined,
  }));

  return {
    id: fn.getUnique(), // 节点的唯一标识
    nodeType, // 节点类型标识
    x, // 相对于画布的x轴距离
    y, // 相对于画布的y轴距离

    entryId: entryId === "" ? fn.getUnique() : null, // 本节点入口Id

    pId: null, // 父节点唯一标识
    pOutputId: null, // 父节点出口Id

    isError, // 是否配置参数有错误

    configuration, // 节点的配置项数据
  };
};

// 如何创建一个lineItem
export const createLineObject = (
  state: SystemState,
  startPoint: Point,
  startNodeId: string,
  startOutputId: string
): LineItem => {
  const line = {
    uniqueId: fn.getUnique(), // 唯一标识

    id: startNodeId, // 开始节点的唯一标识
    outputId: startOutputId, // 开始节点的出口id

    startPoint,
    path: draw.countPath(startPoint), // svg线路

    toId: null, // 指向节点的唯一标识
    entryId: null, // 指向节点的入口Id
  };
  return line;
};
