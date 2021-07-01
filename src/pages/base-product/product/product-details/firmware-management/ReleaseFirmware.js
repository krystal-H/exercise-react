import React, { Component } from 'react';
import { Input, Form, Select,Button, Upload, Icon  } from 'antd';
import { get,post,Paths } from '../../../../../api';
import {Notification} from '../../../../../components/Notification'
import './but.scss';

const { Option } = Select;
const { TextArea } = Input;


const releaseWayList = [
    {
        id: '0',
        text: "全部设备升级",
    },
    {
        id: '1',
        text: "指定设备升级",
    },
];
const upgradeWayList = [
    {
        id: '1',
        text: "普通升级",
    },
    {
        id: '2',
        text: "强制升级",
    },
    {
        id: '3',
        text: "静默升级",
    },
];
let upgradeWayListExplain  = [
    '',
    '用户可感知，升级触发时用户可以在app上查看到升级提醒，确认后才能升级',
    '用户可感知，用户可以在app上查看到升级提示，无需确认自动开始升级',
    '用户无感知，无需确认，直接推送到设备进行升级'
];
export const ReleaseFirmware = Form.create({
    name: 'releaseFirmware',
    mapPropsToFields(props) {//处理父组件传值
        return {
          deviceVersionId: Form.createFormField({
            ...props.deviceVersionId,
            deviceVersionId: props.deviceVersionId,
          }),
        };
    },
})(
    class extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                releaseWayId:'',//发布id
                upgradeType:'',
                file:null,
                macList:'',
            }
            this.handleSubmit = this.handleSubmit.bind(this);
            this.releaseWayType = this.releaseWayType.bind(this);
            this.upgradeType = this.upgradeType.bind(this);
            this.downloadMac = this.downloadMac.bind(this);
            this.changeMacList = this.changeMacList.bind(this);
            this.releaseFirmware = this.releaseFirmware.bind(this);
        }
        componentDidMount() {
            
        }
        componentDidUpdate(prevProps){
            
        }
        handleSubmit (e) {
            let _this = this;
            e.preventDefault();
            const { deviceVersionTypeList, validateFieldsAndScroll } = this.props.form;
            validateFieldsAndScroll((err, values) => {
                if (!err) {
                    let {deviceVersionId,releaseState,releaseFirmware,macListOperationRecords} = _this.props;
                    let data = {
                        deviceVersionId: deviceVersionId,
                        status: values.upgradeWay,//接口参数status\upgradeType弄反了,在这儿调个个儿
                        upgradeType: values.releaseWayId,
                        releaseNote: values.promptInformation,
                    };
                    data.macSet= macListOperationRecords? _this.state.macList : _this.state.macList || releaseState.macSet;
                    console.log('data------999-----', data);
                    if(data.upgradeType==1&&!data.macSet){
                        Notification({
                            description:`请输入Mac！`
                        });
                        return false;
                    }
                    get(Paths.versionPublish,data).then((model) => {
                        if(model.code==0){
                            _this.setState({macList:''},()=>{
                                releaseFirmware('修改成功，请求列表数据','','');
                            });
                        }else{
                            // 错误提示
                            Notification({
                                description:model.msg
                            });
                        }
                    });
                }
            });
        }
        releaseWayType(releaseWayId){
            this.setState({releaseWayId:releaseWayId+''});
        }
        upgradeType(upgradeType){
            this.setState({upgradeType:upgradeWayListExplain[upgradeType]});
        }
        //mac模板下载
        downloadMac(){
            // window.location.href = window.location.origin+'v1/web/open/device/mac/download?type=2';
            let urls = window.location.origin+'/v1/web/open/device/mac/download?type=2';
            window.location.href = urls;
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
                    this.setState({macList:successesStr});
                    let successCount = data.successCount > 0 ? data.successCount : 0;
                 
                    Notification({
                        type:'info',
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
        changeMacList(e){
            this.props.macListOperationRecordsFunc();
            this.setState({macList:e.target.value});
        }
        releaseFirmware(str,id,validationState){
            this.setState({macList:'',releaseWayId:'',upgradeType:'',file:null},()=>{
                this.props.releaseFirmware(str,id,validationState);
                this.props.form.resetFields();
            });
        }
        render() {
            const { getFieldDecorator, getFieldValue } = this.props.form;
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
                padding: '0 0 20px 80px',
            }
            let { releaseWayId,macList } = this.state;
            let {releaseState,macListOperationRecords} = this.props;
                releaseWayId = releaseWayId+''?releaseWayId+'':releaseState.status?releaseState.status+'':'0';
                macList = macListOperationRecords?macList:macList||releaseState.macSet;
            let upgradeWay = getFieldValue('upgradeWay')||'';
            return (
                <div className='release_firmware'>
                     <Form {...formItemLayout} onSubmit={this.handleSubmit} className="">
                        <Form.Item label="发布方式：" hasFeedback>
                            {getFieldDecorator('releaseWayId', {initialValue:releaseWayId}, {
                                rules: [{ required: true, message: '请选择发布方式!' }]
                            })(
                            <Select style={{ width: 174 }} placeholder="请选择" onChange={this.releaseWayType}>
                                {releaseWayList.map((item,index)=>{
                                    return <Option key={item.id+index} value={item.id}>{item.text}</Option>
                                })}
                            </Select>
                            )}
                        </Form.Item>
                        {
                            releaseWayId==1?
                                <div>
                                    <div>
                                        <span style={{verticalAlign: 'top',margin: '0 10px 0 23px',color: 'rgba(0, 0, 0, 0.85)'}}>MAC地址:</span>
                                        <textarea value={macList} rows="10" cols="69" style={{borderRadius: '3px',padding: '10px'}} onChange={this.changeMacList} />
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
                                </div>
                                :null
                        }
                        <Form.Item label="升级方式：" hasFeedback>
                            {getFieldDecorator('upgradeWay', {initialValue:releaseState.upgradeType?releaseState.upgradeType+'':'1'}, {
                                rules: [{ required: true, message: '请选择升级方式!' }]
                            })(
                            <Select style={{ width: 174 }} placeholder="请选择">
                                {upgradeWayList.map((item,index)=>{
                                    return <Option key={item.id+index} value={item.id}>{item.text}</Option>
                                })}
                            </Select>
                            )}
                            <p style={{height: '10px',fontSize: '12px'}}>{upgradeWayListExplain[upgradeWay||releaseState.upgradeType]}</p>
                        </Form.Item>
                        <Form.Item label="升级提示信息：" hasFeedback>
                            {getFieldDecorator('promptInformation', {initialValue:releaseState.releaseNote}, {
                                rules: [{ required: true, message: '请输入升级提示信息!' }]
                            })(<TextArea />)}
                            <p style={{height: '10px',fontSize: '12px'}}>选择普通升级和强制升级时，用户可在app查看到升级提示</p>
                        </Form.Item>
                        <div className='but'>
                            <Button type="primary" htmlType="submit">
                                确定
                            </Button>
                            <Button className='cancel'  onClick={this.releaseFirmware.bind(this,'','','')}>
                                取消
                            </Button>
                        </div>
                     </Form>
                </div>
            )
        }
    }
);