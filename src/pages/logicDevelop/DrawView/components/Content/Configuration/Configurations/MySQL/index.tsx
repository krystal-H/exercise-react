import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Select, Input } from "antd";
import rules from "../../rules";
import CodeView from "../../../../../../../../components/CodeView2";
import fn from "../../../../../tools/fn";

interface MySQLProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class MySQL extends Component<MySQLProps> {
  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  setSQL = (exeSql: string, form: formType) => {
    this.onChange({ exeSql });
    form.setFieldsValue({
      __sql__: fn.toTrim(exeSql),
    });
    form.validateFields(["__sql__"]);
  };
  setValues = (values: string, form: formType) => {
    this.onChange({ values });
    form.setFieldsValue({
      __query__: fn.toTrim(values),
    });
    form.validateFields(["__query__"]);
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: { configuration },
      database: { isLoading, isError, list },
    } = this.props;
    const { dsId, values, exeSql } = configuration;
    const { getFieldDecorator } = form;

    const isNull = isError || list.length === 0;

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数</div>
        </div>
        <Form.Item label="数据库选择">
          {getFieldDecorator("dsId", {
            initialValue: dsId,
            rules: [rules.isRequire("数据库")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用数据库" : "请选择数据库"}
              notFoundContent="未找到相应记录"
              optionFilterProp="children"
              loading={isLoading}
              disabled={isNull || readonly}
            >
              {list.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <a className="goto-dataasset" href="#/userCenter/dataasset" target='_blank'>数据资产知识库管理</a>

        <Form.Item label="SQL输入" required>
          <CodeView
            readOnly={readonly}
            mode="mysql"
            height={200}
            code={exeSql}
            onChange={(code: string) => this.setSQL(code, form)}
          />
          {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
          {getFieldDecorator("__sql__", {
            initialValue: exeSql,
            rules: [rules.isRequire("SQL输入")],
          })(<Input type="hidden" />)}
        </Form.Item>

        <Form.Item label="入参选择" required>
          <CodeView
            readOnly={readonly}
            mode="json"
            height={120}
            code={values}
            onChange={(code: string) => this.setValues(code, form)}
          />
          {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
          {getFieldDecorator("__query__", {
            initialValue: values,
            rules: [rules.isRequire("入参")],
          })(<Input type="hidden" />)}
        </Form.Item>
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

export default MySQL;
