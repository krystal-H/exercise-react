import React, { useEffect, useState } from 'react'
import {Form,Table,Select} from 'antd'
import {getNodeNameFormItem} from '../common'

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

    console.log("--------pProps---",pProps);

    // dataSourceList = [{id:1,name:'a'}];

    const { getFieldDecorator } = form,
          {nodeName,datasourceId,tableCode,selectedRowKeys,dataSource,tableList,filedList} = input;

    const  destSelectChange = (value,index,_options) => {
        const _item = _options.filter(item => item.srcCode === value)[0]

        let {srcCode,srcName,srcType,srcTableCode} = _item,
            _data = [...dataSource]

        _data[index] = {..._data[index],...{
            destName:srcName,
            destCode:srcCode,
            destType:srcType,
            destTableCode:srcTableCode
        }}

        changeNodeDataByIds([id],[
            {
                input:{
                    dataSource:_data
                }
            }
        ])
    }

    const COLUMNS = [{
                title: '输出节点',
                dataIndex: 'srcName',
                key: 'srcName',
                width:'100px',
            },
            {
                title: '数据库字段',
                dataIndex: 'destName',
                key: 'destName',
                width:'100px',
                render:(text,record,index) => {
                    let {srcType,destCode,srcCode} = record,
                        // _options = filedList.filter(item => item.srcType === srcType),
                        _options = [...filedList],
                        disabled = !selectedRowKeys.includes(srcCode);

                    return (
                        <Select value={destCode || ''}
                                onChange={value => destSelectChange(value,index,_options)}
                                style={{width:'90px'}} 
                                disabled={disabled}>
                            {
                                _options.map(item => {
                                    let {srcCode,srcName} = item;
                                    
                                    return <Option key={srcCode} value={srcCode}>{srcName}</Option>
                                })
                            }
                        </Select>
                    )
                }
            },
            {
                title: '字段类型',
                dataIndex: 'srcType',
                key: 'srcType',
                width:'100px',
            }
        ]

    useEffect( () => {
        console.log("---useEffect---",pProps);
        let preCodes = dataSource.map(item => item.srcCode),
            pCodes = pProps.map(item => item.srcCode),
            _data = [...dataSource];

        pProps.forEach(item => {
            if(!preCodes.includes(item.srcCode)){
                _data.push({...item,...{
                    destName:'',
                    destCode:'',
                    destType:'',
                    destTableCode:''
                }})
            }
        })

        _data = _data.filter(item => pCodes.includes(item.srcCode));

        console.log("---useEffect-_data--",_data);

        changeNodeDataByIds([id],[
            {
                input:{
                    dataSource:_data
                }
            }
        ])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    /*
    没有连接之前节点 直接选中输出节点的话，useEffect死循环执行，导致点击下拉框页面直接崩溃，暂时删除useEffect对[pProps]的依赖
    */

    const getTableList = (_datasourceId) => {

        getTableByDatasource(_datasourceId).then( (_tableList) => {
            changeNodeDataByIds([id],[
                {
                    input:{
                        tableList:_tableList,
                        filedList:[]
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
                        filedList:_filedList
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

    const rowSelection = {
        onChange: (_selectedRowKeys, selectedRows) => {
            changeNodeDataByIds([id],[
                {
                    input:{
                        selectedRowKeys:_selectedRowKeys
                    }
                }
            ])
        },
        selectedRowKeys
    };

    return (
        <Form>
            {/* {getNodeNameFormItem(getFieldDecorator,nodeName)} */}
            <Form.Item label="数据库">
                {getFieldDecorator('datasourceId', {
                    rules: [{ required: true, message: '请选择数据库！' }],
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
            <Form.Item label="数据表">
                {getFieldDecorator('tableCode', {
                    rules: [{ required: true, message: '请选择数据表！' }],
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
            <Form.Item label="输出映射(数据类型要和数据库匹配)">
                <Table rowKey="srcCode"
                       rowSelection={rowSelection}
                       columns={COLUMNS} 
                       dataSource={dataSource} 
                       pagination={false}/>
            </Form.Item>
        </Form>
    )
}