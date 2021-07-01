import { connect } from "react-redux";
import { AppState } from "../store/types";
import Log from "../components/Content/View/Log";
import { toggleLogView, toggleLogFullscreen } from "../store/action";

const mapStateToProps = (state: AppState) => {
  const { showLog, showLogHeight, debuggedResult, debuggedOutput } = state.get(
    "drawView"
  );
  return {
    isShow: showLog,
    height: showLogHeight,
    debuggedResult,
    debuggedOutput,
  };
};

const mapDispatchToProps = (dispatch: Function) => ({
  toggle: () => dispatch(toggleLogView()),
  toFullscreen: () => dispatch(toggleLogFullscreen()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Log);
