import React from 'react'
import { Form, Input, Select,InputNumber} from 'antd'

const {Option} = Select

export const COMMON_COLUMNS = [{
    title: '属性名称',
    dataIndex: 'srcName',
    key: 'srcName'
},
{
    title: '数据类型',
    dataIndex: 'srcType',
    key: 'srcType',
    width:'100px'
}]

export const NUMBER_TYPE = "NUMBER_TYPE"

export const getNodeNameFormItem = (getFieldDecorator,initialValue) => {

    return (
        <Form.Item label="节点名称">
            {getFieldDecorator('nodeName', {
                rules: [{ required: true, message: '请输入节点名称！' }],
                initialValue
            })(
                <Input
                    placeholder="请输入节点名称！"
                />
            )}
        </Form.Item>
    )
}

export class InputAndSelectInLine extends React.Component {
    handletChange = (key,value) => {
      this.triggerChange({ [key]:value });
    };
  
    triggerChange = changedValue => {
      const { onChange, value } = this.props;
      if (onChange) {
        onChange({
          ...value,
          ...changedValue,
        });
      }
    };
  
    render() {
      const { value,inputString,selectString,optionsConfig = [] } = this.props;
      return (
        <span>
          <InputNumber
            value={value[inputString]}
            onChange={value => this.handletChange(inputString,value)}
            style={{ width: '65%', marginRight: '3%' }}
          />
          <Select
            value={value[selectString]}
            style={{ width: '32%' }}
            onChange={value => this.handletChange(selectString,value)}
          >
            {
                optionsConfig.map(item => {
                    let {label,value} = item;

                    return (<Option key={value} value={value}>{label}</Option>)
                })
            }
          </Select>
        </span>
      );
    }
}