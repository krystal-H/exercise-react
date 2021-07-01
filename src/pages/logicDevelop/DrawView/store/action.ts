import {
  INIT,
  CHANGESEARCH,
  DROP,
  TOGGLECHOOSER,
  TOGGLECONFIGURATION,
  MOVE,
  CREATELINE,
  LINETO,
  CONNECTCANCEL,
  CONNECTOK,
  SHOWCONTEXTMENU,
  HIDECONTEXTMENU,
  DELETELINE,
  DELETENODE,
  CHANGECHOOSEID,
  CHANGECHOOSELINEID,
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
  LISTLOADED,
  LISTLOADCRASH,
  LISTLOADING,
  SAVED,
  SAVING,
  DEPLOYING,
  DEPLOYED,
  DEBUGGING,
  DEBUGGED,
  PUBLISHING,
  PUBLISHED,
  OPENPUBLISH,
  SAVEOK,
  DEPLOYOK,
  SHOWDEBUGINPUT,
  HIDEDEBUGINPUT,
  DEBUGOK,
  TOGGLELOG,
  CHANGELOGHEIGHT,
  LOGFULLSCREEN,
} from "./actionNames";
import {
  actionProps,
  Point,
  ContextMenuType,
  SystemState,
  NodeItem,
  SendData,
  OutputProps,
  LineItem,
  ParentItemProps,
  DebugObject,
  CodeType,
} from "./types";
import { message, Modal } from "antd";
import { configurationMap, nodeWidth, entryList } from "./params";
import fn from "../tools/fn";
import draw from "../tools/draw";
import { parentsDefaultList } from "./constants";
import {
  _getData,
  _getProductList,
  _getApiList,
  _getPlatformApiList,
  _saveData,
  _deploy,
  _getSameList,
  _debug,
} from "./api";
import httpEvent from "./nodeConfig/HTTPEvent";

export const init = (
  projectId: string,
  serviceId: string,
  readonly: boolean = false
) => {
  return (dispatch: Function) => {
    dispatch(
      initState(parseInt(projectId) || 0, parseInt(serviceId) || 0, readonly)
    );

    // 获取节点编排数据
    dispatch(getData(serviceId, true, readonly));

    // 获取对应的产品列表
    dispatch(
      getList(
        _getProductList,
        {
          projectId,
          pageRows: 9999,
        },
        "product"
      )
    );
    // 获取对应的项目内api列表
    dispatch(getList(_getApiList, { projectId, serviceId }, "api"));
    // 获取平台内api列表
    dispatch(getList(_getPlatformApiList, { type:3,pageRows:9999 }, "platformapi"));

    // 获取对应的项目内RocketMQ的topic列表
    dispatch(getList(_getSameList, { type: 5 }, "rocketMQTopic"));
    // 获取MQ的topic队列列表
    dispatch(getList(_getSameList, { type: 1 }, "mqTopic"));
    // 获取对应的项目内数据库列表
    dispatch(getList(_getSameList, { type: 2 }, "database"));
    // 获取对应的项目内redis数据源列表
    dispatch(getList(_getSameList, { type: 4 }, "redis"));
  };
};

const initState = (
  projectId: number,
  serviceId: number,
  readonly: boolean
): actionProps => ({
  type: INIT,
  projectId,
  serviceId,
  readonly,
});

const showLoading = (): actionProps => ({ type: LOADING, isLoading: true });
const hideLoading = (): actionProps => ({ type: LOADING, isLoading: false });
const saveOK = (root: string, action: string, authCheck:number): actionProps => ({
  type: SAVEOK,
  root,
  action,
  authCheck,
}); // 保存成功
const deployOK = (): actionProps => ({ type: DEPLOYOK }); // 保存成功

export const showDebugInput = (): actionProps => ({ type: SHOWDEBUGINPUT });
export const hideDebugInput = (): actionProps => ({ type: HIDEDEBUGINPUT });

