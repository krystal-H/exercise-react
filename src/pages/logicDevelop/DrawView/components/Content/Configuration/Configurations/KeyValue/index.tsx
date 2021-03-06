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
          <div className="draw-group-inner">??????</div>
        </div>
        <Form.Item label="??????Redis?????????">
          {getFieldDecorator("redis", {
            initialValue: redis,
            rules: [rules.isRequire("Redis?????????")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "????????????Redis?????????" : "?????????Redis?????????"}
              notFoundContent="?????????????????????"
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
        <a className="goto-dataasset" href="#/userCenter/dataasset" target='_blank'>???????????????????????????</a>

        <div className="draw-group">
          <div className="draw-group-inner">KV????????????</div>
        </div>

        <Form.Item
          label={getNameCom(
            "??????",
            "????????????????????????Key?????????Value???????????????????????????????????????"
          )}
          required
        >
          {getFieldDecorator("opeType", {
            initialValue: opeType,
            rules: [rules.isRequire("??????")],
          })(
            <Select placeholder="???????????????" disabled={readonly}>
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
            label={getNameCom("???(key)", "key????????????????????????")}
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
            {/* ??????__?????????????????????????????????????????????????????????????????? */}
            {getFieldDecorator("__keyValue__", {
              initialValue: defaultKey,
              rules: [rules.isRequire("???(key)")],
            })(<Input type="hidden" />)}
          </Form.Item>
        ) : null}

        {opeType === KeyValueType.Set && (
          <>
            <Form.Item
              label={getNameCom("???(value)", "value????????????????????????")}
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
              {/* ??????__?????????????????????????????????????????????????????????????????? */}
              {getFieldDecorator("__valueValue__", {
                initialValue: defaultValue,
                rules: [rules.isRequire("???(value)")],
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

export default KeyValue;
