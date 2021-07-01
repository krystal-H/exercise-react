import React, { Component } from 'react';
import { Form, Button, Upload, Icon } from 'antd';
import { post,Paths } from '../../../../../api';
import {Notification} from '../../../../../components/Notification'
import './but.scss';

export const ValidationFirmwareDialog = Form.create({
    name: 'validationFirmwareDialog',
    mapPropsToFields(props) {//处理父组件传值
        return {
          deviceVersionId: Form.createFormField({
            ...props.deviceVersionId,
            deviceVersionId: props.deviceVersionId,
            ...props.validationFirmware,
            validationFirmware:props.validationFirmware,
            ...props.macListStr,
            macListStr:props.validationState,
          }),
        };
    },
})(
    class extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                deviceVersionId:this.props.deviceVersionId,
                file:null,
                macList:'',
            }
            this.handleSubmit = this.handleSubmit.bind(this);
            this.downloadMac = this.downloadMac.bind(this);
            this.changeMacList = this.changeMacList.bind(this);
            this.validationFirmware = this.validationFirmware.bind(this);
        }
    
        componentDidMount() {
            
        }
        handleSubmit (e) {
            let _this = this;
            e.preventDefault();
            const { validateFieldsAndScroll } = this.props.form;
            validateFieldsAndScroll((err, values) => {
                if (!err) {
                    let {macList} = _this.state;
                    let {macListValidationRecords,deviceVersionId,validationState} = _this.props;
                    let data = {
                        deviceVersionId,
                        macSet:macListValidationRecords ? macList : macList || validationState
                    }
                    if(!data.macSet){
                        Notification({
                            message:'请输入Mac！',
                        });
                        return false;
                    }
                    post(Paths.versionValidate,data).then((model) => {
                        if(model.code==0){
                            this.setState({macList:''},()=>{
                                _this.props.validationFirmware('接口成功后，关闭弹窗刷新列表');
                            });
                        }else{
                            // 错误提示
                            Notification({
                                type:'error',
                                message:'验证固件提示',
                                description:model.msg
                            });
                        }
                    });
                }
            });
        }
        //mac模板下载
        downloadMac(){
            let urls = window.location.origin+'/v1/web/open/device/mac/download?type=2';
            window.location.href = urls;
        }
        changeMacList(e){
            this.props.macListValidationRecordsFunc();
            this.setState({macList:e.target.value});
        }
        //文件添加
        beforeUpload = file => {
            const isLt2M = file.size / 1024 < 500;//限制500k
            if (!isLt2M) {
                Notification({
                    description:'文件上传大小超过500k限制'
                });
                return false;
            }
            post(Paths.versionCheckMac,{multipartFile:file},{needFormData:true}).then((model) => {
                if (model.code == 0) {
                    let data = model.data,
                        successes = data.successes,
                        fails = data.fails,
                        successesStr = '',
                        failsStr = '无';
                    if (successes.length > 0) {
                        for (let i = 0; i < successes.length; i++) {
                            successesStr += successes[i] + ';'
                        }
                        successesStr = successesStr.slice(0, successesStr.length - 1);
                    }
                    if (fails.length > 0) {
                        failsStr = '';
                        let nub = fails.length>4?4:fails.length;
                        for (let i = 0; i < nub; i++) {//只显示前四个
                            failsStr += fails[i] + ';'
                        }
                        failsStr = failsStr.slice(0, failsStr.length - 1);
                        if(fails.length > 4){//超过四个省率号显示
                            failsStr+= '...';
                        }
                    }
                    // this.props.form.setFieldsValue({ macListStr: successesStr });
                    this.setState({macList:successesStr});
                    let successCount = data.successCount > 0 ? data.successCount : 0;
                    Notification({
                        message:'上传mac返回提示',
                        description:'总共导入' + data.totalCount + '条,成功了' + successCount + '条，失败' + data.failCount + '条，（失败：' + failsStr + '）'
                    });
                } else {
                    // 错误提示
                    Notification({
                        type:'error',
                        message:'上传mac返回提示',
                        description:model.msg
                    });
                }
            });
            return false;
        };
        //
        validationFirmware(str,id,validationState){
            this.setState({macList:''},()=>{
                this.props.validationFirmware(str,id,validationState);
            });
        }
        render() {
            const { getFieldDecorator } = this.props.form;
            const formItemLayout = {
                labelCol: {
                  xs: { span: 24 },
                  sm: { span: 4 },
                },
                wrapperCol: {
                  xs: { span: 24 },
                  sm: { span: 20 },
                },
            };
            const style = {
                color: '#2F78FF',
                cursor: 'pointer',
                padding:'5px 10px'
            };
            const fileStyle = {
                position: 'absolute',
                top: '-30px',
                left: '80px',
                opacity: 0,
            }
            const filebox = {
                position: 'relative',
                paddingLeft: '60px'
            }
            
            let {deviceVersionId,validationState,macListValidationRecords,macListValidationRecordsFunc} = this.props;
            let {macList} = this.state;
            macList = macListValidationRecords ? macList : macList || validationState;
            return (
                <div className='validation_firmware_dialog'>
                     <Form {...formItemLayout} onSubmit={this.handleSubmit} className="">
                        <div>
                            <span style={{verticalAlign: 'top',marginRight: '10px'}}>MAC地址:</span>
                            <textarea value={macList} rows="10" cols="73" style={{borderRadius: '3px',padding: '10px'}} onChange={this.changeMacList} />
                        </div>
                        <div style={filebox}>
                            <span style={style} onClick={this.downloadMac}>下载模板</span>
                            <span style={style}>批量导入</span>
                            <Form.Item  label="" >
                                {getFieldDecorator('file', {
                                    rules: [
                                        {
                                            required: false,
                                        },
                                    ]})(<div style={fileStyle}>
                                            <Upload
                                                beforeUpload={this.beforeUpload}
                                                fileList={this.state.file}
                                                accept='.xls,.xlsx'
                                            >
                                                <Button>
                                                    <Icon type="upload" />批量倒入
                                                </Button>
                                            </Upload>
                                        </div>)
                                }
                            </Form.Item>
                        </div>
                        <div className='but'>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button className='cancel' onClick={this.validationFirmware.bind(this,'',deviceVersionId,validationState)}>
                                取消
                            </Button>
                        </div>
                     </Form>
                </div>
            )
        }
    }
);