const saving = (): actionProps => ({ type: SAVING }); // 保存中
const saved = (): actionProps => ({ type: SAVED }); // 保存结束
const deploying = (): actionProps => ({ type: DEPLOYING }); // 部署中
const deployed = (): actionProps => ({ type: DEPLOYED }); // 部署结束
const debugging = (): actionProps => ({ type: DEBUGGING }); // 调试中
const debugged = (): actionProps => ({ type: DEBUGGED }); // 调试结束
const publishing = (): actionProps => ({ type: PUBLISHING }); // 发布中
const published = (): actionProps => ({ type: PUBLISHED }); // 发布结束

export const openPublish = (num:number): actionProps => ({ type: OPENPUBLISH, isopenPublish:num}); // 
// 获取节点编排数据
let isReset = false; // 记录当前是否需要重新拉取列表提醒
const getData = (
  serviceId: string,
  isFirst: boolean = false,
  readonly: boolean = false
) => {
  return (dispatch: Function) => {
    if (isFirst) isReset = false;
    const errorCB = () => {
      if (!isReset) {
        Modal.confirm({
          title: "关键数据--节点编排数据读取失败，是否重新获取？",
          centered: true,
          okText: "好的",
          cancelText: "取消",
          zIndex: 1080,
          onOk: () => {
            isReset = true;
            dispatch(getData(serviceId, false, readonly)); // 重新获取
          },
        });
      } else {
        Modal.error({
          title: "关键数据--节点编排数据再次读取失败，请联系相关开发人员。",
          centered: true,
          zIndex: 1080,
        });
      }
    };
    dispatch(showLoading());
    _getData({ serviceId }, readonly)
      .then(({ data, code }: any) => {
        if (code === 0) {
          const {
            serveName,
            flowName,
            flowNodeList,
          } = data || {};
          let {
            action,
            authCheck,
            flowId,
            projectName,
            testEnv,
            proEnv,
            lines,
          } = data || {};
          if(readonly){
            lines = data.flowVersion && data.flowVersion.lines;
          }
          dispatch({
            type: READ,
            action,
            authCheck,
            flowId,
            productionName: serveName || flowName || projectName,
            nodeList: flowNodeList || [],
            lineList: lines ? lines : "[]",
            testEnv,
            proEnv,
          });
        } else {
          errorCB();
        }
      })
      .catch(errorCB)
      .finally(() => {
        dispatch(hideLoading());
      });
  };
};

// 保存节点流程编排              nextToPublish-保存时同时发布
const saveData = (
  data: any,
  nextToPublish: any = false,
) => {
  return (dispatch: Function) => {
    const name = nextToPublish ? "发布" : "保存",
      errorMsg = name + "失败";
    dispatch(saving());
    // 保存成功后，自动保存根节点和action、authCheck
    const root = data.nodes[0].id + "",
      authCheck = data.authCheck,
      action = data.action;
    _saveData(data)
      .then(({ data, code }: any) => {
        if (code === 0) {
          if (!nextToPublish) message.success(name + "成功");
          dispatch(saveOK(root, action,authCheck));

          if (nextToPublish) {
            dispatch(deploy(nextToPublish || {}));
          }
        } else {
          message.error(errorMsg);
        }
      })
      .catch(() => {
        message.error(errorMsg);
      })
      .finally(() => {
        dispatch(saved());
      });
  };
};


export const deploy = (data: object) => {
  return (dispatch: Function) => {
    const errorMsg = "部署失败";
    dispatch(deploying());
    _deploy({ ...data, funcType: 0, envType: 1, operate: 3 })
      .then(({ data, code }: any) => {
        if (code === 0) {
          message.success("部署成功，请点击调试按钮进行调试");
          dispatch(deployOK());
        } else {
          message.error(errorMsg);
        }
      })
      .catch(() => {
        message.error(errorMsg);
      })
      .finally(() => {
        dispatch(deployed());
      });
  };
};
export const publish = (data: object) => {
  return (dispatch: Function) => {
    const errorMsg = "发布正式环境失败";
    dispatch(publishing());
    _deploy({ ...data, funcType: 0, envType: 0, operate: 3 })
      .then(({ code }: any) => {
        if (code === 0) {
          message.success("正式环境发布成功");
        } else {
          message.error(errorMsg);
        }
      })
      .catch(() => {
        message.error(errorMsg);
      })
      .finally(() => {
        dispatch(published());
      });
  };
};

