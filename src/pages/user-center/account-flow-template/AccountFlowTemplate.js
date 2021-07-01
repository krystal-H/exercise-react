import React, { Component } from 'react'
import FullScreenFlexWrapper from '../full-screen-flex-wrapper/FullScreenFlexWrapper';
import DescWrapper from '../../../components/desc-wrapper/DescWrapper';
import FLowChart from '../../../components/flow-chart/FlowChart';
import {EmailAuthFormWrapper,SetPassWordFormWrapper,CloseAccountFormWrapper} from '../AccountForm';
import {Button,Checkbox} from 'antd';
import { post,Paths,get } from '../../../api';
import { getUrlParam} from '../../../util/util';

import EmailAuthOk from '../../../assets/images/account/email-auth-ok.png'; 
import EmailAuthError from '../../../assets/images/account/email-auth-error.png';
import ResetOk from '../../../assets/images/account/reset-ok.png';
import DoubleRightArrow from '../../../assets/images/double-right-arrow.png'
import { withRouter } from 'react-router-dom';

const desc5 =[
    '重要提示',
    '1. 账户注销操作是非常重要的操作，您必须在通过身份验证后，才可以提交账户注销申请；',
    '2. 账户注销申请提交后，平台将审核您提交的信息；在审核期间，您可以正常访问平台，但您将无法创建任何的数据，如创建产品，创建场景等；您也可以在审核期间撤销账户注销申请；',
    '3. 账户注销申请审批通过后，您将无法登录平台控制台，接口访问也将被拒绝；您在平台创建的数据以及您账户产生的信息将完全被清除；',
    '4. 注销账户申请提交后，在审核之前您可以随时撤销账户注销申请；审核通过后，数据和账户信息将立刻被清除，无法恢复。请慎重使用注销账户操作；'
];

