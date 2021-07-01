import {
  INIT,
  CHANGESEARCH,
  DROP,
  MOVE,
  CREATELINE,
  LINETO,
  CONNECTCANCEL,
  CONNECTOK,
  SHOWCONTEXTMENU,
  HIDECONTEXTMENU,
  CHANGECHOOSEID,
  CHANGECHOOSELINEID,
  DELETELINE,
  DELETENODE,
  CHANGENODECONFIGURATION,
  NODEERROR,
  UNDO,
  CLEARNODE,
  CUTNODE,
  COPYNODE,
  PASTENODE,
  FULLSCREEN,
  READ,
  LOADING,
  LISTLOADING,
  LISTLOADED,
  LISTLOADCRASH,
  SAVED,
  SAVEOK,
  SAVING,
  DEPLOYING,
  DEPLOYED,
  DEBUGGING,
  DEBUGGED,
  PUBLISHING,
  PUBLISHED,
  DEPLOYOK,
  SHOWDEBUGINPUT,
  HIDEDEBUGINPUT,
  DEBUGOK,
  TOGGLECHOOSER,
  TOGGLECONFIGURATION,
  TOGGLELOG,
  CHANGELOGHEIGHT,
  LOGFULLSCREEN,
  OPENPUBLISH
} from "./actionNames";
import {
  SystemState,
  actionProps,
  Point,
  OutputProps,
  ContextMenuType,
  NodeItem,
  LineItem,
  CopyItem,
  CopyType,
  ConnectNodeType,
  Status,
} from "./types";
import {
  configurationMap,
  createNodeObject,
  getRelativePoint,
  getEntryPoint,
  createLineObject,
  copyNodeObject,
  pasteNodeObject,
  defaultLogHeight,
} from "./params";
import { message } from "antd";
import draw from "../tools/draw";
import { clearNodeNext, decode, decodeDebugged } from "./action";
import { nodeConfigurationMaps } from "./nodeConfig";

const defaultContextMenuValue = {
    show: false,
    type: ContextMenuType.NULL,
    id: null,
    x: 0,
    y: 0,
  },
  defaultList = { isLoading: false, isError: false, list: [] };

/*** 撤销的实现 */
const saveHistory = (state: SystemState) => {
  const { nodeList, lineList, chooseId } = state;
  const props = { nodeList, lineList, chooseId };
  let stackHistory = [...state.stackHistory];
  stackHistory.push(JSON.stringify(props));
  return stackHistory;
};
const pullHistory = (state: SystemState) => {
  let stackHistory = [...state.stackHistory];
  stackHistory.pop();
  return stackHistory;
};

const createNode = (
  state: SystemState,
  nodeType: string,
  x: number,
  y: number
): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  const config = configurationMap[nodeType];
  const canDropMsg = config.canDrop(state, nodeType, x, y);
  if (canDropMsg) {
    message.error(canDropMsg);
    return state;
  }
  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap };

  const node = createNodeObject(state, nodeType, x, y);
  nodeList.push(node);
  nodeMap[node.id] = node;

  draw.checkMin(nodeList); // 及时检测当前窗口变化

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    chooseId: node.id,
    showConfiguration: true, // 强制立即展示配置栏
    stackHistory,
  };
};

const moveNode = (
  state: SystemState,
  nodeId: string,
  x: number,
  y: number,
  isMoveStart: boolean
): SystemState => {
  let { stackHistory } = state;
  if (isMoveStart) {
    // 如果是刚开始产生移动，则记录此时回滚历史的操作
    stackHistory = saveHistory(state);
  }

  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap },
    lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  nodeMap[nodeId].x = x;
  nodeMap[nodeId].y = y;

  draw.checkMin(nodeList); // 及时检测当前窗口变化

  draw.checkLine(nodeMap[nodeId], nodeMap, lineList, lineMap);

  return { ...state, nodeList, nodeMap, lineList, lineMap, stackHistory };
};

