import React, { Component } from "react";
import decode from "./decode";
import {
  KeyObjectProps,
  idName,
  typeName,
  keyName,
  valueName,
  keysName,
  parentTypeName,
  Types,
} from "./types";

import "./index.less";

interface ObjectViewProps {
  keyName: string; // 键名
  data: object; // 对象数据
}

interface ObjectViewState {
  data: KeyObjectProps; // 转译后的数据
  close: object;
}

class ObjectView extends Component<ObjectViewProps, ObjectViewState> {
  data: object;
  constructor(props: ObjectViewProps) {
    super(props);
    this.data = props.data;
    this.state = {
      data: decode(props.keyName, props.data),
      close: {}, // 哪些需要关闭
    };
  }

  componentDidUpdate() {
    const { keyName, data } = this.props;
    // 如果变更了data数据
    if (this.data !== data) {
      this.data = data;
      this.setState({
        data: decode(keyName, data),
        close: {}, // 重置参数
      });
    }
  }

  toggle = (id: number, _close: boolean) => {
    const { close } = this.state;
    this.setState({ close: { ...close, [id]: _close } });
  };

  getOne = (obj: KeyObjectProps, close: object) => {
    const {
      [idName]: id,
      [typeName]: type,
      [keyName]: _key,
      [valueName]: _value,
      [keysName]: keys,
      [parentTypeName]: parentType,
    } = obj;

    const isString = type === Types.String,
      isArray = type === Types.Array,
      isObject = type === Types.Object,
      key = parentType === Types.Array ? _key : '"' + _key + '"',
      value = isString
        ? '"' + _value + '"'
        : type === Types.Boolean ||
          type === Types.Null ||
          type === Types.Undefined
        ? _value + ""
        : _value,
      canClose = isArray || isObject,
      sign = isArray ? ["[", "]"] : ["{", "}"],
      titCls = canClose ? "ov-pointer" : undefined,
      valCls = "ov-value-" + type,
      isNull = keys.length === 0,
      isClose = close[id] === undefined && isNull ? true : !!close[id],
      showEnd = canClose && !isClose,
      needChildren = showEnd && !isNull,
      iconCls = isClose ? "ov-collapsed-icon" : "ov-expanded-icon",
      iconCol = isClose ? "#333" : "#586e75",
      iconPath = isClose ? "M0 14l6-6-6-6z" : "M0 5l6 6 6-6z";

    return (
      <div className="ov-key-value">
        <span className="ov-line">
          <span className={titCls} onClick={() => this.toggle(id, !isClose)}>
            {canClose ? (
              <div className="ov-icon-container">
                <span className={iconCls}>
                  <svg viewBox="0 0 15 15">
                    <path d={iconPath} fill={iconCol}></path>
                  </svg>
                </span>
              </div>
            ) : null}
            <span className="ov-key">{key}</span>
            <span className="ov-colon">:</span>
            {canClose ? (
              <>
                <span className="ov-bracket">{sign[0]}</span>
                {isClose ? (
                  <>
                    {isNull ? null : <div className="ov-ellipsis">...</div>}
                    <span className="ov-bracket">{sign[1]}</span>
                  </>
                ) : null}
              </>
            ) : null}
          </span>
          {canClose ? (
            <div className="ov-meta-data">
              <span className="ov-size">{keys.length} items</span>
            </div>
          ) : null}
          {!canClose ? (
            <div className="ov-value">
              <span className={valCls}>{value}</span>
            </div>
          ) : null}
        </span>
        <div className="ov-children">
          {needChildren ? (
            <>
              {keys.map((__key) => {
                return (
                  <React.Fragment key={__key}>
                    {this.getOne(obj[__key], close)}
                  </React.Fragment>
                );
              })}
            </>
          ) : null}
        </div>
        {showEnd ? <div className="ov-end">{sign[1]}</div> : null}
      </div>
    );
  };

  public render(): JSX.Element | null {
    const { data, close } = this.state;

    return <div className="ov-wrap">{this.getOne(data, close)}</div>;
  }
}

export default ObjectView;
