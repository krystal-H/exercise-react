import React, { Component } from 'react';
import { Input, Form, Radio } from 'antd';

class SubscriptionWayForm extends Component {

    componentDidMount() {
        this.props.onRef(this);
    }

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { createSubscription } = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                createSubscription();
            }
        });
    };

    render() {
        const { form, subscriptionWayForm } = this.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 2 },
            wrapperCol: { span: 22 }
        };
        const { pushWay } = subscriptionWayForm;
        return (
            <div className="third-content">
                <Form {...formItemLayout} className="subscription-way-form">
                    <Form.Item
                        label="订阅方式"
                    >
                        {getFieldDecorator('pushWay', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择订阅方式',
                                },
                            ],
                        })
                        (<Radio.Group>
                            <Radio value={0}>API数据PUSH形式</Radio>
                            <Radio value={1}>MQTT主题订阅</Radio>
                        </Radio.Group>)}
                    </Form.Item>
                    {
                        pushWay.value === 0 &&
                        <Form.Item
                            label="数据订阅URL"
                        >
                            {getFieldDecorator('url', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入数据订阅服务器的URL',
                                    },
                                ],
                            })
                            (<Input
                                placeholder={'请输入数据订阅服务器的URL'}
                                style={{ width: 'calc(70%)' }}
                            />)}
                            {/* <a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank' className="url-help">查看帮助文档</a> */}
                            <div className="url-desc">第三方云服务接口的惟一标识，供C-Life云推送服务给第三方云推送数据用的，现仅支持http方式。</div>
                        </Form.Item>
                    }
                    {
                        pushWay.value === 0 &&
                        <Form.Item
                            label="Token"
                        >
                            {getFieldDecorator('pushToken', {
                                rules: [
                                    {
                                        required: true,
                                        message: '填写验证token',
                                    },
                                ],
                            })
                            (<Input
                                placeholder={'填写验证token'}
                                style={{ width: 'calc(70%)' }}
                            />)}
                            <div className="token-desc">第三方云服务接口对接C-Life云推送服务的凭证，用来验证厂商服务接口的合法性。</div>
                        </Form.Item>
                    }
                </Form>
            </div>
        );
    }
}

export const WrappedSubscriptionWayForm = Form.create({
    name: 'subscriptionWay',
    onFieldsChange(props, changedFields) {
        if (JSON.stringify(changedFields) === '{}') {
            return;
        }
        props.changeFormData('subscriptionWayForm', changedFields);
    },
    mapPropsToFields(props) {
        const subscriptionWayForm = props.subscriptionWayForm;
        let subscriptionWayFormMap = {};
        for (let key of Object.keys(subscriptionWayForm)) {
            subscriptionWayFormMap[key] = Form.createFormField({
                ...subscriptionWayForm[key],
                value: subscriptionWayForm[key].value,
            })
        }
        return subscriptionWayFormMap;
    },
})(SubscriptionWayForm);