const createLine = (
  state: SystemState,
  startPoint: Point,
  startNodeId: string,
  startOutputId: string
): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  const { x, y } = startPoint;

  let lineArrow = getRelativePoint(state, x, y);
  

  const line = createLineObject(state, lineArrow, startNodeId, startOutputId);

  lineList.push(line);
  lineMap[startOutputId] = line;

  return {
    ...state,
    lineList,
    lineMap,
    lineArrow,
    connectId: startOutputId,
    stackHistory,
  };
};

const lineTo = (
  state: SystemState,
  currentOutputId: string,
  x: number,
  y: number
): SystemState => {
  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  const { startPoint } = lineMap[currentOutputId];

  const lineArrow = getRelativePoint(state, x, y);
  lineMap[currentOutputId].path = draw.countPath(startPoint, lineArrow);

  return { ...state, lineList, lineMap, lineArrow };
};

const connectCancel = (
  state: SystemState,
  currentOutputId: string
): SystemState => {
  // 如果连线失败，则取消当前存储的
  let stackHistory = pullHistory(state);

  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  lineList = lineList.filter((d) => d.outputId !== currentOutputId);
  lineMap[currentOutputId] = undefined;

  return {
    ...state,
    lineList,
    lineMap,
    lineArrow: null,
    connectId: null,
    stackHistory,
  };
};

const connectOK = (
  state: SystemState,
  currentOutputId: string,
  toId: string,
  entryId: string,
  nodeType:string,
): SystemState => {
  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap },
    nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap };

  const { id, startPoint } = lineMap[currentOutputId];

  //完善连线的终止节点、终止入口
  lineMap[currentOutputId].toId = toId;
  lineMap[currentOutputId].entryId = entryId;
  lineMap[currentOutputId].path = draw.countPath(
    startPoint,
    getEntryPoint(nodeMap[toId])
  );

  let isHavePid = nodeType==="forLoopEnd" && nodeMap[toId].pId;

  //完善连线的起始出口信息
  let outputVal =
    nodeMap[id].configuration.output.find(
      (d: OutputProps) => d.id === currentOutputId
    ) || {};
  outputVal.connectEntryId = entryId;

  if(isHavePid){
    let adddata = nodeMap[toId].pIdpOutputIdSpare || [];
    nodeMap[toId].pIdpOutputIdSpare = [...adddata,[id,currentOutputId]];
  }else{
    outputVal.connectId = toId;
    //完善连线的终止节点的父节点、父出口
    nodeMap[toId].pId = id;
    nodeMap[toId].pOutputId = currentOutputId;

  }

  // 处理连线后配置的相关变化（目前（20201125）只有httpResponse节点需要afterConnect）
  const s = nodeMap[id],
    e = nodeMap[toId];
  nodeConfigurationMaps[s.nodeType].afterConnect(
    ConnectNodeType.StartPoint,
    s.configuration,
    s, // 起点
    e, // 终点
    state
  );
  nodeConfigurationMaps[e.nodeType].afterConnect(
    ConnectNodeType.EndPoint,
    e.configuration,
    s, // 起点
    e, // 终点
    state
  );

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    lineArrow: null,
    connectId: null,
  };
};

const changeChooseId = (state: SystemState, id: string | null): SystemState => {
  let data = { ...state, chooseId: id };
  if (id !== null && state.nodeMap[id]) {
    data.showConfiguration = true;
  }
  return data;
};

const showContextMenu = (
  state: SystemState,
  showType: ContextMenuType,
  id: string,
  x: number,
  y: number
): SystemState => {
  let data = {
    ...state,
    chooseId: id,
    contextMenu: {
      show: true,
      type: showType,
      id,
      x,
      y,
    },
  };
  if (showType === ContextMenuType.NODE) {
    data.showConfiguration = true;
  }
  return data;
};

