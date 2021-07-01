import React, { Component } from 'react';
import { Input,Form,Modal} from 'antd';
import { post, Paths} from '../../../api';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';

export default Form.create({
    name: 'add-dataflow-rule',
})(props=>{
    let {
        form:{validateFieldsAndScroll,getFieldValue,getFieldDecorator,resetFields},
        closeMod,
        visable,
        transferId=undefined,//undefined 新增，有值 编辑
        transferName='',
        transferDesc='',
    } = props;
    let modtitle = transferId&&'编辑规则'||'新增规则';

    const addOk = () => {
        validateFieldsAndScroll((err, values) => {
            let {transferName,transferDesc} = values;
            if(!err){
                post(Paths.saveTransfer,{transferName,transferDesc,transferId},{needJson:true}).then((res) => {
                    closeMod(true);
                    resetFields();
                });
            }  
        });
    }
    const addCancel=()=>{
        closeMod();
        resetFields();
    }
    return (
        <Modal
            title={modtitle}
            visible={visable}
            width={600}
            onOk={addOk}
            onCancel={addCancel}
            maskClosable={false}
            className="self-modal"
        >
            <Form labelCol= {{ span:4}} wrapperCol={{span:20}} >
                <Form.Item label="规则名称">
                    {getFieldDecorator('transferName', {
                        rules: [{ required: true, message: '请输入规则名称'},{ max: 50, message: '最大输入长度为50' }],
                        initialValue:transferName
                        
                    })(<Input placeholder="请输入规则名称" />)
                    }
                </Form.Item>
                <TextAreaCounter
                    label="规则描述"
                    formId='transferDesc'
                    astrictNub='50'
                    rows='4'
                    placeholder='规则描述'
                    getFieldDecorator={getFieldDecorator}
                    getFieldValue={getFieldValue}
                    initialVal={transferDesc}
                />
            </Form>
        </Modal>
    )
});

