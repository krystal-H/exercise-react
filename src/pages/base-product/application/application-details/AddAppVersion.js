import React, { Component } from 'react';
import { Input, Form, Button, Icon, Select, Modal, Tooltip, InputNumber } from 'antd';
import { UploadFileClass } from "../../../../components/upload-file";
import { Notification } from '../../../../components/Notification';
import TextAreaCounter from '../../../../components/textAreaCounter/TextAreaCounter';

import './addAppVersion.scss'

const { TextArea } = Input;
const { Option } = Select;

class AddAppVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: '',
            appType: 1, // 1 android 2 ios
        }
    }

    handleCancel = (type) => {
        const { showDialog } = this.props;
        showDialog(type);
    };

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll, getFieldValue } = this.props.form;
        const { createAppVersion, curAppVersionDetail } = this.props;
        const appType = getFieldValue('appType');
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let appVersionId = curAppVersionDetail.appVersionId;
                // android
                if (appType === 1 || appType === undefined) {
                    let { url } = this.state;
                    // 创建
                    if (!appVersionId) {
                        if (!url && JSON.stringify(curAppVersionDetail) === '{}') {
                            Notification({
                                description:'请先上传文件，自动生成升级链接！',
                                type:'warn'
                            });
                            return false;
                        }
                    } else {
                        url = url === '' ? curAppVersionDetail.url : url;
                    }
                    createAppVersion({ ...values, url, appVersionId });
                } else {
                    createAppVersion({ ...values, appVersionId });
                }
            }
        });
    };

    getUrl = () => {
        let fileListUrl = this.versionApk.getFileListUrl();
        this.setState(() => {
            return {
                url: fileListUrl[0],
            }
        })
    };

    componentDidMount = () => {
        let { curAppVersionDetail } = this.props;
        if (JSON.stringify(curAppVersionDetail) !== '{}') {
            let fileList = [{
                uid: '-1', // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
                name: curAppVersionDetail.url,
                status: 'done',
                url: curAppVersionDetail.url,
            },];
            setTimeout(() => {
                this.versionApk.setState({ fileList });
            })
        }
    };

    validateMainVersion = (rule, value, callback) => {
        const reg = /^[0-9]*$/;
        if (!value) {
            callback('请输入版本序列标识，仅支持数值型');
        } else if (!reg.test(value)) {
            callback('版本序列标识仅支持数值型');
        } else if (value.length > 100) {
            callback('最多可以输入100个数值型数据');
        }
        callback();
    };

    render() {
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const { showAppVersionDialog, curAppVersionId, curAppVersionDetail, appInfo } = this.props;
        const formItemLayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 19 }
        };
        let title = curAppVersionId ? '编辑应用版本' : '创建应用版本';
        let { androidPkg, iosBundleId } = appInfo;
        const appType = getFieldValue('appType');
        const status = getFieldValue('status') || 1;
        return (
            <Modal
                width="50%"
                visible={showAppVersionDialog}
                centered={true}
                title={title}
                className="add-version-modal"
                onCancel={() => this.handleCancel('showAppVersionDialog')}
                maskClosable={false}
                footer={[
                    <Button key="submit" type="primary" onClick={this.handleSubmit}>
                        确认
                    </Button>,
                    <Button key="cancel" onClick={() => this.handleCancel('showAppVersionDialog')}>
                        取消
                    </Button>
                ]}
            >
                <div className="add-version-from-wrapper">
                    <Form {...formItemLayout} className="add-version-from">
                        <Form.Item
                            label="版本序列标识"
                            wrapperCol={ { span: 10 }}
                        >
                            {getFieldDecorator('mainVersion', {
                                rules: [
                                    {
                                        validator: this.validateMainVersion,
                                    }
                                ],
                            })
                            (<Input placeholder="请输入版本序列标识" style={{ width: 'calc(100% )' }} />)}
                        </Form.Item>
                        <Form.Item
                            label="版本号"
                            wrapperCol={ { span: 10 }}
                        >
                            {getFieldDecorator('externalVersion', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入版本号',
                                    },
                                    {
                                        max: 100,
                                        message: '最多可以输入100个字符',
                                    },
                                ],
                            })
                            (<Input
                                placeholder='推荐使用XYZ的格式，如：V1.1.0'
                            />)}
                        </Form.Item>
                        <Form.Item
                            label="版本类型"
                            wrapperCol={ { span: 10 }}
                        >
                            {getFieldDecorator('appType', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择版本类型',
                                    },
                                ],
                            })
                            (<Select
                                showSearch
                                placeholder="请选择版本类型"
                                optionFilterProp="children"
                            >
                                {<Option value={1}>Android版</Option>}
                                {<Option value={2}>iOS版</Option> }
                            </Select>)}
                        </Form.Item>
                        {(appType === 1 || appType === undefined) && <Form.Item
                            label="版本附件"
                        >
                            <UploadFileClass
                                onRef={ref => this.versionApk = ref}
                                format='.apk'
                                maxSize={200}
                                isNotImg={true}
                                cb={this.getUrl}
                            />
                        </Form.Item>}
                        {(appType === 1 || appType === undefined) && <Form.Item
                            label="升级链接"
                        >
                            <a href="javascript:">{this.state.url || curAppVersionDetail.url}</a>
                            <div className="url-desc">上传附件链接后自动生成升级链接</div>
                        </Form.Item>}
                        {appType === 2 && <Form.Item
                            label="升级链接"
                        >
                            {getFieldDecorator('url', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入链接',
                                    },
                                ],
                            })
                            (<Input
                                placeholder='请确保链接填写完全正确'
                                style={{ width: 'calc(53% )' }}
                            />)}
                            <div className="url-desc">请先将应用包上传到iOS应用市场，然后将获取的链接复制到这里</div>
                        </Form.Item>}
                        <Form.Item
                            label="升级方式"
                        >
                            {getFieldDecorator('status', {
                                initialValue: 1,
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择升级方式',
                                    },
                                ],
                            })
                            (<Select
                                showSearch
                                placeholder="请选择升级方式"
                                optionFilterProp="children"
                                style={{ width: 'calc(53% )', marginRight: '6px' } }>
                                <Option value={1}>普通升级</Option>
                                <Option value={2}>强制升级</Option>
                            </Select>)}
                            <Tooltip
                                title={status === 1 ? '用户可选择是否升级到新版本，不升级仍然可以继续使用' : '用户必须确认升级才可以继续使用'}
                                placement="top"><Icon type="question-circle-o" /></Tooltip>
                        </Form.Item>
                        <TextAreaCounter
                            label='备注'
                            formId='releaseNote'
                            astrictNub={100}
                            placeholder="升级内容的提示信息，用户查看升级时可见。最多输入100个字符。"
                            getFieldDecorator={getFieldDecorator}
                            isRequired={true}
                            getFieldValue={getFieldValue}
                        />
                    </Form>
                </div>
            </Modal>
        );
    }
}

export const AddAppVersionForm = Form.create({
    name: 'addAppVersion',
    // onFieldsChange(props, changedFields) {
    //     console.log('changedFields', changedFields);
    //     if (JSON.stringify(changedFields) === '{}') {
    //         return;
    //     }
    //     props.changeCurApi(changedFields);
    // },
    mapPropsToFields(props) {
        const { curAppVersionDetail, appInfo } = props;
        let { appVersionType } = appInfo;
        let correctMap = null;
        // 版本的ios和android反了
        if (appVersionType.value === 1) {
            correctMap = 2;
        } else {
            correctMap = 1;
        }
        let curAppVersionDetailMap = {};
        if (curAppVersionDetail) {
            for (let key of Object.keys(curAppVersionDetail)) {
                curAppVersionDetailMap[key] = Form.createFormField({
                    value: curAppVersionDetail[key],
                })
            }
        }
        curAppVersionDetailMap.appType = Form.createFormField({
            // android and ios
            value: appVersionType.value === 3 ? 1 : correctMap,
        })
        return curAppVersionDetailMap;
    }
})(AddAppVersion);
