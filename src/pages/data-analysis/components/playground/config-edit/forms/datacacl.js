import React, { useMemo } from 'react'
import {Form,Radio,Table,Checkbox} from 'antd'
import {getNodeNameFormItem,COMMON_COLUMNS,InputAndSelectInLine,NUMBER_TYPE} from '../common'

const FuncOptions = [
    { label: '最大值', value: 'max' },
    { label: '最小值', value: 'min' },
    { label: '平均值', value: 'sum' },
    { label: '求和', value: 'avg' },
  ]

export default function ({
    form,
    input,
    id,
    pProps = [],
    changeNodeDataByIds
}) {
    const { getFieldDecorator } = form,
          { nodeName,props,granularity,dimsCode,measureCode,funcs,windowType,windowDurings,slideDurings} = input;
    
    const _options = useMemo(() => {
        let _numberProps = [],
            _notNumberProps = [];
            
        pProps.forEach(item => {
            // TODO:打开数值类型参数过滤
            // if (item.srcType === NUMBER_TYPE) {
            //     _numberProps.push({...item})
            // } else {
            //     _notNumberProps.push({...item}) 
            // }
            _numberProps.push({...item})
            _notNumberProps.push({...item}) 
        });

        return [
            _numberProps.map(item => {
                let {srcCode,srcName} = item;
    
                return {
                    label:srcName,
                    value:srcCode
                }
            }),
            _notNumberProps.map(item => {
                let {srcCode,srcName} = item;
    
                return {
                    label:srcName,
                    value:srcCode
                }
            })
        ]
    },[pProps])

    const check = (str) => {
        return (rule, value, callback) => {
            if (value[str] > 0) {
                return callback();
            }
            callback('请输入大于0的数字');
        };

    }

    const dealProps = (_dims = dimsCode,_measure = measureCode,_funcs = funcs) => {
        let _props = pProps.filter(item => _dims.includes(item.srcCode))

        _measure = pProps.filter(item => _measure.includes(item.srcCode))
        _funcs = FuncOptions.filter(item => _funcs.includes(item.value))

        _measure.forEach(item => {
            let {srcCode,srcName,srcType,srcTableCode = ''} = item;

            _funcs.forEach(_item => {
                let {label,value} = _item;

                _props.push({
                    srcName:`${srcName}_${label}`,
                    srcCode:`${value}_${srcCode}`,
                    srcType,
                    srcTableCode
                })
            })
        })

        return _props
    }

    const changeHandle = (values,key) => {

        let _props = [],
            _dims=null,
            _measure = null;
        
        if (key === 'dimsCode') {
            _props = dealProps(values)
            _dims = pProps.filter(item => values.includes(item.srcCode)).map(item => {
                let {srcCode,srcName,srcTableCode = ''} = item;

                return {
                    srcCode,
                    srcName,
                    srcTableCode
                }
            })
        }
        if (key === 'measureCode') {
            _props = dealProps(undefined,values)
            _measure = pProps.filter(item => values.includes(item.srcCode)).map(item => {
                let {srcCode,srcName,srcTableCode = ''} = item;

                return {
                    srcCode,
                    srcName,
                    srcTableCode
                }
            })
        }
        if (key === 'funcs') {
            _props = dealProps(undefined,undefined,values)
        }

        let _newMerge = {
            props:[..._props]
        }

        if (_dims) {_newMerge.dims = _dims}
        if (_measure) {_newMerge.measure = _measure}

        changeNodeDataByIds([id],[
            {
                input:_newMerge
            }
        ])
    }

    return (
        <Form>
            {getNodeNameFormItem(getFieldDecorator,nodeName)}
            <Form.Item label="统计粒度">
                {getFieldDecorator('granularity', {
                    rules: [{ required: true, message: '请选择统计粒度' }],
                    initialValue:granularity
                })(
                    <Radio.Group>
                        <Radio value={0}>单个设备</Radio>
                        <Radio value={1}>所有设备</Radio>
                    </Radio.Group>
                )}
            </Form.Item>
            <Form.Item label="统计维度(非数值类型)">
                {getFieldDecorator('dimsCode', {
                    rules: [{ required: true, message: '请选择统计粒度' }],
                    initialValue:dimsCode
                })(
                    <Checkbox.Group onChange={values => changeHandle(values,'dimsCode')} options={_options[1]}/>
                )}
            </Form.Item>
            <Form.Item label="计算度量(数值类型)">
                {getFieldDecorator('measureCode', {
                    rules: [{ required: true, message: '请选择计算度量' }],
                    initialValue:measureCode
                })(
                    <Checkbox.Group onChange={values => changeHandle(values,'measureCode')} options={_options[0]}/>
                )}
            </Form.Item>
            <Form.Item label="统计函数">
                {getFieldDecorator('funcs', {
                    rules: [{ required: true, message: '请选择统计函数' }],
                    initialValue:funcs
                })(
                    <Checkbox.Group onChange={values => changeHandle(values,'funcs')} options={FuncOptions}/>
                )}
            </Form.Item>
            <Form.Item label="时间窗口类型">
                {getFieldDecorator('windowType', {
                    rules: [{ required: true, message: '请选择统计粒度' }],
                    initialValue:windowType
                })(
                    <Radio.Group>
                        <Radio value={0}>滑动窗口</Radio>
                        <Radio value={1}>滚动窗口</Radio>
                    </Radio.Group>
                )}
            </Form.Item>
            <Form.Item label="窗口时长">
                {getFieldDecorator('windowDurings', {
                    initialValue: windowDurings,
                    rules: [{ validator: check('windowDuring') }],
                })(
                    <InputAndSelectInLine inputString="windowDuring" selectString="windowUnit" optionsConfig={
                        [{label:'秒',value:'s'},{label:'分',value:'m'},{label:'时',value:'h'}]
                    }></InputAndSelectInLine>
                )}
            </Form.Item>
            {
                windowType === 0 &&
                <Form.Item label="滑动时长">
                    {getFieldDecorator('slideDurings', {
                        initialValue: slideDurings,
                        rules: [{ validator: check('slideDuring') }],
                    })(
                        <InputAndSelectInLine inputString="slideDuring" selectString="slideUnit" optionsConfig={
                            [{label:'秒',value:'s'},{label:'分',value:'m'},{label:'时',value:'h'}]
                        }></InputAndSelectInLine>
                    )}
                </Form.Item>
            }
            <Form.Item label="输出数据">
                <Table columns={COMMON_COLUMNS}
                       rowKey="srcCode" 
                       dataSource={props} 
                       pagination={false}/>
            </Form.Item>
        </Form>
    )
}