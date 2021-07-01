import React from 'react'
import {Form,Input,Row,Col,Tooltip} from 'antd'

export default function VerificationCodeInput({getFieldDecorator,imgSrc,refreshVeriCode}) {
   
    return (
        <Form.Item>
            <Row>
                <Col span={15}>
                    {getFieldDecorator('veriCode', {
                        rules:[{required:true,message:'请输入验证码'},{len:4,message:'验证码长度为4'}],
                        initialValue: '',
                        
                    })(<Input placeholder="请输入验证码" />)}
                </Col>
                <Col span={8} offset={1}>
                    <div className="code-img-wrapper">
                        <Tooltip title="点击刷新验证码">
                            <img style={{height:'100%',width:'100%',cursor:'pointer'}} 
                                src={imgSrc}
                                onClick={refreshVeriCode} 
                                alt="验证码图片"/>
                        </Tooltip>
                    </div>
                </Col>
            </Row>
        </Form.Item>
    )
}