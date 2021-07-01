import React, { useState } from 'react'
import {Modal,Form,Input,Table,Checkbox,Button,Select,Radio} from 'antd'
import { Notification } from '../../../../components/Notification';
import {getDeviceListByProductId,getDownPropOrEventList,getDownDatasource,getDownTableByDatasource,getDownFieldsByDatasourceTable,getEventList} from '../playground/apis'
import { deleteLine } from '../../../logicDevelop/DrawView/store/action';

const {Option} = Select

const PRE_DATA = [
    {
        code:'eventTime',
        name:'事件时间',
        type:'varchar',
        intBit:'',
        doubleBit:''
    },
    {
        code:'windowEventTime',
        name:'窗口事件时间',
        type:'timestamp',
        intBit:'',
        doubleBit:''
    },
    {
        code:'deviceId',
        name:'设备id',
        type:'varchar',
        intBit:'',
        doubleBit:''
    },
    {
        code:'proceTime',
        name:'当前系统时间',
        type:'timestamp',
        intBit:'',
        doubleBit:''
    }
]  

export const InputConfigModal =  Form.create({
    name:'sql-link-input-config'
})(
    function ConfigModal({
        visible,
        cancelHandle,
        form,
        productList=[],
        setInputData,
        inputData
    }) {

        const [deviceList,setDeviceList] = useState(inputData.deviceList || [])
        const [eventList,setEventList] = useState([])
        const [_propEvent,set_propEvent] = useState(0)
        const [propsOrEventList,setPropsOrEventList] = useState(inputData.propsOrEventList || [])
        const [fields,setFields] = useState(inputData.fields || [...PRE_DATA])
    
        const { getFieldDecorator, setFieldsValue,getFieldValue} = form,
              {code = '',productId = '',deviceIds = [], propEvent="0",fieldsCodes = [],eventOffset=''} = inputData;

        const submit = () => {
            form.validateFields((err, values) => {

                if (!err) {
                    setInputData([
                        {
                            ...values,
                            fields,
                            deviceList,
                            propsOrEventList
                        }
                    ])
                    cancelHandle()
                }
              });
        }

        // 获取属性或者事件字段
        const getPropOrEventList = (productId,property,eventIdentifier) => {
            return getDownPropOrEventList({
                property,
                productId,
                eventIdentifier
            }).then(data => {
                return (data && data.data) || []
            })
        }

        const handleProductSelectChange = value => {
            getDeviceListByProductId({
                productId:value,
                pageRows:9999
            }).then(res => {
                setFieldsValue({
                    deviceIds:[]
                })
                setDeviceList((res.data && res.data.list) || [])
            })

            let propeventval = getFieldValue('propEvent');
            if(propeventval==0){
                getPropOrEventList(value,"0").then(data => {
                    setPropsOrEventList(data)
                    setFieldsValue({
                        fieldsCodes:[]
                    })
                })

            }

            
        }
        const handleEventSelectChange  = value => {
            const _productId = getFieldValue('productId')
            getPropOrEventList(_productId,1,value).then(data => {
                setPropsOrEventList(data)
                setFieldsValue({
                    fieldsCodes:[]
                })
            })   
        }

        // 获取事件列表
    const getDownEventList = _productId => {
        return getEventList({
            productId:_productId
        }).then(data => {
            return (data && data.data) || []
        })
    }


        const handlePropEventRadioChange = value => {
            const _productId = getFieldValue('productId')
            set_propEvent(value);

            if (!_productId) {
                Notification({
                    description:'请先选择一个产品'
                })

                return
            }
            if(value==0){
                getPropOrEventList(_productId,value).then(data => {
                    setPropsOrEventList(data)
                    setFieldsValue({
                        fieldsCodes:[]
                    })
                })

            }else{
                getDownEventList(_productId).then(_eventList => {
                    setEventList(_eventList);

                    setFieldsValue({
                        fieldsCodes:[]
                    })
                })


            }

            
        }

        const handlePropsCodesSelectChange = (_fieldsCodes = []) => {
            let _fields = fields.filter(item => _fieldsCodes.includes(item.code)),
                _nowCodes = _fields.map(item => item.code),
                needAdd = [];

            _fieldsCodes.forEach(item => {
                if (!_nowCodes.includes(item)) {
                    needAdd.push(item)
                }
            })

            propsOrEventList.forEach(item => {
                let {srcCode,srcName,srcType} = item;

                if (needAdd.includes(srcCode)) {
                    _fields.push({
                        code:srcCode,
                        name:srcName,
                        type:srcType,
                        intBit:'',
                        doubleBit:''
                    })
                }
            })

            setFields([...PRE_DATA,..._fields])
        }

        const changeFieldParam = (key,value,index) => {
            setFields(pre => {
                let _fields = [...pre];
                _fields[index][key] = value

                return _fields
            })
        }

        const COLUMNS = [{
            title: '字段名称',
            dataIndex: 'name',
            key: 'name',
            width:'100px',
        },
        {
            title: '字段编码',
            dataIndex: 'code',
            key: 'code',
            width:'100px',
        },
        {
            title: '字段类型',
            dataIndex: 'type',
            key: 'type',
            width:'100px',
        },
        {
            title: '整数位',
            dataIndex: 'intBit',
            key: 'intBit',
            width:'100px',
            render:(text,record,index) => {
                let {intBit} = record;

                return (
                    <input style={{width:'100px'}} type="number" value={intBit} onChange={e => changeFieldParam('intBit',e.target.value,index)}/>
                )
            }
        },
        {
            title: '小数位',
            dataIndex: 'doubleBit',
            key: 'doubleBit',
            width:'100px',
            render:(text,record,index) => {
                let {doubleBit} = record;

                return (
                    <input style={{width:'100px'}} type="number" value={doubleBit} onChange={e => changeFieldParam('doubleBit',e.target.value,index)}/>
                )
            }
        }]
    
        return (
            <Modal
                className="sql-modal-self-class"
                visible={visible}
                width={600}
                title="输入表"
                closable={true}
                centered={true}
                okText="保存"
                onOk={submit}
                onCancel={cancelHandle}
                destroyOnClose={true}
                maskClosable={false}
            >
                <div className="sql-link-input-config-wrapper">
                    <Form>
                        <Form.Item label="表名称（只允许字母,数字,下划线，必须以字母开头）">
                            {getFieldDecorator('code', {
                                rules: [{ required: true, message: '请输入表名称！' },{
                                    pattern:/^[a-zA-Z]+[a-zA-Z0-9_]{0,50}$/,message: '格式错误'
                                }],
                                initialValue:code
                            })(
                                <Input
                                    placeholder="请输入表名称！"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="选择产品">
                            {getFieldDecorator('productId', {
                                rules: [{ required: true, message: '请选择产品！' }],
                                initialValue:productId
                            })(
                                <Select onChange={handleProductSelectChange}>
                                    {
                                        productList.map(item => {
                                            const {productId,productName} = item;
                                            return <Option key={productId} value={productId}>{productName}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="选择设备">
                            {getFieldDecorator('deviceIds', {
                                rules: [{ required: true, message: '请选择设备！' }],
                                initialValue:deviceIds
                            })(
                                <Select mode="multiple">
                                    {
                                        deviceList.map(item => {
                                            const {deviceId} = item;
                                            return <Option key={deviceId} value={deviceId}>{deviceId}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="输入参数">
                            {getFieldDecorator('propEvent', {
                                rules: [{ required: true, message: '请选择输入参数！' }],
                                initialValue:propEvent
                            })(
                                <Radio.Group onChange={e => handlePropEventRadioChange(e.target.value)}>
                                    <Radio value="0">属性</Radio>
                                    <Radio value="1">事件</Radio>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        {
                            _propEvent == "1" && 
                            <Form.Item>
                                {getFieldDecorator('eventIdentifier', {
                                    rules: [{ required: true, message: '请选择事件！' }],
                                    // initialValue:''
                                })(
                                    <Select onChange={handleEventSelectChange} placeholder="请选择事件！">
                                        {
                                            eventList.map(item => {
                                                const {identifier,name} = item;
                                                return <Option key={identifier} value={identifier}>{name}</Option>
                                            })
                                        }
                                    </Select>
                                )}
                            </Form.Item>
                        }
                        <Form.Item >
                            {getFieldDecorator('fieldsCodes', {
                                rules: [{ required: true, message: `请选择${_propEvent === '0' ? '属性' : '事件'}字段！` }],
                                initialValue:fieldsCodes
                            })(
                                <Select  mode="multiple" onChange={handlePropsCodesSelectChange}>
                                    {
                                        propsOrEventList.map(item => {
                                            const {srcName,srcCode} = item;
                                            return <Option key={srcCode} value={srcCode}>{`${srcName}( ${srcCode} )`}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="窗口起始时间偏移（毫秒）">
                            {getFieldDecorator('eventOffset', {
                                rules: [{ required: true, message: '请输入窗口起始时间偏移！' }],
                                initialValue:eventOffset
                            })(
                                <Input
                                    placeholder="请输入窗口起始时间偏移！" type="number"
                                />
                            )}
                        </Form.Item>
                        <Form.Item>
                            <Table rowKey="code" columns={COLUMNS} dataSource={fields} pagination={false}/>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
)

export const OutputConfigModal =  Form.create({
    name:'sql-link-output-config'
})(
    function ConfigModal({
        visible,
        cancelHandle,
        form,
        changeOutput,
        inputData
    }) {

        const [dataSourceList,setDataSourceList] = useState(inputData.dataSourceList || [])
        const [tableList,setTableList] = useState(inputData.tableList || [])
        const [fieldsList,setFieldList] = useState(inputData.fieldsList || [])
        const [selectedRowKeys,setSelectedRowKeys] = useState(inputData.selectedRowKeys || [])
    
        const { getFieldDecorator, setFieldsValue,getFieldValue} = form,
              {code,dsType,dsId,tableCode} = inputData;

        const submit = () => {
            form.validateFields((err, values) => {

                if (!err) {
                    let fields = [],
                        error = false;

                    if(getFieldValue('dsType') != '5') {
                        fields = fieldsList.filter(item => selectedRowKeys.includes(item.code));
                    } else {
                        fields = [...fieldsList]

                        fields.forEach(item => {
                            if(!item.code) {
                                error = true
                            }
                        })
                    }

                    if (error) {
                        Notification({
                            description:'有参数未填完！'
                        })
                    }

                    changeOutput({...values,
                        fields,
                        fieldsList,
                        tableList,
                        dataSourceList,
                        selectedRowKeys
                    })

                    cancelHandle()
                }
              });
        }


        const handleDataSourceTypeSelectChange = value => {
            // 获取数据源数据
            getDownDatasource({type:value}).then(data => {
                if (data && data.data ){
                    setDataSourceList([...data.data])
                    setFieldsValue({
                        dsId:'',
                        tableCode:''
                    })
                    setTableList([])
                    setFieldList([])
                    setSelectedRowKeys([])
                } 
            })
        };

        const handleDataSourceSelectChange = datasourceId => {
            if (getFieldValue('dsType') == '5') {
                return;
            }
            getDownTableByDatasource({
                datasourceId
            }).then(data => {
                if (data && data.data) {
                    setTableList(data.data)
                    setFieldsValue({
                        tableCode:''
                    })
                    setFieldList([])
                    setSelectedRowKeys([])
                }
                
            })
        };

        const handleTableSelectChange = tableCode => {
            getDownFieldsByDatasourceTable({
                datasourceId:getFieldValue('dsId'),
                tableCode
            }).then(data => {
                if (data && data.data) {               
                    setFieldList(data.data.map(item => {
                        let {srcCode,srcName} = item

                        return {
                            code:srcCode,
                            type:'varchar',
                            name:srcName,
                            intBit: '',
                            doubleBit: ''
                        }
                    }))
                    setSelectedRowKeys([])
                }
            })
        };

        const changeFieldParam = (key,value,index) => {
            setFieldList(pre => {
                let _fields = [...pre];
                _fields[index][key] = value

                return _fields
            })
        }

        const addNewLine = () => {
            setFieldList(pre => {
                return [...pre,{
                    code:'',
                    type:'varchar',
                    name: '',
                    intBit: '',
                    doubleBit:'',
                    index: 10000 * Math.random()
                }]
            })
        }

        const deleteLine = (index) => {
            setFieldList(pre => {
                return [...pre.slice(0,index),...pre.slice(index + 1)]
            })
        }

        const COLUMNS = [
        {
            title: '字段编码',
            dataIndex: 'code',
            key: 'index',
            width:'100px',
            render:(text,record,index) => {
                let {code} = record;
                
                return (
                    getFieldValue('dsType') == '5' ?
                    <input style={{width:'100px'}} type="text" value={code} onChange={e => changeFieldParam('code',e.target.value,index)}/>
                    : <span>{code}</span>
                )
            }
        },
        {
            title: '字段类型',
            dataIndex: 'type',
            key: 'type',
            width:'100px',
            render:(text,record,index) => {
                let {type} = record;

                return (
                    <select value={type} onChange={e => changeFieldParam('type',e.target.value,index)}>
                        <option value="varchar">varchar</option>
                        <option value="double">double</option>
                        <option value="integer">integer</option>
                        <option value="time">time</option>
                        <option value="date">date</option>
                        <option value="timestamp(3)">timestamp(3)</option>
                        <option value="varbinary">varbinary</option>
                        <option value="decimal">decimal</option>
                        <option value="float">float</option>
                        <option value="bigint">bigint</option>
                        <option value="boolean">boolean</option>
                        <option value="tinyint">tinyint</option>
                        <option value="smallint">smallint</option>
                    </select>
                )
            }
        },
        {
            title: '整数位',
            dataIndex: 'intBit',
            key: 'intBit',
            width:'100px',
            render:(text,record,index) => {
                let {intBit} = record;

                return (
                    <input style={{width:'100px'}} type="number" value={intBit} onChange={e => changeFieldParam('intBit',e.target.value,index)}/>
                )
            }
        },
        {
            title: '小数位',
            dataIndex: 'doubleBit',
            key: 'doubleBit',
            width:'100px',
            render:(text,record,index) => {
                let {doubleBit} = record;

                return (
                    <input style={{width:'100px'}} type="number" value={doubleBit} onChange={e => changeFieldParam('doubleBit',e.target.value,index)}/>
                )
            }
        },
        {
            title: '操作',
            dataIndex: 'code',
            key: 'code',
            width:'100px',
            render:(text,record,index) => {
               
                return (
                   <a style={{marginLeft:'8px'}} onClick={e => deleteLine(index)}>删除</a>
                )
            }
        },
    ]
    
        const rowSelection = {
            onChange: (_selectedRowKeys, selectedRows) => {
                setSelectedRowKeys(_selectedRowKeys)
            },
            selectedRowKeys
        };


        return (
            <Modal
                className="sql-modal-self-class"
                visible={visible}
                width={600}
                title="输出表"
                closable={true}
                centered={true}
                okText="保存"
                onOk={submit}
                onCancel={cancelHandle}
                destroyOnClose={true}
                maskClosable={false}
            >
                <div className="sql-link-input-config-wrapper">
                    <Form>
                        <Form.Item label="表名称（只允许字母,数字,下划线，必须以字母开头）">
                            {getFieldDecorator('code', {
                                rules: [{ required: true, message: '请输入表名称！' },
                            {
                                pattern:/^[a-zA-Z]+[a-zA-Z0-9_]{0,50}$/,message: '格式错误'
                            }],
                                initialValue:code
                            })(
                                <Input
                                    placeholder="请输入表名称！"
                                />
                            )}
                        </Form.Item>
                        <Form.Item label="数据源类型">
                            {getFieldDecorator('dsType', {
                                rules: [{ required: true, message: '请选择数据源类型！' }],
                                initialValue:dsType
                            })(
                                <Select onChange={handleDataSourceTypeSelectChange}>
                                    {
                                        [{
                                            key:2,
                                            name:'mysql'
                                        },
                                        {
                                            key:5,
                                            name:'rocketMq'
                                        }].map(item => {
                                            let {name,key} = item;

                                            return (<Option key={key} value={key}>{name}</Option>)
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="数据库">
                            {getFieldDecorator('dsId', {
                                rules: [{ required: true, message: '请选择数据库！' }],
                                initialValue:dsId
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
                        {
                            getFieldValue('dsType') != '5' ?
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
                            </Form.Item>:
                            <Form.Item>
                                <Button type="primary" size="small" onClick={addNewLine}>新增一行</Button>
                            </Form.Item>
                        }
                        <Form.Item label="输出">
                            <Table rowKey={getFieldValue('dsType') != '5' ? 'code' : 'index'}
                                rowSelection={getFieldValue('dsType') != '5' ? rowSelection : undefined}
                                columns={getFieldValue('dsType') != '5' ? COLUMNS.slice(0,-1) : COLUMNS} 
                                dataSource={fieldsList}
                                scroll={{ y: 240 }} 
                                pagination={false}/>
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
)