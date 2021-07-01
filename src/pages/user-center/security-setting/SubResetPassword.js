import React, { Component } from 'react'
import FullScreenFlexWrapper from '../full-screen-flex-wrapper/FullScreenFlexWrapper'
import {SubResetPassWordFormWrapper} from '../AccountForm';

export default class SubResetPassword extends Component {
    render() {
        let {history} = this.props;
        return (
            <FullScreenFlexWrapper needHeader={false} isInPage={true}>
                  <div className="content-area">
                    <div className="title">
                        重置登录密码
                    </div>
                    <div className="desc default middle-fontsize">
                        重置子账户登录密码，需要验证原登录账号
                    </div>
                    <SubResetPassWordFormWrapper history={history}></SubResetPassWordFormWrapper>
                </div>  
            </FullScreenFlexWrapper>
        )
    }
}
