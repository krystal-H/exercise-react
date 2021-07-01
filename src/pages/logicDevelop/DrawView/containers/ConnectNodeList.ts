import { connect } from "react-redux";
import NodeList from "../components/Content/View/NodeList";
import { AppState } from "../store/types";
import { changeChooseId } from "../store/action";

const mapStateToProps = (state: AppState) => {
  const {
    readonly,
    nodeList,
    nodeMap,
    testEnv,
    debuggedMap,
    chooseId,
  } = state.get("drawView");
  // console.log("---nodeList---",nodeList)
  return { readonly, nodeList, nodeMap, testEnv, debuggedMap, chooseId };
};

const mapDispatchToProps = (dispatch: Function) => ({
  changeChooseId: (id: string | null) => dispatch(changeChooseId(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NodeList);