const deleteLine = (state: SystemState): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap },
    nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap },
    { chooseId } = state;
  const id = chooseId;
  chooseId = null; // 取消选中当前选择节点

  const { id: nodeId = "", outputId = "", toId,entryId } =
    lineList.find((d) => d.uniqueId === id) || {};

  // 首先删除线条
  let delIdx = lineList.findIndex((d) => d.uniqueId === id);
  if (delIdx > -1) {
    lineList.splice(delIdx, 1);
  }
  lineMap[outputId] = undefined;

  //处理 线条两端的节点、出入口（pId,pOutId,connectid,connectentryid）
  let startNode = nodeMap[nodeId],
      endNode= toId && nodeMap[toId] || undefined;
  let output = startNode.configuration.output.find(
    (d: OutputProps) => d.id === outputId
  );
  
  let spare = endNode.pIdpOutputIdSpare || [];
  if(endNode&&spare.length>0){//如果endNode是循环结束节点（有多个入口，只有一个是保存给后台，其他只做前端样式存在pIdpOutputIdSpare）
    if(output.connectId){//如果 该连线是保存给后台和流程节点逻辑相关的那一条
      //设置新的父节点 和父节点的出口信息（出口的connectid关系到流程树的遍历）
      let [newpid,newpoutputid] = spare.pop();
      endNode.pId = newpid;
      endNode.pOutputId = newpoutputid;
      let newPidNode =  nodeMap[newpid];
      let newooutpot = newPidNode.configuration.output.find(
        (_d: OutputProps) => _d.id === newpoutputid
      );
      newooutpot.connectId = toId;
      newooutpot.connectEntryId = entryId;
    }else{//如果 该连线只是样式作用的连线
      let index = spare.findIndex((d:any) => d[0] == nodeId)
      spare.splice(index, 1);
    }
  }else{
    if (endNode) {
      endNode.pId = null;
      endNode.pOutputId = null;
    }
  }
  if (output) {
    output.connectId = undefined;
    output.connectEntryId = undefined;
  }

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    chooseId,
    stackHistory,
  };
};

const deleteNodeNext = (
  nodeId: string,
  nodeList: NodeItem[],
  nodeMap: object,
  lineList: LineItem[],
  lineMap: object
) => {
  const {
    pId,
    pOutputId,
    configuration: { output },
    pIdpOutputIdSpare,
  } = nodeMap[nodeId];

  // del
  let delIdx = nodeList.findIndex((d) => d.id === nodeId);
  if (delIdx > -1) {
    nodeList.splice(delIdx, 1);
  }
  nodeMap[nodeId] = undefined;

  // del parent line 删除该节点左边的连线
  let leftLineList = [[pId,pOutputId],...pIdpOutputIdSpare];
  // console.log("..leftLineList...",leftLineList);
  leftLineList.forEach(([_pid,_poutputid])=>{
    if (_pid && _poutputid) {
      let pOutput = nodeMap[_pid].configuration.output.find(
        (d: OutputProps) => d.id === _poutputid
      );
      if (pOutput) {
        pOutput.connectId = undefined;
        pOutput.connectEntryId = undefined;
      }
      let delIdx = lineList.findIndex((d) => d.outputId === _poutputid);
      if (delIdx > -1) {
        lineList.splice(delIdx, 1);
      }
      lineMap[_poutputid] = undefined;
    }
  })

  // del line 删除该节点右边的连线
  output.forEach(({ id, connectId, connectEntryId }: OutputProps) => {
    // 如果有连线
    // if (connectId && connectEntryId) {
    //   delIdx = lineList.findIndex((d) => d.outputId === id);
    //   if (delIdx > -1) {
    //     lineList.splice(delIdx, 1);
    //   }
    //   lineMap[id] = undefined;

    //   nodeMap[connectId].pId = null;
    //   nodeMap[connectId].pOutputId = null;
    // }
    if (connectEntryId) {
      delIdx = lineList.findIndex((d) => d.outputId === id);
      if (delIdx > -1) {
        lineList.splice(delIdx, 1);
      }
      lineMap[id] = undefined;
      if(connectId){
        let nextnode = nodeMap[connectId];
        nextnode.pId = null;
        nextnode.pOutputId = null;
        if(nextnode.pIdpOutputIdSpare.length>0){//如果下一个节点有备用父节点
          let [_pid,_poutid] = nextnode.pIdpOutputIdSpare.pop();
          nextnode.pId = _pid;
          nextnode.pOutputId = _poutid;
          
          let newPidNode =  nodeMap[_pid];
          let newooutpot = newPidNode.configuration.output.find(
            (_d: OutputProps) => _d.id === _poutid
          );
          newooutpot.connectId = connectId;
          newooutpot.connectEntryId = connectEntryId;

        }
      } 
    }
  });
};
const deleteNode = (state: SystemState): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  let lineList = [...state.lineList],
    lineMap = { ...state.lineMap },
    nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap },
    { chooseId } = state;

  const id = chooseId;
  chooseId = null; // 取消选中当前选择节点

  // 如果有这个节点，则执行下一步
  if (id) {
    deleteNodeNext(id, nodeList, nodeMap, lineList, lineMap);
  }

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    chooseId,
    stackHistory,
  };
};