export const debug = (data: object) => {
  return (dispatch: Function) => {
    dispatch(debugging());
    _debug({ ...data, funcType: 0, envType: 1 })
      .then((data: any) => {
        dispatch({
          type: DEBUGOK,
          data,
        });
      })
      .catch((data: any) => {
        if(data.debugLog){//接口本身请求正常，但是函数返回异常 后台 把异常码放在最外层的code，导致程序进入catch，但是需要按正常调试结果显示
          dispatch({
            type: DEBUGOK,
            data,
          });
        }else{
          message.error("调试异常");
        }
      })
      .finally(() => {
        dispatch(debugged());
      });
  };
};

// 通用获取
const getList = (getListFunc: Function, data: object, listKey: string) => {
  return (dispatch: Function) => {
    dispatch({
      type: LISTLOADING,
      listKey,
    });
    getListFunc(data)
      .then(({ data, code }: any) => {
        if (code === 0) {
          dispatch({
            type: LISTLOADED,
            listKey,
            list: data,
          });
        } else {
          dispatch({
            type: LISTLOADCRASH,
            listKey,
          });
        }
      })
      .catch(() => {
        dispatch({
          type: LISTLOADCRASH,
          listKey,
        });
      });
  };
};

// 切换左右两侧及日志栏视图的显示隐藏
export const toggleChooserView = () => ({ type: TOGGLECHOOSER });
export const toggleConfigurationView = () => ({ type: TOGGLECONFIGURATION });
export const toggleLogView = () => ({ type: TOGGLELOG });
export const toggleLogFullscreen = () => ({ type: LOGFULLSCREEN });
export const changeLogHeight = (logHeight: number) => ({
  type: CHANGELOGHEIGHT,
  logHeight,
});

// 修改左侧开发组件筛选条件
export const changeSearch = (searchText: string) => ({
  type: CHANGESEARCH,
  searchText,
});

export const drop = (nodeType: string, x: number, y: number) => ({
  type: DROP,
  nodeType,
  x,
  y,
});

export const move = (
  nodeId: string,
  x: number,
  y: number,
  isMoveStart: boolean
) => ({
  type: MOVE,
  nodeId,
  x,
  y,
  isMoveStart,
});

export const createLine = (
  startPoint: Point,
  startNodeId: string,
  startOutputId: string
) => ({
  type: CREATELINE,
  startPoint,
  startNodeId,
  startOutputId,
});

export const lineTo = (currentOutputId: string, x: number, y: number) => ({
  type: LINETO,
  currentOutputId,
  x,
  y,
});

export const connectCancel = (currentOutputId: string) => ({
  type: CONNECTCANCEL,
  currentOutputId,
});

export const connectOK = (
  currentOutputId: string,
  toId: string,
  entryId: string,
  nodeType:string,
) => ({
  type: CONNECTOK,
  currentOutputId,
  toId,
  entryId,
  nodeType
});

export const showContextMenu = (
  showType: ContextMenuType,
  id: string,
  x: number,
  y: number
) => ({
  type: SHOWCONTEXTMENU,
  showType,
  id,
  x,
  y,
});

export const hideContextMenu = () => ({ type: HIDECONTEXTMENU });

export const deleteNode = () => ({ type: DELETENODE });
export const deleteLine = () => ({ type: DELETELINE });

export const changeChooseId = (id: string | null) => ({
  type: CHANGECHOOSEID,
  id,
});
export const changeChooseLineId = (id: string | null) => ({
  type: CHANGECHOOSELINEID,
  id,
});

