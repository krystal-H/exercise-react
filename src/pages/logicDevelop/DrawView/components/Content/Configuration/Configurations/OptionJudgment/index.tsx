import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Button, Popconfirm, Icon, Input } from "antd";
import ValueMatchModal from "../commModal/ValueMatchModal";
import {
  getCompareName,
  compareTypeMaps,
  compareTypeWithNoTarget,
  inputId,
} from "../../../../../store/constants";
import {
  createOutputObject,
  configurationMap,
} from "../../../../../store/params";

interface OptionJudgmentProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

let pathId = 1;

class OptionJudgment extends Component<OptionJudgmentProps> {
  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  reverse = (pathId: string | number, isDelOne = false) => {
    let {
      nodeItem: {
        configuration: { paths },
      },
    } = this.props;
    let sendData = { paths: [...paths] };
    const idx = paths.findIndex((d: any) => d.id === pathId);
    if (idx > -1) {
      const trueIdx = isDelOne ? idx - 1 : idx;
      const cut = sendData.paths.splice(trueIdx, 2);
      sendData.paths.splice(trueIdx, 0, ...cut.reverse());
    }
    this.onChange(sendData);
  };
  downPath = (pathId: string | number) => {
    this.reverse(pathId);
  };
  upPath = (pathId: string | number) => {
    this.reverse(pathId, true);
  };
  delAllPath = (form: formType) => {
    const {
      nodeItem: {
        configuration: { paths },
      },
    } = this.props;
    if (paths.length > 0) {
      this.onChange({ output: [], paths: [] });
      form.setFieldsValue({ __pathLen__: 0 });
      form.validateFields(["__pathLen__"]);
    }
  };
  delPath = (pathId: string | number, form: formType) => {
    let {
      nodeItem: {
        configuration: { output, paths },
      },
    } = this.props;
    let sendData = { output: [...output], paths: [...paths] };
    const idx = paths.findIndex((d: any) => d.id === pathId);
    if (idx > -1) {
      sendData.output.splice(idx, 1);
      sendData.paths.splice(idx, 1);
      form.setFieldsValue({ __pathLen__: sendData.paths.length });
      form.validateFields(["__pathLen__"]);
    }
    this.onChange(sendData);
  };
  hidePathModal = () => {
    this.onChange({ showPathModal: false, showPathId: undefined });
  };
  addInput = () => {
    this.onChange({ showPathModal: true, showPathId: inputId });
  };
  addPath = () => {
    this.onChange({ showPathModal: true, showPathId: undefined });
  };
  editPath = (pathId: string | number) => {
    this.onChange({ showPathModal: true, showPathId: pathId });
  };
  savePath = (data: any, form: formType) => {
    let {
      nodeItem: {
        configuration: { output, paths, showPathId },
      },
    } = this.props;
    let sendData: any = { showPathId: undefined, showPathModal: false };
    if (showPathId) {
      const v = paths.find((d: any) => d.id === showPathId);
      if (v) {
        Object.assign(v, data);
      } else if (showPathId === inputId) {
        let input = { id: inputId };
        Object.assign(input, data);
        sendData.input = [input];
        form.setFieldsValue({ __inputLen__: 1 });
        // form.validateFields(["__inputLen__"]);
      }
    } else {
      paths.push({ id: pathId++, ...data });
      sendData.output = [...output];
      sendData.output.push(createOutputObject());
      form.setFieldsValue({ __pathLen__: paths.length });
      // form.validateFields(["__pathLen__"]);
    }
    this.onChange({ ...sendData, paths: [...paths] });
  };
  getDel = (
    title: string,
    content: React.ReactNode,
    submit: () => void,
    disabled: boolean = false
  ) => {
    if (disabled) return content;
    return (
      <Popconfirm
        title={title}
        overlayClassName="draw-confirm"
        okText="删除"
        okType="danger"
        getPopupContainer={() => document.body}
        cancelText="取消"
        placement="topRight"
        onConfirm={submit}
      >
        {content}
      </Popconfirm>
    );
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      parents,
      nodeItem: { nodeType, configuration },
    } = this.props;
    const [, , maxNum] = configurationMap[nodeType].output;
    const { input, paths, showPathModal, showPathId } = configuration;
    const isInput = inputId === showPathId, // 如果是配置输入
      title = isInput ? "配置输入" : "配置路径",
      noAdd = paths.length >= maxNum,
      btnTxt = noAdd ? "最多添加" + maxNum + "条路径" : "路径";

