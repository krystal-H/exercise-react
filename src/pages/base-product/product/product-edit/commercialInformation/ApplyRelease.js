import React, { Component } from 'react';
import {Notification} from '../../../../../components/Notification'; 
import DescWrapper from '../../../../../components/desc-wrapper/DescWrapper';
import { get,Paths } from '../../../../../api';
import FlowChart from '../../../../../components/flow-chart/FlowChart';
import DoubleBtns from '../../../../../components/double-btns/DoubleBtns';

import './ApplyRelease.scss';

const desc = [
    '注意事项：',
    '1. 产品发布后，将进入正式使用状态，功能定义/通信模组等关键信息将无法被修改，请确保产品功能开发完成并验证通过。',
    '2. 产品选用的拓展服务，如场景，语音，APP控制等，可以在发布后继续维护更新。',
    '3. 产品发布后将开放固件管理，设备密钥管理等功能，可持续对发布产品进行维护。',
];
const appGuideLists = [
    {
        title: '提交发布申请'
    },
    {
        title: '功能配置审查'
    },
    {
        title: '硬件审查'
    },
    {
        title: '上线运行'
    }
]

let flag = false;
export default class ApplyRelease  extends Component {
    constructor(props){
        super(props);
        this.state = {
            
        }
        this.click_1 = this.click_1.bind(this);
        this.click_2 = this.click_2.bind(this);
    }
    componentDidMount() {

    }
    click_1(){
        this.props.history.goBack();
    }
    //发布产品 
    click_2(){
        if(flag){
            return;
        }
        flag = true;
        get(Paths.productPublishAdd,{productId:this.props.productId},{needVersion:1.1}).then((model) => {
            flag = false;
            if(model.code==0){
                Notification({
                    type:'success',
                    message: "申请发布成功",
                    duration: 3
                })
                this.props.history.push({
                    pathname: `/open/base/product/list`
                });
            }
        });
    }
    // goBackServiceSelect  = () => {
    //     let {history}  = this.props;
    //     history.goBack();
    // }
    render() {

        return (
            <div className="applyRelease">
                <div className='commonContentBox'>
                <div className="app-control">
                    <div className="service-title">
                        {/* <span className="back" onClick={this.goBackServiceSelect}><Icon type="arrow-left" /> 返回</span> */}
                        <span className="title_apply">产品发布申请</span>
                    </div>
                    <div className="centent">
                        <DescWrapper desc={desc} />
                    </div>
                    <section className="app-guide-wrapper section-bg">
                        <p>为了确保产品功能和服务正常可用，平台将对申请发布的产品进行审核。请寄送产品2太产品样机，以便于平台对产品进行全面测试。若审查未通过，您可以参考审核拒绝意见进行修改和完善，并重新提交发布。发布审查的周期约为5-10个工作日。</p>
                        <div className="use-flow-wrapper">
                            <h3>邮寄地址：</h3>
                            <div className="app-flows">
                            广东省深圳市南山区粤海街道科技南十路6号航天科技创建研究院D座10楼      前台收      0755-23954126
                            </div>
                        </div>
                        <div className="use-flow-wrapper">
                            <h3>产品发布审查流程：</h3>
                            <FlowChart flowLists={appGuideLists}></FlowChart>
                        </div>
                    </section>
                </div>
                <DoubleBtns
                    preText='再想想'
                    preHandle={this.click_1}
                    nextText='申请发布'
                    nextHandle={this.click_2}
                />
                </div>
            </div>
        )
    }
}