export const changeNodeConfiguration = (nodeId: string, config: object) => ({
  type: CHANGENODECONFIGURATION,
  nodeId,
  config,
});

export const nodeError = (
  nodeId: string | string[],
  isError: boolean = true
) => ({
  type: NODEERROR,
  nodeId,
  isError,
});

export const fullScreen = () => ({ type: FULLSCREEN });

export const cutNode = () => ({ type: CUTNODE });
export const copyNode = () => ({ type: COPYNODE });
export const pasteNode = () => ({ type: PASTENODE });

export const undo = () => ({ type: UNDO });

// 整理节点
export const clearNode = () => ({ type: CLEARNODE });

const firstH = 50, // 第一编排流所站的初始高度
  distH = 90, // 每个编排流所相距的高度
  nodeDistH = 44, // 节点间的上下间距
  minNodeDistH = nodeDistH / 2; // 上下俩节点的最小距离

// 找到根节点的入参列表
export const getParams = (root: string | null, nodeMap: object) => {
  const {
    nodeType,
    configuration: { params },
  } = nodeMap[root || ""] || {
    configuration: {
      params: [],
    },
  };
  // 根节点是否是HTTP事件
  const isHTTP = nodeType === httpEvent.id;
  // 如果是HTTP事件，则填入该列表
  return {
    isHTTP,
    params: isHTTP ? params : [],
  };
};

// 拉取父节点列表
export const getParents = (
  node: NodeItem | undefined,
  nodeMap: object
): ParentItemProps[] => {
  let parents: ParentItemProps[] = parentsDefaultList.concat([]);
  let _node = node,
    { pId } = _node || {};
  while (pId) {
    const { pId: _pId, id, nodeType, configuration } = nodeMap[pId];
    const { outputType, outputValue } = configurationMap[nodeType];
    parents.push({
      id,
      value: configuration.name,
      type: outputType,
      list: outputValue(configuration, nodeMap[pId]),
    });
    pId = _pId;
  }
  return parents;
};
// 拉取子节点列表
const getChildren = (node: NodeItem): string[] =>
  node.configuration.output
    .filter((d) => d.connectId)
    .map((d) => d.connectId) as string[];

// 找到最右上角的那个节点
const getTop = (_node: NodeItem, nodeMap: object) => {
  let node = _node;
  let nodeIds = getChildren(node);
  while (nodeIds[0]) {
    node = nodeMap[nodeIds[0]];
    nodeIds = getChildren(node);
  }
  return node;
};
// 找到最右下角的那个节点
const getBottom = (_node: NodeItem, nodeMap: object) => {
  let node = _node;
  let nodeIds = getChildren(node),
    len = nodeIds.length;
  while (len > 0) {
    node = nodeMap[nodeIds[len - 1]];
    nodeIds = getChildren(node);
    len = nodeIds.length;
  }
  return node;
};
// 获取节点高度
export const getNodeHeight = (node: NodeItem) => {
  const outNum = node.configuration.output.length;
  return outNum <= 1 ? 32 : 18 * outNum;
};

