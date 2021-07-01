import React, { Component } from 'react'
import { connect } from 'react-redux'
import {trim} from 'lodash';
import { Input, Select, Switch, Form, Button } from 'antd';
import {get, post, Paths} from '../../../api';
import {encryption,checkAccount} from '../../../util/util'
import {Notification} from '../../../components/Notification';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';

import './editBasicInformation.scss';

const {Option} = Select;
const passwordList = [
    {
        id:1,
        text:'自动生成默认密码',
    },
    {
        id:2,
        text:'手动设置登录密码',
    }
];
const mapStateToProps = state => {
    return {
        developerInfo: state.getIn(['userCenter', 'developerInfo']).toJS()
    }
}
@connect(mapStateToProps, null)
class EditBasicInformationForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            resetChecked:false,//是否重置密码
            resetSelectId:null,
            password:null,//密码
            userName:this.props.userData.userName||null,//用户名称
            remark:this.props.userData.remark||'',//备注
            roleId:this.props.userData.roleId||null,//角色ID
            roleList_1:[],//角色列表
            roleList_2:[],//角色列表
            ipWhiteSelect:this.props.userData.ipWhiteList?true:false,//是否提白名单
            ipWhiteList:this.props.userData.ipWhiteList
        };
    }
    componentDidMount() {
        this.props.onRef(this);
        get(Paths.getRoleList).then((res) => {
            if(res.code==0){
                let roleList_1 = [],
                    roleList_2 = [];
                for(let a=0; a<res.data.length; a++){
                    let item = res.data[a];
                    if(item.userCategory==1){
                        roleList_1.push(item);
                    }else{
                        roleList_2.push(item);
                    }
                }
                this.setState({roleList_1,roleList_2});
            }
        });
    }
    backfill = (userInfo) => {
        this.setState({
            userName:userInfo.userName||null,//用户名称
            remark:userInfo.remark||'',//备注
            roleId:userInfo.roleId||null,//角色ID
            ipWhiteSelect:userInfo.ipWhiteList?true:false,//是否提白名单
            ipWhiteList:userInfo.ipWhiteList,
            resetChecked:false,
        });
    }
    //角色选择
    roleSelect = (roleId) => {
        this.setState({roleId});
    }
    //是否重置密码
    reset = (resetChecked) => {
        this.setState({resetChecked});
    }
    //密码
    resetSelect = (resetSelectId) => {
        if(resetSelectId==1){
            this.setState({resetSelectId});
            setTimeout(()=>{this.props.form.setFieldsValue({password:'a123456'})},100);//第一次选择时，由于dom没有回出现警告，并且设置不了password得值。
        }else{
            this.setState({resetSelectId});
            this.props.form.setFieldsValue({password:''});
        }
    }
    //密码输入
    passwordInput = (val) => {
        this.setState({password:val.target.value});
    }
    //是否选中白名单
    ipWhiteSelectFunc = (ipWhiteSelect) => {
        this.setState({ipWhiteSelect});
    }
    //白名单
    ipWhiteListFunc = (val) => {
        this.setState({ipWhiteList:val.target.value});
    }
    userName = (e) => {
        this.setState({userName:e.target.value});
    }
    remark = (e) => {
        this.setState({remark:e.target.value});
    }
    //确认保存
    affirm = (e) => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let {resetChecked,ipWhiteSelect} = this.state,
                    {userId,userCategory} = this.props.userData,
                    {roleId,userName,password,ipWhiteList,remark} = values;
                    let data = {
                    userId,
                    roleIds:roleId
                    // userName:userName+'@'+this.props.developerInfo.id,
                };
                 if(userCategory==1&&resetChecked){
                    data.password = encryption(password);//密码 加密
                }
                if(userCategory==2&&ipWhiteSelect){
                    if(ipWhiteList){
                        let ipList = ipWhiteList.split(',');//英文 , 分隔符
                        if(ipList.length>10){
                            Notification({
                                description:'IP白名单最多添加10条！',
                            });
                            return false;
                        }
                        data.ipWhiteList = ipWhiteList
                    }
                }else if(userCategory==2&&!ipWhiteSelect){
                    data.ipWhiteList = '';
                }
                if(remark){
                    data.remark = remark;
                }
                post(Paths.updateChild,data,{needFormData:true,loading:true}).then((res) => {
                    if(res.code==0){
                        this.props.handleClose();
                    }
                });
            }
        });
    }
    passwordCheck = (rule, value, callback) => {
        if(!(/^^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/.test(value))){
            callback('密码格式为大小写字母加数字，长度为6-18');
        }else{
            callback();
        }
    }
    render() {
        let { resetChecked, remark, userName, roleId, roleList_1, roleList_2, ipWhiteSelect, ipWhiteList } = this.state;
        // userName = userName.split('@')[0];
        const { getFieldDecorator,getFieldValue } = this.props.form;
        const resetSelectId = resetChecked ? getFieldValue('resetSelectId') : null;
        let parentAccountId = this.props.developerInfo.id;
        let roleList = [];
        let { userCategory } = this.props.userData;
        if(userCategory==1){
            roleList = roleList_1;
        }else{
            roleList = roleList_2;
        }
        const formItemLayout = {
            labelCol: {
                xs: { span: 5 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 19 },
                sm: { span: 19 },
            },
        };
        return (
            <Form {...formItemLayout} onSubmit={this.affirm} className='edit-basic-information'>
                {/* <div className='common_title_input'>
                    <Form.Item label='账户类型' hasFeedback >
                        {getFieldDecorator('userName',{
                            rules: [{ required: true, min: 6, max: 14, message: '请输入6~14位大小写字母＋数字' }],
                            initialValue:userName,
                            disabled:true
                        })(
                            <Input disabled style={{width:'240px'}} onChange={this.userName}  suffix={'@'+parentAccountId}/>
                        )}
                    </Form.Item>
                </div> */}
                <div className='common_title_input'>
                    <span className='common_title'>用户名:</span>
                    <div className='common_content'>{userName}</div>
                </div>
                <div className='common_title_input'>
                    <span className='common_title'>账户类型:</span>
                    <div className='common_content'>{userCategory==1?'控制台访问用户':userCategory==2?'接口访问用户':'--'}</div>
                </div>
                <div className='common_title_input'>
                    <Form.Item label='用户角色' hasFeedback >
                        {getFieldDecorator('roleId', {
                            rules: [{ required: true, message: '请选择用户角色' }],
                            initialValue:roleId
                        })(
                            <Select style={{width:'180px'}} placeholder="请选择">
                                {
                                    roleList.map((item,index)=>{
                                        return <Option key={index+'用户角色'} value={item.roleId} >{item.roleName}</Option>
                                    })
                                }
                            </Select>
                        )}
                    </Form.Item>
                </div>
                {
                    userCategory==1?
                    <div className='common_title_input'>
                        <Form.Item label='重置密码：' >
                            {getFieldDecorator('resetChecked')(
                                <Switch size="small" checked={resetChecked} onClick={this.reset} />
                            )}
                        </Form.Item>
                        {
                            resetChecked?
                                <div className='reset-select'>
                                    <Form.Item label=' ' colon={false} >
                                        {getFieldDecorator('resetSelectId', {
                                            rules: [{ required: true, message: '请选择密码生成方式' }]
                                        })(
                                            <Select style={{width:'180px'}} placeholder="请选择密码生成方式" onChange={this.resetSelect}>
                                                {passwordList.map((item,index)=>{
                                                    return <Option key={index+'登录密码'} value={item.id} >{item.text}</Option>
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                    {resetSelectId?
                                        <Form.Item label=' ' colon={false} >
                                            {getFieldDecorator('password', {
                                                rules: [{ required: true, validator:this.passwordCheck, message: '密码格式为大小写字母加数字，长度为6-18' }]
                                            })(
                                                resetSelectId==1?
                                                <Input style={{width:'240px'}} disabled={true}/>
                                                :<Input.Password style={{width:'240px'}} placeholder='密码格式为大小写字母加数字，长度为6-18' />
                                            )}
                                        </Form.Item>
                                    :null}
                                </div>
                                :null
                        }
                    </div>
                    :null
                }
                {
                    userCategory==2?
                        // <div className='common_title_input'>
                        //     <Form.Item label='IP白名单' >
                        //         {getFieldDecorator('ipWhiteSelect')(
                        //             <Switch size="small" checked={ipWhiteSelect} onClick={this.ipWhiteSelectFunc} />
                        //         )}
                        //     </Form.Item>
                        //     {
                        //         ipWhiteSelect?
                        //         <TextAreaCounter
                        //             label=" "
                        //             colon={false} 
                        //             formId='ipWhiteList'
                        //             astrictNub='159'
                        //             rows='3' 
                        //             placeholder='请输入IP地址，多个IP地址以",(英文)"分割,最多10个IP' 
                        //             getFieldDecorator={getFieldDecorator}
                        //             initialVal={ipWhiteList}
                        //             getFieldValue={getFieldValue}
                        //             width='300px'
                        //             isRequired={true}
                        //             message='IP白名单'
                        //         />
                        //         :null
                        //     }
                        // </div>
                        null
                        :null
                }
                <div className='common_title_input'>
                    <TextAreaCounter
                        label="备注"
                        formId='remark'
                        astrictNub='100'
                        rows='2' 
                        placeholder='请输入备注' 
                        getFieldDecorator={getFieldDecorator}
                        initialVal={remark}
                        width='300px'
                        getFieldValue={getFieldValue}
                    />
                </div>
                <div className='but'>
                    <Button type="primary" htmlType="submit">
                        确定
                    </Button>
                    <Button className='cancel' onClick={this.props.onCancel}>
                        取消
                    </Button>
                </div>
            </Form>
        );
    }
}

export const EditBasicInformation = Form.create({
    name: 'editBasicInformation',
})(EditBasicInformationForm);