class AccountFlowTemplate extends Component {
    constructor(props){
        super(props);
        let email = getUrlParam('email'),
            uuid = getUrlParam('uuid'),
            updateEmailComfirm = getUrlParam('updateEmailComfirm'),
            {emailFromFather,isNeedVerifyType} = this.props;

        this.state = {
            type: 0, // 标记组件内部的不同的操作步骤
            email: email || emailFromFather || '', // 当前操作的账号邮箱 忘记密码-手动输入；链接跳转-链接参数中获取；其他场景-父组件传递
            countDownNum:0, // 发送邮件倒计时，避免短时间类重复触发
            uuid, // 邮件确认时拿到的UUID
            needEmailComfirm: !!email, // 标记是否时邮件确认链接进入的；用于判断是否需要请求邮件确认接口
            code:'', // 随机码；部分操作需要协议，请求成功一次后失效，最长有效期为4小时
            isResetEmail:false,
            isReadedCloseAccountDesc: email ? true : false,
            isConfirmedForCloseAccount: email ? true : false, // 注销账号是，是否勾选过确认
            newEmail:'',
            updateEmailComfirm,
            isNeedVerifyType: email ? false : (isNeedVerifyType || false),
            verifyType: 0 // 0 - 未选择，1 - 邮箱 ， 2 - 手机
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(prevProps.emailFromFather !== this.props.emailFromFather) {
            let email = getUrlParam('email')
            if (!email) {

                this.setState({
                    email:this.props.emailFromFather
                })
            }
        }
    }
    // cType 标记不同的场景 1- 忘记密码； 2- 修改密码；3-修改绑定邮箱 ；5- 注销账户
    componentDidMount(){
        let {email,uuid,needEmailComfirm,updateEmailComfirm} = this.state,
            {cType} = this.props, 
            path = Paths.authConfirm,
            data = {
                account:email,
                uuid,
                type:cType 
            };
        
        if (updateEmailComfirm) {
            path = Paths.resetEmailConfirm
            data = {
                account:email,
                uuid
            }
        }

        if (needEmailComfirm) {
            // 邮件确认接口，链接跳转进来才会请求
            post(path,data).then(data => {
                let code = data.data;

                if (updateEmailComfirm) {
                    this.setState({
                        type:4
                    })
                } else {
                    this.setState({
                        code,
                        type:2
                    })
                }
            }).catch(error => {
                this.setState({
                    type:3
                })
            }).finally( () => {
                this.setState({
                    needEmailComfirm:false
                })
            })
        }
    }
    goToLogin = () => {
        window.location = window.location.origin + window.location.pathname + '#/account/login';
    }
    goUserInfo = () => {
        window.location = window.location.origin + window.location.pathname +  '#/userCenter/info/base';
    }
    // 切换不同的场景
    changeType = (data) => {
        this.setState({
            ...data
        })

        if(data.type === 1) {
            this.countDown()
        }

    }
    // 重新发送验证邮件；type标志不同的场景 0：发送邮件失败，用户未收到；1：用户通过邮件链接访问后，邮件确认失败，重新请求发送邮件
    reSendEmail = (type = 0) => {
        let {email,isResetEmail,newEmail,code} = this.state,
            {cType} = this.props,
            path = '',
            data = {};
        
        if (cType === 1) {
            path = Paths.resendForgetPasswordEmail
            data = {
                account:email
            }
        } else if (isResetEmail) {
            path = Paths.resetEmail
            data = {
                account: newEmail,
                code
            }
        } else {
            path = Paths.resetAuth
            data = {
                type : cType
            }
        }

        this.countDown()

        post(path,data,{
            loading:true
        }).then(data => {
            if (type === 1) {
                this.setState({
                    type : 1
                })
            }

            this.countDown()
        })
    }
    sendEmail = () => {
        let {cType} = this.props;

        this.countDown()

        post(Paths.resetAuth,{
            type:cType
        }).then( data => {
            this.changeType({
                type:1
            })
        }).catch( error => {

        })
    }
    withDraw = () => {
        get(Paths.withdraw,{
        },{
            loading:true
        }).then( data => {
            this.goUserInfo()
        }).catch( error => {

        })
    }
    countDown = () => {

        if(this._countDown){
            clearInterval(this._countDown)
        }

        this.setState({
            countDownNum:60
        })
        this._countDown = setInterval(() => {
            let {countDownNum} = this.state;
            if (countDownNum <= 0) {
                clearInterval(this._countDown)
                return false
            }
            this.setState({
                countDownNum: countDownNum - 1
            })
        }, 1000 )
    }
    getFlowItem = () => {
        let {type} = this.state;

        if (type === 4) {
            return 2;
        }

        if (type === 2) {
            return 1;
        }

        return 0;
    }
    getTypeDom = (type) => {
        let {cType = 1} = this.props,
            {email,code,countDownNum} = this.state;

        switch (type) {
            case 0:
                let descText0 = '平台将向您账号设置的邮箱地址发送验证邮件，请根据邮件指引完成身份验证';
                if (cType === 1) {
                    descText0 = '请输入您注册时填写的邮箱地址，请根据邮件指引完成身份验证';
                }
                return (
                    <React.Fragment>
                        <div className="desc">
                            {descText0}
                        </div>
                        {
                            cType === 1 && 
                            <EmailAuthFormWrapper type={1} changeType={this.changeType}></EmailAuthFormWrapper>
                        }
                        {
                            [2,3,5].includes(cType) && 
                            <React.Fragment>
                                <div className="desc second">
                                    {`您的账号邮箱为`} <a>{email}</a>
                                </div>
                                <div className="button-wrapper">
                                    <Button onClick={this.sendEmail}
                                            disabled={countDownNum > 0} 
                                            type="primary">确认发送验证邮件</Button>
                                </div>
                            </React.Fragment>
                        }
                    </React.Fragment>
                )
            case 2:
                let descText2 = '您可以创建新的登录密码';
                if (cType === 3) {
                    descText2 = '平台将向您的邮箱输入一封验证邮件，请根据邮件指引完成邮箱验证';
                }
                if (cType === 5) {
                    descText2 = '请提交账户注销申请';
                }
                return (
                    <React.Fragment>
                        <div className="img-wrapper ok">
                            <img src={EmailAuthOk} alt="反馈图标"/>
                            <span>身份验证成功！</span>
                        </div>
                        <div className="desc second middle-fontsize">
                            {descText2}
                        </div>
                        {
                            [1,2].includes(cType) && 
                            <SetPassWordFormWrapper cType={cType} code={code} email={email} changeType={this.changeType} style={{marginTop:'24px'}}></SetPassWordFormWrapper>
                        }
                        {
                            cType === 3 && 
                            <EmailAuthFormWrapper type={2} code={code} changeType={this.changeType}></EmailAuthFormWrapper>
                        }
                        {
                            cType === 5 && 
                            <CloseAccountFormWrapper isCloseAccount={true} code={code} changeType={this.changeType}></CloseAccountFormWrapper>
                        }
                    </React.Fragment>
                )
            case 4:
                let descText4 = '密码重置完成！';
                if (cType === 3) {
                    descText4 = '电子邮件修改完成！';
                }

                if (cType === 5) {
                    return (
                        <React.Fragment>
                            <div className="desc ">
                                您的账户注销申请已提交，平台将在 <a>3</a> 个工作日内完成审核
                            </div>
                            <div className="desc second middle-fontsize">
                                在审核期间，您可以正常访问平台，但您将无法创建任何的数据，如创建产品，创建场景等；
                            </div>
                            <div className="button-wrapper">
                                <Button onClick={ () => this.withDraw()} 
                                        type="primary">撤销账户注销申请</Button>
                            </div>
                        </React.Fragment>
                    )
                }
                return (
                    <React.Fragment>
                        <div className="img-wrapper ok">
                            <img src={ResetOk} alt="反馈图标"/>
                            <span>{descText4}</span>
                        </div>
                        <div className="button-wrapper">
                            <Button onClick={ () => this.goToLogin()} 
                                    type="primary">返回立即登录</Button>
                        </div>
                    </React.Fragment>
                )
            default:
                break;
        }
    }
    readedCloseAccountDesc = () => {
        this.setState((preState) => (
            {
                isReadedCloseAccountDesc: !preState.isReadedCloseAccountDesc
            }
        ))
    }
    confirmedForCloseAccount = e => {
        this.setState((preState) => (
            {
                isConfirmedForCloseAccount: !preState.isConfirmedForCloseAccount
            }
        ))
    }
    // 取消注销
    cancelCloseAccount = () => {
        this.props.history.go(-1);
    }
    setVerifyType = () => {
        this.setState({
            verifyType:1
        })
    }
    render() {
        let {type,email,countDownNum,isResetEmail,newEmail,isConfirmedForCloseAccount,isReadedCloseAccountDesc,isNeedVerifyType,verifyType} = this.state,
            {FlowList,cType,title} = this.props,
            btnDisable = (countDownNum > 0);

        return (
            <FullScreenFlexWrapper needHeader={cType === 1} isInPage={cType !== 1}>
                <div className="content-area">
                    <div className="sub-title">
                        {title}
                    </div>
                    {
                        // 注销账号 独有的确认流程
                        ((cType === 5) && !isConfirmedForCloseAccount ) ?
                        <div style={{margin:'24px auto'}}>

                            <DescWrapper style={{marginBottom:'24px'}} desc={desc5}></DescWrapper>
                            <Checkbox checked={isReadedCloseAccountDesc} onChange={this.readedCloseAccountDesc}>已了解，提交申请后，账号 <b>{email}</b> 将会被注销，所有的平台数据将会被清除且无法恢复。</Checkbox>

                            <div style={{marginTop:'72px',textAlign:'right'}}>
                                <Button style={{marginRight:'24px'}} 
                                        disabled={!isReadedCloseAccountDesc}
                                        onClick={this.confirmedForCloseAccount}
                                        type="primary">确认注销</Button> 
                                        
                                <Button disabled={!isReadedCloseAccountDesc} 
                                        onClick={this.cancelCloseAccount}
                                        type="default">取消注销</Button>
                            </div>
                        </div> :
                        <>
                            <div className="flow-chart-wrapper">
                                <FLowChart type={2} flowLists={FlowList} activeItem={this.getFlowItem()}></FLowChart>
                            </div>
                            {
                                // 选择验证方式 --- 目前只有邮箱验证，后续可能会增加手机验证，此处是为扩展预留位置
                                (isNeedVerifyType && (verifyType === 0)) ?
                                <div className="select-verify-type-wrapper">
                                    <p>请选择身份验证方式</p>
                                    <div className="verify-type-item">
                                        <h3>通过邮箱</h3>
                                        <div>将通过您账号关联的邮箱 <b>{email}</b> 进行验证 <div onClick={this.setVerifyType} className="float-right"><span>去验证</span> <img src={DoubleRightArrow} alt=""/></div></div> 
                                    </div>      
                                </div>:
                                <>
                                    {
                                        type === 0 && 
                                        this.getTypeDom(0)
                                    }
                                    {
                                        type === 1 && 
                                        <React.Fragment>
                                            <div className="desc">
                                                {`身份验证邮箱已发送到您的邮箱：${isResetEmail ? newEmail : email}`}
                                            </div>
                                            <div className="desc second">
                                                请您根据邮件指引完成身份验证操作
                                            </div>
                                            <div className="button-wrapper">
                                                <Button disabled={btnDisable}
                                                        onClick={this.reSendEmail} 
                                                        type="primary">{`重发邮件` + (btnDisable ? ` (${countDownNum}S)` : '')}</Button>
                                            </div>
                                        </React.Fragment>
                                    }
                                    {
                                        type === 2 && 
                                        this.getTypeDom(2)
                                    }
                                    {
                                        type === 3 && 
                                        <React.Fragment>
                                            <div className="img-wrapper error">
                                                <img src={EmailAuthError} alt="反馈图标"/>
                                                <span>身份验证失败！</span>
                                            </div>
                                            <div className="desc middle-fontsize">
                                                您可以重新发送验证邮件。
                                            </div>
                                            <div className="button-wrapper">
                                                <Button onClick={ () => this.reSendEmail(1)} 
                                                        type="primary">重发邮件</Button>
                                            </div>
                                        </React.Fragment>
                                    }
                                    {
                                        type === 4 && 
                                        this.getTypeDom(4)
                                    }
                                    {
                                        (cType === 1) &&
                                        <div className="right-top">
                                            <span className="tip">已有C-Life云帐号? </span> <a onClick={this.goToLogin}> 快速登录</a>
                                        </div>
                                    }
                                </>
                            }
                        </>
                    } 
                </div>
            </FullScreenFlexWrapper>
        )
    }
}

export default withRouter(AccountFlowTemplate)