import React from 'react'
import {Form,Input,Table,Checkbox,Select,InputNumber} from 'antd'
import {COMMON_COLUMNS,getNodeNameFormItem} from '../common'

const {Option} = Select

export default function ({
    form,
    id,
    productList,
    changeNodeDataByIds,
    input
}) {
    const { getFieldDecorator } = form,
          {nodeName,productId,deviceIds = [],propEvent,propsCodes = [],props = [],eventTimeField} = input;

    const   checkPrice = (rule, value, callback) => {
                if (value.number > 0) {
                    return callback();
                }
                callback('Price must greater than zero!');
            };

    return (
        <Form>
            {getNodeNameFormItem(getFieldDecorator,nodeName)}
            <Form.Item label="节点名称">
                {getFieldDecorator('nodeName', {
                    rules: [{ required: true, message: '请输入节点名称！' }],
                })(
                    <Input
                        placeholder="请输入节点名称！"
                    />
                )}
            </Form.Item>
            <Form.Item label="检测属性">
                {getFieldDecorator('eventTimeField', {
                    rules: [{ required: true, message: '请选择检测属性！' }],
                    initialValue:''
                })(
                    <Select >
                        <Option value="">请选择</Option>
                        {/* TODO:取表格中除了默认字段外的其他字段 */}
                    </Select>
                )}
            </Form.Item>
            <Form.Item label="检测规则">
                {getFieldDecorator('condition', {
                    initialValue: { number: 60, currency: 's' },
                    rules: [{ validator: checkPrice }],
                })(
                    <PriceInput></PriceInput>
                )}
            </Form.Item>
            <Form.Item>
                <Table columns={COMMON_COLUMNS} dataSource={props} pagination={false}/>
            </Form.Item>
        </Form>
    )
}


class PriceInput extends React.Component {
    handleNumberChange = e => {
      const number = parseInt(e.target.value || 0, 10);
      if (isNaN(number)) {
        return;
      }
      this.triggerChange({ number });
    };
  
    handleCurrencyChange = currency => {
      this.triggerChange({ currency });
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
      const {checked, value } = this.props;
      return (
        <>
            <p>
                <Checkbox
                    checked={checked}
                    style={{ margin:'0 2%'}}
                ></Checkbox>
                <span>连续</span>
                <InputNumber
                    value={value.number}
                    style={{ width: '20%',margin:'0 2%'}}
                />
                <span>个点小于阈值</span>
                <InputNumber
                    value={value.number}
                    style={{ width: '20%',margin:'0 2%'}}
                />
            </p>
            <p>
                <Checkbox
                    checked={checked}
                    style={{ margin:'0 2%'}}
                ></Checkbox>
                <span>连续</span>
                <InputNumber
                    value={value.number}
                    style={{ width: '20%',margin:'0 2%'}}
                />
                <span>个点超出阈值</span>
                <InputNumber
                    value={value.number}
                    style={{ width: '20%',margin:'0 2%'}}
                />
            </p>
        </>
      );
    }
  }