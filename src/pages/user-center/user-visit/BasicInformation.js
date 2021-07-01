import React, { Component } from 'react'
import { Button } from 'antd';
import AloneSection from '../../../components/alone-section/AloneSection';
import LabelVisible from '../../../components/form-com/LabelVisible';
import { DateTool } from '../../../util/util';

export default class BasicInformation extends Component {
    constructor(props){
        super(props);
        this.state = {
            
        };
        
    }
    componentDidMount() {
        // 获取产品列表
    }
    render() {
        let { userInfo,secretKey,secretId } = this.props;
        const ListItem = ({title, label, type}) => {
            return (
                <p className="list-item"><span className="title">{title}：</span>
                    {
                        type === "visible" ? <LabelVisible label={label || ""} tip="点击复制" copy={true}/> :
                        <span>{label}</span>
                    }
                </p>
            )
        }
        return (
            <div className='basic-information-box'>
                <Button className='but-edit basic-information-edit' type="primary" onClick={this.props.editUserInfo}>编辑</Button>
                <AloneSection title="基础信息">
                    
                    <div className="device-info">
                        <ListItem title="用户名" label={userInfo.userName||'--'}/>
                        <ListItem title="用户ID" label={userInfo.userId||'--'} />
                        <ListItem title="账户类型" label={userInfo.userCategory==1?'控制台访问用户':userInfo.userCategory==2?'接口访问用户':'--'}/>
                        <ListItem title="用户角色" label={userInfo.roleName||'--'}/>
                        {   //控制台访问用户不用显示secretKey
                        userInfo.userCategory==2&&<ListItem title="用户secretId" label={secretId} type="visible"/>
                        }

                        {   //控制台访问用户不用显示secretKey
                        userInfo.userCategory==2&&<ListItem title="用户SecretKey" label={secretKey} type="visible"/>
                        }

                        <ListItem title="创建时间" label={ DateTool.utcToDev(userInfo.regTime) }/>
                        <ListItem title="最新修改时间" label={DateTool.utcToDev(userInfo.modifyTime) }/>
                        {/* <ListItem title="备注" label={userInfo.remark||'--'} /> */}
                    </div>
                    <p className="userlook-mark"><span>备注：</span>{userInfo.remark}</p>
                </AloneSection>

            </div>

            
        );
    }
}
