export interface SelectItemProps {
  id: string | number;
  value: string;
  [others: string]: any;
}

export interface AnyData {
  [props: string]: any;
}

export interface Point {
  x: number;
  y: number;
  [others: string]: any;
}

export interface SendNodeData {
  id: number; // 全局唯一标识
  nodeName: string; // 节点名称
  nodeType: string | number; // 节点类型

  pid: number | null; // 父节点唯一标识

  location: string; // 包含坐标等信息，格式如下：
  // x,y|entryId|pOutputId|id,connectId,connectEntryId;id,connectId,connectEntryId

  input: string; // 专属节点配置信息

  [others: string]: any;
}

export interface SendData {
  projectId?: number | null;
  serviceId?: number | null;
  flowId?: number | null;
  action: string; // HTTP事件特有参数，同时在HTPP事件属性配置中也同时有，其他触发事件时，此值均为空字符串
  authCheck:number; // HTTP事件特有参数，同时在HTPP事件属性配置中也同时有，其他触发事件时，此值均为空
  oriAction: string; // 编辑之前的action值
  nodes: SendNodeData[]; // 节点列表
  lines: string; // 描述线条列表的JSON字符串
}

export interface OutputProps {
  id: string; // 该出口的唯一标识
  connectId?: string; // 入口节点Id
  connectEntryId?: string; // 入口Id
  [others: string]: any;
}

export interface ConfigurationProps {
  name: string; // 该节点的名字
  output: OutputProps[]; // 出口列表
  [others: string]: any;
}

export interface NodeItem {
  id: string; // 节点的唯一标识
  nodeType: string; // 节点类型标识
  x: number; // 相对于画布的x轴距离
  y: number; // 相对于画布的y轴距离

  entryId: string | null; // 本节点入口Id

  pId: string | null; // 父节点唯一标识
  pOutputId: string | null; // 父节点出口Id

  isError: boolean; // 是否配置参数有错误

  configuration: ConfigurationProps; // 节点的配置项数据

  pIdpOutputIdSpare?:any,//只有循环结束节点才有用的属性

  // 以下为"临时属性"，仅供作为临时参考值，不可用于视图等情况
  deep?: number; // NOTE [临时属性] 当前节点所在深度，只有在整理节点时，才会赋值与使用
  height?: number; // NOTE [临时属性]
  top?: number; //  NOTE [临时属性] 子孙当中的最高点
  bottom?: number; //  NOTE [临时属性] 子孙当中的最低点
}

export interface LineItem {
  uniqueId: string; // 唯一标识

  id: string; // 开始节点的唯一标识
  outputId: string; // 开始节点的出口id

  startPoint: Point; // 开始坐标
  path: string; // svg线路

  toId: string | null; // 指向节点的唯一标识
  entryId: string | null; // 指向节点的入口Id
}

export interface ContextMenuProps {
  show: boolean;
  type: ContextMenuType;
  id: string | null; // 当前所属唯一标识
  x: number;
  y: number;
}

export interface CopyItem {
  type: CopyType; // 是复制还是粘贴
  nodeData: NodeItem; // 拷贝的数据原型
}

export enum CodeType {
  Success = 0, // 成功
  Failure = 1, // 失败
}

export interface DebugItemObject {
  code: CodeType; // 失败还是成功
  data: string | object; // 具体调试数据
}

export interface ProductProps {
  isLoading: boolean; // 是否在查询中
  isError: boolean; // 是否查询中报错
  list: SelectItemProps[]; // 产品列表
}

export interface DebugObject {
  [id: string]: DebugItemObject;
}

export interface SystemState {
  readonly: boolean; // 是否是只读模式

  action: string; // HTTP事件的action值，没有则是空字符串
  authCheck:number;
  projectId: number | null; // 服务所属项目id
  serviceId: number | null; // 开发服务流程图id
  flowId: number | null; // 流程id
  productionName: string | null; // 项目名
  mustSave: boolean; // 必须要保存才能执行调试发布操作
  testEnv: Status; // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除  999-调试中
  proEnv: Status; // 生产环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除

  isSaving: boolean; // 测试环境节点代码是否正在保存
  isInDeploy: boolean; // 测试环境是否正在部署
  isInDebug: boolean; // 测试环境是否正在调试
  isInPublish: boolean; // 正式环境是否在发布
  isopenPublish:boolean;// 发布前打开服务运行参数弹窗

  showChooser: boolean; // 显示开发节点选择器
  showConfiguration: boolean; // 显示当前开发节点配置信息
  showConfigurationWithFullScreen: boolean; // 配置信息是否显示全屏
  showLog: boolean; // 显示日志栏
  showLogHeight: number; // 日志栏高度

  showDebugInput: boolean; // 是否显示调试参数输入弹框

  searchText: string; // 搜索内容

  root: null | string; // 保存流程图后的根节点id，只有以下两种情况会发生变更：
  // 1.一开始拉取服务开发数据时
  // 2.服务保存成功时

  nodeList: NodeItem[]; // 当前所画节点列表
  nodeMap: object; //  当前所画全部节点映射

  debuggedData: object | null; // 当前已调试的节点数据(原始数据)（这是个数组结构！？）
  debuggedResult: object | null; // 整个返回的结果（根据debuggedData解析得出）
  debuggedOutput: any[] | null; // 全局日志节点（根据debuggedData解析得出）
  debuggedMap: DebugObject; // 当前已调试的每个节点情况,以节点id为key的平面结构

  lineList: LineItem[]; // line列表
  lineMap: object; // 当前所画全部line映射，以LineItem的outputId为key

