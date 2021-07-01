/**
 * Created by xiaodaoguang on 2019/10/18.
 */
import React, { memo, useState, useRef, useEffect } from 'react';
import { Input, Form, Row, Col, Icon } from 'antd';
import { Notification } from '../../../../../components/Notification';
import TextAreaCounter from '../../../../../components/textAreaCounter/TextAreaCounter';
import { UploadFileHooks } from '../../../../../components/upload-file';
import DoubleBtns from '../../../../../components/double-btns/DoubleBtns';
import { strToAsterisk } from '../../../../../util/util';

import './style.scss';

export const EditApplicationForm = memo(Form.create({
    name: 'editApplication',
    // onFieldsChange(props, changedFields) {
    //     // console.log('changedFields', changedFields);
    //     if (JSON.stringify(changedFields) === '{}') {
    //         return;
    //     }
    //     // props.changeCurApi(changedFields);
    // },
    mapPropsToFields(props) {
        const { appInfo } = props;
        let appInfoMap = {};
        for (let key of Object.keys(appInfo)) {
            appInfoMap[key] = Form.createFormField({
                ...appInfo[key],
                value: appInfo[key].value,
            })
        }
        return appInfoMap;
    }
})(memo((props) => {
    const uploadRef = useRef();
    const [showSecret, setShowSecret] = useState(false);
    const { getFieldDecorator,getFieldValue } = props.form;
    const formItemLayout = {
        labelCol: { span: 2 },
        wrapperCol: { span: 12 }
    };
    useEffect(() => {
        const { appInfo } = props;
        const { appIconLow } = appInfo;
        let fileList = [
            {
                uid: '-1', // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
                name: appIconLow.value,
                status: 'done',
                url: appIconLow.value,
            },
        ];
        uploadRef.current.setFileList(fileList);
    }, [props]); // 仅在props更改时更新

    const { appInfo } = props;
    const { appType, appId, appSecret } = appInfo;
    let appSecretText = showSecret ? appSecret.value : strToAsterisk(appSecret.value, 10);
    let showSecretType = showSecret ? 'eye-invisible' : 'eye';
    const handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = props.form;
        const { saveAppBaseInfo } = props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let fileListUrl = uploadRef.current.getFileListUrl();
                if (fileListUrl.length <= 0) {
                    Notification({
                        description:'请选择文件!',
                        type:'warn'
                    });
                    return;
                }
                values.appIconLow = fileListUrl[0];
                saveAppBaseInfo(values);
            }
        });
    };
    const handleCancel = () => {
        props.handleCancel('showEditAppForm');
    }
    return (
        <Form  {...formItemLayout} className="edit-application-form">
            <Form.Item
                label="应用名称"
                wrapperCol={{ span: 10 }}
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
            <Row gutter={8}>
                <Col span={2} className="app-icon-low-label">
                    <span className="form-require">应用图标</span>
                </Col>
                <Col span={12}>
                    <UploadFileHooks ref={uploadRef} format=".png" />
                </Col>
            </Row>
            <Form.Item
                label="应用类型"
            >
                {appType.value === 0 ? '移动应用' : '小程序应用'}
            </Form.Item>
            {
                (appType.value === 0 || appType.value === undefined) && <Form.Item
                    className="appVersion"
                    label="应用包"
                >
                    <Row gutter={8}>
                        <Col span={24}>
                            Android版
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={16}>
                            <Form.Item
                                label=""
                                hasFeedback
                                labelCol={{ span: 1 }}
                                wrapperCol={{ span: 22 }}
                                className="android-input"
                                colon={false}
                            >
                                {getFieldDecorator('androidPkg', {
                                    rules: [
                                        {
                                            max: 200,
                                            message: '最多可以输入200个字符',
                                        },
                                    ],
                                })
                                (<Input
                                    placeholder='请输入应用包名，例如com.example.mirror'
                                />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label=""
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
                                />)}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={8}>
                        <Col span={24}>
                            iOS版
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label=""
                                hasFeedback
                                labelCol={{ span: 1 }}
                                wrapperCol={{ span: 22 }}
                                className="ios-input"
                                colon={false}
                            >
                                {getFieldDecorator('iosBundleId', {
                                    rules: [
                                        {
                                            max: 200,
                                            message: '最多可以输入200个字符',
                                        },
                                    ],
                                })
                                (<Input
                                    placeholder='请输入应用包名，例如com.example.mirror'
                                />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label=""
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
                                    placeholder='请输入分享Schema'
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
                label="APPID"
                className="app-id"
            >
                <span>{appId.value}</span>
                <span className="appId-desc">由系统自动分配的APP唯一标识码</span>
            </Form.Item>
            <Form.Item
                label="APPSecret"
                className="app-secret"
            >
                {appSecretText}
                <Icon type={showSecretType} className="icon-display" style={{ marginLeft: '10px', fontSize: '18px' }}
                      theme="twoTone"
                      twoToneColor="#2874FF" onClick={() => setShowSecret(!showSecret)} />
                <span className="secret-desc">由系统自动分配的密码</span>
            </Form.Item>
            <Form.Item
                label="应用构建模式"
                wrapperCol={{ span: 6 }}
            >
                <span>开发模式</span>
            </Form.Item>
            <TextAreaCounter
                label='应用简介'
                formId='appDesc'
                astrictNub={100}
                placeholder="最多可以输入100个字符"
                getFieldDecorator={getFieldDecorator}
                isRequired={true}
                getFieldValue={getFieldValue}
            />
            <Form.Item>
                <DoubleBtns preHandle={handleSubmit} nextHandle={handleCancel} preText="确认" nextText="取消"
                            nextType='default' preType='primary' />
            </Form.Item>
        </Form>
    );
})));
