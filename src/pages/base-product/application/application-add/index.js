import React, { memo, useState, useRef } from 'react';
import { Input, Form, Select, Row, Col, Radio, Upload, Button, Icon, Checkbox } from 'antd';
import PageTitle from '../../../../components/page-title/PageTitle';
import { UploadFileHooks } from '../../../../components/upload-file';
import { Notification } from '../../../../components/Notification';
import DoubleBtns from '../../../../components/double-btns/DoubleBtns';
import { get, Paths, post } from '../../../../api';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import TextAreaCounter from '../../../../components/textAreaCounter/TextAreaCounter';

import './style.scss';

const { TextArea } = Input;
const { Option } = Select;

export default memo(function ApplicationAdd(props) {

    const saveAppBaseInfo = (params) => {
        let appType = params.appType;
        delete params.appType;
        params = { ...params, appMode: 1 };
        let url = Number(appType) === 0 ? 'saveAppBaseInfo' : 'saveMiniProgramsInfo';
        let app = Number(appType) === 0 ? '应用移动创建成功' : '小程序应用创建成功';
        post(Paths[url], {
            ...params
        }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                Notification({
                    message:'创建成功',
                    description:app,
                    type:'success'
                });
                let { history } = props;
                history.replace({
                    pathname: 'open/base/application/list',
                })
            }
        });
    };
    const handleCancel = () => {
        const { history } = props;
        history.goBack();
    }
    return (
        <section className="add-application-wrapper flex-column">
            <PageTitle backHandle={() => props.history.goBack()} title="新建应用" />
            <div className="add-application">
                <AddApplicationForm saveAppBaseInfo={saveAppBaseInfo} handleCancel={handleCancel} />
            </div>
        </section>
    )
})


const AddApplicationForm = memo(Form.create({
    name: 'addApplication',
})(memo((props) => {
    const [checkedAndroid, setCheckedAndroid] = useState(false);
    const [checkedIOS, setCheckedIOS] = useState(false);
    const { getFieldDecorator, getFieldValue } = props.form;
    const formItemLayout = {
        labelCol: { span: 3 },
        wrapperCol: { span: 12 }
    };
    const appType = getFieldValue('appType');
    const uploadRef = useRef();
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
                        description: '请选择文件！',
                        type:'warn'
                    });
                    return;
                }
                values.appIconLow = fileListUrl[0];
                saveAppBaseInfo(values);
            }
        });
    };
    const handleCancel = props.handleCancel;
    return (
        <Form  {...formItemLayout} className="add-application-form">
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
                <Col span={3} className="app-icon-low-label">
                    <span className="form-require">应用图标</span>
                </Col>
                <Col span={12}>
                    <UploadFileHooks ref={uploadRef} format=".png" />
                </Col>
            </Row>
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
                (<Radio.Group>
                    <Radio value="0">移动应用</Radio>
                    <Radio value="2">小程序应用</Radio>
                </Radio.Group>)}
                <br />
                {(appType === '0' || appType === undefined) &&
                <span className="app-type-desc">Android和iOS共用一个APPID</span> }
                {appType === '2' && <span className="app-type-desc">微信的小程序应用</span>}
            </Form.Item>
            {
                (appType === '0' || appType === undefined) && <Form.Item
                    className="appVersion"
                    label="应用包"
                >
                    <Row gutter={8}>
                        <Col span={24}>
                            <Checkbox
                                onChange={(e) => setCheckedAndroid(e.target.checked) }
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
                                            message: '请输入应用包名',
                                        },
                                        {
                                            max: 200,
                                            message: '最多可以输入200个字符',
                                        },
                                    ],
                                })
                                (<Input
                                    placeholder='请输入应用包名，例如com.example.mirror'
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
                            <Checkbox
                                onChange={(e) => setCheckedIOS(e.target.checked) }
                            >iOS版</Checkbox>
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
                                            message: '请输入应用包名',
                                        },
                                        {
                                            max: 200,
                                            message: '最多可以输入200个字符',
                                        },
                                    ],
                                })
                                (<Input
                                    placeholder='请输入应用包名，例如com.example.mirror'
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
                                    placeholder='请输入分享Schema'
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
                label="应用构建模式"
                wrapperCol={{ span: 6 }}
            >
                {getFieldDecorator('reportFormsType', {
                    initialValue: '开发模式'
                })
                (<Select>
                    <Option value='开发模式'>开发模式</Option>
                </Select>)}
            </Form.Item>
            <TextAreaCounter
                label='应用简介'
                formId='appDesc'
                astrictNub={100}
                placeholder="最多可以输入100个字符"
                getFieldDecorator={getFieldDecorator}
                getFieldValue={getFieldValue}
                isRequired={true}
            />
            <Form.Item>
                <DoubleBtns preHandle={handleSubmit} nextHandle={handleCancel} preText="确认" nextText="取消"
                            nextType='default' preType='primary' />
            </Form.Item>
        </Form>
    );
})));
