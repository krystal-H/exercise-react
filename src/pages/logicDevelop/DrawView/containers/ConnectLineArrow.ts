import { connect } from "react-redux";
import LineArrow from "../components/Content/View/LineArrow";
import { AppState } from "../store/types";

const mapStateToProps = (state: AppState) => {
  const { lineArrow } = state.get("drawView");
  return { lineArrow };
};

export default connect(mapStateToProps)(LineArrow);
