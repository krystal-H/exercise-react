import { connect } from "react-redux";
import { changeSearch } from "../store/action";
import Search from "../components/Content/Chooser/Search";

const mapDispatchToProps = (dispatch: Function) => ({
  changeSearch: (s: string) => dispatch(changeSearch(s)),
});

export default connect(undefined, mapDispatchToProps)(Search);
