import React, { useState } from 'react'
import {Modal,Form,Collapse,Input,Table,Checkbox,Button,Icon} from 'antd'
import { Notification } from '../../../../components/Notification';
import { DateTool } from '../../../../util/util';
import { cloneDeep } from "lodash";

const { Panel } = Collapse;

export const ConfigModal =  Form.create({
    name:'sql-config'
})(
    function ConfigModal({
        visible,
        cancelHandle,
        form,
        requestList = [],
        responseList= [],
        invokeUrl,
        setConfigModalData,
        saveData,
        apiName,
        onPage
    }) {
    
        const { getFieldDecorator, setFieldsValue} = form;


        const changeParam = (value,index,key,pKey) => {
            setConfigModalData(pre => {
                let _data = {...pre}

                _data[pKey][index][key] = value

                return _data
            })
        }

        const REQUEST_COLUMNS = [{
            title: '属性名称',
            dataIndex: 'key',
            key: 'key',
            width:'200px'
        },
        {
            title: '数据类型',
            dataIndex: 'type',
            key: 'type',
            render:(text,record,index) => {
                let {type} = record
                return (
                    <select value={type} onChange={e => changeParam(e.target.value,index,'type','requestList')}>
                        <option value="">请选择</option>
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="DOUBLE">DOUBLE</option>
                        <option value="DATE">DATE</option>
                    </select>
                )
            }
        },
        {
            title: '是否必填',
            dataIndex: 'ro',
            key: 'ro',
            render:(text,record,index) => {
                let {ro} = record
                return (
                    <Checkbox checked={ro} 
                              onChange={e => changeParam(e.target.checked,index,'ro','requestList')}></Checkbox>
                )
            }
        }]

        const RESPONSE_COLUMNS = [{
            title: '属性名称',
            dataIndex: 'key',
            key: 'key',
            width:'200px'
        },
        {
            title: '数据类型',
            dataIndex: 'type',
            key: 'type',
            render:(text,record,index) => {
                let {type} = record
                return (
                    <select value={type} onChange={e => changeParam(e.target.value,index,'type','responseList')}>
                        <option value="">请选择</option>
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="DOUBLE">DOUBLE</option>
                        <option value="DATE">DATE</option>
                    </select>
                )
            }
        }]

        const submit = () => {
            form.validateFields((err, values) => {

                if (!err) {

                    let error = false;

                    [...requestList,...responseList].forEach(item => {
                        if (item.type === '') {
                            error = true
                        }
                    })
    
                    if (error) {
                        Notification({
                            message:'请为所有参数选择数据类型！'
                        })
    
                        return;
                    }

                    saveData({...values})
                }
              });
        }
    
        return (
            <Modal
                className="sql-modal-self-class"
                visible={visible}
                width={600}
                title="生成API"
                closable={true}
                centered={true}
                okText="提交"
                onOk={submit}
                onCancel={cancelHandle}
                destroyOnClose={true}
                maskClosable={false}
            >
                <div className="sql-config-wrapper">
                    <Collapse defaultActiveKey={['1','2','3','4']}>
                        <Panel header={`基本信息`} key="1">
                            <Form.Item label="API名称">
                                {getFieldDecorator('apiName', {
                                    rules: [{ required: true, message: '请输入API名称！' }],
                                    initialValue:apiName
                                })(
                                    <Input
                                        placeholder="请输入API名称！"
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label="ApiSrn">
                                {getFieldDecorator('apiSrn', {
                                    initialValue:invokeUrl,
                                    rules: [{ required: true, message: '请输入ApiSrn！' }],
                                })(
                                    <Input
                                    />
                                )}
                            </Form.Item>
                        </Panel>
                        <Panel header={`请求参数`} key="2">
                            <Table rowKey="key"
                                columns={REQUEST_COLUMNS} 
                                dataSource={requestList} 
                                pagination={false}/>    
                        </Panel>
                        <Panel header={`返回参数`} key="3">
                            <Table rowKey="key"
                                columns={RESPONSE_COLUMNS} 
                                dataSource={responseList} 
                                pagination={false}/>      
                        </Panel>
                        <Panel header={`高级设置`} key="4">
                            <Form.Item>
                                {getFieldDecorator('onPage', {
                                    valuePropName: 'checked',
                                    initialValue: onPage,
                                })(
                                    <Checkbox>开启返回结果分页</Checkbox>
                                )}
                            </Form.Item>
                        </Panel>
                    </Collapse>
                </div>
            </Modal>
        )
    }
)

export function TestModal ({
    visible,
    cancelHandle,
    params,
    sqlTest,
}) {
    console.log('---params--',params)

    const [valArr,setValArr] = useState(new Array(params.length))


    const test = () => {
       sqlTest(valArr)
    }

    const changeValue=(e,i)=>{
        let val = e.target.value
        let newvalarr = cloneDeep(valArr)
        newvalarr[i] = val
        setValArr(newvalarr)
    }

    return (
        <Modal
            className="modal-sql-paramsconfig"
            visible={visible}
            title="参数配置"
            closable={true}
            centered={true}
            footer={null}
            onCancel={cancelHandle}
            destroyOnClose={true}
            maskClosable={false}
        >
            <div className="test-config-wrapper">
                {params.map((param,index)=>{
                    return <div key={index} className='param'>
                                <span className='key'>{param} :</span>
                                <Input 
                                    className='input' 
                                    placeholder='输入参数值'
                                    onChange={(e)=>{changeValue(e,index)}}
                                /> 
                            </div>
                })}
                <Button className='testbtn' type="primary" onClick={test}>开始调试</Button>
            </div>
        </Modal>
    )
}

export function DownHistory ({
    visible,
    cancelHandle,
    downHistoryLi,
    getDownTslHistory,
    downHistoryLoading,
    addTslHistory,
}) {

    const COLUMNS = [
        {
            title:'导出时间',
            dataIndex:'createTime',
            width:150,
            // render: text => <span>{DateTool.utcToDev(text)}</span>
            render: text => <span>{DateTool.pekingToStr(text)}</span>
            
        },
        {
            title:'路径地址',
            dataIndex:'filePath',
        },
        {
            title:'状态',
            dataIndex:'status',
            width:90,
            render: text => <span>{{'0':'处理中','1':'成功','2':'失败'}[text] || '--'}</span>
        },
    ]

    // const add=()=>{
    //     addTslHistory
    // }

    
    return (
        <Modal
            className="modal-downHistoryLi"
            visible={visible}
            title="导出列表"
            closable={true}
            centered={true}
            footer={null}
            onCancel={cancelHandle}
            destroyOnClose={true}
            maskClosable={false}
            width={800}
        >
            <div className='topbtnbox'>
                <Button className='addbtn' type='link' onClick={addTslHistory} >新增导出</Button>  
                <Icon
                    type="sync"
                    title="刷新列表"
                    spin={downHistoryLoading}
                    className="refresh"
                    onClick={getDownTslHistory}
                />
            </div>
            <Table 
                rowKey="createTime"
                columns={COLUMNS}
                dataSource={downHistoryLi}
                scroll={{ y: 600 }}
                pagination={false}
            />
               
        </Modal>
    )
}
