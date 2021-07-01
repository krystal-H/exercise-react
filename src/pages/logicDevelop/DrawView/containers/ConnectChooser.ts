import { connect } from "react-redux";
import Chooser from "../components/Content/Chooser";
import { AppState } from "../store/types";

const mapStateToProps = (state: AppState) => {
  const { showChooser } = state.get("drawView");
  return { showChooser };
};

export default connect(mapStateToProps)(Chooser);
