import { connect } from "react-redux";
import LineList from "../components/Content/View/LineList";
import { AppState } from "../store/types";
import { changeChooseId, changeChooseLineId } from "../store/action";

const mapStateToProps = (state: AppState) => {
  const { readonly, lineList, chooseId, chooseLineId } = state.get("drawView");
  // console.log("---999---",lineList);
  return { readonly, lineList, chooseId, chooseLineId };
};

const mapDispatchToProps = (dispatch: Function) => ({
  changeChooseId: (id: string | null) => dispatch(changeChooseId(id)),
  changeChooseLineId: (id: string | null) => dispatch(changeChooseLineId(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LineList);
