
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {get, post, Paths} from '../../../api';
import { Input, Select, Switch, Icon, Form, Row, Col, Button } from 'antd';
import {trim} from 'lodash';//去除文本前后空格
import {encryption,checkAccount} from '../../../util/util';
import {Notification} from '../../../components/Notification';
import LabelTip from '../../../components/form-com/LabelTip';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';

import './addUserInfo.scss';

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
class AddUserInfoForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            userNameList:[''],//用户名称
            userCategory:1,//用户类型
            roleList_1:[],//控制台访问-角色列表
            roleList_2:[],//接口访问-角色列表
            roleId:null,//角色ID
            resetSelectId:'',
            password:'',
            ipWhiteSelect:false,//是否提白名单
            ipWhiteList:'',//白名单
            remark:'',//备注
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
    //添加用户按钮
    addUserList = () => {
        let userNameList = this.state.userNameList;
        if(userNameList.length>=10){
            Notification({
                description:'添加用户一次最多添加10个！',
            });
            return false;
        }
        userNameList.push('');
        this.setState({userNameList});
    }
    //删除用户
    deleteUserList = (index) => {
        let userNameList = this.state.userNameList;
        userNameList.splice(index,1)
        this.setState({userNameList});
    }
    //账户类型
    accountSelect = (userCategory) => {
        this.setState({userCategory});
        this.props.form.resetFields('roleId');
    }
    //角色选择
    roleSelect = (roleId) => {
        this.setState({roleId});
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
    userName = (index,val) => {
        let userNameList = this.state.userNameList;
            userNameList[index] = val.target.value;
        this.setState({userNameList});
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
    //备注
    remark = (remark) => {
        this.setState({remark:remark.target.value});
    }
    //确认保存
    affirm = (e) => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let {userNameList,userCategory,ipWhiteSelect} = this.state;
                for (let a = 0; a < userNameList.length; a++) {
                    userNameList[a] = trim(userNameList[a]);//过滤首尾空格
                    if(!userNameList[a]){
                        Notification({
                            description:'请填写用户名称！',
                        });
                        return false;
                    }else{
                        userNameList[a] = userNameList[a].split('@')[0];
                        if(!checkAccount(userNameList[a])){
                            Notification({
                                description:'请正确格式的用户名称！大小写字母+数字6~14位',
                            });
                            return false;
                        }
                    }
                }
                //本地校验重复性
                for (let a=0; a<userNameList.length; a++) {
                    let item_1 = userNameList[a];
                    for(let b=a+1; b<userNameList.length; b++){
                        let item_2 = userNameList[b];
                        if(item_1==item_2){
                            Notification({
                                description:'第'+(a+1)+'跟第'+(b+1)+'个用户名重复，请重新输入！',
                            });
                            return false;
                        }
                    }
                }
                //给子账号添加主账号id
                for(let a=0; a<userNameList.length; a++){
                    userNameList[a] = userNameList[a]+'@'+this.props.developerInfo.id;
                }
                let data = {
                            userNameList,
                            roleId:values.roleId,
                            userCategory:values.userCategory
                        };
                if(userCategory==1&&values.password){
                    data.password = encryption(values.password);
                }
                if(userCategory==2&&ipWhiteSelect){
                    debugger;
                    let ipWhiteList = values.ipWhiteList;
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
                }
                
                if(values.remark){
                    data.remark = values.remark;
                }
                post(Paths.addMultiChild,data,{needJson:true}).then((res) => {
                    if(res.code==0){
						Notification({type:'success',description:'用户创建成功！'});
                        this.setState({
                            userNameList:[''],//用户名称
                            userCategory:1,//用户类型
                            roleId:null,//角色ID
                            resetSelectId:'',
                            password:'',
                            ipWhiteSelect:false,//是否提白名单
                            ipWhiteList:'',//白名单
                            remark:'',//备注
                        },()=>{
                            this.props.form.resetFields();//注销form内容。
                            this.props.onAddClose();
                            this.props.pagerIndex(1);
                        });
                    }
                });
            }
        });

        // if(!roleId){
        //     Notification('','请选择用户的角色！');
        //     return false;
        // }
        // if(userCategory==2&&ipWhiteSelect&&!ipWhiteList){
        //     Notification('','请添加IP白名单！');
        //     return false;
        // }
        // if(ipWhiteList){
        //     let ipList = ipWhiteList.split(',');//英文 , 分隔符
        //     if(ipList.length>10){
        //         Notification('','IP白名单最多添加10条！');
        //         return false;
        //     }
        // }
        // let data = {
        //     userNameList,
        //     roleId,
        //     userCategory,
        //     remark
        // };
        // if(userCategory==1){
        //     if(!password){
        //         Notification('','请输入密码！');
        //         return false;
        //     }
        //     let reg = /^[a-zA-Z\d]{6,18}$/;
        //         password = trim(password);
        //     if(!reg.test(password)){
        //         Notification('','请输入正确的密码格式，大小写字母加数字，长度为6-18！');
        //         return false;
        //     }
        //     data.password = encryption(password);//密码 加密
        // }
        // if(userCategory){
        //     data.userCategory = userCategory
        // }
        // if(ipWhiteList){
        //     data.ipWhiteList = ipWhiteList
        // }
        // post(Paths.addMultiChild,data,{needJson:true}).then((res) => {
        //     if(res.code==0){
        //         this.setState({
        //             userNameList:[''],//用户名称
        //             userCategory:1,//用户类型
        //             roleId:null,//角色ID
        //             resetSelectId:'',
        //             password:'',
        //             ipWhiteSelect:false,//是否提白名单
        //             ipWhiteList:'',//白名单
        //             remark:'',//备注
        //         },()=>{
        //             this.props.onAddClose();
        //             this.props.pagerIndex(1);
        //         });
        //     }
        // });
    }
    passwordCheck = (rule, value, callback) => {
        if(!(/^^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,18}$/.test(value))){
            callback('密码格式为大小写字母加数字，长度为6-18');
        }else{
            callback();
        }
    }
    render() {
        const { getFieldDecorator,getFieldValue } = this.props.form;
        let { userCategory, roleId, resetSelectId, ipWhiteSelect, ipWhiteList, password, remark, userNameList, roleList_1, roleList_2 } = this.state;
        
        userCategory = getFieldValue('userCategory');
        resetSelectId = getFieldValue('resetSelectId');
        let roleList = userCategory==1?roleList_1:roleList_2;
        let parentAccountId = this.props.developerInfo.id;
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
            <Form {...formItemLayout} onSubmit={this.affirm} className='add-user-box'>
                <div className='add-user-box'>
                    <div className='common_title_input'>
                        <Row gutter={8}>
                            <Col span={5} className="label">
                                <span className="form-require on-require"><LabelTip label="用户名" tip="控制台访问时的登录名。"/></span>
                            </Col>
                            <Col span={19}>
                                    {
                                        userNameList.map((item,index)=>{
                                            return <div className='uesrName' key={'productName'+index}>
                                                    <Form.Item label='' hasFeedback colon={false} >
                                                        {getFieldDecorator('productName_'+index, {
                                                            rules: [{ required: true, min: 6, max: 14, message: '请输入6~14位大小写字母＋数字' }]
                                                        })(
                                                            <Input className='input'  style={{width:'300px'}} placeholder="请输入用户名称" suffix={'@'+parentAccountId} onChange={this.userName.bind(this,index)}/>
                                                        )}
                                                    </Form.Item>
                                                    {
                                                        index>0?<span className='delete' onClick={this.deleteUserList.bind(this,index)}><Icon type="close-circle" /></span>:null
                                                    }
                                            </div> 
                                        })
                                    }
                                
                            </Col>
                        </Row>
                        <span className='addUesr explainLink-N' onClick={this.addUserList}>添加用户</span>
                        {/* <span className='common_title'>用户名：</span>
                        <div className='common_content'>
                            {
                                userNameList.map((item,index)=>{
                                    return <div key={index+'用户名'}>
                                            <Input className='input' maxLength={14} placeholder='请输入6~14位大小写字母＋数字' style={{width:'300px'}} value={item} onChange={this.userName.bind(this,index)} suffix={'@'+parentAccountId}/>
                                            {
                                                index>0?<span className='delete' onClick={this.deleteUserList.bind(this,index)}><Icon type="close-circle" /></span>:null
                                            }
                                        </div>
                                    })
                            }   
                            <p className='user-name-remark'>控制台访问时的登录名。</p>
                            <span className='explainLink-N' onClick={this.addUserList}>添加用户</span>
                        </div> */}
                    </div>
                    <div className='common_title_input'>
                        <Form.Item label='账户类型' hasFeedback >
                            {getFieldDecorator('userCategory',{
                                rules: [{ required: true, message: '请选择账户类型' }],
                                initialValue: 1
                            })(
                                <Select style={{width:'180px'}} onChange={this.accountSelect}>
                                    <Option key={1+'账户类型'} value={1}>控制台访问用户</Option>
                                    <Option key={2+'账户类型'} value={2} >接口访问用户</Option>
                                </Select>
                            )}
                        </Form.Item>
                        {/* <span className='common_title'>账户类型：</span>
                        <div className='common_content'>
                            <Select value={userCategory} style={{width:'180px'}} onChange={this.accountSelect} >
                                <Option key={1+'账户类型'} value={1}>控制台访问用户</Option>
                                <Option key={2+'账户类型'} value={2} >接口访问用户</Option>
                            </Select>
                        </div> */}
                    </div>
                    <div className='common_title_input'>
                        <Form.Item label='用户角色' hasFeedback >
                            {getFieldDecorator('roleId', {
                                rules: [{ required: true, message: '请选择用户角色' }]
                            })(
                                <Select showSearch style={{width:'180px'}} placeholder="请选择"
                                  filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                  }
                                >
                                    {
                                        roleList.map((item,index)=>{
                                            return <Option key={index+'用户角色'} value={item.roleId}>{item.roleName}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        {/* <span className='common_title'>用户角色：</span>
                        <div className='common_content'>
                            <Select value={roleId||'请选择'} style={{width:'180px'}} onChange={this.roleSelect} >
                                {
                                    roleList.map((item,index)=>{
                                        return <Option key={index+'用户角色'} value={item.roleId}>{item.roleName}</Option>
                                    })
                                }
                            </Select>
                        </div> */}
                    </div>
                    {
                        userCategory==1?
                        <div className='common_title_input'>
                            <div className='reset-select'>
                                <Form.Item label='登录密码' hasFeedback >
                                    {getFieldDecorator('resetSelectId', {
                                        rules: [{ required: true, message: '请选择密码生成方式' }]
                                    })(
                                        <Select style={{width:'180px'}} placeholder="请选择" onChange={this.resetSelect}>
                                            {passwordList.map((item,index)=>{
                                                return <Option key={index+'登录密码'} value={item.id} >{item.text}</Option>
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                                {/* <div className='reset'>
                                    <Input.Password maxLength={18} style={{width:'240px'}} placeholder='大小写字母加数字，长度为6-18' value={password} onChange={this.passwordInput} disabled={resetSelectId==1?true:false} />
                                </div> */}
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
                            {/* <span className='common_title'>登录密码：</span>
                            <div className='common_content'>
                                <div className='reset-select'>
                                    <Select value={resetSelectId||'请选择'} style={{width:'180px'}} onChange={this.resetSelect}>
                                        {passwordList.map((item,index)=>{
                                            return <Option key={index+'登录密码'} value={item.id} >{item.text}</Option>
                                        })}
                                    </Select>
                                    {resetSelectId?
                                    <div className='reset'>
                                        <Input.Password maxLength={18} style={{width:'240px'}} placeholder='大小写字母加数字，长度为6-18' value={password} onChange={this.passwordInput} disabled={resetSelectId==1?true:false} />
                                    </div>
                                    :null}
                                </div>
                            </div> */}
                        </div>
                        :null
                    }
                    {
                        userCategory==2?
                            // <div className='common_title_input'>
                            //         <Form.Item label='IP白名单' >
                            //             {getFieldDecorator('ipWhiteSelect')(
                            //                 <Switch size="small" checked={ipWhiteSelect} onClick={this.ipWhiteSelectFunc} />
                            //             )}
                            //         </Form.Item>
                            //         {
                            //             ipWhiteSelect?
                            //             <TextAreaCounter
                            //                 label=" "
                            //                 colon={false} 
                            //                 formId='ipWhiteList'
                            //                 astrictNub='159'
                            //                 rows='3' 
                            //                 placeholder='请输入IP地址，多个IP地址以",(英文)"分割,最多10个IP' 
                            //                 getFieldDecorator={getFieldDecorator}
                            //                 initialVal={ipWhiteList}
                            //                 getFieldValue={getFieldValue}
                            //                 width='300px'
                            //                 isRequired={true}
                            //                 message='IP白名单'
                            //             />
                            //             :null
                            //         }
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

export const AddUserInfo = Form.create({
    name: 'addUserInfo',
})(AddUserInfoForm);

