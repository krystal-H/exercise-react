import React, { Component } from "react";
import { Modal, Form, Input, message, Select } from "antd";
import { FormComponentProps } from "antd/lib/form";
import rules from "./Content/Configuration/rules";
import { ParamType, RequireType } from "../store/types";
import { booleanList, paramTypeMaps, booleanMaps } from "../store/constants";

interface DebugInputModalProps extends FormComponentProps {
  isShow: boolean; // 是否显示调试参数输入弹框

  serviceId: number; // 开发服务流程图id
  isHTTP: boolean; // 根节点是否是HTTP事件
  params: any[]; // 找到根节点的入参列表

  hide: () => void; // 关闭的方法
  debug: (data: object) => void; // 提交的方法
}

const msgE = "参数值格式不正确",
  intRegExp = /^-?[1-9]\d*$/,
  floatRegExp = /^-?(([1-9]\d*\.?\d*)|(0\.[^.]*))$/,
  formItemLayout: any = {
    // layout: "vertical",
    labelCol: { xs: { span: 4 }, sm: { span: 4 } },
    wrapperCol: { xs: { span: 20 }, sm: { span: 20 } },
  };

class DebugInputModal extends Component<DebugInputModalProps> {
  onClose = () => {
    this.props.hide();
  };
  submit = () => {
    const { form, serviceId, params, debug, hide } = this.props;
    (form.validateFields() as any)
      .then((d: any) => {
        // 根据不同参数类型处理成合法参数
        params.forEach(({ name, type }: any) => {
          if (type === ParamType.Boolean) {
            d[name] = booleanMaps[d[name]].value2;
          } else if (type === ParamType.Int || type === ParamType.Long) {
            d[name] = parseInt(d[name]);
          } else if (type === ParamType.Float || type === ParamType.Double) {
            d[name] = parseFloat(d[name]);
          }
        });
        debug({ serviceId, jsonData: JSON.stringify(d) });
        hide();
      })
      .catch(() => {
        message.error("请按要求进行输入");
      });
  };
  public render(): JSX.Element {
    const { isShow, params, form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Modal
        title="入参配置"
        width={480}
        wrapClassName="draw-small-form"
        maskClosable={false}
        visible={isShow}
        // centered={true}
        destroyOnClose={true}
        onOk={this.submit}
        okText="开始调试"
        onCancel={this.onClose}
      >
        <Form {...formItemLayout}>
          <div className="draw-params">
            {params.map(({ name, type, isRequire, defaultValue }: any) => {
              let rs: object[] = [],
                isBoolean = type === ParamType.Boolean,
                isString = type === ParamType.String,
                placeholder = isBoolean
                  ? "请选择布尔值"
                  : "请输入" +
                    (isString
                      ? "字符串"
                      : "数值（" + paramTypeMaps[type].text + "）"),
                input = <Input placeholder={placeholder} />,
                value = defaultValue || "";

              if (isRequire === RequireType.Required) {
                rs.push(rules.isRequire("参数值"));
              }
              if (type === ParamType.Int) {
                input = <Input placeholder={placeholder} maxLength={16} />;
                rs.push(rules.checkRules(intRegExp, msgE));
              } else if (type === ParamType.Long) {
                rs.push(rules.checkRules(intRegExp, msgE));
              } else if (
                type === ParamType.Float ||
                type === ParamType.Double
              ) {
                rs.push(rules.checkRules(floatRegExp, msgE));
              } else if (isBoolean) {
                value = booleanList[0].id2;
                input = (
                  <Select placeholder={placeholder}>
                    {booleanList.map(({ id2, value }) => (
                      <Select.Option value={id2} key={id2}>
                        {value}
                      </Select.Option>
                    ))}
                  </Select>
                );
              }
              return (
                <Form.Item label={name} key={name}>
                  {getFieldDecorator(name as string, {
                    initialValue: value,
                    rules: rs,
                  })(input)}
                </Form.Item>
              );
            })}
          </div>
        </Form>
      </Modal>
    );
  }
}

export default Form.create<DebugInputModalProps>({ name: "DebugInputModal" })(
  DebugInputModal
);
