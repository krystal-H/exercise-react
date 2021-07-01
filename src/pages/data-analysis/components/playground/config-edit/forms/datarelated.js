import React, { useState } from 'react'
import {Form,Table,Select,Radio} from 'antd'
import {COMMON_COLUMNS,getNodeNameFormItem} from '../common'

const {Option} = Select

export default function ({
    form,
    id,
    input = {},
    pProps = [],
    changeNodeDataByIds,
    dataSourceList,
    getTableByDatasource,
    getFieldsByDatasourceTable
}) {

    const { getFieldDecorator } = form,
          {nodeName,datasourceId,tableCode,relate,joinType,selectedRowKeys,tableList,filedList} = input;

    const getTableList = (_datasourceId) => {

        getTableByDatasource(_datasourceId).then( (_tableList) => {    
            changeNodeDataByIds([id],[
                {
                    input:{
                        tableList:_tableList,
                        tableCode:'',
                        filedList:[],
                        relate:{
                            dimFieldCode:''
                        },
                    }
                }
            ])
        })
    }

    const getFieldsList = (_tableCode) => {
        getFieldsByDatasourceTable(_tableCode,datasourceId).then((_filedList) => {
            changeNodeDataByIds([id],[
                {
                    input:{
                        filedList:_filedList,
                        relate:{
                            dimFieldCode:''
                        },
                    }
                }
            ])
        })
    }

    const handleDataSourceSelectChange = value => {
        getTableList(value)
    };

    const handleTableSelectChange = value => {
        getFieldsList(value)
    };

    const   checkRelate = (rule, value, callback) => {
                if (value.streamFieldCode && value.dimFieldCode) {
                    return callback();
                }
                callback('请选择关联字段');
            };

    const outProps = [...pProps,...filedList]

    const rowSelection = {
        onChange: (_selectedRowKeys, selectedRows) => {
            changeNodeDataByIds([id],[
                {
                    input:{
                        selectedRowKeys:_selectedRowKeys,
                        props:outProps.filter(item => _selectedRowKeys.includes(item.srcCode))
                    }
                }
            ])
        },
        selectedRowKeys
    };

    return (
        <Form>
            {getNodeNameFormItem(getFieldDecorator,nodeName)}
            <Form.Item label="选择数据源">
                {getFieldDecorator('datasourceId', {
                    rules: [{ required: true, message: '请选择数据源！' }],
                    initialValue:datasourceId
                })(
                    <Select onChange={handleDataSourceSelectChange}>
                        {
                            dataSourceList.map(item => {
                                let {name,id} = item;

                                return (<Option key={id} value={id}>{name}</Option>)
                            })
                        }
                    </Select>
                )}
            </Form.Item>
            <Form.Item label="指定维表">
                {getFieldDecorator('tableCode', {
                    rules: [{ required: true, message: '请选择维表！' }],
                    initialValue: tableCode
                })(
                    <Select onChange={handleTableSelectChange}>
                        {
                            tableList.map(item => {
                                let {code} = item;

                                return (<Option key={code} value={code}>{code}</Option>)
                            })
                        }
                    </Select>
                )}
            </Form.Item>
            <Form.Item label="设置连接">
                {getFieldDecorator('joinType', {
                    rules: [{ required: true, message: '请设置连接方式！' }],
                    initialValue:joinType
                })(
                    <Radio.Group>
                        <Radio value={0}>内连接</Radio>
                        <Radio value={1}>外连接</Radio>
                    </Radio.Group>
                )}
            </Form.Item>
            <Form.Item label="连接条件(类型必须匹配, 且维表字段为主键)">
                {getFieldDecorator('relate', {
                    initialValue: relate,
                    rules: [{ validator: checkRelate }],
                })(
                    <RelateInput streamOptions={pProps}
                                 changeNodeDataByIds={changeNodeDataByIds}
                                 id={id} 
                                 dimOptions={filedList}></RelateInput>
                )}
            </Form.Item>
            <Form.Item label="输出字段">
                <Table rowKey="srcCode"
                       rowSelection={rowSelection}
                       columns={COMMON_COLUMNS} 
                       dataSource={outProps} 
                       pagination={false}/>
            </Form.Item>
        </Form>
    )
}


class RelateInput extends React.Component {
  
    handletChange = (key,value) => {

        if(key === 'streamFieldCode') {
            const {streamOptions,changeNodeDataByIds,id} = this.props,
                  _item = streamOptions.map(item => item.srcCode === value)[0];

            let {srcTableCode} = _item;

            changeNodeDataByIds([id],[
                {
                    input:{
                        streamTableCode:srcTableCode || ''
                    }
                }
            ])
        }

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
      const {value,streamOptions,dimOptions} = this.props;
      return (
        <span>
            <span>流</span>
            <Select 
                value={value.streamFieldCode}
                onChange={value => this.handletChange('streamFieldCode',value)}
                style={{ width: '30%',margin:'0 2%'}}>
                    {
                        streamOptions.map(item => {
                            let {srcName,srcCode} = item;
                            return (
                                <Option key={srcCode} value={srcCode}>{srcName}</Option>
                            )
                        })
                    }
            </Select>
            <span> = 维表</span>
            <Select 
                value={value.dimFieldCode}
                onChange={value => this.handletChange('dimFieldCode',value)}
                style={{ width: '30%',margin:'0 2%'}}>
                    {
                        dimOptions.map(item => {
                            let {srcName,srcCode} = item;
                            return (
                                <Option key={srcCode} value={srcCode}>{srcName}</Option>
                            )
                        })
                    }
            </Select>
        </span>
      );
    }
  }