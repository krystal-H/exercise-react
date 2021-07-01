import { connect } from "react-redux";
import View from "../components/Content/View";
import { AppState } from "../store/types";

const mapStateToProps = (state: AppState) => {
  const {
    readonly,
    showChooser,
    showConfiguration,
    showLog,
    showLogHeight,
  } = state.get("drawView");
  return {
    readonly,
    showChooser,
    showConfiguration,
    showLog,
    showLogHeight,
  };
};

export default connect(mapStateToProps)(View);