// 解析流程节点编排数据操作
export const decode = (_nodeList: any, lineList: any) => {
  let lineMap = {},
    nodeMap = {},
    maxId = fn.nowTime;
  const checkId = (_id: string | number) => {
    const id = Number(_id);
    if (id > maxId) maxId = id;
  };

  // 记录根节点
  const root = _nodeList[0] ? _nodeList[0].nodeId + "" : null;

  const nodeList = _nodeList.map(
    ({
      nodeId,
      nodeName,
      nodeType: _nodeType,
      pNodeId,
      location,
      input
    }: any) => {
      const { id: nodeType, toConfiguration } = configurationMap[_nodeType];
      const ids = location.split("|");
      const [x, y] = ids[0].split(","),
        output = ids[3] === "" ? [] : ids[3].split(";");
      const endloopids = ids[4] && ids[4].split(";").map((_str:string)=> _str.split(",")) || [];
      // console.log("endloopids---",endloopids);
      const node: NodeItem = {
        id: nodeId + "",
        nodeType, // 节点类型标识
        x: parseInt(x), // 相对于画布的x轴距离
        y: parseInt(y), // 相对于画布的y轴距离

        entryId: ids[1] || null, // 本节点入口Id

        // 这里强调下父节点id为0时设置为null
        pId: pNodeId !== 0 && pNodeId ? pNodeId + "" : null, // 父节点唯一标识
        pOutputId: ids[2] || null, // 父节点出口Id
        pIdpOutputIdSpare:endloopids,

        isError: false, // 是否配置参数有错误

        configuration: {
          ...toConfiguration(JSON.parse(input)),
          name: nodeName,
          output: output.map((d: string) => {
            const [id, a, b] = d.split(",");
            checkId(id); // 节点中的id只有这里才可能产生最大值
            return {
              id, // 该出口的唯一标识
              connectId: a || undefined, // 入口节点Id
              connectEntryId: b || undefined, // 入口Id
            };
          }),
        }, // 节点的配置项数据
      };
      nodeMap[nodeId] = node;
      return node;
    }
  );
  lineList.forEach((d: any) => {
    lineMap[d.outputId] = d;
    checkId(d.uniqueId);
  });

  fn.setUnique(maxId); // 根据当前最大id值重置当前唯一标识
  return {
    root,
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    mustSave: nodeList.length === 0,
  };
};

// 解析调试成功或失败数据
export const decodeDebugged = (_data: any) => {
  let data: any,
    debuggedData,
    debuggedResult: any = {
      code: -1,
      msg: "error",
      data: null,
    },
    debuggedMap: DebugObject = {},
    debuggedOutput: any[] = [];

  try {
    const { code, data: __data, msg, debugLog } = _data;
    data = typeof debugLog === "string" ? JSON.parse(debugLog) : debugLog;
    debuggedResult.code = code;
    debuggedResult.msg = msg;
    debuggedResult.data = __data;

    // 如果调试成功
    debuggedData = data;
    if ({}.toString.call(data) === "[object Array]") {
      let maps = {};
      /*
  [{"nodeInput":{},"nodeOutput":{},"nodeDebug":[],"takeUpTime":"0ms","nodeId":65537,"nodeType":101,"nodeName":"HTTP事件"},{"nodeInput":{},"nodeOutput":123,"nodeDebug":[],"takeUpTime":"0ms","nodeId":65539,"nodeType":701,"nodeName":"HTTP返回"}]
      takeUpTime：耗时
      nodeId：节点Id
      nodeType：节点类型
      nodeName：节点名称
      nodeInput：节点输入
      nodeOutput：节点输出
      nodeDebug：调试日志
      */
      debuggedData.forEach((d: any, i: number) => {
        const {
          nodeId,
          nodeType,
          nodeName,
          nodeInput,
          takeUpTime,
          nodeOutput,
          nodeDebug,
          ...others
        } = d;
        maps[nodeId] = {
          ...others,
        };
        maps[nodeId]["节点Id"] = nodeId;
        maps[nodeId]["节点类型"] =
          (configurationMap[nodeType] || {}).name || "未知类型";
        maps[nodeId]["节点名称"] = nodeName;
        maps[nodeId]["节点输入"] = nodeInput;
        maps[nodeId]["节点输出"] = nodeOutput;
        maps[nodeId]["耗时"] = takeUpTime;
        maps[nodeId]["调试日志"] = nodeDebug;

        debuggedOutput.push(maps[nodeId]);
        // 这里修改成只针对返回的节点指定成功标志。
        debuggedMap[nodeId] = {
          code: CodeType.Success,
          data: maps[nodeId],
        };
        // 2020-08-04 杨振修改返回数据，直接返回了最终调试结果
        // if (i === debuggedData.length - 1) {
        //   debuggedResult.data = nodeOutput;
        // }
      });

      // if(!(debugLog&&code!==0)){
      //   message.success(
      //     "调试" + (code === 0 ? "成功" : "完成") + "，请查阅相关日志"
      //   );

      // }
      message.success(
        "调试" + (code === 0 ? "成功" : "完成") + "，请查阅相关日志"
      );

     
    } else {
      message.error("节点具体调试信息空缺");
    }
  } catch (e) {
    message.error("调试数据解析失败");
  }

  return { debuggedData, debuggedMap, debuggedResult, debuggedOutput };
};

