import { connect } from "react-redux";
import Configuration from "../components/Content/Configuration";
import { AppState } from "../store/types";
import {
  changeNodeConfiguration,
  nodeError,
  getParents,
  fullScreen,
} from "../store/action";

const mapStateToProps = (state: AppState) => {
  const {
    readonly,
    showConfiguration,
    showConfigurationWithFullScreen,
    chooseId,
    nodeMap,
    debuggedData, // 当前已调试的节点数据（树结构）
    debuggedMap, // 当前已调试的每个节点情况,以节点id为key的平面结构
    testEnv,
    product,
    api,
    platformapi,
    mqTopic,
    rocketMQTopic,
    database,
    redis,
  } = state.get("drawView");
  const nodeItem = nodeMap[chooseId];
  return {
    readonly,
    isShow: showConfiguration,
    isFullScreen: showConfigurationWithFullScreen,
    nodeItem: nodeItem ? { ...nodeItem } : undefined,
    parents: getParents(nodeItem, nodeMap), // FIXME 理论上来讲，不可以在这里进行读取，因为每一次页面触发更新，这个方法都会被执行一次，然而这个方式执行还是需要挺多时间的，此处留给后面去解决
    debuggedData,
    debuggedMap,
    testEnv,
    product,
    api,
    platformapi,
    mqTopic,
    rocketMQTopic,
    database,
    redis,
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  changeNodeConfiguration: (nodeId: string, config: object) =>
    dispatch(changeNodeConfiguration(nodeId, config)),
  nodeError: (nodeId: string, isError: boolean = true) =>
    dispatch(nodeError(nodeId, isError)),
  fullScreen: () => dispatch(fullScreen()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Configuration);
