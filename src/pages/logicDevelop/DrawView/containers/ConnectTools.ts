import { connect } from "react-redux";
import { AppState } from "../store/types";
import Tools from "../components/Content/View/Tools";
import {
  toggleChooserView,
  toggleConfigurationView,
  toggleLogView,
} from "../store/action";

const mapStateToProps = (state: AppState) => {
  const {
    showChooser,
    showConfiguration,
    showLog,
    showLogHeight,
    readonly,
  } = state.get("drawView");
  return {
    showChooser,
    showConfiguration,
    showLog,
    showLogHeight,
    readonly,
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  toggleChooserView: () => dispatch(toggleChooserView()),
  toggleConfigurationView: () => dispatch(toggleConfigurationView()),
  toggleLogView: () => dispatch(toggleLogView()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
