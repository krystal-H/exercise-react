import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Popconfirm, Form, Button, Icon, Select, Input } from "antd";
import {
  getCompareName,
  compareTypeMaps,
  compareTypeWithNoTarget,
  logicList,
} from "../../../../../store/constants";
import ValueMatchModal from "../commModal/ValueMatchModal";

interface CalculatProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

const maxNum = 10; // 最多添加十个条件组
const defaultLogic = logicList[0].id;
let autoListId = 1;

class ConditionalJudgment extends Component<CalculatProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  changeLogic = (listId: string | number, logic: number) => {
    let {
      nodeItem: {
        configuration: { list },
      },
    } = this.props;
    let sendData = { list: [...list] };
    const idx = list.findIndex((d: any) => d.id === listId);
    if (idx > -1) {
      sendData.list[idx].logic = logic;
    }
    this.onChange(sendData);
  };
  reverse = (listId: string | number, isDelOne = false) => {
    let {
      nodeItem: {
        configuration: { list },
      },
    } = this.props;
    let sendData = { list: [...list] };
    const idx = list.findIndex((d: any) => d.id === listId);
    if (idx > -1) {
      const trueIdx = isDelOne ? idx - 1 : idx;
      const cut = sendData.list.splice(trueIdx, 2);
      if (cut.length === 2) {
        const [{ logic: logic1 }, { logic: logic2 }] = cut;
        cut[0].logic = logic2;
        cut[1].logic = logic1;
      }
      sendData.list.splice(trueIdx, 0, ...cut.reverse());
    }
    this.onChange(sendData);
  };
  down = (listId: string | number) => {
    this.reverse(listId);
  };
  up = (listId: string | number) => {
    this.reverse(listId, true);
  };
  delAll = (form: formType) => {
    const {
      nodeItem: {
        configuration: { list },
      },
    } = this.props;
    if (list.length > 0) {
      this.onChange({ list: [] });
      form.setFieldsValue({ __listLen__: 0 });
      form.validateFields(["__listLen__"]);
    }
  };
  del = (listId: string | number, form: formType) => {
    let {
      nodeItem: {
        configuration: { list },
      },
    } = this.props;
    let sendData = { list: [...list] };
    const idx = list.findIndex((d: any) => d.id === listId);
    if (idx > -1) {
      sendData.list.splice(idx, 1);
    }
    form.setFieldsValue({ __listLen__: sendData.list.length });
    form.validateFields(["__listLen__"]);
    this.onChange(sendData);
  };
  hideListModal = () => {
    this.onChange({ showListModal: false, showListId: undefined });
  };
  addListItem = () => {
    this.onChange({ showListModal: true, showListId: undefined });
  };
  editListItem = (listId: string | number) => {
    this.onChange({ showListModal: true, showListId: listId });
  };
  saveListItem = (data: any, form: formType) => {
    let {
      nodeItem: {
        configuration: { list, showListId },
      },
    } = this.props;
    let sendData: any = { showListId: undefined, showListModal: false };
    if (showListId) {
      const v = list.find((d: any) => d.id === showListId);
      if (v) {
        Object.assign(v, data);
      }
    } else {
      list.push({ id: autoListId++, logic: defaultLogic, ...data });
      form.setFieldsValue({ __listLen__: list.length });
    }
    this.onChange({ ...sendData, list: [...list] });
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
      nodeItem: { configuration },
    } = this.props;
    const { list, showListModal, showListId } = configuration;
    const noAdd = list.length >= maxNum,
      btnTxt = noAdd ? "最多添加" + maxNum + "条件组" : "条件";
    const isEmpty = list.length === 0,
      delCls = "draw-del" + (isEmpty ? " disabled" : "");

    return (
      <>
        <Form.Item
          label={getNameCom(
            "条件配置",
            "可以设置多个子条件，按顺序进行判断并产生最终的布尔值"
          )}
          required
        >
          {readonly ? null : (
            <div className={delCls}>
              {this.getDel(
                "您确定要删除所有条件配置吗？",
                <Icon type="delete" theme="filled" />,
                () => this.delAll(form),
                isEmpty
              )}
            </div>
          )}
          <div className="draw-topic">
            {list.map(
              (
                {
                  id,
                  operate,
                  source,
                  sourceType,
                  sourceValue,
                  target,
                  targetType,
                  targetValue,
                  logic,
                }: any,
                idx: number
              ) => {
                const onlyOperate =
                    compareTypeWithNoTarget.indexOf(operate) > -1,
                  isLast = list.length - 1 === idx;
                const n1 =
                    getCompareName(source, sourceType, sourceValue, parents) +
                    " ",
                  n2 = onlyOperate
                    ? ""
                    : getCompareName(target, targetType, targetValue, parents),
                  n3 = onlyOperate
                    ? compareTypeMaps[operate].value2
                    : compareTypeMaps[operate].value;
                const name = "条件" + (idx + 1) + "：" + n1 + n3 + " " + n2;
                const logicContent = isLast ? null : (
                  <div className="draw-logic">
                    <div className="draw-logic-inner">
                      <div className="draw-logic-content">
                        <Select
                          placeholder="请选择"
                          value={logic}
                          onChange={(v: number) => this.changeLogic(id, v)}
                          disabled={readonly}
                        >
                          {logicList.map(({ id, value }) => (
                            <Select.Option value={id} key={id}>
                              {value}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>
                );
                return (
                  <React.Fragment key={id}>
                    <div className="draw-topic-item">
                      <span title={name}>{name}</span>
                      {readonly ? null : (
                        <div className="draw-topic-right">
                          {idx === 0 ? null : (
                            <Icon type="up" onClick={() => this.up(id)} />
                          )}
                          {isLast ? null : (
                            <Icon type="down" onClick={() => this.down(id)} />
                          )}

                          <Icon
                            type="edit"
                            onClick={() => this.editListItem(id)}
                          />
                          {this.getDel(
                            "确定删除该路径吗？",
                            <Icon type="close" />,
                            () => this.del(id, form)
                          )}
                        </div>
                      )}
                    </div>
                    {logicContent}
                  </React.Fragment>
                );
              }
            )}
          </div>
          {readonly ? null : (
            <Button
              block
              icon="plus"
              onClick={this.addListItem}
              disabled={noAdd}
            >
              {btnTxt}
            </Button>
          )}

          {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
          {form.getFieldDecorator("__listLen__", {
            initialValue: list.length,
            rules: [
              {
                pattern: /^[1-9]\d*$/,
                message: "条件配置不能为空",
              },
            ],
          })(<Input type="hidden" />)}
        </Form.Item>

        <ValueMatchModal
          title="配置条件"
          needSource={true}
          needOperate={true}
          isShow={showListModal}
          parents={parents}
          id={showListId}
          list={list}
          hide={this.hideListModal}
          submit={(data: any) => this.saveListItem(data, form)}
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

export default ConditionalJudgment;
