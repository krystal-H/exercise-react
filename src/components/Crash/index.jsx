import React, { Component } from "react";
import { Result, Button } from "antd";
import "./crash.scss";

class Crash extends Component {
    render() {
        const { tryAgain, height, style, useWrap = true } = this.props;
        let _style = {};
        if (height) {
            _style = { height: height + "px" };
        }
        if (style) {
            _style = { ..._style, ...style };
        }
        const inner = (
            <Result
                className={useWrap ? "lcp-null-inner" : undefined}
                status="error"
                title="查询失败"
                subTitle="请确认网络连接是否正常."
                extra={
                    <Button type="primary" onClick={tryAgain}>
                        重 试
                    </Button>
                }
            />
        );
        if (useWrap) {
            return (
                <div className="lcp-null-wrap" style={_style}>
                    {inner}
                </div>
            );
        }
        return inner;
    }
}

export default Crash;
