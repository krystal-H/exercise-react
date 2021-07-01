import React,{useState} from 'react'
import {Switch,Redirect,Route} from 'react-router-dom'
import {PrivateRoute} from '../../../configs/route.config'
import { get,Paths } from '../../../api'

import ResetPassword from './reset-password/ResetPassword'
import UpdateEmail from './update-email/UpdateEmail'
import CloseAccount from './close-account/CloseAccount'
import SubResetPassword from './SubResetPassword';

import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import { DateTool,strToAsterisk } from '../../../util/util';
import { Icon } from "antd";

import './SecuritySetting.scss'

export default function SecuritySetting ({developerInfo,getDeveloperInfo,match}) {
    let {path} = match,
        isOk = !(developerInfo.isSubUser === 1);
    return (
        <Switch>
            <Route path={`${path}/setting`} render={routeProps => <Setting {...routeProps} developerInfo={developerInfo} getDeveloperInfo={getDeveloperInfo}></Setting>}></Route>
            <PrivateRoute component={ResetPassword} path={`${path}/resetPassword`} redirect={`${path}/base`} developerInfo={developerInfo} isOk={isOk}></PrivateRoute>
            <PrivateRoute component={UpdateEmail} path={`${path}/updateEmail`} redirect={`${path}/base`} developerInfo={developerInfo} isOk={isOk}></PrivateRoute>
            <PrivateRoute component={CloseAccount} path={`${path}/closeAccount`} redirect={`${path}/base`} developerInfo={developerInfo} isOk={isOk}></PrivateRoute>
            <PrivateRoute component={SubResetPassword} path={`${path}/subResetPassword`} redirect={`${path}/base`} isOk={!isOk}></PrivateRoute>
            <Redirect to={`${path}/setting`}></Redirect>
        </Switch>
    )
}


function Setting ({
    developerInfo,
    history,
    getDeveloperInfo
}) {
    let {id,secretId,secretKey,createTime,isSubUser,email,cancelStatus} = developerInfo,
        _isSubUser = !!isSubUser;

    const [showid, setShowid] = useState(false);
    const [showkey, setShowkey] = useState(false);

    const goToItem = (type) => {
        history.push({
            pathname: `/userCenter/security/${type}`})
    }
    const withDraw = () => {
        get(Paths.withdraw,{
        },{
            loading:true
        }).then( data => {
            getDeveloperInfo()
        }).catch( error => {

        })
    }
   
    return (
        <React.Fragment>
            <PageTitle noback={true} title="安全设置"></PageTitle>
            <AloneSection>
                {
                        <div className="safe-setting">
                        <div className="setting-item flex-row">

                            <div className="left-desc flex1">
                                <div className="title">API访问秘钥</div>
                                <div className="desc-content">
                                    <div className="p-flex">
                                        <span className="flex-item">
                                            <span className="tit">开发者ID：</span>
                                            {id}
                                        </span>
                                        <span className="flex-item">
                                            <span className="tit">用户secretId：</span>
                                            {showid?secretId:strToAsterisk(secretId, 10)}
                                            <Icon
                                                type={showid?"eye":"eye-invisible"}
                                                style={{ fontSize: "18px", marginLeft: "6px" }}
                                                theme="twoTone"
                                                twoToneColor="#2874FF"
                                                onClick={ ()=>{setShowid(pri=>!pri)} }
                                            />
                                        </span>
                                        <span className="flex-item">
                                            <span className="tit">用户SecretKey：</span>
                                            {showkey?secretKey:strToAsterisk(secretKey, 10)}
                                            <Icon
                                                type={showkey?"eye":"eye-invisible"}
                                                style={{ fontSize: "18px", marginLeft: "6px" }}
                                                theme="twoTone"
                                                twoToneColor="#2874FF"
                                                onClick={ ()=>{setShowkey(pri=>!pri)} }
                                            />
                                        </span>

                                        
                                        <span className="flex-item">
                                            <span className="tit">创建时间：</span>
                                            {createTime ? DateTool.utcToDev(createTime) : '--'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="setting-item flex-row">
                            <div className="left-desc flex1">
                                <div className="title">登录密码</div>
                                <div className="desc-content">
                                    登录平台需验证密码。以字母开头的6到18位的字母，数字和下划线。建议您定期更换密码。
                                </div>
                            </div>
                            <div className="setting-btn-wrapper">
                                <div className="btns">
                                    <span className="btn-has">已设置</span>
                                    <span onClick={() => goToItem(_isSubUser ? 'subResetPassword' : 'resetPassword')} className="btn-can-control">重置</span>
                                </div>
                            </div>
                        </div>
                        {
                            !_isSubUser && 
                            <React.Fragment>
                                <div className="setting-item flex-row">
                                    <div className="left-desc flex1">
                                        <div className="title">电子邮箱</div>
                                        <div className="desc-content">
                                            电子邮箱地址可用于登录平台，也可以用于接收服务通知信息。
                                        </div>
                                    </div>
                                    <div className="setting-btn-wrapper">
                                        <div className="btns">
                                            <span className={email ? 'btn-has' : 'btn-not-has'}>{email ? '已设置' : '未设置'}</span>
                                            <span onClick={() => goToItem('updateEmail')} className="btn-can-control">重置</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-item flex-row">
                                    <div className="left-desc flex1">
                                        <div className="title">注销账户</div>
                                        <div className="desc-content">
                                        如果您不再使用此账号，可以将其注销。账号成功注销后，所有的产品数据及隐私信息将会被永久删除且无法恢复。
                                        </div>
                                    </div>
                                    <div className="setting-btn-wrapper">
                                        <div className="btns">
                                            {
                                                (cancelStatus == 1) ? 
                                                <span onClick={() => withDraw()} className="btn-can-control">撤销注销账户申请</span>
                                                : <span onClick={() => goToItem('closeAccount')} className="btn-can-control">注销账户</span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        }
                    </div>
                }
            </AloneSection>
        </React.Fragment>
    )

}