const setConfiguration = (
  state: SystemState,
  nodeId: string,
  config: object
): SystemState => {
  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap },
    lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  if (nodeMap[nodeId]) {
    const prevOutput = nodeMap[nodeId].configuration.output,
      oNum = prevOutput.length;
    nodeMap[nodeId].configuration = {
      ...nodeMap[nodeId].configuration,
      ...config,
    };
    // 计算错误
    if (nodeMap[nodeId].isError) {
      const check = !!nodeConfigurationMaps[nodeMap[nodeId].nodeType].validate(
        nodeMap[nodeId].configuration,
        nodeMap[nodeId],
        state
      );
      if (!check) nodeMap[nodeId].isError = check;
    }

    // 如果出口数量发生变化，即节点高度发生变化时，重新处理连线
    const nowOutput = nodeMap[nodeId].configuration.output;
    if (oNum !== nowOutput.length) {
      const { pOutputId } = nodeMap[nodeId];
      // 如果该节点有父级，则重画父级连线
      if (pOutputId) {
        draw.resetLine(lineMap[pOutputId], nodeMap);
      }

      // 重画与子节点的连线
      prevOutput.forEach(({ id, connectId, connectEntryId }: OutputProps) => {
        const idx = nowOutput.findIndex((d: OutputProps) => d.id === id);
        // 删除了一个出口，则同时删除其与子节点的连线
        if (idx === -1) {
          // 如果有连线
          if (connectId && connectEntryId) {
            const delIdx = lineList.findIndex((d) => d.outputId === id);
            if (delIdx > -1) {
              lineList.splice(delIdx, 1);
            }
            lineMap[id] = undefined;

            nodeMap[connectId].pId = null;
            nodeMap[connectId].pOutputId = null;
          }
        } else if (connectEntryId) {
          // 重画剩余的其他所有出口连线
          draw.resetLine(lineMap[id], nodeMap);
        }
      });
    }
  }

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    lineList,
    lineMap,
  };
};

const setNodeError = (
  state: SystemState,
  nodeId: string | string[],
  isError: boolean = true
): SystemState => {
  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap };

  const ty = typeof nodeId,
    list =
      ty === "string" || ty === "number"
        ? [nodeId as string]
        : (nodeId as string[]);
  list.forEach((d) => {
    if (nodeMap[d]) {
      nodeMap[d].isError = isError;
    }
  });

  return { ...state, nodeList, nodeMap };
};

const doHistory = (state: SystemState): SystemState => {
  let stackHistory = [...state.stackHistory];
  const rst = stackHistory.pop();
  // 如果有历史回滚数据
  if (rst) {
    const { nodeList, lineList, chooseId } = JSON.parse(rst);
    let nodeMap = {},
      lineMap = {};

    nodeList.forEach((d: NodeItem) => (nodeMap[d.id] = d));
    lineList.forEach((d: LineItem) => (lineMap[d.outputId] = d));

    draw.checkMin(nodeList); // 及时检测当前窗口变化

    return {
      ...state,
      mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
      stackHistory,
      nodeList,
      nodeMap,
      lineList,
      lineMap,
      chooseId,
    };
  }
  return { ...state, stackHistory };
};