    const inputContent =
      input.length > 0 ? (
        <div className="draw-topic">
          {input.map(({ id, target, targetType, targetValue }: any) => {
            return (
              <div className="draw-topic-item" key={id}>
                <span>
                  {getCompareName(target, targetType, targetValue, parents)}
                </span>
                {readonly ? null : (
                  <div className="draw-topic-right">
                    <Icon type="edit" onClick={() => this.editPath(id)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Button block icon="plus" onClick={this.addInput} disabled={readonly}>
          输入
        </Button>
      );

    const isEmpty = paths.length === 0,
      delCls = "draw-del" + (isEmpty ? " disabled" : "");

    const pathContent = (
      <Form.Item
        label={getNameCom(
          "路径配置",
          "路径选择的输入变量，用于对比所有路径的条件，可以是一个固定值或者来自其他节点的动态值。"
        )}
        required
      >
        {readonly ? null : (
          <div className={delCls}>
            {this.getDel(
              "您确定要删除所有路径吗？",
              <Icon type="delete" theme="filled" />,
              () => this.delAllPath(form),
              isEmpty
            )}
          </div>
        )}
        <div className="draw-topic">
          {paths.map(
            (
              { id, operate, target, targetType, targetValue }: any,
              idx: number
            ) => {
              const onlyOperate = compareTypeWithNoTarget.indexOf(operate) > -1;
              const n = onlyOperate
                ? ""
                : getCompareName(target, targetType, targetValue, parents);
              const name =
                "路径" +
                (idx + 1) +
                "：" +
                compareTypeMaps[operate].value +
                " " +
                n;
              return (
                <div className="draw-topic-item" key={id}>
                  <span title={name}>{name}</span>
                  {readonly ? null : (
                    <div className="draw-topic-right">
                      {idx === 0 ? null : (
                        <Icon type="up" onClick={() => this.upPath(id)} />
                      )}
                      {idx === paths.length - 1 ? null : (
                        <Icon type="down" onClick={() => this.downPath(id)} />
                      )}

                      <Icon type="edit" onClick={() => this.editPath(id)} />
                      {this.getDel(
                        "确定删除该路径吗？",
                        <Icon type="close" />,
                        () => this.delPath(id, form)
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
        {readonly ? null : (
          <Button block icon="plus" onClick={this.addPath} disabled={noAdd}>
            {btnTxt}
          </Button>
        )}
        {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
        {form.getFieldDecorator("__pathLen__", {
          initialValue: paths.length,
          rules: [
            {
              pattern: /^[1-9]\d*$/,
              message: "路径不能为空",
            },
          ],
        })(<Input type="hidden" />)}
      </Form.Item>
    );
    return (
      <>
        <Form.Item
          label={getNameCom(
            "输入",
            "路径选择的输入变量，用于对比所有路径的条件，可以是一个固定值或者来自其他节点的动态值"
          )}
          required
        >
          {inputContent}
          {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
          {form.getFieldDecorator("__inputLen__", {
            initialValue: input.length,
            rules: [
              {
                pattern: /^[1-9]\d*$/,
                message: "输入不能为空",
              },
            ],
          })(<Input type="hidden" />)}
        </Form.Item>
        {pathContent}

        <ValueMatchModal
          title={title}
          needSource={false}
          needOperate={!isInput}
          isShow={showPathModal}
          parents={parents}
          id={showPathId}
          list={input.concat(paths)}
          hide={this.hidePathModal}
          submit={(data: any) => this.savePath(data, form)}
        />
      </>
    );
  };
  public render(): JSX.Element {
    const {
      nodeItem: { id },
    } = this.props;

    // 配置传递给高阶组件的参数
    const baseProps = {
      ...this.props,

      // 一些额外参数
      log: undefined, // 日志组件，暂无需求，不知道咋做
      render: this.getChildren,
    };
    return <BaseConfiguration {...baseProps} key={id} />;
  }
}

export default OptionJudgment;
