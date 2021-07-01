import React, { Component } from "react";
import { Input, Select, DatePicker } from "antd";
import {
  DataValueType,
  ParentItemProps,
  ValueType,
  OutputType,
} from "../../../../../store/types";
import {
  valueTypeList,
  compareParamTypeList,
  booleanList,
  parentsDefaultList,
  compareParamTypeAddList,
  format,
} from "../../../../../store/constants";
import moment from "moment";
import CodeView from "../../../../../../../../components/CodeView2";

interface ValueMatchProps {
  readonly?: boolean; // 是否是只读模式

  onlyNumber?: boolean; // 是否需要固定固定值的类型为“数值型”，且锁定为disabled的
  onlyString?: boolean; // 是否需要固定固定值的类型为“字符型”，且锁定为disabled的
  onlyArray?: boolean; // 是否需要固定固定值的类型为“字符型”，且锁定为disabled的

  moreValueType?: boolean; // 是否添加“数组、结构型”列表，针对Http返回节点

  source: DataValueType; // 源数据类型1
  sourceType: number | string; // 源数据类型2
  sourceValue: string | moment.Moment; // 源数据：默认值

  parents: ParentItemProps[]; // 父节点列表

  onChange: (config: object) => void;
}

const blockSty = { width: "100%" },
  defaultBoolean = booleanList[0].id,
  defaultParentNode = parentsDefaultList[0].id;

class ValueMatch extends Component<ValueMatchProps> {
  defaultType: string | number;
  state = {
    mustReCode: false, // 是否是必须要更新codeView的情况
  };
  constructor(props: ValueMatchProps) {
    super(props);
    const {
      onlyNumber = false,
      onlyString = false,
      onlyArray=true,
      moreValueType = false, // 默认不添加“数组、结构型”列表
      
    } = props;
    const sourceTypeList = onlyNumber
      ? compareParamTypeList.slice(0, 1) // 仅可选数值型
      : onlyString
      ? compareParamTypeList.slice(2, 3) // 仅可选字符串
      : onlyArray
      ? compareParamTypeAddList.slice(0, 1) 
      : moreValueType
      ? compareParamTypeList.concat(compareParamTypeAddList) // 需要添加“数组、结构型”列表
      : compareParamTypeList; // 普通情况
    this.defaultType = sourceTypeList[0].id;
  }

  componentDidUpdate() {
    if (this.state.mustReCode) {
      this.setState({ mustReCode: false });
    }
  }

  getValue = (type: number | string) => {
    if (type === ValueType.Boolean) {
      return defaultBoolean;
    }
    if (type === ValueType.Time) {
      return undefined;
    }
    if (type === ValueType.Array) {
      return "[]";
    }
    if (type === ValueType.Object) {
      return `{
}`;
    }
    return "";
  };
  changeFirst = (source: DataValueType) => {
    const type =
        source === DataValueType.Value ? this.defaultType : defaultParentNode,
      value = this.getValue(type);
    this.props.onChange({
      source: source, // 源数据类型1
      sourceType: type, // 源数据类型2
      sourceValue: value, // 源数据：默认值
    });
  };
  changeSecond = (type: number | string, isValueEmpty: boolean = false) => {
    this.props.onChange({
      sourceType: type, // 源数据类型2
      sourceValue: isValueEmpty ? "" : this.getValue(type),
    });
    if (type === ValueType.Array || type === ValueType.Object) {
      this.setState({ mustReCode: true });
    }
  };
  changeThird = (value: string | moment.Moment) => {
    this.props.onChange({
      sourceValue: value, // 源数据：默认值
    });
  };

