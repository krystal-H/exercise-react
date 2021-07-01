import React from 'react';
import {Switch,Route,Redirect} from 'react-router-dom';
import Login from './login/Login';
import Register from './register/Register';
import ForgotPassword from './forgot-password/ForgotPassWord';

import './Account.scss';

export default function Account({match}) {
    let {path} = match;
    return (
        <div className="account-wrapper">
            <Switch>
                {/* 登录 */}
                <Route path={`${path}/login`} component={Login}></Route>
                {/* 注册 */}
                <Route path={`${path}/register`} component={Register}></Route>
                {/* 忘记密码 */}
                <Route path={`${path}/forgtopassword`} component={ForgotPassword}></Route>
                {/* 重定向登录 */}
                <Redirect to={`${path}/login`}></Redirect>
            </Switch>
        </div>
    )
}
