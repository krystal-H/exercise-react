/**
 * Created by xiaodaoguang on 2019/10/18.
 */
import React, { Component } from 'react';
import { Input, Form, Button, Modal, Row, Col, Radio, Checkbox } from 'antd';
import { UploadFileClass } from '../../../../../components/upload-file';
import { Notification } from '../../../../../components/Notification';

const { TextArea } = Input;

class AddApplicationForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkedList: [],
            checkedAndroid: false,
            checkedIOS: false,
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { saveAppBaseInfo } = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let fileListUrl = this.uploadFile.getFileListUrl();
                if (fileListUrl.length <= 0) {
                    Notification({
                        description:'请选择文件！',
                        type:'warn'
                    });
                    return;
                }
                values.appIconLow = fileListUrl[0];
                saveAppBaseInfo(values);
            }
        });
    };

    handleCancel = () => {
        const { handleClick } = this.props;
        handleClick();
    };

    onChange = (checkedType, e) => {
        this.setState(() => {
            return {
                [checkedType]: e.target.checked,
            }
        });
    };

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { visibleAddApplication } = this.props;
        const { checkedAndroid, checkedIOS } = this.state;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 18 }
        };
        const appType = getFieldValue('appType');
        return (
            <Modal
                width="650px"
                visible={visibleAddApplication}
                title="创建应用"
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={[
                    <Button key="submit" type="primary" onClick={this.handleSubmit}>
                        创建应用
                    </Button>,
                    <Button key="cancel" onClick={this.handleCancel}>
                        取消
                    </Button>
                ]}
            >
                <div className="add-application-wrapper">
                    <Form  {...formItemLayout} className="application-form">
                        <Form.Item
                            label="应用名称"
                            hasFeedback
                        >
                            {getFieldDecorator('appName', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入应用名称',
                                    },
                                    {
                                        max: 20,
                                        message: '最多可以输入20个字符',
                                    },
                                ],
                            })
                            (<Input
                                placeholder='最多可以输入20个字符'
                            />)}
                        </Form.Item>
                        <Form.Item
                            label="应用类型"
                        >
                            {getFieldDecorator('appType', {
                                initialValue: '0',
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入应用名称',
                                    },
                                ],
                            })
                            (<Radio.Group buttonStyle="solid">
                                <Radio.Button value="0">移动应用</Radio.Button>
                                <Radio.Button value="2">小程序应用</Radio.Button>
                            </Radio.Group>)}
                            <br />
                            {(appType === '0' || appType === undefined) &&
                            <span className="app-type-desc">移动APP类应用，Android版和iOS版共用一个APPID</span> }
                            {appType === '2' && <span className="app-type-desc">微信的小程序应用</span>}
                        </Form.Item>
                        {
                            (appType === '0' || appType === undefined) && <Form.Item
                                className="appVersion"
                                label="应用版本"
                            >
                                <Row gutter={8}>
                                    <Col span={24}>
                                        <Checkbox
                                            onChange={(e) => this.onChange('checkedAndroid', e) }
                                        >Android版</Checkbox>
                                    </Col>
                                </Row>
                                <Row gutter={8}>
                                    <Col span={16}>
                                        <Form.Item
                                            label=" "
                                            hasFeedback
                                            labelCol={{ span: 1 }}
                                            wrapperCol={{ span: 22 }}
                                            className="android-input"
                                            colon={false}
                                        >
                                            {getFieldDecorator('androidPkg', {
                                                rules: [
                                                    {
                                                        required: checkedAndroid,
                                                        message: '请输入Android版的应用包名',
                                                    },
                                                    {
                                                        max: 200,
                                                        message: '最多可以输入200个字符',
                                                    },
                                                ],
                                            })
                                            (<Input
                                                placeholder='请输入Android版的应用包名'
                                                disabled={!checkedAndroid}
                                            />)}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            label=" "
                                            hasFeedback
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 20 }}
                                            className="android-schema-input"
                                            colon={false}
                                        >
                                            {getFieldDecorator('androidSchema', {
                                                rules: [
                                                    {
                                                        max: 50,
                                                        message: '最多可以输入50个字符',
                                                    },
                                                ],
                                            })
                                            (<Input
                                                placeholder='请输入分享Schema'
                                                disabled={!checkedAndroid}
                                            />)}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={8}>
                                    <Col span={24}>
                                        <Checkbox onChange={(e) => this.onChange('checkedIOS', e)}>iOS版</Checkbox>
                                    </Col>
                                    <Col span={16}>
                                        <Form.Item
                                            label=" "
                                            hasFeedback
                                            labelCol={{ span: 1 }}
                                            wrapperCol={{ span: 22 }}
                                            className="ios-input"
                                            colon={false}
                                        >
                                            {getFieldDecorator('iosBundleId', {
                                                rules: [
                                                    {
                                                        required: checkedIOS,
                                                        message: '请输入iOS版的应用包名',
                                                    },
                                                    {
                                                        max: 200,
                                                        message: '最多可以输入200个字符',
                                                    },
                                                ],
                                            })
                                            (<Input
                                                placeholder='请输入iOS版的应用包名'
                                                disabled={!checkedIOS}
                                            />)}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            label=" "
                                            hasFeedback
                                            labelCol={{ span: 0 }}
                                            wrapperCol={{ span: 20 }}
                                            className="ios-schema-input"
                                            colon={false}
                                        >
                                            {getFieldDecorator('iosSchema', {
                                                rules: [
                                                    {
                                                        max: 50,
                                                        message: '最多可以输入50个字符',
                                                    },
                                                ],
                                            })
                                            (<Input
                                                placeholder='请输入iOS版的应用包名'
                                                disabled={!checkedIOS}
                                            />)}
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form.Item>
                        }
                        {
                            appType === '2' &&
                            <Form.Item
                                label="微信应用ID"
                                hasFeedback
                            >
                                {getFieldDecorator('weChatAppId', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入在微信申请时的APPID',
                                        },
                                        {
                                            max: 100,
                                            message: '最多可以输入100个字符',
                                        },
                                        {
                                            pattern: /^[a-zA-Z0-9]*$/,
                                            message: 'APPID仅支持数字或字母',
                                        },
                                    ],
                                })
                                (<Input placeholder='请输入在微信申请时的APPID' />)}
                            </Form.Item>

                        }
                        {
                            appType === '2' &&
                            <Form.Item
                                label="微信应用Secret"
                                hasFeedback
                            >
                                {getFieldDecorator('secret', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入在微信申请时的APP的Secret',
                                        },
                                        {
                                            max: 100,
                                            message: '最多可以输入100个字符',
                                        },
                                        {
                                            pattern: /^[a-zA-Z0-9]*$/,
                                            message: 'APP的Secret仅支持数字或字母',
                                        },
                                    ],
                                })
                                (<Input placeholder='请输入在微信申请时的APP的Secret' />)}
                            </Form.Item>
                        }
                        <Form.Item
                            label="应用图标"
                        >
                            <UploadFileClass onRef={el => this.uploadFile = el} format=".png" />
                        </Form.Item>
                        <Form.Item
                            label="应用构建模式"
                        >
                            <Button type="primary">
                                开发模式
                            </Button>
                        </Form.Item>
                        <Form.Item
                            label="应用简介"
                            hasFeedback
                        >
                            {getFieldDecorator('appDesc', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入应用简介',
                                    },
                                    {
                                        max: 100,
                                        message: '最多可以输入100个字符',
                                    },
                                ],
                            })
                            (<TextArea rows={4}
                                       placeholder="最多可以输入100个字符"
                            />)}
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        );
    }
}

export const WrappedAddApplicationForm = Form.create({
    name: 'addApplication',
})(AddApplicationForm);
