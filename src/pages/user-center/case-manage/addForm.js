import React, { Component } from 'react';
import {post, Paths} from '../../../api';
import { Input,Form} from 'antd';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';
import {Notification} from '../../../components/Notification';
import './caseManage.scss'

class CaseAddForm extends Component {
    constructor(props){
        super(props);
        this.state = {
           
        };
       
    }
   
    componentDidMount() {
        this.props.onRef(this);
        
    }

    //确认保存
    affirm = () => {
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {

            if(!err){
                post(Paths.addCase,values).then((res) => {
                    if(res.code==0){
                        Notification({type:'success',description:'实例创建成功！'});
                        this.props.form.resetFields();//注销form内容。
                        this.props.onAddClose();
                        this.props.pagerIndex(1);
                    }
                });
            }
            
            
        });
    }
    blurr=(key)=>{
        const { getFieldValue,setFieldsValue } = this.props.form;
        let thisval = getFieldValue(key);
        if(thisval==''||thisval==0){
            let setobj = {};
            setobj[key] = {namespaceCpu:20,namespaceMemory:10,namespaceStorage:100}[key];
            setFieldsValue(setobj);
        }
    }

    render() {
        let formlayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        let { getFieldDecorator,getFieldValue } = this.props.form;
        return ( 
                <Form  {...formlayout} onSubmit={this.handleSubmit}>
                    <Form.Item label="实例名称">
                        {getFieldDecorator('name', {
                            rules: [{ required: true, message: '请输入实例名称'},
                                    { max: 20, message: '最大输入长度为20' }],
                        })(<Input placeholder="请输入实例名称" />)
                        }
                    </Form.Item>
                    <TextAreaCounter
                        label="备注"
                        formId='desc'
                        astrictNub='50'
                        rows='3'
                        isRequired={true}
                        placeholder='实例备注' 
                        getFieldDecorator={getFieldDecorator}
                        getFieldValue={getFieldValue}
                    />
                    <Form.Item label="cpu(核)">
                        {getFieldDecorator('namespaceCpu', {
                            rules: [{
                                max: 3,
                                required: true,
                                pattern: /^\d{1,3}$/,
                                message: "请输入不超过3位数的数字"
                            }],
                            initialValue: 20
                        })(<Input placeholder="请输入申请核数（核）/默认20核" onBlur={this.blurr.bind(this,'namespaceCpu')} />)
                        }
                    </Form.Item>
                    <Form.Item label="内存(G)">
                        {getFieldDecorator('namespaceMemory', {
                            rules: [{ max: 3, required: true,
                                pattern: /^\d{1,3}$/,
                                message: "请输入不超过3位数的数字"}],
                            initialValue: 10
                        })(<Input placeholder="请输入申请内存（G）/默认10G" onBlur={this.blurr.bind(this,'namespaceMemory')} />)
                        }
                    </Form.Item>
                    <Form.Item label="存储(G)">
                        {getFieldDecorator('namespaceStorage', {
                            rules: [{ max: 4, required: true,
                                pattern: /^\d{1,4}$/,
                                message: "请输入不超过4位数的数字"}],
                            initialValue: 100
                        })(<Input placeholder="请输入申请存储空间（G）/默认100G" onBlur={this.blurr.bind(this,'namespaceStorage')} />)
                        }
                    </Form.Item>
                </Form>
          
        )
    }
}
export const AddForm = Form.create({
    name: 'caseAdd',
})(CaseAddForm);
