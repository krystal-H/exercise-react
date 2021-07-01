import React, { Component } from 'react'
import {Form,Input,Button,Radio,Checkbox,Row,Col} from 'antd';
import VerificationCodeInput from '../../components/verification-code-input/VerificationCodeInput';
import {post,Paths} from '../../api';
import { encryption ,getVcodeImgUrl,psdPattern} from '../../util/util';

class EmailAuthWordForm extends Component {

    state = {
        vCodeImgUrl:getVcodeImgUrl()
    }
    refreshVeriCode = () => {
        this.setState({
            vCodeImgUrl: getVcodeImgUrl()
        })
    }
    handleSubmit = (e) => {
        e.preventDefault();

        let {form,changeType,type = 1,code} = this.props;

        form.validateFields((err, values) => {
          if (!err) {
            let _values = {...values},
                path = Paths.forgetPasswordAuth,
                data = _values;

            if (type === 2) {
                path = Paths.resetEmail;
                data = {
                    ..._values,
                    code
                }
            }

            post(path,data,{
              loading:true
            }).then(data => {
                if (type === 1) {
                    changeType({
                        type:1,
                        email:_values.account
                    })
                }

                if (type === 2) {
                    changeType({
                        type:1,
                        isResetEmail:true,
                        NewEmail:_values.account
                    })
                }

            }).catch(error => {
                if (type === 1) {
                    this.refreshVeriCode()
                }
                this.resetPswAndCode()
            })
          }
        });
    }
    resetPswAndCode = () => {
        let {form,type = 1} = this.props,
            _array = (type === 1) ?  ['account','veriCode'] : ['account'];

        form.resetFields(_array)
    }
    render () {
        let {form,loading,type=1} = this.props,
        {vCodeImgUrl} = this.state,
        {getFieldDecorator} = form;

        return (
            <Form className="form-wrapper"  onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('account', {
                        rules:[{ required: true, message: '请输入注册邮箱' },
                        { type: 'email', message: '请确认输入邮箱格式是否正确' }
                        ],
                        initialValue: ''
                    })(<Input placeholder={`请输入您的${(type === 1) ? "注册" : "修改"}邮箱`} />)
                    }
                </Form.Item>
                {
                    type === 1 && 
                    <VerificationCodeInput getFieldDecorator={getFieldDecorator}
                                           imgSrc={vCodeImgUrl}
                                           refreshVeriCode={this.refreshVeriCode}></VerificationCodeInput>
                }
                <Form.Item>
                    <Button type="primary" 
                            htmlType="submit" 
                            loading={loading}>发 送</Button>
                </Form.Item>
            </Form>
        )
    }
}

class SetPassWordForm extends Component {
    resetPswAndCode = () => {
        let {form} = this.props;
        form.resetFields(['password','passwordComfirm'])
    }
    handleSubmit = e => {
        e.preventDefault();

        let {form,code,email,changeType,cType} = this.props;

        form.validateFields((err, values) => {
          if (!err) {
              
            let _values = {
                password : encryption(values.password)
            }

            post(Paths.setPassword,{
                ..._values,
                code,
                account:email,
                type:cType
            },{
              loading:true
            }).then(data => {
                changeType({
                    type:4
                })
            }).catch(error => {
                this.resetPswAndCode()
            })
          }
        }) 
    }

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
          callback('两次密码输入必须一致');
        } else {
          callback();
        }
    };

    render () {
        let {form,style} = this.props,
        {getFieldDecorator} = form;

        return (
            <Form className="form-wrapper" style={style} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入账号密码' },
                        { pattern: psdPattern, message: '8到18位须同时包含字母、数字、符号'}],
                        initialValue: ''    
                    })(<Input.Password placeholder="设置您的登录密码" />)}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('passwordComfirm', {
                        rules: [{ required: true, message: '请确认账号密码' },
                                { validator: this.compareToFirstPassword}],
                        initialValue: ''
                    })(<Input.Password placeholder="请再次输入登录密码" />)}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" 
                            htmlType="submit">保 存</Button>
                </Form.Item>
            </Form>
        )
    }
}

class CloseAccountForm extends Component {
    state = {
        otherReason:''
    }
    handleSubmit = e => {
        e.preventDefault();

        let {form,code,email,changeType} = this.props,
            {otherReason}=this.state;

        form.validateFields((err, values) => {
            values.reason = values.reason.join();

          if (!err) {
            let _values = {
                ...values,
                applyDesc:otherReason
            }

            post(Paths.cancelAccount,{
                ..._values,
                code,
                account:email
            },{
              loading:true
            }).then(data => {
                changeType({
                    type:4
                })
            })
          }
        });
    }

    otherReasonChange = (value) => {
        this.setState({
            otherReason:value
        })
    }

