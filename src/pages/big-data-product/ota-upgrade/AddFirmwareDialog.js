import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Form, Select,Radio,Cascader,AutoComplete } from 'antd';
import { get,post,Paths } from '../../../api';
import {Notification} from '../../../components/Notification';
import { UploadFileClass } from '../../../components/upload-file';
import LabelTip from '../../../components/form-com/LabelTip';
import {formrules,VERFIRMTYPE} from './store/constData'
import {getVersionList,getExtVerLi} from './store/actionCreators'
const { Option } = Select;
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 7 }, },
    wrapperCol: { xs: { span: 24 }, sm: { span: 15 }, },
};
const mapStateToProps = state => {
    const {productList,extVerisonLi} = state.get('otaUpgrade')
    return {
        productList,extVerisonLi
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getVersionLi: param => dispatch(getVersionList(param)),
        getExtVerLi: param => dispatch(getExtVerLi(param)),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export const AddFirmwareDialog = Form.create({
    name: 'addFirmwareDialog'
})(
    class extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                packType:0,
                uploadType:0,
            }
        }
        componentDidMount() {
            this.props.onRef(this);
        }
        handleSubmit =()=> {
            const { form:{validateFieldsAndScroll},changeState } = this.props;
            validateFieldsAndScroll((err, values) => {
                const [deviceVersionType,firmwareVersionType] = values.verType
                delete values.verType;
                if (!err) {
                    let params = {...values,deviceVersionType,firmwareVersionType};
                    if(this.state.uploadType == 0){
                        let filePath = this.addFirmwareInput.getFileListUrl().length>0 ? this.addFirmwareInput.getFileListUrl().join(',') : '';
                        if(!filePath){
                            Notification({
                                description:`请上传固件程序`,
                            });
                            return false;
                        }else{
                            params.filePath = filePath
                        }
                    }
                    post(Paths.otaAddVersion,params,{needFormData:true,needVersion:1.1,loading:true}).then((model) => {
                        this.resetForm()
                        this.props.getVersionLi()
                        changeState('addFirmwareDialog',false)
                      
                    });
                }
            });
        }
        resetForm = ()=>{
            this.props.form.resetFields();
            this.addFirmwareInput.setState({fileList:[]});
        }

        changePackType=e=>{
            let v = e.target.value
            this.setState({packType:v},()=>{
                this.getExtVersion()
            })
            
        }
        uploadType=e=>{
            let v = e.target.value
            this.setState({uploadType:v})
        }
        getExtVersion=()=>{
            if(this.state.packType==0) return
            const { getFieldValue } = this.props.form
            const productId = getFieldValue('productId')
            const totalVersion = getFieldValue('totalVersion')
            const verType = getFieldValue('verType') || []
            const [deviceVersionType,firmwareVersionType] = verType
            if(productId&&totalVersion&&verType.length==2){
                this.props.getExtVerLi({productId,totalVersion,deviceVersionType,firmwareVersionType})
            }else{
                this.props.getExtVerLi()
            }
        }
        checkMainVersion = (rule, value, callback)=> {
            if(+value>2147483647){
                callback('最大不能超过数值2147483647');
            }else{
                callback()
            }
        }
        render() {
            const {form:{getFieldDecorator},productList,extVerisonLi} = this.props
            
            let {  packType,uploadType } = this.state;
            return (
                     <Form {...formItemLayout} className="ota_add_firmware_dialog">
                        <Form.Item label={<LabelTip label="包类型" tip="可选择整体升级包，或者差分包进行升级。"/>}>
                            {getFieldDecorator('packageType', {
                                rules: [{ required: true, message: '请选择包类型' }],
                                initialValue:0
                            })(
                                <Radio.Group onChange={this.changePackType}>
                                    <Radio.Button value={0}>整 包</Radio.Button>
                                    <Radio.Button value={1}>差 分</Radio.Button>
                                </Radio.Group>
                            )}
                        </Form.Item>
                        <Form.Item label='固件包名称' hasFeedback>
                            {getFieldDecorator('deviceVersionName', {
                                rules: [
                                    { required: true, message: '请输入固件包名称' },
                                    {
                                        pattern: formrules.verNam,
                                        message: '仅支持中英文、数字、下划线，须以中英文或数字开头，不超过40个字符',
                                    }
                                ]
                            })(<Input maxLength={40} placeholder='中英文、数字、下划线，且须以中英文或数字开头' />)}
                        </Form.Item>
                        <Form.Item label='所属产品'>
                            {getFieldDecorator('productId', {
                                rules: [{ required: true, message: '请选择所属产品' }]
                            })(
                            <Select placeholder="选择产品" onBlur={this.getExtVersion} showSearch optionFilterProp="children">
                                {
                                    productList.map(({productId,productName},i)=><Option key={i} value={productId}>{productName}</Option>)
                                }
                            </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="固件类型">
                            {getFieldDecorator('verType', {
                                rules: [{ required: true, message: '请选择固件类型' }]
                            })( <Cascader options={VERFIRMTYPE} onChange={this.getExtVersion} expandTrigger="hover" placeholder='请选择固件类型' /> )}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="固件系列标识" tip="区分不同的固件系列，同系列同版本号的固件才能触发升级"/>} hasFeedback>
                            {getFieldDecorator('totalVersion', {
                                rules: [
                                    { required: true, message: '请输入固件系列标识' },
                                    {
                                        pattern: formrules.strextVer,
                                        message: '仅支持字母、数字、下划线、短横线、点号，不超过30个字符',
                                    }
                                ]
                            })(<Input maxLength={30} onBlur={this.getExtVersion} placeholder='支持字母、数字、下划线、短横线、点号' />)}
                        </Form.Item>
                        <Form.Item label={<LabelTip label="内部版本号" tip="同一系列标识的固件通过对比内部版本号决定是否升级"/>} hasFeedback>
                            {getFieldDecorator('mainVersion', {
                                rules: [
                                    { required: true, message: '请输入内部版本号' },
                                    { pattern: formrules.mainVer, message: '须为不小于0的整数'},
                                    { validator:this.checkMainVersion}
                            ]
                            })(<Input maxLength={10} placeholder='内部版本须为不小于0的整数' />)}
                        </Form.Item>
                        {
                            packType==0?
                                <Form.Item label={<LabelTip label="外部版本号" tip="升级时对外部用户可见的公开版本号"/>} hasFeedback>
                                    {getFieldDecorator('extVersion', {
                                        rules: [{ required: true, message: '请输入外部版本号!' },{
                                            pattern: formrules.strextVer,
                                            message: '仅支持字母、数字、下划线、短横线、点号，不超过30个字符',
                                        }]
                                    })(<Input maxLength={30} placeholder='支持字母、数字、下划线、短横线、点号' />)}
                                </Form.Item>:
                            <>
                                <Form.Item label={<LabelTip label="升级对象的外部版本号" tip="需要升级的对象设备的外部版本号"/>} hasFeedback>
                                    {getFieldDecorator('upgradeExtVerison', {
                                        rules: [
                                            { required: true, message: '请输入外部版本号!' },
                                            {
                                                pattern: formrules.strextVer,
                                                message: '仅支持字母、数字、下划线、短横线、点号，不超过30个字符',
                                            }
                                        ]
                                    })(
                                        <AutoComplete
                                            dataSource={extVerisonLi}
                                            placeholder={extVerisonLi.length>0 && "选择或输入" || '没有查到可选项请手动输入'}
                                            maxLength='30'
                                            filterOption={true}
                                        />
                                    )}
                                </Form.Item>
                                <Form.Item label={<LabelTip label="升级后的外部版本号" tip="升级时对外部用户可见的公开版本号"/>} hasFeedback>
                                    {getFieldDecorator('extVersion', {
                                        rules: [{ required: true, message: '请输入外部版本号!' },{
                                            pattern: formrules.strextVer,
                                            message: '仅支持字母、数字、下划线、短横线、点号，不超过30个字符',
                                        }]
                                    })(<Input maxLength={30} placeholder='支持字母、数字、下划线、短横线、点号' />)}
                                </Form.Item>
                            
                            </>
                        }
                        <Form.Item label="固件程序：" required>
                            <Radio.Group defaultValue={0} onChange={this.uploadType}>
                                <Radio.Button value={0}>本地上传</Radio.Button>
                                <Radio.Button value={1}>填写URL</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item className='filepathinpt' hasFeedback>{ uploadType==1? 
                            getFieldDecorator('filePath', {
                                rules: [{ required: true, message: '请输入URL' },{
                                    pattern: formrules.url,
                                    message: '请输入正确的URL',
                                }]
                            })(<Input maxLength={100} placeholder='请输入URL' />)
                            :
                            <UploadFileClass 
                                onRef={el => this.addFirmwareInput = el}
                                isNotImg={true} 
                                format='.bin,.hex,.zip,.cyacd,.apk,.dpkg'
                                maxSize={200}
                            />}  
                        </Form.Item>
                     </Form>
               
            )
        }
    }
);