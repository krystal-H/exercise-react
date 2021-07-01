import React, { useState, useMemo } from 'react'
import {Form,Select,Radio,Table} from 'antd'
// import {getDeviceListByProductId,getDownPropOrEventList} from '../../apis'
import {INPUT_DEFAULT_PROPS} from '../../nodes-container/configs'
import {COMMON_COLUMNS,getNodeNameFormItem} from '../common'

const {Option} = Select

export default function ({
    form,
    id,
    input = {},
    productList,
    getDeviceList,
    getPropOrEventList,
    getDownEventList,
    changeNodeDataByIds
}) {
    // input.deviceList = [{deviceId:1},{deviceId:2},{deviceId:333},{deviceId:441},{deviceId:5667},{deviceId:667}];


    const { getFieldDecorator, setFieldsValue} = form,
          {nodeName,productId,deviceIds = [],propEvent,propsCodes = [],props = [],eventTimeField,deviceList,propsOrEventList,eventList,eventIdentifier} = input;

    const eventTimeFieldList = useMemo( () => {
        return propsOrEventList.filter(item => propsCodes.includes(item.srcCode))
    },[propsOrEventList,propsCodes])
          
    const handleProductSelectChange = value => {
        Promise.all([getDeviceList(value),getPropOrEventList(value,propEvent)]).then(datas => {
            let [_deviceList,_propsOrEventList] = datas;

            changeNodeDataByIds([id],[
                {
                    input:{
                        deviceList:_deviceList,
                        deviceIds:[],
                        propsOrEventList:_propsOrEventList,
                        propsCodes:[],
                        props:[...INPUT_DEFAULT_PROPS],
                        // eventTimeField:''
                    }
                }
            ])

            setFieldsValue({
                deviceIds:[],
                propsCodes:[],
                // eventTimeField:''
            })
        })
    };

    const handlePropEventRadioChange = value => {
        if(value==0){
            // 请求属性或者事件
            getPropOrEventList(productId,value).then(_propsOrEventList => {
                changeNodeDataByIds([id],[
                    {
                        input:{
                            propsOrEventList:_propsOrEventList,
                            propsCodes:[],
                            props:[...INPUT_DEFAULT_PROPS],
                            // eventTimeField:''
                        }
                    }
                ])

                setFieldsValue({
                    propsCodes:[],
                    // eventTimeField:''
                })
            })

        }else{// 1
            getDownEventList(productId).then(_eventList => {
                changeNodeDataByIds([id],[
                    {
                        input:{
                            eventList:_eventList,
                            propsCodes:[],
                            eventIdentifier:'',
                            props:[...INPUT_DEFAULT_PROPS],
                            // eventTimeField:''
                        }
                    }
                ])

                setFieldsValue({
                    propsCodes:[],
                    eventIdentifier:''
                    // eventTimeField:''
                })
            })
        }
        
    }
    const handleEventSelectChange = val=>{
        // 选择事件后，请求属性事件
        getPropOrEventList(productId,1,val).then(_propsOrEventList => {
            changeNodeDataByIds([id],[
                {
                    input:{
                        propsOrEventList:_propsOrEventList,
                        propsCodes:[],
                        props:[...INPUT_DEFAULT_PROPS],
                        // eventTimeField:''
                    }
                }
            ])

            setFieldsValue({
                propsCodes:[],
                // eventTimeField:''
            })
        })

    }

    // 选中属性或者事件时，调整表格中的输出属性
    const handlePropsCodesSelectChange = (value = [])=> {
            
        let _props = propsOrEventList.filter(item => value.includes(item.srcCode))
 
        changeNodeDataByIds([id],[
            {
                input:{
                    props:[..._props,...INPUT_DEFAULT_PROPS]
                }
            }
        ])
    }

    

    return (
        <Form>
            {getNodeNameFormItem(getFieldDecorator,nodeName)}
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
                propEvent == 1 && 
                <Form.Item>
                    {getFieldDecorator('eventIdentifier', {
                        rules: [{ required: true, message: '请选择事件！' }],
                        initialValue:eventIdentifier
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
                {getFieldDecorator('propsCodes', {
                    rules: [{ required: true, message: `请选择${propEvent === '0' ? '属性' : '事件'}字段！` }],
                    initialValue:propsCodes
                })(
                    <Select  mode="multiple" onChange={handlePropsCodesSelectChange}>
                         {
                            propsOrEventList.map(item => {
                                const {srcName,srcCode,srcType} = item;
                                return <Option key={srcCode} value={srcCode}>{`${srcName}( ${srcCode} )`}</Option>
                            })
                         }
                    </Select>
                )}
            </Form.Item>
            <Form.Item>
                <Table rowKey="srcCode" columns={COMMON_COLUMNS} dataSource={props} pagination={false}/>
            </Form.Item>
            {/* <Form.Item label="事件时间字段">
                {getFieldDecorator('eventTimeField', {
                    rules: [{ required: true, message: '请选择事件时间字段！' }],
                    initialValue:eventTimeField
                })(
                    <Select >                        
                        {
                            eventTimeFieldList.map(item => {
                                const {srcName,srcCode,srcType} = item;
                                return <Option key={srcCode} value={srcCode}>{srcName}</Option>
                            })
                        }
                    </Select>
                )}
            </Form.Item> */}
        </Form>
    )
}