    render () {
        let {form,style,isCloseAccount} = this.props,
            {otherReason} = this.state,
            {getFieldDecorator,getFieldValue} = form,
            reasons = getFieldValue('reason') || [];
        
        return (
            <Form className={"form-wrapper " + (isCloseAccount ? 'for-close-account' : '')} style={style} layout="horizontal" onSubmit={this.handleSubmit}>
                <Form.Item label="注销账户原因">
                    {getFieldDecorator('reason', {
                        initialValue: [],
                    })(
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row>
                                <Col span={6}>
                                <Checkbox value="1"> 平台无法满足我的需求 </Checkbox>
                                </Col>
                                <Col span={6}>
                                <Checkbox value="2"> 自身业务调整或经营需要 </Checkbox>
                                </Col>
                                <Col span={6}>
                                <Checkbox value="3"> 有更好的平台选择 </Checkbox>
                                </Col>
                                {   reasons.includes('3') &&
                                    <Col span={6}>
                                        <Input type="text"
                                            value={otherReason} 
                                            placeholder="请输入其他平台名称"
                                            onChange={e => this.otherReasonChange(e.target.value)}></Input>
                                    </Col>
                                }
                            </Row>
                        </Checkbox.Group>,
                    )}
                </Form.Item>
                <Form.Item label="保持硬件可用">
                    {getFieldDecorator('hardware',{
                        initialValue:'1'
                    })(
                        <Radio.Group style={{ width: '100%' }}>
                            <Row>
                                <Col span={6}>
                                    <Radio value="1">保持硬件产品可用</Radio>
                                </Col>
                                <Col span={6}>
                                    <Radio value="2">硬件产品不可用</Radio>
                                </Col>
                            </Row>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item label="保持应用可用">
                    {getFieldDecorator('appApply',{
                        initialValue:'1'
                    })(
                        <Radio.Group style={{ width: '100%' }}>
                            <Row>
                                <Col span={6}>
                                    <Radio value="1">保持应用&APP可用</Radio>
                                </Col>
                                <Col span={6}>
                                    <Radio value="2">应用&APP不可用</Radio>
                                </Col>
                            </Row>
                        </Radio.Group>
                    )}
                </Form.Item>
                <Form.Item className="center">
                    <Button type="primary" 
                            htmlType="submit">提 交</Button>
                </Form.Item>
            </Form>
        )
    }
}

class SubResetPassWordForm extends Component {
    resetPswAndCode = () => {
        let {form} = this.props;
        form.resetFields(['oldPassword','password','passwordComfirm'])
    }
    handleSubmit = e => {
        e.preventDefault();

        let {form} = this.props;

        form.validateFields((err, values) => {
          if (!err) {
            let _values = {
                oldPassword:encryption(values.oldPassword),
                password : encryption(values.password)
            }

            post(Paths.subResetPassword,{
                ..._values
            },{
              loading:true
            }).then(data => {
                this.goLogin()
            }).catch(error => {
                this.resetPswAndCode()
            })
          }
        });
    }

    goLogin = () => {
        let {history} = this.props;

       history.push({
            pathname:'/account/login'
       })
    }

    compareToFirstPassword = (rule, value, callback) => {
        const { form } = this.props;
        if (value && value !== form.getFieldValue('password')) {
          callback('两次密码输入必须一致');
        } else {
          callback();
        }
    };

    render () {
        let {form,style} = this.props,
        {getFieldDecorator} = form;

        return (
            <Form className="form-wrapper" style={style} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('oldPassword', {
                        rules: [{ required: true, message: '请输入原登录密码' },
                                // { pattern: /^[a-zA-Z]\w{5,17}$/ , message: '密码要求是以字母开头的6到18个字母或数字或下划线'}
                            ],
                        initialValue: ''    
                    })(<Input.Password placeholder="请输入原登录密码" />)}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: '请输入账号密码' },
                        { pattern: psdPattern, message: '8到18位须同时包含字母、数字、符号'}],
                        initialValue: ''    
                    })(<Input.Password placeholder="请设置新的登录密码" />)}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('passwordComfirm', {
                        rules: [{ required: true, message: '请确认账号密码' },
                                { validator: this.compareToFirstPassword}],
                        initialValue: ''
                    })(<Input.Password placeholder="请再次输入登录密码" />)}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" 
                            htmlType="submit">保 存</Button>
                </Form.Item>
            </Form>
        )
    }
}


export const EmailAuthFormWrapper = Form.create({name:'email-auth-form'})(EmailAuthWordForm)
export const SetPassWordFormWrapper = Form.create({name:'set-password-form'})(SetPassWordForm)
export const CloseAccountFormWrapper = Form.create({name:'close-account-form'})(CloseAccountForm)
export const SubResetPassWordFormWrapper = Form.create({name:'sub-reset-password-form'})(SubResetPassWordForm)