const cutNode = (state: SystemState): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap },
    lineList = [...state.lineList],
    lineMap = { ...state.lineMap };

  const { chooseId } = state;
  // 首先复制下该节点内容
  let copyNode: CopyItem = {
    type: CopyType.CUT, // 剪切模式，只能粘贴一次，之后清空
    nodeData: copyNodeObject(nodeMap[chooseId as string]),
  };

  // 接着删除该节点
  deleteNodeNext(chooseId as string, nodeList, nodeMap, lineList, lineMap);

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    stackHistory,
    copy: copyNode,
  };
};

const copyNode = (state: SystemState) => {
  const { chooseId, nodeMap } = state;
  // 首先复制下该节点内容
  let copyNode: CopyItem = {
    type: CopyType.COPY, // 剪切模式，只能粘贴一次，之后清空
    nodeData: copyNodeObject(nodeMap[chooseId as string]),
  };

  return {
    ...state,
    copy: copyNode,
  };
};

const pasteNode = (state: SystemState): SystemState => {
  // 记录回滚历史的操作
  let stackHistory = [...state.stackHistory];

  const {
    contextMenu: { x, y },
  } = state;
  let copy: CopyItem | null = state.copy as CopyItem;
  const { type, nodeData } = copy;

  if (type === CopyType.CUT) {
    copy = null;
  }

  const node = pasteNodeObject(nodeData, x, y, state);
  let nodeList = [...state.nodeList],
    nodeMap = { ...state.nodeMap };

  if (node !== false) {
    // 记录回滚历史的操作
    stackHistory = saveHistory(state);

    nodeList.push(node);
    nodeMap[node.id] = node;

    draw.checkMin(nodeList); // 及时检测当前窗口变化
  }

  return {
    ...state,
    mustSave: true, // 流程节点发生变化，必须保存/部署后才能调试与发布
    nodeList,
    nodeMap,
    copy,
    stackHistory,
  };
};

const clearNode = (state: SystemState): SystemState => {
  const { nodeList: a, nodeMap: b, lineList: c, lineMap: d } = state;

  // 如果没有节点，则直接返回源数据
  if (a.length === 0) {
    return state;
  }

  // 记录回滚历史的操作
  let stackHistory = saveHistory(state);

  // 整理节点过程
  const { nodeList, nodeMap, lineList, lineMap } = clearNodeNext(a, b, c, d);

  draw.checkMin(nodeList); // 及时检测当前窗口变化

  return {
    ...state,
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    stackHistory,
  };
};

// 解析数据
const read = (
  state: SystemState,
  action: string,
  authCheck:number,
  flowId: number,
  productionName: string,
  nodeList: any,
  lineList: any,
  testEnv: Status,
  proEnv: Status,
): SystemState => {
  let data: any = {};
  try {
    data = decode(nodeList, JSON.parse(lineList));

    draw.checkMin(data.nodeList); // 及时检测当前窗口变化
  } catch (e) {
    setTimeout(() => {
      message.error("节点编排数据解析失败");
    }, 200);
  }
  return {
    ...state,
    action: action || "",
    authCheck:authCheck || 0,
    flowId,
    productionName,
    testEnv,
    proEnv,
    ...data,
  };
};

// 保存成功操作之后的协同操作
const saved = (
  state: SystemState,
  root: string,
  action: string,
  authCheck:number,
): SystemState => {
  let data: any = { isSaving: false, root, action,authCheck };
  // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除
  data.testEnv = Status.Compiled;
  return { ...state, mustSave: false, ...data };
};

// 部署成功操作之后的协同操作
const deployed = (state: SystemState): SystemState => {
  let data: any = { isSaving: false };
  // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除
  data.testEnv = Status.Running;
  return { ...state, mustSave: false, ...data };
};

// 调试成功之后导入调试数据
const debugged = (state: SystemState, data: any): SystemState => {
  return {
    ...state,
    testEnv: Status.Debugging,
    showLog: true, // 立即展示日志栏
    showLogHeight: state.showLogHeight || defaultLogHeight,
    ...decodeDebugged(data),
  };
};

