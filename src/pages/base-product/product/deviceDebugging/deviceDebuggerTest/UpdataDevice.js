import React from 'react';
import { connect } from 'react-redux';
import { get,post,Paths } from '../../../../../api';
import UploadFile from '../../../../../components/upFile/UploadFile';
import {Notification} from '../../../../../components/Notification';
import { Select, Form, Button, Input, Tooltip, Icon } from 'antd';
const { Option } = Select;

/**
 * 升级调试/模组升级、MCU升级
 * @type {[type]} 1 模组升级    2 MCU升级
 */
// const mapStateToProps = state => {
//     return {
//         productBaseInfo: state.getIn(['product','productBaseInfo']).toJS(),
//     }
// }
// @connect(mapStateToProps, mapDispatchToProps);
export const UpdataDevice = Form.create({
        name: 'exportStagerDataDialog',
        onFieldsChange(props, changedFields) {
            if (JSON.stringify(changedFields) === '{}') {
                return ;
            }
            props.changeFormData( changedFields);
        },
        mapPropsToFields(props) {//处理父组件传值
            return {
                productId: Form.createFormField({
                    ...props.productId,
                    productId: props.productId,
                }),
                firmwareVersionType:Form.createFormField({
                    ...props.firmwareVersionType,
                    value: props.firmwareVersionType.value,
                }),
                totalVersion:Form.createFormField({
                    ...props.totalVersion,
                    value: props.totalVersion.value,
                }),
                mainVersion:Form.createFormField({
                    ...props.mainVersion,
                    value: props.mainVersion.value,
                }),
            };
        },
    })(
        class extends React.Component{
            constructor(props){
                super(props);
                this.state = {
                    allFirmwareVersionTypeList:[],//模块列表
                }
                this.handleSubmit = this.handleSubmit.bind(this);
            }
            componentDidMount() {
                // this.props.form.resetFields('firmwareVersionType');//清除form列表内容
                get(Paths.getAllFirmwareVersionType,{deviceVersionTypeId:1}).then((model) => {
                    this.setState({allFirmwareVersionTypeList:model.data});
                });
                
            }
            componentDidUpdate(prevProps){
                
            }
            handleSubmit (e) {
                e.preventDefault();
                const { validateFieldsAndScroll } = this.props.form;
                validateFieldsAndScroll((err, values) => {
                    if (!err) {
                        let data = {...values},
                            _this = this;
                        data.deviceVersionType = this.props.deviceVersionType;
                        let macList = this.props.macList||[];
                        for(let a=0; a<macList.length; a++){
                            if((this.props.mac==macList[a].physicalAddr) || (this.props.mac==macList[a].id)){
                                data.id = macList[a].id;
                            }
                        }
                        this.addUpdataDevice.upToTencentCloud((srclist)=>{
                            let strtotalVer = (data.totalVersion + '').replace(/^\s+|\s+$/g, ''),
                                strmainVer = (data.mainVersion + '').replace(/^\s+|\s+$/g, '');
                            if (!/^[\w\.-]*$/.test(strtotalVer)) {
                                Notification({
                                    description:'固件系列标示只能包含字母、数字、下划线、短横线、点号',
                                });
                                return false;
                            }
                            if ( +strmainVer > 2147483647 ) {
                                Notification({
                                    description:'内部版本号大小超过范围，最大2147483647',
                                });
                                return false;
                            }
                            if (!/^[0-9]*$/.test(strmainVer)) {
                                Notification({
                                    description:'内部版本须为不小于0的整数',
                                });
                                return false;
                            }
                            data.file = srclist[0];
                            if(!data.file){
                                Notification({
                                    description:'请选择文件！',
                                });
                                return false;
                            }
                            post(Paths.upgradeDebug,data,{needFormData:true}).then((model) => {
                                if(model.code==0){
                                    //先清空表单数据再关闭弹窗
                                    _this.onCancel();
                                    _this.props.get_clearDevData2();
                                }
                            });
                        });
                    }
                });
            }
            onCancel = () => {
                this.props.form.resetFields();
                this.addUpdataDevice.setState({fileList:[]});
                this.props.onCancel();
            }
            render() {
                const { getFieldDecorator } = this.props.form;
                const formItemLayout = {
                    labelCol: {
                      xs: { span: 24 },
                      sm: { span: 8 },
                    },
                    wrapperCol: {
                      xs: { span: 24 },
                      sm: { span: 16 },
                    },
                };
                const Lstyle = {
                    position: 'relative',
                    left: '320px'
                };
                const Rstyle = {
                    position: 'absolute',
                    right: '24px'
                };
                let {tipconts,firmwareModules} = this.props;
                return (
                    <div className='add_firmware_dialog'>
                         <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                            <Form.Item label="固件类型：">
                                <span className="ant-form-text">{tipconts}</span>
                            </Form.Item>
                            <Form.Item label={
                                    <span>固件模块：
                                        <Tooltip placement='top' title="请选择固件的细分模块，升级时将只针对该模块升级。">
                                            <Icon type="question-circle-o" />
                                        </Tooltip>
                                    </span>
                                } hasFeedback
                            >
                                {getFieldDecorator('firmwareVersionType', {
                                    rules: [{ required: true, message: '请选择模块!' }]
                                })(
                                <Select style={{ width: 174 }} placeholder="请选择">
                                    {firmwareModules.map((item,index)=>{
                                        return <Option key={'固件模块：'+index} value={item.firmwareVersionTypeNo}>{item.firmwareVersionTypeName}</Option>
                                    })}
                                </Select>
                                )}
                            </Form.Item>
                            <Form.Item label={
                                    <span>固件系列标识：
                                        <Tooltip placement='top' title="区分不同固件包，只有相同的固件才能升级">
                                            <Icon type="question-circle-o" />
                                        </Tooltip>
                                    </span>
                                } hasFeedback
                            >
                                {getFieldDecorator('totalVersion', {
                                    rules: [{ required: true, message: '请输入固件系列标识!' }]
                                })(<Input maxLength={30} placeholder='只能包含字母、数字、下划线、短横线、点号' />)}
                            </Form.Item>
                            <Form.Item label={
                                    <span>内部版本号：
                                        <Tooltip placement='top' title="同一系列的固件根据内部版本号决定是否升级">
                                            <Icon type="question-circle-o" />
                                        </Tooltip>
                                    </span>
                                } hasFeedback
                            >
                                {getFieldDecorator('mainVersion', {
                                    rules: [{ required: true, message: '请输入内部版本号!' }]
                                })(<Input maxLength={10} placeholder='内部版本须为不小于0的整数' />)}
                            </Form.Item>
                            <Form.Item label="固件程序：" hasFeedback>
                                <UploadFile 
                                    isNotImg={true}
                                    format="bin,hex,zip,cyacd"
                                    maxsize="5120"
                                    upFileShowType={true}
                                    chooseWay={true}
                                    onRef={ref => this.addUpdataDevice = ref}  
                                />
                            </Form.Item>
                            <Button style={Lstyle} type="primary" onClick={this.onCancel}>
                                取消
                            </Button>
                            <Button style={Rstyle} type="primary" htmlType="submit">
                                确定
                            </Button>
                         </Form>
                    </div>
                )
            }
        }   
);

