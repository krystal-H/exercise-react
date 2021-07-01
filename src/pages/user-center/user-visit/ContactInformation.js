import React, { Component } from 'react'
import {Form,Input,Button} from 'antd';

const formItemLayout = {
    labelCol: {
        span: 4
    },
    wrapperCol: {
        span: 20
    },
};

class ContactInformation extends Component {
    handleSubmit = () => {

    }
    render() {
        let {form,loading} = this.props,
            { getFieldDecorator } = form;
        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item label="国家">
                    {getFieldDecorator('productName', {
                        // rules: [{ required: true, message: '请输入产品名称' },
                        //         { max: 20, message: '最大输入长度为20' }
                        //         ],
                        initialValue: '中国'
                    })(<Input placeholder="请选择国家" />)
                    }
                </Form.Item>
                <Form.Item label="联系地址">
                    {getFieldDecorator('productCode', {
                        // rules: [{ max: 20, message: '最大输入长度为20' }],
                        initialValue: '无论刮风还是下雨，太阳照常升起'
                    })(<Input placeholder="请输入联系地址" />)}
                </Form.Item>
                <Form.Item label="联系人">
                    {getFieldDecorator('productCode', {
                        // rules: [{ max: 20, message: '最大输入长度为20' }],
                        initialValue: '曙光女神'
                    })(<Input placeholder="请输入联系人" />)}
                </Form.Item>
                <Form.Item label="联系电话">
                    {getFieldDecorator('productCode', {
                        // rules: [{ max: 20, message: '最大输入长度为20' }],
                        initialValue: '13924703524'
                    })(<Input placeholder="请输入联系电话" />)}
                </Form.Item>
                <Form.Item wrapperCol={{ span: 24 }}>
                    <div className="ant-col ant-col-4 ant-form-item-label"></div>
                    <div>
                        <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
                    </div>
                </Form.Item>
            </Form>
        )
    }
}


const ContactInformationForm = Form.create({ name: 'contact-information' })(ContactInformation);


export default ContactInformationForm;