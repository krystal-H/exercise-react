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
        okText="??????"
        okType="danger"
        getPopupContainer={() => document.body}
        cancelText="??????"
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
    const isInput = inputId === showPathId, // ?????????????????????
      title = isInput ? "????????????" : "????????????",
      noAdd = paths.length >= maxNum,
      btnTxt = noAdd ? "????????????" + maxNum + "?????????" : "??????";

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
          ??????
        </Button>
      );

    const isEmpty = paths.length === 0,
      delCls = "draw-del" + (isEmpty ? " disabled" : "");

    const pathContent = (
      <Form.Item
        label={getNameCom(
          "????????????",
          "?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
        )}
        required
      >
        {readonly ? null : (
          <div className={delCls}>
            {this.getDel(
              "????????????????????????????????????",
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
                "??????" +
                (idx + 1) +
                "???" +
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
                        "???????????????????????????",
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
        {/* ??????__?????????????????????????????????????????????????????????????????? */}
        {form.getFieldDecorator("__pathLen__", {
          initialValue: paths.length,
          rules: [
            {
              pattern: /^[1-9]\d*$/,
              message: "??????????????????",
            },
          ],
        })(<Input type="hidden" />)}
      </Form.Item>
    );
    return (
      <>
        <Form.Item
          label={getNameCom(
            "??????",
            "??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
          )}
          required
        >
          {inputContent}
          {/* ??????__?????????????????????????????????????????????????????????????????? */}
          {form.getFieldDecorator("__inputLen__", {
            initialValue: input.length,
            rules: [
              {
                pattern: /^[1-9]\d*$/,
                message: "??????????????????",
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

    // ????????????????????????????????????
    const baseProps = {
      ...this.props,

      // ??????????????????
      log: undefined, // ?????????????????????????????????????????????
      render: this.getChildren,
    };
    return <BaseConfiguration {...baseProps} key={id} />;
  }
}

export default OptionJudgment;
