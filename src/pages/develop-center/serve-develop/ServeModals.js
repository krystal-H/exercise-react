import React,{useState,useEffect} from 'react'
import {Modal,Input,Select,Form,Table} from 'antd'
import { Paths, get } from '../../../api'

const {Option} = Select
const {TextArea} = Input

const PATTERN = /^[\w\u4E00-\u9FA5]{1,30}$/
const PLACEHOLDER = '中英文、数字、下划线，长度不超过30'
const NUMPATTERN = /^[1-9]\d{0,9}$/
const NUMPLACEHOLDER = '正整数，不超过10位'
const TEXtAREATXT  = '不超过50个字符'

export const AddServe = Form.create({ name: 'form_in_modal-project-add' })(function({form,visible,onCancel,onOk,projectId,projectList}) {
    const {getFieldDecorator,validateFieldsAndScroll} = form

    const submitHandle = ()=> {
        validateFieldsAndScroll((err, values) => {
            if(!err) {
                if(projectId) {
                    values.projectId = projectId
                }

                onOk({...values})
            }
        })
    }

    return  <Modal
        visible={visible}
        width={600}
        title="新增服务"
        centered={true}
        closable={false}
        onCancel={onCancel}
        onOk={submitHandle}
        destroyOnClose={true}
        maskClosable={false}
    >
        <Form {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}
                labelAlign="left">
            <Form.Item label="服务名称">
                {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入服务名称' },
                            { pattern: PATTERN, message: PLACEHOLDER }],
                    initialValue: ''
                })(<Input placeholder={PLACEHOLDER} />)
                }
            </Form.Item>
            {
                !projectId && 
                <Form.Item label="所属项目">
                    {getFieldDecorator('projectId', {
                        rules: [{ required: true, message: '请选择所属项目' }],
                        initialValue: ''
                    })( <Select >
                            <Option value="">选择所属项目</Option>
                            {
                                projectList.map(item => {
                                    const {projectId,name} = item;
                                return <Option value={projectId} key={projectId}>{name}</Option>
                                })
                            }
                        </Select>)
                    }
                </Form.Item>
            }
            <Form.Item label="服务类型">
                {getFieldDecorator('type', {
                    rules: [{ required: true, message: '请选择服务类型' }],
                    initialValue: ''
                })( <Select >
                        <Option value="">选择服务类型</Option>
                        <Option value="0">业务逻辑服务</Option>
                        <Option value="1">数据分析服务</Option>
                    </Select>)
                }
            </Form.Item>
            <Form.Item label="服务描述">
                {getFieldDecorator('desc', {
                    // rules: [{ required: true, message: '请输入服务描述' },
                    //         { pattern: PATTERN, message: PLACEHOLDER }],
                    initialValue: ''
                })(<TextArea placeholder={TEXtAREATXT} maxLength={50} rows={3}/>)
                }
            </Form.Item>
        </Form>
    </Modal>
})

export const CallExplain = function({visible,onCancel,paramList = [],url}){ 
    const PageColumns =  [
        {
            title: '参数',
            dataIndex: 'param_name',
            key: 'param_name'
        },
        {
            title: '类型',
            dataIndex: 'param_typ',
            key: 'param_typ',
            render:(text,record,index) => {
                const {param_typ} = record
                return (
                    <span>{['String', 'int', 'long', 'float', 'double', 'boolean'][param_typ || 0]}</span>
                )
            }
        },
        {
            title: '默认值',
            dataIndex: 'param_default',
            key: 'param_default'
        },
        {
            title: '描述',
            dataIndex: 'param_desc',
            key: 'param_desc',
            width: 160
        }
    ]
    return  <Modal
        visible={visible}
        width={600}
        title="调用说明"
        centered={true}
        closable={true}
        onCancel={onCancel}
        onOk={onCancel}
        okText={null}
        cancelText={null}
        destroyOnClose={true}
        maskClosable={false}
    >
        <div style={{marginBottom:'24px'}}><b>invokeUrl : </b><a> { url || '--'}</a></div>
        <Table columns={PageColumns}
            dataSource={paramList}
            rowKey="param_name"
            pagination={false}
            />
    </Modal>
}

