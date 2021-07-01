import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Popconfirm, Form, Button, Icon, Select, Input } from "antd";
import ValueMatchModal from "../commModal/ValueMatchModal";
import {
  getCompareName,
  logicalOperationList,
  inputId,
} from "../../../../../store/constants";

interface CalculatProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

const maxNum = 10; // 最多增加十个参数
let autoListId = 1;

class Calculat extends Component<CalculatProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  changeLogic = (logic: number): void => {
    this.onChange({ logic });
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
    this.onChange({
      showListModal: false,
      showListId: undefined,
    });
  };
  addInput = () => {
    this.onChange({
      showListModal: true,
      showListId: inputId,
    });
  };
  addListItem = () => {
    this.onChange({
      showListModal: true,
      showListId: undefined,
    });
  };
  editListItem = (listId: string | number) => {
    this.onChange({
      showListModal: true,
      showListId: listId,
    });
  };
  saveListItem = (data: any, form: formType) => {
    let {
      nodeItem: {
        configuration: { list, showListId },
      },
    } = this.props;
    let sendData: any = {
      showListId: undefined,
      showListModal: false,
    };
    if (showListId) {
      const v = list.find((d: any) => d.id === showListId);
      if (v) {
        Object.assign(v, data);
      } else if (showListId === inputId) {
        let input = { id: inputId };
        Object.assign(input, data);
        sendData.input = [input];
        form.setFieldsValue({ __inputLen__: 1 });
      }
    } else {
      list.push({ id: autoListId++, ...data });
      form.setFieldsValue({ __listLen__: list.length });
    }
    this.onChange({
      ...sendData,
      list: [...list],
    });
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
      nodeItem: { /*id,*/ configuration },
    } = this.props;
    const { input, logic, list, showListModal, showListId } = configuration;
    const isInput = inputId === showListId, // 如果是源数据
      label = isInput ? "选择源数据" : "选择参数",
      title = isInput ? "配置源数据" : "配置参数",
      noAdd = list.length >= maxNum,
      btnTxt = noAdd ? "最多添加" + maxNum + "个参数" : "参数";

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
                    <Icon type="edit" onClick={() => this.editListItem(id)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : readonly ? null : (
        <Button block icon="plus" onClick={this.addInput}>
          配置源数据
        </Button>
      );

    const isEmpty = list.length === 0,
      delCls = "draw-del" + (isEmpty ? " disabled" : "");

    const paramContent = (
      <Form.Item
        label={getNameCom("参数配置", "用于与数据源进行依次计算的各个参数配置")}
        required
      >
        {readonly ? null : (
          <div className={delCls}>
            {this.getDel(
              "您确定要删除所有参数吗？",
              <Icon type="delete" theme="filled" />,
              () => this.delAll(form),
              isEmpty
            )}
          </div>
        )}
        <div className="draw-topic">
          {list.map(
            ({ id, target, targetType, targetValue }: any, idx: number) => {
              const name =
                "参数" +
                (idx + 1) +
                "：" +
                getCompareName(target, targetType, targetValue, parents);
              return (
                <div className="draw-topic-item" key={id}>
                  <span title={name}>{name}</span>
                  {readonly ? null : (
                    <div className="draw-topic-right">
                      <Icon type="edit" onClick={() => this.editListItem(id)} />
                      {this.getDel(
                        "确定删除该参数吗？",
                        <Icon type="close" />,
                        () => this.del(id, form)
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
        {readonly ? null : (
          <Button block icon="plus" onClick={this.addListItem} disabled={noAdd}>
            {btnTxt}
          </Button>
        )}
        {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
        {form.getFieldDecorator("__listLen__", {
          initialValue: list.length,
          rules: [
            {
              pattern: /^[1-9]\d*$/,
              message: "参数不能为空",
            },
          ],
        })(<Input type="hidden" />)}
      </Form.Item>
    );
    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">输入配置</div>
        </div>
        <Form.Item
          label={getNameCom(
            "数据源",
            "数值计算节点的数据源只能是数值型数据。用于作为下述计算的基准数"
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
                message: "数据源不能为空",
              },
            ],
          })(<Input type="hidden" />)}
        </Form.Item>

        <div className="draw-group">
          <div className="draw-group-inner">数值计算</div>
        </div>

        <Form.Item
          label={getNameCom(
            "运算方法",
            "数值计算节点的数据源只能是数值型数据。用于作为下述计算的基准数"
          )}
          required
        >
          <Select
            placeholder="请选择"
            value={logic}
            onChange={this.changeLogic}
            disabled={readonly}
          >
            {logicalOperationList.map(({ id, value }) => (
              <Select.Option value={id} key={id}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {paramContent}

        <ValueMatchModal
          title={title}
          label={label}
          needSource={false}
          needOperate={false}
          onlyNumber={true}
          isShow={showListModal}
          parents={parents}
          id={showListId}
          list={input.concat(list)}
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

export default Calculat;
