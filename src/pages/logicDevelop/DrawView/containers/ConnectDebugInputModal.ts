import { connect } from "react-redux";
import { AppState } from "../store/types";
import DebugInputModal from "../components/DebugInputModal";
import { debug, hideDebugInput, getParams } from "../store/action";

const mapStateToProps = (state: AppState) => {
  const { serviceId, showDebugInput, root, nodeMap } = state.get("drawView");
  const { isHTTP, params } = getParams(root, nodeMap);
  return {
    isShow: showDebugInput,

    serviceId,
    isHTTP, // 根节点是否是HTTP事件
    params, // 找到根节点的入参列表
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  hide: () => dispatch(hideDebugInput()),
  debug: (data: object) => dispatch(debug(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DebugInputModal);