export const CopyServe = Form.create({ name: 'form_in_modal-project-copy' })(function({form,onCancel,onOk,visible,editContent}) {
    const {getFieldDecorator,validateFieldsAndScroll} = form
    const {id,name,desc} = editContent

    const submitHandle = ()=> {
        validateFieldsAndScroll((err, values) => {
            if(!err) {
                onOk({...values}) 
            }
        })
    }

    return  <Modal
        visible={visible}
        width={600}
        title={id!==-1&&"修改"||"复制服务"}
        centered={true}
        closable={false}
        onCancel={onCancel}
        onOk={submitHandle}
        destroyOnClose={true}
        maskClosable={false}
    >
        <Form {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }}
                labelAlign="left">
            <Form.Item label="服务名称">
                {getFieldDecorator('name', {
                    rules: [{ required: true, message: '请输入服务名称' },
                            { pattern: PATTERN, message: PLACEHOLDER }],
                    initialValue: name
                })(<Input placeholder="" />)
                }
            </Form.Item>
            <Form.Item label="服务描述">
                {getFieldDecorator('desc', {
                    initialValue: desc
                })(<TextArea placeholder={TEXtAREATXT} maxLength={50} rows={3}/>)
                }
            </Form.Item>
        </Form>
    </Modal>
})

export const ServeSourceConfig = Form.create({ name: 'form_in_modal-serve-source' })(_props => {
    const [publishConfig,setPublishConfig] = useState({})
    const {form,onCancel,onOk,visible,envdata={},confirmLoading} = _props
    const {getFieldDecorator,validateFieldsAndScroll} = form
    const {actionType,testEnv,proEnv,name,id} = envdata;
    const {cpu="",memory="",replicas="",timeout=""} = publishConfig

    useEffect(() => {
        visible && get(
            Paths.getPublishParam,
            {
                serviceId:id,
                envType:actionType==1?1:0
            },
            {loading:true}
        ).then(
            res =>{
                setPublishConfig({...(res.data || {})})
            }
        )
    }, [visible])

    const submitHandle = ()=> {
        validateFieldsAndScroll((err, values) => {
            if(!err) {
                let _cpu = values.cpu,
                    _memory = values.memory,
                    _replicas = values.replicas,
                    _timeout = values.timeout;
                let nochange = _cpu===cpu && _memory===memory && _replicas===replicas && _timeout===timeout;
                onOk({...values,changed:!nochange})
            }
        })
    }
    
    let evetxt = "测试环境", actiontxt = "发布";
    if(actionType==2){
        evetxt = "生产环境";
        if(proEnv==3){
            actiontxt = "启动";
        }
    }else{
        if(testEnv==3){
            actiontxt = "启动";
        }
    }


    return  <Modal
        visible={visible}
        width={600}
        title={`${evetxt}${actiontxt}服务：${name}`}
        centered={true}
        closable={false}
        onCancel={onCancel}
        onOk={submitHandle}
        destroyOnClose={true}
        maskClosable={false}
        confirmLoading={confirmLoading}
    >
        <div style={{fontSize:"12px"}}>服务运行参数：</div>
        <Form {...{ labelCol: { span: 10 }, wrapperCol: { span: 10} }}
                labelAlign="right">
            <Form.Item label="CPU（微核）">
                {getFieldDecorator('cpu', {
                    rules: [{ required: true, message: '请输入CPU核数' },
                            { pattern: NUMPATTERN, message: NUMPLACEHOLDER }],
                    initialValue: cpu
                })(<Input placeholder={NUMPLACEHOLDER} />)
                }
            </Form.Item>
            <Form.Item label="内存（M）">
                {getFieldDecorator('memory', {
                    rules: [{ required: true, message: '请输入内存' },
                            { pattern: NUMPATTERN, message: NUMPLACEHOLDER }],
                    initialValue: memory
                })(<Input placeholder={NUMPLACEHOLDER} />)
                }
            </Form.Item>
            <Form.Item label="副本数（个）">
                {getFieldDecorator('replicas', {
                    rules: [{ required: true, message: '请输入副本数' },
                            { pattern: NUMPATTERN, message: NUMPLACEHOLDER }],
                    initialValue: replicas
                })(<Input placeholder={NUMPLACEHOLDER} />)
                }
            </Form.Item>
            <Form.Item label="函数超时时长（秒）">
                {getFieldDecorator('timeout', {
                    rules: [{ required: true, message: '请输入超时时长' },
                            { pattern: NUMPATTERN, message: NUMPLACEHOLDER }],
                    initialValue: timeout
                })(<Input placeholder={NUMPLACEHOLDER} />)
                }
            </Form.Item>
        </Form>
    </Modal>
})