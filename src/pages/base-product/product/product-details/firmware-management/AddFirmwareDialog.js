import React, { Component } from 'react';
import { Input, Form, Select,Button } from 'antd';
import { get,post,Paths } from '../../../../../api';
import {Notification} from '../../../../../components/Notification';
import { UploadFileClass } from '../../../../../components/upload-file';
import LabelTip from '../../../../../components/form-com/LabelTip';
import './but.scss';

const { Option } = Select;

export const AddFirmwareDialog = Form.create({
    name: 'addFirmwareDialog'
})(
    class extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                deviceVersionTypeList:[],//固件列表
                deviceVersionType:'',//固件id
                allFirmwareVersionTypeList:[],//模块列表
                firmwareVersionType:'',//模块ID
                totalVersion:'',//固件标识
                mainVersion:'',//内部版本号
                extVersion:'',//外部版本号
            }
            this.handleSubmit = this.handleSubmit.bind(this);
            this.deviceVersionType = this.deviceVersionType.bind(this);
        }
        componentDidMount() {
            get(Paths.getAllDeviceVersionType,{checkProductId:this.props.productId,bindType:this.props.bindType}).then((model) => {
                this.setState({deviceVersionTypeList:model.data});
            });
        }
        handleSubmit (e) {
            e.preventDefault();
            const { deviceVersionTypeList, validateFieldsAndScroll } = this.props.form;
            validateFieldsAndScroll((err, values) => {
                if (!err) {
                    let data = {...values},
                        _this = this;
                    data.productId = this.props.productId;
                    data.upgradeFile = this.addFirmwareInput.getFileListUrl().length>0 ? this.addFirmwareInput.getFileListUrl().join(',') : '';
                    if(!data.upgradeFile){
                        Notification({
                            description:`请选择文件`,
                        });
                        return false;
                    }
                    let strtotalVer = (data.totalVersion + '').replace(/^\s+|\s+$/g, ''),
                        strmainVer = (data.mainVersion + '').replace(/^\s+|\s+$/g, ''),
                        strextVer = (data.extVersion + '').replace(/^\s+|\s+$/g, '');
                    if (!/^[\w\.-]*$/.test(strtotalVer)) {
                        Notification({
                            description:`固件系列标示只能包含字母、数字、下划线、短横线、点号`
                        });
                        return false;
                    }
                    if ( +strmainVer > 2147483647 ) {
                        Notification({
                            description:`内部版本号大小超过范围，最大2147483647`
                        });
                        return false;
                    }
                    if (!/^[0-9]*$/.test(strmainVer)) {
                        Notification({
                            description:`内部版本须为不小于0的整数`
                        });
                        return false;
                    }
                    if (!/^[\w\.-]*$/.test(strextVer)) {
                        Notification({
                            description:`外部版本只能包含字母、数字、下划线、短横线、点号`
                        });
                        return false;
                    }
                    post(Paths.versionAdd,data,{needFormData:true,needVersion:1.1}).then((model) => {
                        if(model.code==0){
                            //先清空表单数据再关闭弹窗
                            this.props.form.resetFields();
                            _this.addFirmwareInput.setState({fileList:[]},()=>{
                                this.props.addFirmware('添加固件成，请求列表');
                            });
                        }
                    });
                }
            });
        }
        deviceVersionType(id){
            this.props.form.resetFields('firmwareVersionType');
            get(Paths.getAllFirmwareVersionType,{deviceVersionTypeId:id}).then((model) => {
                this.setState({allFirmwareVersionTypeList:model.data});
            });
        }
        addFirmware = () => {
             this.props.form.resetFields();
             this.addFirmwareInput.setState({fileList:[]});
            this.props.addFirmware();
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: {
                  xs: { span: 24 },
                  sm: { span: 6 },
                },
                wrapperCol: {
                  xs: { span: 24 },
                  sm: { span: 18 },
                },
            };
            let { deviceVersionTypeList, allFirmwareVersionTypeList } = this.state;
            return (
                <div className='add_firmware_dialog'>
                     <Form {...formItemLayout} onSubmit={this.handleSubmit} className="">
                        <Form.Item label={<LabelTip label="添加固件" tip="该产品采用的是独立MCU方案，您可以管理PCB和模组的固件程序"/>} hasFeedback>
                            {getFieldDecorator('deviceVersionType', {
                                rules: [{ required: true, message: '请选择模组固件!' }]
                            })(
                            <Select style={{ width: 174 }} placeholder="请选择" onChange={this.deviceVersionType}>
                                {deviceVersionTypeList.map((item,index)=>{
                                    return <Option key={item.deviceVersionTypeId+index} value={item.deviceVersionTypeId}>{item.deviceVersionTypeName}</Option>
                                })}
                            </Select>
                            )}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="添加模块" tip="请选择固件的细分模块，升级时将只针对该模块升级。"/>} hasFeedback>
                            {getFieldDecorator('firmwareVersionType', {
                                rules: [{ required: true, message: '请选择模块!' }]
                            })(
                            <Select style={{ width: 174 }} placeholder="请选择">
                                {allFirmwareVersionTypeList.map((item,index)=>{
                                    return <Option key={item.firmwareVersionTypeNo+index} value={item.firmwareVersionTypeNo}>{item.firmwareVersionTypeName}</Option>
                                })}
                            </Select>
                            )}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="固件系列标识" tip="区分不同固件包，只有相同的固件才能升级"/>} hasFeedback>
                            {getFieldDecorator('totalVersion', {
                                rules: [{ required: true, message: '请输入固件系列标识!' }]
                            })(<Input maxLength={30} placeholder='固件系列标示只能包含字母、数字、下划线、短横线、点号' />)}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="内部版本号" tip="同一系列的固件根据内部版本号决定是否升级"/>} hasFeedback>
                            {getFieldDecorator('mainVersion', {
                                rules: [{ required: true, message: '请输入内部版本号!' }]
                            })(<Input maxLength={10} placeholder='内部版本须为不小于0的整数' />)}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="外部版本号" tip="升级提示时，用户可见的版本号"/>} hasFeedback>
                            {getFieldDecorator('extVersion', {
                                rules: [{ required: true, message: '请输入外部版本号!' }]
                            })(<Input maxLength={30} placeholder='外部版本只能包含字母、数字、下划线、短横线、点号' />)}
                        </Form.Item>
                        <Form.Item label="固件程序：" hasFeedback>
                            <UploadFileClass 
                                onRef={el => this.addFirmwareInput = el}
                                isNotImg={true} 
                                format='.bin,.hex,.zip,.cyacd' 
                                maxSize={20}
                            />
                        </Form.Item>
                        <div className='but'>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button className='cancel' onClick={this.addFirmware}>
                                取消
                            </Button>
                        </div>
                     </Form>
                </div>
            )
        }
    }
);