export const clearNodeNext = (
  _nodeList: NodeItem[],
  _nodeMap: object,
  _lineList: LineItem[],
  _lineMap: object
) => {
  let nodeList = [..._nodeList],
    nodeMap = { ..._nodeMap },
    lineList = [..._lineList],
    lineMap = { ..._lineMap };

  let noConnectList: NodeItem[] = [], // 无连接节点列表
    entrys: NodeItem[] = []; // 编排流的入口列表

  // 第一步，初始化循环列表，搜索关键节点
  nodeList.forEach((d) => {
    d.deep = undefined; // 重置关键参数

    const {
      pId,
      configuration: { output },
    } = d;
    if (!pId) {
      const len = output.filter((d: OutputProps) => d.connectId).length;
      if (len === 0) {
        noConnectList.push(d); // 若是无连接节点
      } else {
        entrys.push(d); // 找出根节点
      }
    }
  });

  let nowH = firstH; // 当前记录高度

  // 对无连接节点重排
  noConnectList
    .sort((a, b) => fn.idToNum(a.id) - fn.idToNum(b.id))
    .forEach((d, i) => {
      d.x = firstH + (nodeWidth - 10) * i; // 50   176  302
      d.y = firstH;

      // 计算当前最大记录高度
      nowH = Math.max(distH + getNodeHeight(d) + firstH, nowH);
    });

  // 对各条编排流重排
  entrys
    .sort((a, b) => fn.idToNum(a.id) - fn.idToNum(b.id))
    .forEach((entry, i) => {
      let topH = nowH,
        deepMaps = {}; // 深度节点列表

      // 设置x坐标等基础参数，并重新计算深度
      const countX = (nodeId: string, deep: number) => {
        const node = nodeMap[nodeId];

        // 阻止 出现环的时候，无限查询
        if (node.deep !== undefined) return;

        !deepMaps[deep] && (deepMaps[deep] = []);
        deepMaps[deep].push(node);
        node.deep = deep;
        node.x = firstH + deep * (nodeWidth + nodeDistH); // 50 230 410 590
        node.y = 0;
        node.height = getNodeHeight(node);
        const children = getChildren(node);
        if (children.length > 0) {
          children.forEach((d) => countX(d, deep + 1));
        } else {
          // 针对末尾节点赋予基础计算属性top、bottom
          node.top = topH;
          node.bottom = topH + node.height;
          topH = node.bottom + nodeDistH;
        }
      };

      // 1.首先设置x坐标等基础参数
      countX(entry.id, 0);

      // 遍历全编排流节点，计算y值
      const countY = (nodeId: string) => {
        const node = nodeMap[nodeId];
        const top = getTop(node, nodeMap).top as number;
        const bottom = getBottom(node, nodeMap).bottom as number;
        node.top = top;
        node.bottom = bottom;
        node.y = (top + bottom) / 2 - node.height / 2;
        const children = getChildren(node);
        if (children.length > 0) {
          children.forEach((d: string) => countY(d));
        }
      };

      // 2.设置所有节点的y坐标
      countY(entry.id);

      // 3.假如有同深度的节点太高，无法支撑全部显示，则将该节点下面的所有节点都统一下降位置
      let countAgain = false;
      Object.keys(deepMaps)
        .sort((a, b) => +b - +a) // 倒序，从末尾节点开始查起
        .forEach((deep) => {
          const nodes = deepMaps[deep];
          nodes.forEach((node: NodeItem) => {
            const dist = node.y - (node.top as number);
            // 如果她触碰到了上面的节点,则整体向下移动一段距离
            if (dist < -minNodeDistH) {
              countAgain = true;
              const last = getBottom(node, nodeMap);
              last.bottom = (last.bottom as number) + (-dist - minNodeDistH);
            }
          });
        });
      // 如果需要重新计算Y值
      if (countAgain) {
        countY(entry.id);
      }

      // 计算下一编排流的最初始高度
      const lastNode = getBottom(entry, nodeMap);
      nowH = lastNode.y + (lastNode.height || 0) + distH;
    });

  // 对线条进行重排
  lineList.forEach((line) => draw.resetLine(line, nodeMap));

  return {
    nodeList,
    nodeMap,
    lineList,
    lineMap,
  };
};

