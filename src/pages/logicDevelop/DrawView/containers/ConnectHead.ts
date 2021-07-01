import { connect } from "react-redux";
import { AppState, SystemState } from "../store/types";
import {
  undo,
  save,
  clearNode,
  publish,
  deploy,
  getParams,
  debug,
  showDebugInput,
  openPublish,
} from "../store/action";
import Head from "../components/Head";

const mapStateToProps = (state: AppState) => {
  const _state = state.get("drawView");
  const {
    serviceId,
    productionName,
    mustSave,
    testEnv,
    proEnv,
    stackHistory,
    isSaving,
    isInDeploy,
    isInDebug,
    isInPublish,
    isopenPublish,
    root,
    nodeMap,
  } = _state;
  const { isHTTP, params } = getParams(root, nodeMap);
  return {
    productionName,
    mustSave,
    testEnv,
    proEnv,
    stackHistory,
    isSaving,
    isInDeploy,
    isInDebug,
    isInPublish,
    isopenPublish,

    serviceId,
    isHTTP, // 根节点是否是HTTP事件
    params, // 找到根节点的入参列表

    state: _state,
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  undo: () => dispatch(undo()),
  clearNode: () => dispatch(clearNode()),
  save: (state: SystemState, nextToPublish: any=false) =>
    dispatch(save(state, nextToPublish)),
  deploy: (data: object) => dispatch(deploy(data)),
  publish: (data: object) => dispatch(publish(data)),
  showParamsModal: () => dispatch(showDebugInput()),
  debug: (data: object) => dispatch(debug(data)),
  openPublish:(num:number)=>dispatch(openPublish(num))
});

export default connect(mapStateToProps, mapDispatchToProps)(Head);
