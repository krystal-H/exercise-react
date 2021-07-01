import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import {
  NodeItem,
  formType,
  KeyValueType,
  DataValueType,
} from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Select, Input } from "antd";
import { opeTypeList } from "../../../../../store/constants";
import ValueMatch from "../comm/ValueMatch";
import rules from "../../rules";

interface KeyValueProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class KeyValue extends Component<KeyValueProps> {
  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  get__ = (source: any, sourceValue: any) => {
    return source === DataValueType.Value && sourceValue === "" ? "" : "1";
  };
  onChangeKey = (_data: any, form: formType) => {
    const {
      nodeItem: {
        configuration: { key },
      },
    } = this.props;
    const { source, sourceType, sourceValue } = _data;
    let data: any = {};
    "source" in _data && (data.key = source);
    "sourceType" in _data && (data.keyType = sourceType);
    "sourceValue" in _data && (data.keyValue = sourceValue);
    form.setFieldsValue({
      __keyValue__: this.get__("source" in _data ? source : key, sourceValue),
    });
    form.validateFields(["__keyValue__"]);
    this.onChange(data);
  };
  onChangeValue = (_data: any, form: formType) => {
    const {
      nodeItem: {
        configuration: { value },
      },
    } = this.props;
    const { source, sourceType, sourceValue } = _data;
    let data: any = {};
    "source" in _data && (data.value = source);
    "sourceType" in _data && (data.valueType = sourceType);
    "sourceValue" in _data && (data.valueValue = sourceValue);
    form.setFieldsValue({
      __valueValue__: this.get__(
        "source" in _data ? source : value,
        sourceValue
      ),
    });
    form.validateFields(["__valueValue__"]);
    this.onChange(data);
  };

  getChildren = (form: formType) => {
    const {
      readonly,
      parents,
      nodeItem: { configuration },
      redis: { isLoading, isError, list },
    } = this.props;
    const { getFieldDecorator } = form;
    const isNull = isError || list.length === 0;

    const {
      redis,
      opeType,
      key,
      keyType,
      keyValue,
      value,
      valueType,
      valueValue,
    } = configuration;

    const defaultKey = this.get__(key, keyValue),
      defaultValue = this.get__(value, valueValue);

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数</div>
        </div>
        <Form.Item label="选择Redis数据源">
          {getFieldDecorator("redis", {
            initialValue: redis,
            rules: [rules.isRequire("Redis数据源")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用Redis数据源" : "请选择Redis数据源"}
              notFoundContent="未找到相应记录"
              optionFilterProp="children"
              loading={isLoading}
              disabled={isNull || readonly}
            >
              {list.map(({ id, value }) => {
                return (
                  <Select.Option value={id} key={id}>
                    {value}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </Form.Item>
        <a className="goto-dataasset" href="#/userCenter/dataasset" target='_blank'>数据资产知识库管理</a>

        <div className="draw-group">
          <div className="draw-group-inner">KV存储配置</div>
        </div>

        <Form.Item
          label={getNameCom(
            "操作",
            "操作对应的是键（Key）值（Value）对存储的增删改查等操作。"
          )}
          required
        >
          {getFieldDecorator("opeType", {
            initialValue: opeType,
            rules: [rules.isRequire("操作")],
          })(
            <Select placeholder="请选择操作" disabled={readonly}>
              {opeTypeList.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        {opeType !== undefined ? (
          <Form.Item
            label={getNameCom("键(key)", "key仅支持字符串类型")}
            required
          >
            <ValueMatch
              readonly={readonly}
              onlyString={true}
              parents={parents}
              source={key}
              sourceType={keyType}
              sourceValue={keyValue}
              onChange={(data: any) => this.onChangeKey(data, form)}
            />
            {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
            {getFieldDecorator("__keyValue__", {
              initialValue: defaultKey,
              rules: [rules.isRequire("键(key)")],
            })(<Input type="hidden" />)}
          </Form.Item>
        ) : null}

        {opeType === KeyValueType.Set && (
          <>
            <Form.Item
              label={getNameCom("值(value)", "value仅支持字符串类型")}
              required
            >
              <ValueMatch
                readonly={readonly}
                onlyString={true}
                parents={parents}
                source={value}
                sourceType={valueType}
                sourceValue={valueValue}
                onChange={(data: any) => this.onChangeValue(data, form)}
              />
              {/* 以“__”为前缀和后缀的字段不会自动赋值进配置信息里 */}
              {getFieldDecorator("__valueValue__", {
                initialValue: defaultValue,
                rules: [rules.isRequire("值(value)")],
              })(<Input type="hidden" />)}
            </Form.Item>
          </>
        )}
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

export default KeyValue;
