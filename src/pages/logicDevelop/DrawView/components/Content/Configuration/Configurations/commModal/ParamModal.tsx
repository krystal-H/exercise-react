import React, { Component } from "react";
import { Modal, Form, Input, Select, Radio, message } from "antd";
import { formItemLayout, getNameCom } from "../../BaseConfiguration";
import { FormComponentProps } from "antd/lib/form";
import rules from "../../rules";
import { paramTypeList, requireTypeList } from "../../../../../store/constants";

interface ParamModalProps extends FormComponentProps {
  isShow: boolean;

  id: number | string | undefined; // 入参Id
  list: any[]; // 入参列表

  hide: () => void; // 关闭的方法
  submit: (data: object) => void; // 提交的方法
}

class ParamModal extends Component<ParamModalProps> {
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
        if (id === undefined && list.find((e) => e.name === d.name)) {
          message.error("参数名称不能与已有参数名称重复，请更改名称");
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
      name = "", // 参数名称
      type = paramTypeList[0].id, // 类型
      isRequire = requireTypeList[0].id, // 是否必填
      defaultValue = "", // 默认值
      description = "", // 描述
    } = list.find((d) => d.id === id) || {};
    const { getFieldDecorator } = form;
    const title = id === undefined ? "添加参数" : "编辑入参",
      nameTitle = getNameCom(
        "参数名称"
        // <>
        //   参数名称{rules.paramExplain}。在后续节点中可使用
        //   <a href="javascript:void(0);">query.${"{参数名称}"}</a>调用该参数
        // </>
      );

    return (
      <Modal
        title={title}
        width={320}
        wrapClassName="draw-small-form"
        maskClosable={false}
        visible={isShow}
        // centered={true}
        destroyOnClose={true}
        onOk={this.submit}
        onCancel={this.onClose}
      >
        <Form {...formItemLayout}>
          <Form.Item label={nameTitle}>
            {getFieldDecorator("name", {
              initialValue: name,
              rules: rules.param("参数名称"),
            })(<Input placeholder="请输入参数名称" />)}
          </Form.Item>
          <Form.Item label="类型" required>
            {getFieldDecorator("type", {
              initialValue: type,
            })(
              <Select placeholder="请选择类型" optionFilterProp="children">
                {paramTypeList.map(({ id, value }) => (
                  <Select.Option value={id} key={id}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item label="是否必填" required>
            {getFieldDecorator("isRequire", { initialValue: isRequire })(
              <Radio.Group>
                {requireTypeList.map(({ id, value }) => (
                  <Radio value={id} key={id}>
                    {value}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label="默认值">
            {getFieldDecorator("defaultValue", {
              initialValue: defaultValue,
            })(<Input placeholder="请输入默认值" />)}
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

export default Form.create<ParamModalProps>({ name: "ParamModal" })(ParamModal);
