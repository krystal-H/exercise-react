import React, { Component } from 'react';
import { Form, Button, Radio, Alert,Input,Upload } from 'antd';
import { post,Paths } from '../../../api';
import {Notification} from '../../../components/Notification'
const { TextArea } = Input;
const formItemLayout = {
    labelCol: { xs: { span: 24 }, sm: { span: 4 }, },
    wrapperCol: { xs: { span: 24 }, sm: { span: 19 }, },
};
const desc = [
    '系统验证：要求输入的设备全部都升级成功到新版本后，状态才更新成验证完成。',
    '手动验证：用户线下自行对设备验证，验证通过后，选择验证完成状态。'
]
export class ValidationFirmwareDialog  extends Component{
    constructor(props){
        super(props);
        this.state = {
            status:0,
            error:false,
        }
    }

    componentDidMount() {
        this.props.onRef(this.handleSubmit);
    }
    changeValidateType = ()=>{

    }
    handleSubmit =() =>{
        const {deviceVersionId,validationDetail:{macSet,validateType},pagerIndex,pageIndex,close} = this.props
        if(!macSet){
            this.setState({error:true})
            return
        }
        const {status} =this.state
        // console.log()
        post(Paths.otaValidate,{deviceVersionId,macSet,validateType,status},{loading:true}).then((model) => {
            pagerIndex(pageIndex) 
            close()
        });
    }
    //mac模板下载
    downloadMac =()=>{
        // let urls = window.location.origin+'/v1/web/open/device/mac/download?type=2';
        window.location.href = 'https://open.clife.cn/v1/web/open/device/mac/download?type=2';//v5版 域名换成cms 所以用绝对地址
    }
    //批量导入
    beforeUpload = file => {
        const isLt2M = file.size / 1024 < 500;//限制500k
        if (!isLt2M) {
            Notification({
                description:'文件上传大小超过500k限制'
            });
            return false;
        }
        const {deviceVersionId} = this.props
        post(Paths.otaImportMac,{multipartFile:file,deviceVersionId},{needFormData:true}).then(({data={}}) => {
            const {successes,fails,totalCount,successCount,failCount} = data
            let macSet = successes.join(','),failsStr='';
            // if(failCount>0){
            //     let failmac = fails.slice(0,4).join(',')
            //     if(failCount>4){
            //         failmac += ',....'
            //     }
            //     failsStr = `（失败：${failmac})`
            // }
            this.props.setValidationDetail('macSet',macSet)
            Notification({
                message:'Mac导入结果',
                description:`共导入${totalCount}条，成功了${successCount}条，失败了${failCount}条${failsStr}`
            });
            
        });
        return false;
    };
    changeStatus = status=>{
        console.log(1111,status);
        this.setState({status})
    }
    changeValue = (key,e)=>{
        const val = e.target.value
        const {setValidationDetail} = this.props
        setValidationDetail(key,val)

    }
    render() {
        const {validationDetail:{macSet,validateType}} = this.props
        const {error} = this.state
        return (
            <div className="ota_validationdialog" >
                <Form {...formItemLayout} >
                    <Form.Item label='验证模式' name="validateType">
                        <Radio.Group value={validateType} onChange={e=>{this.changeValue('validateType',e)}} >
                            <Radio.Button value={0}>系统验证</Radio.Button>
                            <Radio.Button value={1}>手动验证</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label='设备Mac' required help={!macSet&&error&&'请输入或导入要验证的设备Mac'||''} hasFeedback validateStatus={!macSet&&error&&'error'||''}>
                        <TextArea
                            value={macSet}
                            placeholder='请输入或导入要验证的设备Mac，多个用逗号隔开'
                            rows={7}
                            onChange={e=>{this.changeValue('macSet',e)}}
                        />
                    </Form.Item>
                    <div className='ota_uploadbox'>
                        <Upload className='upbtn' beforeUpload={this.beforeUpload} fileList={[]} accept='.xls,.xlsx'>
                            <Button type="primary" icon="upload">批量导入</Button>
                        </Upload>
                        <Button className='downbtn' type="link" onClick={this.downloadMac}>下载模板</Button>
                    </div>
                    {validateType==1&&
                    <Form.Item label='线下验证状态' name="status">
                        <Radio.Group defaultValue={0}  onChange={(e)=>{this.changeStatus(e.target.value)}}>
                            <Radio.Button value={0}>验证中</Radio.Button>
                            <Radio.Button value={1}>验证完成</Radio.Button>
                        </Radio.Group>
                    </Form.Item>}
                </Form>
                <Alert message={desc[validateType]} type="info" showIcon />
            </div>
        )
    }
}
