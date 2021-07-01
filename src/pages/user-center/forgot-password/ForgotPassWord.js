import React, { Component } from 'react';
import AccountFlowTemplate from '../account-flow-template/AccountFlowTemplate';

const FlowList = [
    {
        title: '身份验证'
    },
    {
        title: '重置密码'
    },
    {
        title: '完成'
    }
]

export default class ForgotPassWord extends Component {
    render() {
        return (
            <AccountFlowTemplate FlowList={FlowList} cType={1} title="忘记密码"></AccountFlowTemplate>
        )
    }
}
