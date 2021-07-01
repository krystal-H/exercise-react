import React, { Component } from "react";
import { Empty } from "antd";
import "../Crash/crash.scss";

class EmptyData extends Component {
    render() {
        const { height, description, style, children } = this.props;
        let _style = {};
        if (height) {
            _style = { height: height + "px" };
        }
        if (style) {
            _style = { ..._style, ...style };
        }
        return (
            <div className="lcp-null-wrap" style={_style}>
                <Empty className="lcp-null-inner" description={description}>
                    {children}
                </Empty>
            </div>
        );
    }
}

export default EmptyData;
