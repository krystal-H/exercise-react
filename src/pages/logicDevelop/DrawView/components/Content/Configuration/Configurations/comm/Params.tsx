import React, { Component } from "react";
import { Form, Input, Icon, Button, Popconfirm } from "antd";
import ParamModal from "../commModal/ParamModal";
import { ConfigurationProps, formType } from "../../../../../store/types";

let paramsIdCount = 1;

interface ParamsProps {
  change: (config: object) => void;

  readonly: boolean; // 是否是只读模式
  configuration: ConfigurationProps;

  isRequire?: boolean; // 是否入参是必填的
  form?: formType; // 入参如果是必填的话，这里需要form
}

class Params extends Component<ParamsProps> {
  delAllParam = () => {
    const {
      configuration: { params },
      form,
      isRequire = false,
      change,
    } = this.props;
    if (params.length > 0) {
      change({ params: [] });
      if (isRequire) form && form.setFieldsValue({ __paramLen__: 0 });
    }
  };
  delParam = (paramId: string | number) => {
    let {
      configuration: { params },
      form,
      isRequire = false,
      change,
    } = this.props;
    params = params.filter((d: any) => d.id !== paramId);
    change({ params });
    if (isRequire) form && form.setFieldsValue({ __paramLen__: params.length });
  };
  hideParamModal = () => {
    this.props.change({
      showParamModal: false,
      showParamId: undefined,
    });
  };
  addParam = () => {
    this.props.change({
      showParamModal: true,
      showParamId: undefined,
    });
  };
  editParam = (paramId: string | number) => {
    this.props.change({
      showParamModal: true,
      showParamId: paramId,
    });
  };
  saveParam = (data: any) => {
    let {
      configuration: { params, showParamId },
      isRequire = false,
      form,
      change,
    } = this.props;
    if (showParamId) {
      const v = params.find((d: any) => d.id === showParamId);
      if (v) {
        Object.assign(v, data);
      }
    } else {
      params.push({ id: paramsIdCount++, ...data });
    }
    change({
      params: [...params],
      showParamId: undefined,
      showParamModal: false,
    });
    if (isRequire) form && form.setFieldsValue({ __paramLen__: params.length });
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
  // 自定义列表
  public render(): JSX.Element {
    const {
      readonly,
      isRequire = false,
      form,
      configuration: { params, showParamModal, showParamId },
    } = this.props;
    const isEmpty = params.length === 0,
      delCls = "draw-del" + (isEmpty ? " disabled" : "");
    const paramList = isEmpty ? null : (
      <div className="draw-topic">
        {params.map(({ id, name }: any) => {
          return (
            <div className="draw-topic-item" key={id}>
              <span>{name}</span>
              {readonly ? null : (
                <div className="draw-topic-right">
                  <Icon type="edit" onClick={() => this.editParam(id)} />
                  {this.getDel(
                    "您确定要删除当前参数吗？",
                    <Icon type="close" />,
                    () => this.delParam(id)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
    return (
      <>
        <Form.Item label="入参配置" required={isRequire}>
          {isRequire && form
            ? form.getFieldDecorator("__paramLen__", {
                initialValue: params.length,
                rules: [
                  {
                    pattern: /^[1-9]\d*$/,
                    message: "入参不能为空",
                  },
                ],
              })(<Input type="hidden" />)
            : null}

          {readonly ? null : (
            <div className={delCls}>
              {this.getDel(
                "您确定要删除所有参数吗？",
                <Icon type="delete" theme="filled" />,
                this.delAllParam,
                isEmpty
              )}
            </div>
          )}
          {paramList}
          <Button block icon="plus" onClick={this.addParam} disabled={readonly}>
            添加入参
          </Button>
        </Form.Item>
        <ParamModal
          isShow={showParamModal}
          id={showParamId}
          list={params}
          hide={this.hideParamModal}
          submit={this.saveParam}
        />
      </>
    );
  }
}

export default Params;
