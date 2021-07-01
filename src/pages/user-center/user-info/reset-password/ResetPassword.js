import React, { Component } from 'react'

import AccountFlowTemplate from '../../account-flow-template/AccountFlowTemplate';

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


export default class ResetPassword extends Component {

    render() {
        let {developerInfo} = this.props,
            {email} = developerInfo;
        return (
            <AccountFlowTemplate FlowList={FlowList} 
                                 cType={2}
                                 emailFromFather={email || ''} 
                                 title="重置密码"></AccountFlowTemplate>
        )
    }
}
