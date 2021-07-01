import React, { Component } from "react";
import { Input } from "antd";

interface SearchProps {
  changeSearch: Function;
}

class Search extends Component<SearchProps> {
  time: NodeJS.Timeout;
  change = (e: React.SyntheticEvent) => {
    const v = (e.target as HTMLInputElement).value;
    clearTimeout(this.time);
    this.time = setTimeout(() => {
      this.search(v);
    }, 500);
  };

  search = (v: string) => {
    this.props.changeSearch(v);
  };

  public render(): JSX.Element {
    // const { productionName } = this.props;
    return (
      <div className="draw-search">
        <div className="draw-search-inner">
          <Input.Search
            placeholder="根据节点名搜索"
            size="small"
            onChange={this.change}
            onSearch={this.search}
          />
        </div>
      </div>
    );
  }
}

export default Search;
