import { connect } from "react-redux";
// import { getData } from "../store/action";
import ChooserList from "../components/Content/Chooser/ChooserList";
import { AppState } from "../store/types";

const mapStateToProps = (state: AppState) => {
  const { searchText } = state.get("drawView");
  return { searchText };
};

const mapDispatchToProps = (dispatch: Function) => ({
  // getData: (noList: boolean = false) => dispatch(getData(noList)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChooserList);
