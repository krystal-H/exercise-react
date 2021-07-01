import React, { Component } from "react";
import { Modal, Form, Input, message } from "antd";
import { formItemLayout, getNameCom } from "../../BaseConfiguration";
import { FormComponentProps } from "antd/lib/form";
import { systemCodeList } from "../../../../../store/constants";

interface CodeModalProps extends FormComponentProps {
  isShow: boolean;

  id: number | string | undefined; // 入参Id
  list: any[]; // 入参列表

  hide: () => void; // 关闭的方法
  submit: (data: object) => void; // 提交的方法
}

class CodeModal extends Component<CodeModalProps> {
  state = {
    count: 0,
  };
  isSetCount = false;
  componentDidUpdate() {
    const { isShow, id, list } = this.props;
    if (isShow && !this.isSetCount) {
      this.isSetCount = true;
      const {
        description = "", // 描述
      } = list.find((d) => d.id === id) || {};
      this.setState({ count: description.length });
    } else if (!isShow && this.isSetCount) {
      this.isSetCount = false;
    }
  }

  setCount = (e: React.SyntheticEvent) => {
    this.setState({ count: (e.target as HTMLInputElement).value.length });
  };
  onClose = () => {
    this.props.hide();
  };
  submit = () => {
    const { form, id, list, submit, hide } = this.props;
    (form.validateFields() as any)
      .then((d: any) => {
        if (
          id === undefined &&
          list.concat(systemCodeList).find((e) => e.code === d.code)
        ) {
          message.error("不可与系统返回码及已定义返回码重复");
        } else {
          submit(d);
          hide();
        }
      })
      .catch(() => {
        message.error("请按要求进行输入");
      });
  };
  public render(): JSX.Element {
    const { count } = this.state;
    const { isShow, id, list, form } = this.props;
    const {
      code = "", // 返回码
      message = "", // 错误信息
      description = "", // 错误具体描述
    } = list.find((d) => d.id === id) || {};
    const { getFieldDecorator } = form;
    const title = id === undefined ? "新增返回码" : "编辑返回码",
      codeTitle = getNameCom(
        "返回码数字",
        "支持数字，长度不超过11个数字，不可与系统返回码（200,400,401,403,404,429,460,500,503）及已定义返回码重复"
      ),
      msgTitle = getNameCom("返回码信息", "长度不超过256个字符");

    return (
      <Modal
        title={title}
        width={480}
        wrapClassName="draw-small-form"
        maskClosable={false}
        visible={isShow}
        // centered={true}
        destroyOnClose={true}
        onOk={this.submit}
        onCancel={this.onClose}
      >
        <Form {...formItemLayout}>
          <Form.Item label={codeTitle}>
            {getFieldDecorator("code", {
              initialValue: code,
              rules: [
                { required: true, message: "返回码不能为空" },
                {
                  pattern: /^-?\d{1,11}$/,
                  message: "仅支持数字",
                },
              ],
            })(<Input maxLength={11} placeholder="请输入数字" />)}
          </Form.Item>
          <Form.Item label={msgTitle}>
            {getFieldDecorator("message", {
              initialValue: message,
              rules: [{ required: true, message: "输入信息不可以为空" }],
            })(<Input maxLength={256} placeholder="输入信息不可以为空" />)}
          </Form.Item>
          <Form.Item label="描述">
            {getFieldDecorator("description", {
              initialValue: description,
            })(
              <Input.TextArea
                placeholder="请输入描述"
                maxLength={100}
                autoSize={{ minRows: 6, maxRows: 6 }}
                onChange={this.setCount}
              />
            )}
            <div className="draw-count">{count}/100</div>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default Form.create<CodeModalProps>({ name: "ParamModal" })(CodeModal);
