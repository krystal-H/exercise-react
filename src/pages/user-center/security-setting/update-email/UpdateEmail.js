import React, { Component } from 'react'

import AccountFlowTemplate from '../../account-flow-template/AccountFlowTemplate';

const FlowList = [
    {
        title: '身份验证'
    },
    {
        title: '设置电子邮箱'
    },
    {
        title: '完成'
    }
]


export default class UpdateEmail extends Component {
    render() {
        let {developerInfo} = this.props,
            {email} = developerInfo;
        return (
            <AccountFlowTemplate FlowList={FlowList} 
                                 cType={3}
                                 emailFromFather={email}
                                 isNeedVerifyType={true} 
                                 title="修改电子邮箱"></AccountFlowTemplate>
        )
    }
}