  // 自定义列表
  public render(): JSX.Element {
    const { mustReCode } = this.state;
    const {
      source,
      sourceType,
      sourceValue,
      parents,
      readonly = false,
      onlyNumber = false,
      onlyString = false,
      onlyArray=false,
      moreValueType = false, // 默认不添加“数组、结构型”列表
    } = this.props;
    const isValue = source === DataValueType.Value,
      isNode = source === DataValueType.Node,
      isArray = sourceType === ValueType.Array,
      isObject = sourceType === ValueType.Object,
      sourceTypeList =
        isValue && onlyNumber
          ? compareParamTypeList.slice(0, 1) // 仅可选数值型
          : isValue && onlyString
          ? compareParamTypeList.slice(2, 3) // 仅可选字符串
          : isValue && onlyArray
          ? compareParamTypeAddList.slice(0, 1)
          : isValue && moreValueType
          ? compareParamTypeList.concat(compareParamTypeAddList) // 需要添加“数组、结构型”列表
          : isValue
          ? compareParamTypeList // 普通情况
          : parents;

    const thirdFunc0 = (e: React.SyntheticEvent) =>
        this.changeThird(
          (e.target as HTMLInputElement).value.replace(/[^\d.]/g, "")
        ),
      thirdFunc = (e: React.SyntheticEvent) =>
        this.changeThird((e.target as HTMLInputElement).value),
      thirdFunc2 = (value: string) => this.changeThird(value),
      thirdFunc3 = (value: moment.Moment) => this.changeThird(value);

    let next = null;
    if (isValue) {
      if (sourceType === ValueType.Number || sourceType === ValueType.String) {
        next = (
          <Input
            placeholder={
              "请输入一个" +
              (sourceType === ValueType.Number ? "数值" : "字符串")
            }
            onChange={sourceType === ValueType.Number ? thirdFunc0 : thirdFunc}
            value={sourceValue as string}
            disabled={readonly}
          />
        );
      } else if (sourceType === ValueType.Boolean) {
        next = (
          <Select
            placeholder="请选择"
            value={sourceValue}
            onChange={thirdFunc2}
            disabled={readonly}
          >
            {booleanList.map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
      } else if (sourceType === ValueType.Time) {
        next = (
          <DatePicker
            placeholder="请选择日期和时间"
            format={format}
            style={blockSty}
            showToday={false}
            showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
            value={sourceValue as moment.Moment}
            onChange={thirdFunc3}
            disabled={readonly}
          />
        );
      } else if (isArray || isObject) {
        next = !mustReCode ? (
          <CodeView
            mode={isObject ? "json" : ""}
            height={145}
            readOnly={readonly}
            code={sourceValue as string}
            onChange={thirdFunc2}
          />
        ) : null;
      }
    } else if (isNode) {
      const { type, list } = parents.find((d) => d.id === sourceType) || {};
      if (type === OutputType.LIST) {
        next = (
          <Select
            placeholder="请选择"
            value={sourceValue}
            onChange={thirdFunc2}
            disabled={readonly}
          >
            {(list || []).map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
      } else {
        next = (
          <Input
            placeholder="不填写变量名则默认为整个返回值"
            onChange={thirdFunc}
            value={sourceValue as string}
            disabled={readonly}
          />
        );
      }
    }
    return (
      <>
        <div className="draw-menu-group">
          {valueTypeList.map(({ id, value, disabled }) => {
            const isSelected = source === id,
              ckFunc =
                isSelected || disabled || readonly
                  ? undefined
                  : () => this.changeFirst(id);
            return (
              <div
                className={
                  "draw-menu" +
                  (isSelected ? " draw-menu-selected" : "") +
                  (disabled || readonly ? " draw-menu-disabled" : "")
                }
                onClick={ckFunc}
                key={id}
              >
                {value}
              </div>
            );
          })}
        </div>
        <div className="draw-line">
          <Select
            placeholder="请选择"
            value={sourceType}
            disabled={(isValue && (onlyNumber || onlyString  || onlyArray)) || readonly}
            onChange={(value: number | string) =>
              this.changeSecond(value, isNode)
            }
          >
            {(sourceTypeList as any[]).map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
          {/* {isNode ? (
            <div className="draw-red">
              Tips：若选中节点被删除，则保存时将强制对应上一节点。
            </div>
          ) : null} */}
        </div>

        <div className="draw-line">{next}</div>
      </>
    );
  }
}

export default ValueMatch;
