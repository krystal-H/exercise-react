const same = "drawview/";

export const INIT: string = same + "INIT";

export const LOADING: string = same + "loading";
export const SAVEOK: string = same + "saveOK"; // 保存成功
export const DEPLOYOK: string = same + "deployOK"; // 部署成功
export const DEBUGOK: string = same + "debugOK"; // 调试成功

// 保存、部署、调试、发布的进行状态
export const SAVING: string = same + "saving"; // 保存中
export const SAVED: string = same + "saved"; // 保存结束，忽视结果
export const DEPLOYING: string = same + "deploying"; // 部署中
export const DEPLOYED: string = same + "deployed"; // 部署结束，忽视结果
export const DEBUGGING: string = same + "debugging"; // 调试中
export const DEBUGGED: string = same + "debugged"; // 调试结束，忽视结果
export const PUBLISHING: string = same + "publishing"; // 发布中
export const PUBLISHED: string = same + "published"; // 发布结束，忽视结果
export const OPENPUBLISH: string = same + "openpublish"; // 

// 弹出调试输入弹窗
export const SHOWDEBUGINPUT: string = same + "showDebugInput";
export const HIDEDEBUGINPUT: string = same + "hideDebugInput";

// 初始化各类列表数据
export const LISTLOADING: string = same + "listLoading";
export const LISTLOADED: string = same + "listLoaded";
export const LISTLOADCRASH: string = same + "listLoadCrash";

// 初始拉取节点编排数据
export const READ: string = same + "read";

export const TOGGLECHOOSER: string = same + "toggleChooser";
export const TOGGLECONFIGURATION: string = same + "toggleConfiguration";
export const TOGGLELOG: string = same + "toggleLog";
// 全屏
export const LOGFULLSCREEN: string = same + "logFullScreen";
// 改变日志栏高度
export const CHANGELOGHEIGHT: string = same + "changeLogHeight";

// 搜索参数
export const CHANGESEARCH: string = same + "changeSearch";

// 弹出右键菜单
export const SHOWCONTEXTMENU: string = same + "showContextMenu";
export const HIDECONTEXTMENU: string = same + "hideContextMenu";

// 设置选中节点或线条
export const CHANGECHOOSEID: string = same + "changeChooseId";
// 设置临时悬浮的选中线条
export const CHANGECHOOSELINEID: string = same + "changeChooseLINEID";

// 拖拽节点事件
export const DROP: string = same + "drop";
// 移动节点事件
export const MOVE: string = same + "move";
// 创建连线
export const CREATELINE: string = same + "createLine";
// 连线时的箭头移动事件
export const LINETO: string = same + "lineTo";
// 取消当前连线事件
export const CONNECTCANCEL: string = same + "connectCancel";
// 连线成功事件
export const CONNECTOK: string = same + "connectOK";

// 删除指定连线
export const DELETELINE: string = same + "deleteLine";
// 删除指定节点
export const DELETENODE: string = same + "deleteNode";

// 节点配置信息变更
export const CHANGENODECONFIGURATION: string = same + "changeNodeConfiguration";

// 节点配置信息出错，一般在节点配置结束，或全体提交时触发判断
export const NODEERROR: string = same + "nodeError";

// 全屏
export const FULLSCREEN: string = same + "fullScreen";

// 头部右侧操作项
export const UNDO: string = same + "undo";

// 剪切节点
export const CUTNODE: string = same + "cutNode";
// 复制节点
export const COPYNODE: string = same + "copyNode";
// 粘贴节点
export const PASTENODE: string = same + "pasteNode";
// 整理节点
export const CLEARNODE: string = same + "clearNode";