const defaultState: SystemState = {
  readonly: false, // 是否是只读模式

  action: "", // HTTP事件的action值，没有则是空字符串
  authCheck:0,// HTTP事件的配置项authCheck 是否鉴权
  projectId: null,
  serviceId: null,
  flowId: null,
  productionName: null, // 项目名
  mustSave: true, // 必须要保存才能执行调试发布操作
  testEnv: Status.Developing, // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除
  proEnv: Status.Developing, // 生产环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除

  isSaving: false, // 是否正在保存
  isInDeploy: false, // 测试环境是否正在部署
  isInDebug: false, // 测试环境是否正在调试
  isInPublish: false, // 正式环境是否在发布
  isopenPublish:false,// 发布前打开服务运行参数弹窗

  showChooser: true, // 显示开发节点选择器
  showConfiguration: true, // 显示当前开发节点配置信息
  showConfigurationWithFullScreen: false, // 配置信息是否显示全屏
  showLog: false, // 显示日志栏
  showLogHeight: 0, // 日志栏高度

  showDebugInput: false, // 是否显示调试参数输入弹框

  searchText: "", // 搜索内容

  root: null, // 保存流程图后的根节点id，只有以下两种情况会发生变更：
  // 1.一开始拉取服务开发数据时
  // 2.服务保存成功时

  nodeList: [], // 当前所画节点列表
  nodeMap: {}, //  当前所画节点映射

  debuggedData: null, // 当前已调试的节点数据(原始数据)（这是个数组结构！？）
  debuggedResult: null, // 整个返回的结果
  debuggedOutput: null, // 全局日志节点（根据debuggedData解析得出）
  debuggedMap: {}, // 当前已调试的每个节点情况,以节点id为key的平面结构

  lineList: [], // line列表
  lineMap: {}, // line映射

  connectId: null, // 当前正在连线的线条Key
  lineArrow: null, // 连线时产生的箭头

  // 右键菜单属性
  contextMenu: defaultContextMenuValue,

  chooseId: null, // 当前选中节点id或线条id
  chooseLineId: null, // 临时悬浮的选中线条id

  copy: null, // 当前剪切或复制的节点信息

  stackHistory: [], // 回滚历史操作堆栈

  isLoading: false,

  /* 全局相关参数 */
  product: { ...defaultList },
  api: { ...defaultList },// 项目内api列表
  platformapi: { ...defaultList }, // 平台内api列表
  // 项目内MQ的topic队列列表
  mqTopic: { ...defaultList },
  // 项目内RocketMQ的topic列表
  rocketMQTopic: { ...defaultList },
  // 数据库数据源
  database: { ...defaultList },
  // Redis数据源
  redis: { ...defaultList },
};

