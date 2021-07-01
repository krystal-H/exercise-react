import React, { Component } from 'react'

import AccountFlowTemplate from '../../account-flow-template/AccountFlowTemplate';

const FlowList = [
    {
        title: '身份验证'
    },
    {
        title: '提交注销申请'
    },
    {
        title: '审核'
    }
]

export default class CloseAccount extends Component {
    render() {
        let {developerInfo} = this.props,
            {email} = developerInfo;
        return (
            <AccountFlowTemplate FlowList={FlowList} 
                                 cType={5}
                                 emailFromFather={email || ''}
                                 isNeedVerifyType={true} 
                                 title="注销账号"></AccountFlowTemplate>
        )
    }
}
