import React, { Component } from "react";
import { Modal, Form, Input, Select, message, DatePicker } from "antd";
import { formItemLayout } from "../../BaseConfiguration";
import { FormComponentProps } from "antd/lib/form";
import {
  ParentItemProps,
  ValueType,
  OutputType,
  DataValueType,
  ItemType,
} from "../../../../../store/types";
import moment from "moment";
import {
  compareParamTypeList,
  booleanList,
  parentsDefaultList,
  compareTypeList,
  valueTypeList,
  compareTypeWithNoTarget,
} from "../../../../../store/constants";

interface ValueMatchModalProps extends FormComponentProps {
  title: string;
  label?: string; // 是否需要替换label
  needSource?: boolean; // 是否需要选择数据源，默认为true
  needOperate?: boolean; // 是否需要比较方式，默认为true
  onlyNumber?: boolean; // 是否需要固定固定值的类型为“数值型”，且锁定为disabled的

  isShow: boolean;

  parents: ParentItemProps[]; // 父节点列表

  id: number | string | undefined; // 匹配Id
  list: any[]; // 匹配值列表

  hide: () => void; // 关闭的方法
  submit: (data: object) => void; // 提交的方法
}

interface ValueMatchModalStates {
  source: DataValueType; // 源数据类型1
  sourceType: number | string; // 源数据类型2
  sourceValue: string | moment.Moment; // 源数据：默认值

  operate: undefined | number; // 默认不选择比较方式

  target: DataValueType; // 比较数据类型1
  targetType: number | string; // 比较数据类型2
  targetValue: string | moment.Moment; // 比较数据：默认值
}

const stName = "选择用于比较的数据源",
  blockSty = { width: "100%" },
  defaultType = compareParamTypeList[0].id,
  defaultBoolean = booleanList[0].id,
  defaultParentNode = parentsDefaultList[0].id,
  defaultState: ValueMatchModalStates = {
    source: DataValueType.Value, // 源数据类型1
    sourceType: defaultType, // 源数据类型2
    sourceValue: "", // 源数据：默认值

    operate: undefined, // 默认不选择比较方式

    target: DataValueType.Value, // 比较数据类型1
    targetType: defaultType, // 比较数据类型2
    targetValue: "", // 比较数据：默认值
  };

class ValueMatchModal extends Component<
  ValueMatchModalProps,
  ValueMatchModalStates