// 保存流程图        nextToPublish-保存时同时发布
export const save = (state: SystemState, nextToPublish: any = false) => {
  return (dispatch: Function) => {
    const { error, id } = checkSave(state);
    if (error) {
      if (id.length > 0) {
        dispatch(nodeError(id, true)); // 让节点处于错误状态
      }
    } else {
      
      const data = countData(state);
      // return;
      // console.log((window["lcp"] = data));
      dispatch(
        saveData(
          data,
          // nextToPublish,
          nextToPublish ? {...nextToPublish,serviceId:state.serviceId} : false
        )
      ); // 提交数据
    }
  };
};

const sayError = (msgs: string[]) => {
  msgs.forEach((msg) => {
    message.error(msg);
  });
};

const msgError0 = "总得画点什么吧",
  msgError1 = (name: string, checkRst: string) =>
    `编排的节点【${name}】${checkRst}`,
  msgError2 = "只允许一条编排流",
  // msgError3 = "编排的输入节点不合法",
  msgError4 = "至少需要一个触发事件";
const checkSave = (state: SystemState): any => {
  let msg: any = {
    error: false,
    id: [],
  };
  const { nodeList } = state;

  if (nodeList.length === 0) {
    msg.error = true;
    sayError([msgError0]);
    return msg;
  }

  let flowNum = 0, // 编排流数量
    entryNum = 0, // 入口数量
    errorMsgs = []; // 需要报错的信息

//  console.log("。。checkSave。nodeList。。。。:",nodeList);



  for (let i = 0; i < nodeList.length; i++) {
    const nodeItem = nodeList[i];
    const { id, entryId, pId, nodeType, configuration } = nodeItem;

    // 从自定义检测判断方法里检测配置是否正确
    const checkRst = configurationMap[nodeType].validate(
      configuration,
      nodeItem,
      state
    );

    // 这里应该要报出具体的错误信息，而不是只指出哪个节点有问题
    if (checkRst) {
      msg.error = true;
      msg.id.push(id);
      errorMsgs.push(msgError1(configuration.name, checkRst));
      // break;
    }

    // 检测编排流数量
    const isEntry = entryId === null, // 如果是初始节点
      isNoParent = entryId && !pId; // 有入口的情况下，没有父节点
    flowNum += isEntry || isNoParent ? 1 : 0;
    
    if (flowNum > 1) {
      // console.log("。。checkSave。entryId。pId。。。:",entryId,pId);
      msg.error = true;
      msg.id = [];
      errorMsgs = [msgError2];
      break;
    }

    // 检测触发事件数量
    entryNum += entryList.indexOf(nodeType) > -1 ? 1 : 0;
  }

  if (msg.error) {
    if (errorMsgs.length > 0) {
      sayError(errorMsgs);
    }
    return msg;
  }

  if (entryNum !== 1) {
    // 检测触发事件数量
    msg.error = true;
    msg.id = [];
    sayError([msgError4]);
    return msg;
  }

  return msg;
};