  connectId: string | null; // 当前正在连线的线条Key
  lineArrow: Point | null; // 连线时产生的箭头

  contextMenu: ContextMenuProps; // 右键菜单属性

  chooseId: null | string; // 当前选中节点id或线条id
  chooseLineId: null | string; // 临时悬浮的选中线条id

  copy: CopyItem | null; // 当前剪切或复制的节点信息

  stackHistory: string[]; // 回滚历史操作堆栈

  isLoading: boolean; // 保存中或者发布中状态

  /* 全局相关参数 */
  product: ProductProps; // 产品相关
  api: ProductProps; // 项目内api列表
  platformapi: ProductProps; // 平台内api列表
  mqTopic: ProductProps; // 项目内MQ的topic队列列表
  rocketMQTopic: ProductProps; // 项目内RocketMQ的topic列表
  database: ProductProps; // 项目内数据源列表
  redis: ProductProps; // 项目内Redis数据源列表
}

export enum ParamType {
  String = 0, // String（字符型）
  Int = 1, // Int（整数型）
  Long = 2, // Long（长整型）
  Float = 3, // Float（浮点型）
  Double = 4, // Double（双精度）
  Boolean = 5, // Boolean（布尔型）
  Enum = 6, // Enum（枚举型）
}

export enum ValueType {
  Number = 0, // 数值型
  Boolean = 1, // 布尔型
  String = 2, // 字符型
  Time = 3, // 时间型
  Array = 4, // 数组型
  Object = 5, // 结构型
}

export enum ItemType {
  Source = 0, // 源数据
  Target = 1, // 目标数据
}
export enum DataValueType {
  Value = 0, // 来自固定值
  Node = 1, // 来自节点
  Param = 2, // 来自变量
}

export enum OutputType {
  AUTO, // 自动式输出类型，以input输入框来自定义，不填则是代表整个返回值
  LIST, // 列表式输出类型，可选择返回值的某个具体的键值，如HTTP事件中的入参列表
}

export enum NodeJsTemplateType {
  BLANK = 0, // 空白模板
  DEVICEACCESS = 1, // 设备接入
}

export interface ParentItemProps extends SelectItemProps {
  type: OutputType;
  list: SelectItemProps[];
}

export enum ConnectNodeType {
  StartPoint, // 起点
  EndPoint,
}

export enum ContentType {
  Node = 0, // 选择节点输出
  Value = 1, // 直接输入内容
}

export enum authCheckType {
  NoNeed = 0, // 不鉴权
  Need = 1, // 鉴权
}

export enum messageDataType {
  Stream = 1, // 流
  String = 2, // 字符串
}



export enum RequireType {
  Required = 0, // 必填项
  Unrequired = 1, // 非必填项
}

export enum ChooseType {
  ProductMode = 0, // 产品数据模型
  Node = 1, // 节点输出
}

export enum QueueType {
  ProductProtocol = 0, // 产品协议队列
  UserDefine = 1, // 自定义队列
}

export enum KeyValueType {
  Get = 0, // KV存储获取
  Set = 1, // KV存储写入
  Delete = 2, // KV存储删除
}

export enum Status {
  Developing = 0, // 开发中
  Compiled = 1, // 编译完成
  Running = 2, // 运行中
  Stopped = 3, // 停止
  Deleted = 4, // 删除

  Debugging = 999, // 调试中
}

export interface NodeControlProps {
  id: string; // 配置的节点类型唯一标识
  name: string; // 节点名称
  nodeType: number; // 节点类型，与后台相对应的数字
  iconCls: string; // 节点图标的className，关联到svg图片
  description: string; // 节点的描述信息
  apiDocumentLink?: string; // 该节点类型的文档地址
  entryNum: number; // 节点入口数量
  output: [number, number, number]; // 出口数量，三个值分别对应默认值、最小值、最大值

  configuration: React.ReactNode; // 指向的配置节点组件
  initData?: () => object; // 节点配置的初始化参数

  outputType?: OutputType; // 节点的输出类型
  outputValue?: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem
  ) => SelectItemProps[]; // 具体的输出列表

  // 当拖拽节点放置进视图时，是否可以放置的判断方法
  canDrop?: (
    state: SystemState,
    nodeType: string,
    x: number,
    y: number,
    nodeConfigrationList: NodeControlProps[],
    nodeConfigurationMaps: object
  ) => string | false;

  // 当被连线时，触发的修改配置信息方法
  afterConnect?: (
    connectType: ConnectNodeType,
    configuration: ConfigurationProps,
    startNode: NodeItem,
    endNode: NodeItem,
    state: SystemState
  ) => void;

  // 用户验证该节点的参数配置是否正确
  // 1.用户修改节点配置参数时的参数验证方法
  // 2.用户最终保存流程图时的验证方法
  validate: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState
  ) => false | string;

  // 提交数据时，根据该方法来处理成提交给后台的参数形式
  toData: (
    configuration: ConfigurationProps,
    nodeItem: NodeItem,
    state: SystemState,
    idMaps?: object,
    idReverseMaps?: object
  ) => object;

  // 编辑时，拉取流程图的数据时，将数据转化为本地
  toConfiguration: (data: AnyData) => object;
}

export enum DragType {
  NULL = "",
  PUTIN = "putIn",
  MOVE = "move",
  CONNECT = "connect",
  LOG = "log", // 移动提高日志栏高度
}

// 右键菜单类型
export enum ContextMenuType {
  NULL = "",
  NODE = "node",
  LINE = "line",
  CONTEXT = "context",
}

export enum CopyType {
  CUT = "cut",
  COPY = "copy",
}

export { AppState, formType, actionProps } from "../../../../types";
