import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Input, Button, Table, Divider, Modal, Tooltip, Tag ,Form} from 'antd';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';
import {Notification} from '../../../components/Notification';
import './caseManage.scss'

class ApplyForm extends Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        this.props.onRef(this);
    }
    render() {
        let formlayout = {
            labelCol: { span: 4 },
            wrapperCol: { span: 20 },
        };
        let { getFieldDecorator,getFieldValue } = this.props.form;
        return ( 
                <Form  {...formlayout} onSubmit={this.handleSubmit}>
                   
                    <Form.Item label="cpu(核)">
                        {getFieldDecorator('namespaceCpu', {
                            rules: [{ required: true, message: '请输入cpu'},{ max: 3, message: '最大输入长度为3' }],
                            // initialValue: ''
                        })(<Input placeholder="输入申请核数(核)" />)
                        }
                    </Form.Item>
                    <Form.Item label="内存(G)">
                        {getFieldDecorator('namespaceMemory', {
                            rules: [{ required: true, message: '请输入内存'},{ max: 3, message: '最大输入长度为3' }],
                            // initialValue: ''
                        })(<Input placeholder="输入申请内存" />)
                        }
                    </Form.Item>
                    <Form.Item label="存储(G)">
                        {getFieldDecorator('namespaceStorage', {
                            rules: [{ required: true, message: '请输入存储'},{ max: 4, message: '最大输入长度为4' }],
                            // initialValue: ''
                        })(<Input placeholder="输入申请存储空间" />)
                        }
                    </Form.Item>
                </Form>  
          
        )
    }
}
export const ApplyForForm = Form.create({
    name: 'applyFor',
})(ApplyForm);