const reducer = (
  state: SystemState = defaultState,
  {
    type,
    isLoading,
    action,
    authCheck,
    projectId,
    serviceId,
    flowId,
    readonly,
    productionName,
    nodeList,
    lineList,
    testEnv,
    proEnv,
    searchText,
    nodeId,
    nodeType,
    x,
    y,
    isMoveStart,
    startPoint,
    startNodeId,
    startOutputId,
    currentOutputId,
    toId,
    entryId,
    showType,
    id,
    config,
    isError,
    listKey,
    list,
    root,
    data,
    logHeight,
    isopenPublish
  }: actionProps
): SystemState => {
  switch (type) {
    case INIT: // 初始化状态
      return { ...defaultState, projectId, serviceId, readonly };

    case LOADING:
      return { ...state, isLoading };
    case SAVEOK:
      return saved({ ...state }, root, action,authCheck);
    case DEPLOYOK:
      return deployed({ ...state });
    case DEBUGOK:
      return debugged({ ...state }, data);

    case READ: // 初始化状态
      return read(
        { ...state },
        action,
        authCheck,
        flowId,
        productionName,
        nodeList,
        lineList,
        testEnv,
        proEnv,
      );

    /* 全局列表状态变化 start */
    // 列表加载中
    case LISTLOADING:
      return {
        ...state,
        [listKey]: { isLoading: true, isError: false, list: [] },
      };
    // 列表加载完成
    case LISTLOADED:
      return {
        ...state,
        [listKey]: { isLoading: false, isError: false, list },
      };
    // 列表加载异常
    case LISTLOADCRASH:
      return {
        ...state,
        [listKey]: { isLoading: false, isError: true, list: [] },
      };
    /* 全局列表状态变化 end */

    case CHANGESEARCH:
      return { ...state, searchText };

    case CHANGECHOOSEID:
      return changeChooseId({ ...state }, id);
    case CHANGECHOOSELINEID:
      return { ...state, chooseLineId: id };

    // 拖拽节点进入容器
    case DROP:
      return createNode({ ...state }, nodeType, x, y);
    // 移动已放置节点
    case MOVE:
      return moveNode({ ...state }, nodeId, x, y, isMoveStart);
    // 创建连线
    case CREATELINE:
      return createLine({ ...state }, startPoint, startNodeId, startOutputId);
    // 连线时的箭头移动事件
    case LINETO:
      return lineTo({ ...state }, currentOutputId, x, y);
    // 取消当前连线事件
    case CONNECTCANCEL:
      return connectCancel({ ...state }, currentOutputId);
    // 连线成功事件
    case CONNECTOK:
      return connectOK({ ...state }, currentOutputId, toId, entryId,nodeType);

    // 右键菜单
    case SHOWCONTEXTMENU:
      return showContextMenu({ ...state }, showType, id, x, y);
    case HIDECONTEXTMENU:
      return { ...state, contextMenu: { ...defaultContextMenuValue } };

    // 删除指定线条
    case DELETELINE:
      return deleteLine({ ...state });
    // 删除指定节点
    case DELETENODE:
      return deleteNode({ ...state });

    // 节点配置信息变更
    case CHANGENODECONFIGURATION:
      return setConfiguration({ ...state }, nodeId, config);

    // 设置节点配置参数是否有错误
    case NODEERROR:
      return setNodeError({ ...state }, nodeId, isError);

    // 设置回滚操作的堆栈
    case UNDO:
      return doHistory({ ...state });

    // 剪切节点
    case CUTNODE:
      return cutNode({ ...state });
    // 复制节点
    case COPYNODE:
      return copyNode({ ...state });
    // 粘贴拷贝节点
    case PASTENODE:
      return pasteNode({ ...state });
    // 整理节点
    case CLEARNODE:
      return clearNode({ ...state });

    // 顶部按钮触发的状态变更
    case SAVING:
      return { ...state, isSaving: true };
    case SAVED:
      return { ...state, isSaving: false };
    case DEPLOYING:
      return { ...state, isInDeploy: true };
    case DEPLOYED:
      return { ...state, isInDeploy: false };
    case DEBUGGING:
      return { ...state, isInDebug: true };
    case DEBUGGED:
      return { ...state, isInDebug: false };
    case PUBLISHING:
      return { ...state, isInPublish: true };
    case PUBLISHED:
      return { ...state, isInPublish: false };
    case OPENPUBLISH:
      return { ...state, isopenPublish};

    // 打开和关闭HTTP调试入参输入弹窗
    case SHOWDEBUGINPUT:
      return { ...state, showDebugInput: true };
    case HIDEDEBUGINPUT:
      return { ...state, showDebugInput: false };

    // 切换左右两侧及日志栏视图的显示隐藏
    case TOGGLECHOOSER:
      return { ...state, showChooser: !state.showChooser };
    case TOGGLECONFIGURATION:
      return { ...state, showConfiguration: !state.showConfiguration };
    case TOGGLELOG:
      return {
        ...state,
        showLog: !state.showLog,
        showLogHeight: state.showLog ? 0 : defaultLogHeight,
      };
    case FULLSCREEN:
      return {
        ...state,
        showConfigurationWithFullScreen: !state.showConfigurationWithFullScreen,
      };
    case CHANGELOGHEIGHT:
      return {
        ...state,
        showLog: logHeight > 0,
        showLogHeight: logHeight,
      };
    case LOGFULLSCREEN:
      return {
        ...state,
        showLogHeight:
          state.showLogHeight === draw.logMaxHeight
            ? defaultLogHeight
            : draw.logMaxHeight,
      };

    default:
      return state;
  }
};

export default reducer;
