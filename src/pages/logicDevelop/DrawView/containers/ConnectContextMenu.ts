import { connect } from "react-redux";
import ContextMenu from "../components/Content/ContextMenu";
import { AppState } from "../store/types";
import {
  deleteNode,
  deleteLine,
  clearNode,
  cutNode,
  copyNode,
  pasteNode,
  undo,
} from "../store/action";

const mapStateToProps = (state: AppState) => {
  const {
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    contextMenu,
    stackHistory,
    copy,
  } = state.get("drawView");
  return {
    nodeList,
    nodeMap,
    lineList,
    lineMap,
    contextMenu,
    stackHistory,
    copy,
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  deleteNode: () => dispatch(deleteNode()),
  deleteLine: () => dispatch(deleteLine()),
  cutNode: () => dispatch(cutNode()),
  copyNode: () => dispatch(copyNode()),
  pasteNode: () => dispatch(pasteNode()),
  clearNode: () => dispatch(clearNode()),
  undo: () => dispatch(undo()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContextMenu);
