import { connect } from "react-redux";
import { AppState } from "../store/types";
import LoadingModal from "../components/LoadingModal";

const mapStateToProps = (state: AppState) => {
  const { isLoading } = state.get("drawView");
  return { isLoading };
};

export default connect(mapStateToProps)(LoadingModal);
