import React from 'react'
import { Form, Input, Radio, Table, Button, Select} from 'antd'
import { getNodeNameFormItem} from '../common'

const { Option } = Select

const JUDGE_LISTS = ['=', '!=', '>=', '<=', '>', '<']

export default function ({
    form,
    id,
    input,
    pProps = [],
    changeNodeDataByIds
}) {
    const { getFieldDecorator } = form,
          { nodeName, props = [], condition } = input;


    const changeConditionProps = (key,value,index) => {

        if(key === 'value') {
            if (!/^\d*$/.test(value)) {
                return;
            }
        }

        let _props = [...props];

        _props[index][key] = value

        if (key === 'code') {
            let temp = pProps.filter(item => item.srcCode === value),
                name = '',
                tableCode = '';

            if (temp.length > 0) {
                name = temp[0].srcName || ''
                tableCode = temp[0].srcTableCode || ''
            }

            _props[index]['name'] = name
            _props[index]['tableCode'] = tableCode
        }

        changeNodeDataByIds([id],[
            {
                input:{
                    props:_props
                }
            }
        ])
    }

    const deleteConditionPropsByIndex = _index => {
        let _props = [...props].filter((item,index) => index !== _index)

        changeNodeDataByIds([id],[
            {
                input:{
                    props:_props
                }
            }
        ])
    }

    const columns = [{
        title: '属性名称',
        dataIndex: 'name',
        key: 'name',
        width:'90px',
        render: (text, record, index) => {
            return (
                <Select value={record.code} onChange={value => changeConditionProps('code',value,index)}>
                    {
                        // TODO: 过滤掉非数字类型的属性
                        pProps.map(item => {
                            let { srcName, srcCode } = item;

                            return <Option key={srcCode} value={srcCode}>{srcName}</Option>
                        })
                    }
                </Select>
            )
        }
    },
    {
        title: '判断',
        dataIndex: 'judge',
        key: 'judge',
        width:'90px',
        render: (text, record, index) => {
            return (
                <Select value={record.judge} onChange={value => changeConditionProps('judge',value,index)}>
                    {
                        JUDGE_LISTS.map((item) => {
                            return <Option key={item} value={item}>{item}</Option>
                        })
                    }
                </Select>
            )
        }
    },
    {
        title: '数值',
        dataIndex: 'value',
        key: 'value',
        width:'50px',
        render: (text, record, index) => {
            return (
                <Input value={record.value} onChange={e => changeConditionProps('value',e.target.value,index)}></Input>
            )
        }
    },
    {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width:'40px',
        render: (text, record, index) => {
            return <a onClick={() => deleteConditionPropsByIndex(index)}>删除</a>
        }
    }
    ]

    const addNewCondition = () => {
        changeNodeDataByIds([id],[
            {
                input:{
                    props:[...props,{}]
                }
            }
        ])
    }

    return (
        <Form>
            {getNodeNameFormItem(getFieldDecorator,nodeName)}
            <Form.Item label="关系与条件">
                {getFieldDecorator('condition', {
                    rules: [{ required: true, message: '请选择关系！' }],
                    initialValue: condition
                })(
                    <Radio.Group>
                        <Radio value="and">同时满足以下条件(and)</Radio>
                        <Radio value="or">满足以下某一个条件(or)</Radio>
                    </Radio.Group>
                )}
            </Form.Item>
            <Form.Item>
                <div className="add-new-condition">
                    <Button type="default"
                            onClick={addNewCondition} 
                            size="small">新增条件</Button>
                </div>
                <Table rowKey="code" columns={columns} dataSource={props} pagination={false} />
            </Form.Item>
        </Form>
    )
}