> {
  state = { ...defaultState };

  isInit = false;
  componentDidUpdate() {
    const { props, isInit } = this;
    const { isShow, id, list } = props;
    // 如果未初始化时，则进行初始化操作
    if (!isInit && isShow) {
      this.isInit = true;
      if (id === undefined) {
        this.setState({ ...defaultState });
      } else {
        const {
          source = DataValueType.Value,
          sourceType = defaultType,
          sourceValue = "",
          operate,
          target = DataValueType.Value,
          targetType = defaultType,
          targetValue = "",
        } = list.find((d) => d.id === id) || {};
        this.setState({
          source,
          sourceType,
          sourceValue,
          operate,
          target,
          targetType,
          targetValue,
        });
      }
    } else if (isInit && !isShow) {
      this.isInit = false;
    }
  }

  changeFirst = (key: ItemType, source: DataValueType) => {
    const type =
        source === DataValueType.Value ? defaultType : defaultParentNode,
      value = "";
    if (key === ItemType.Source) {
      this.setState({
        source: source, // 源数据类型1
        sourceType: type, // 源数据类型2
        sourceValue: value, // 源数据：默认值
      });
    } else {
      this.setState({
        target: source, // 源数据类型1
        targetType: type, // 源数据类型2
        targetValue: value, // 源数据：默认值
      });
    }
  };
  changeSecond = (key: ItemType, type: number | string) => {
    const value = type === ValueType.Boolean ? defaultBoolean : ""; // 源数据：默认值;
    if (key === ItemType.Source) {
      this.setState({
        sourceType: type, // 源数据类型2
        sourceValue: value,
      });
    } else {
      this.setState({
        targetType: type, // 源数据类型2
        targetValue: value, // 源数据：默认值
      });
    }
  };
  changeThird = (key: ItemType, value: string | moment.Moment) => {
    if (key === ItemType.Source) {
      this.setState({
        sourceValue: value, // 源数据：默认值
      });
    } else {
      this.setState({
        targetValue: value, // 源数据：默认值
      });
    }
  };
  changeOperate = (value: number) => {
    this.setState({
      operate: value,
    });
  };
  onClose = () => {
    this.props.hide();
  };
  check = () => {
    const { needSource = true, needOperate = true } = this.props;
    const {
      source,
      sourceType,
      sourceValue,
      operate,
      target,
      targetType,
      targetValue,
    } = this.state;
    // let sourceError = source === DataValueType.Value && sourceValue===""  sourceType === ;
    if (needSource) {
      if (source === DataValueType.Value) {
        if (
          sourceType === ValueType.Number &&
          isNaN(parseFloat(sourceValue as string))
        ) {
          message.error("请输入正确的数值");
          return false;
        } else if (sourceValue === "") {
          message.error(
            sourceType === ValueType.String ? "请输入字符串" : "请选择时间"
          );
          return false;
        }
      }
    }
    if (needOperate && operate === undefined) {
      message.error("请选择比较方式");
      return false;
    }
    // 如果是两种不需要目标数据源的情况时，直接返回true
    if (
      needOperate &&
      compareTypeWithNoTarget.indexOf(operate as number) > -1
    ) {
      return true;
    }
    if (target === DataValueType.Value) {
      if (
        targetType === ValueType.Number &&
        isNaN(parseFloat(targetValue as string))
      ) {
        message.error("请输入正确的数值");
        return false;
      } else if (targetValue === "") {
        message.error(
          targetType === ValueType.String ? "请输入字符串" : "请选择时间"
        );
        return false;
      }
    }
    return true;
  };
  submit = () => {
    if (this.check()) {
      const { submit, hide } = this.props;
      let data = { ...this.state };

      // 此处针对数值型的数据进行处理
      if (
        (data.source === DataValueType.Value && data.sourceType) ===
        ValueType.Number
      ) {
        data.sourceValue = parseFloat(data.sourceValue as string) + "";
      }
      if (
        (data.target === DataValueType.Value && data.targetType) ===
        ValueType.Number
      ) {
        data.targetValue = parseFloat(data.targetValue as string) + "";
      }

      submit(data);
      hide();
    }
  };
  getSource = (
    key: ItemType,
    source: DataValueType,
    sourceType: number | string,
    sourceValue: string | moment.Moment,
    needChangeTitle: boolean = false
  ) => {
    const { parents, onlyNumber = false, label } = this.props;
    const isValue = source === DataValueType.Value,
      isNode = source === DataValueType.Node,
      sourceTypeList =
        isValue && !onlyNumber
          ? compareParamTypeList
          : isValue && onlyNumber
          ? compareParamTypeList.slice(0, 1)
          : parents,
      name = label || (needChangeTitle ? "选择数据源" : stName);

    const thirdFunc0 = (e: React.SyntheticEvent) =>
        this.changeThird(
          key,
          (e.target as HTMLInputElement).value.replace(/[^\d.]/g, "")
        ),
      thirdFunc = (e: React.SyntheticEvent) =>
        this.changeThird(key, (e.target as HTMLInputElement).value),
      thirdFunc2 = (value: string) => this.changeThird(key, value),
      thirdFunc3 = (value: moment.Moment) => this.changeThird(key, value);

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
          />
        );
      } else if (sourceType === ValueType.Boolean) {
        next = (
          <Select
            placeholder="请选择"
            value={sourceValue}
            onChange={thirdFunc2}
          >
            {booleanList.map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        );
      } else {
        next = (
          <DatePicker
            placeholder="请选择日期和时间"
            format="YYYY-MM-DD HH:mm:ss"
            style={blockSty}
            showToday={false}
            showTime={{ defaultValue: moment("00:00:00", "HH:mm:ss") }}
            onChange={thirdFunc3}
          />
        );
      }
    } else if (isNode) {
      const { type, list } = parents.find((d) => d.id === sourceType) || {};
      if (type === OutputType.LIST) {
        next = (
          <Select
            placeholder="请选择"
            value={sourceValue}
            onChange={thirdFunc2}
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
          />
        );
      }
    }
    return (
      <Form.Item label={name} required>
        <div className="draw-menu-group">
          {valueTypeList.map(({ id, value, disabled }) => {
            const isSelected = source === id,
              ckFunc =
                isSelected || disabled
                  ? undefined
                  : () => this.changeFirst(key, id);
            return (
              <div
                className={
                  "draw-menu" +
                  (isSelected ? " draw-menu-selected" : "") +
                  (disabled ? " draw-menu-disabled" : "")
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
            disabled={isValue && onlyNumber}
            onChange={(value: number | string) => this.changeSecond(key, value)}
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
      </Form.Item>
    );
  };
  public render(): JSX.Element {
    const { isShow, title, needSource = true, needOperate = true } = this.props;
    const {
      source,
      sourceType,
      sourceValue,
      operate,
      target,
      targetType,
      targetValue,
    } = this.state;
    const sourceContent = needSource
        ? this.getSource(ItemType.Source, source, sourceType, sourceValue)
        : null,
      targetContent =
        compareTypeWithNoTarget.indexOf(operate as number) === -1
          ? this.getSource(
              ItemType.Target,
              target,
              targetType,
              targetValue,
              !needOperate
            )
          : null,
      operateContent = needOperate ? (
        <Form.Item label="选择比较方式" required>
          <Select
            placeholder="请选择比较方式"
            value={operate}
            onChange={this.changeOperate}
          >
            {compareTypeList.map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : null;
    return (
      <Modal
        title={title}
        width={360}
        maskClosable={false}
        wrapClassName="draw-small-form"
        visible={isShow}
        // centered={true}
        destroyOnClose={true}
        onOk={this.submit}
        onCancel={this.onClose}
      >
        <Form {...formItemLayout}>
          {sourceContent}

          {sourceContent ? <div className="draw-line" /> : null}

          {operateContent}

          {targetContent ? <div className="draw-line" /> : null}

          {targetContent}
        </Form>
      </Modal>
    );
  }
}

export default Form.create<ValueMatchModalProps>({ name: "ValueMatchModal" })(
  ValueMatchModal
);
