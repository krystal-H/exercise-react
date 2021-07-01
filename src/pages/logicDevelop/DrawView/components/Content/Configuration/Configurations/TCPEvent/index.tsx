import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { Form, Select,Radio,Input } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { NodeItem, formType,messageDataType } from "../../../../../store/types";
import rules from "../../rules";
import { messageDataTypeList } from "../../../../../store/constants";

import { ConfigurationProps } from "../../../Configuration";

interface TCPEventProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class TCPEvent extends Component<TCPEventProps> {
  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  changeType = (e: RadioChangeEvent) => {
    const dataType = parseInt(e.target.value);
    let cngedata:any = { dataType }
    cngedata.BYTE_ADJUSTMENT = 0;
    if(dataType===messageDataType.String){
      cngedata.startIndex = 0;
      cngedata.dataLength = 0; 
    }else{
      cngedata.startIndex = undefined;
      cngedata.dataLength = undefined;
    }
    this.onChange(cngedata);
  };
  
  getChildren = (form: formType) => {
    const {
      readonly,
      nodeItem: {
        configuration: { productId,dataType,maximumMessageLength,startIndex,dataLength,encode,STR_DELIMITER,BYTE_ADJUSTMENT },
      },
      product: { isLoading, isError, list },
    } = this.props;

    const { getFieldDecorator } = form;
    const isNull = isError || list.length === 0;
    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">参数配置</div>
        </div>
        <Form.Item label="选择产品">
          {getFieldDecorator("productId", {
            initialValue: productId,
            rules: [rules.isRequire("产品")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用产品" : "请选择产品"}
              notFoundContent="未找到相应数据"
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
        <Form.Item label="消息类型" required>
          <Radio.Group
            value={dataType}
            onChange={this.changeType}
            disabled={readonly}
          >
            {messageDataTypeList.map(({ id, value }) => (
              <Radio value={id} key={id}>
                {value}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
        <Form.Item label="完整消息最大长度" required>
          {getFieldDecorator("maximumMessageLength", {
            initialValue: maximumMessageLength,
            rules: rules.isInt("消息最大长度"),
          })(
            <Input
              type="number"
              min={0}
              placeholder={"请输入完整消息最大长度"}
              disabled={readonly}
            />
          )}
        </Form.Item>
        {
          dataType === messageDataType.Stream && 
          <>
            <Form.Item label="数据长度起始下标" required>
              {getFieldDecorator("startIndex", {
                initialValue: startIndex,
                rules: rules.isInt("起始下标"),
              })(
                <Input
                  type="number"
                  min={0}
                  placeholder={"请输入数据长度起始下标"}
                  disabled={readonly}
                />
              )}
            </Form.Item>
            <Form.Item label="数据长度大小" required>
              {getFieldDecorator("dataLength", {
                initialValue: dataLength,
                rules: rules.isInt("数据长度大小"),
              })(
                <Input
                  type="number"
                  min={0}
                  placeholder={"请输入数据长度大小"}
                  disabled={readonly}
                />
              )}
            </Form.Item>
            <Form.Item label="数据追加长度">
              {getFieldDecorator("BYTE_ADJUSTMENT", {
                initialValue: BYTE_ADJUSTMENT,
                rules: rules.isIntNotRequire(),
              })(
                <Input
                  type="number"
                  min={0}
                  placeholder={"追加长度默认为0"}
                  disabled={readonly}
                />
              )}
            </Form.Item>
          </>
        }
        {
          dataType === messageDataType.String && <>
            <Form.Item label="字符编码" required>
              {getFieldDecorator("encode",{initialValue:"UTF-8"})(
                <Select>
                    <Select.Option value="UTF-8" >UTF-8</Select.Option>
                </Select>
              )}
            </Form.Item>
            <Form.Item label="消息分隔符">
              {getFieldDecorator("STR_DELIMITER", {
                initialValue: STR_DELIMITER,
              })(
                <Input
                  placeholder={"选填"}
                  disabled={readonly}
                />
              )}
            </Form.Item>
            
            </>
        }
        
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

export default TCPEvent;