// 计算提交内容
const countData = (state: SystemState) => {
  const {
    action: _action,
    authCheck,
    flowId,
    projectId,
    serviceId,
    nodeList,
    nodeMap,
    lineList,
  } = state;
  
  // NOTE [2020-06-17] 根据昨晚和超哥讨论的结果，提交时，这里仍然使用原id，而不采用以前使用新的id
  let rst: SendData = {
      projectId,
      serviceId,
      flowId,
      action: "",
      authCheck:authCheck||0,
      oriAction: _action || "",
      nodes: [],
      lines: "",
      
    },
    // ids = 0,
    idMaps = {},
    idReverseMaps = {};

  // console.log("post nodeList:",nodeList);

  // 计算单个节点的data
  const countNodeData = (nodeItem: NodeItem) => {
    const { id, nodeType, entryId, pId, configuration } = nodeItem;
    const addData = configurationMap[nodeType].toData(
      configuration,
      nodeItem,
      state,
      idMaps,
      idReverseMaps
    );
    // console.log("post countNodeData----:",nodeItem);
    // ids++;
    // idMaps[id] = ids; // 保存当前id映射
    idMaps[id] = id; // 保存当前id映射
    // idReverseMaps[ids] = id;
    idReverseMaps[id] = id;
    const data = {
      // id: ids,
      id: parseInt(id),
      nodeName: configuration.name,
      nodeType: configurationMap[nodeType].nodeType,
      pid: pId !== null ? parseInt(idMaps[pId]) : pId,
      location: "",
      output: "",

      // 专属节点配置信息
      input: JSON.stringify(addData),
    };
    rst.nodes.push(data);

    // 为入口创建唯一标识
    if (entryId) {
      // ids++;
      // idMaps[entryId] = ids;
      idMaps[entryId] = entryId;
    }

    configuration.output.forEach(({ id, connectId }) => {
      // 为出口创建唯一标识
      // ids++;
      // idMaps[id] = ids;
      idMaps[id] = id;

      // 如果有子树，则继续深度优先遍历
      if (connectId) countNodeData(nodeMap[connectId]);
    });
  };
  console.log("post rst.nodes----:",rst.nodes);

  // 第一步先找到入口，然后执行深度优先遍历所有节点
  const entry = nodeList.find((d) => d.entryId === null);
  if (entry) {
    // 如果是HTTP事件，则注入action、authCheck值
    if (entry.nodeType === httpEvent.id) {
      rst.action = entry.configuration.action || "";
      rst.authCheck = entry.configuration.authCheck || 0;
    }
    countNodeData(entry);
  }

  // 插入入口、出口、循环结束节点专属的备用父节点列表等信息
  rst.nodes.forEach((d) => {
   
    const { id } = d;
    const {
      x,
      y,
      entryId,
      pOutputId,
      configuration: { output },
      pIdpOutputIdSpare,
    } = nodeMap[idReverseMaps[id]];
    let endlooppid = pIdpOutputIdSpare.map((_arr:string[])=>_arr.join(",")).join(";");
    d.location = [
      x + "," + y, // 坐标信息
      idMaps[entryId], // 入口信息
      idMaps[pOutputId], // 父节点出口信息
      output.map(({ id, connectId, connectEntryId }: OutputProps) =>
        [
          idMaps[id],
          idMaps[connectId + ""],
          idMaps[connectEntryId + ""],
        ].join(",")
      ).join(";"), // 出口列表信息
      endlooppid, // 循环结束节点专属的 备用父节点列表信息
    ].join("|");

  });

  // 线条信息计算
  const newLine = lineList.map((d) => {
    const { uniqueId, id, outputId, toId, entryId } = d;
    // ids++;
    return {
      ...d,
      // uniqueId: ids,
      uniqueId: uniqueId,
      id: idMaps[id],
      outputId: idMaps[outputId],
      toId: toId ? idMaps[toId] : null,
      entryId: entryId ? idMaps[entryId] : null,
    };
  });
  rst.lines = JSON.stringify(newLine);

  return rst;
};
