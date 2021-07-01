import React, { Component } from 'react';
import BaseInfoForm from './configform/baseinfo';
import { RuleForm } from './configform/rule';
import { get, Paths, post } from '../../../../api';
// import { Notification } from '../../../../../components/Notification';
import PageTitle from '../../../../components/page-title/PageTitle';
import '../monitor.scss';
const pagedata = {
    pageIndex:1,
    pageRows:9999
}
class WarningConfig extends Component {

    constructor(props) {
        super(props);
        this.baseInfoForm = {};
        this.ruleForm = {};
        this.publicTypeForm = {};
        this.state = {
            current: 0,
            ruleId: this.props.match.params.id,
            baseFormData:{},
            ruleFormData:[],
            devicegrouplist:[],
            productList:[],
            transferList:[],
        }
        let ruleId = this.props.match.params.id;
        if (ruleId) {
            get(Paths.getMonitor, {id:ruleId}, { loading: true }).then(res => {
                let data = res.data;
                let {description,name,transferId,transferTopic,transferTag,ruleConf} = data;
                let baseFormData = {description,name,transferId,transferTopic,transferTag},
                    ruleFormData = JSON.parse(ruleConf);
                this.setState({ruleId,baseFormData,ruleFormData},()=>{console.log(9999,this.state)});
            });
        }
    }
    componentDidMount(){
        get(Paths.getGroupList,{...pagedata}).then((res) => {
            this.setState({
                devicegrouplist:res.data.list,
            });
        });
        get(Paths.getDownProduct,{...pagedata}).then((res) => {
            let productList = res.data.list;
            if(productList&&productList.length&&productList.length>0){
                this.setState({productList});
            }
        });
        get(Paths.getTransfer4Monitor).then((res) => {
            let transferList = res.data || [];
            console.log(44,transferList);
            this.setState({transferList});
        });

        
     }
    goToStep = current =>{
        this.setState({current},()=>{
            console.log(this.state)
        })
    }
    
    // saveRule = (obj)=>{
    //     console.log("------save step value---",obj);
    //     this.setState(obj,()=>{
    //         if(!obj.current){//判断是否第三步保存（没有传current）此时做整体提交
    //             this.commitAll();
    //         }
    //     });
    // }
    saveBaseInfo = (baseFormData)=>{
        this.setState({baseFormData,current:1})
    }
    setRuleFormData = (formdata)=>{
        this.setState({ruleFormData:formdata,current:0})

    }
    // ruleFormSubmit=(form,e)=>{
    //     this[form].handleSubmit(e)
    // }
    // commitAll=()=>{
    //     let {baseFormData,ruleFormData,ruleId} = this.state;
    //     let otherobj = {...ruleFormData,  };
    //     let content = JSON.stringify(otherobj);
    //     let params = { ...baseFormData, id:ruleId, content };
    //     post(Paths.saveWarningConfig, params, { loading: true }).then(res => {
    //         this.props.history.push({pathname:"/open/base/device/deviceWarning",page:"2"})
    //     });
    // }

    render() {
        let { current,ruleId,baseFormData,ruleFormData,devicegrouplist,productList,transferList } = this.state;
        let curStep = ' current-step';
        return (
            <div className="device-monitordetailpage flex-column">
                <PageTitle backHandle={() => this.props.history.push({pathname:"/open/developCenter/deviceMonitor/list",page:"2"})} title={ruleId ? '编辑设备监控':'新增设备监控'} />
                <div className="step-header-wrapper">
                    <div className="step-header flex-row" >
                        <div className={`step-item flex-row flex1${(current === 0) && curStep || ''}`}>
                            <i className="step-product" />
                            <span>1. 监控信息</span>
                        </div>
                        <div
                            className={`step-item flex1 flex-row${(current === 1) && curStep || ''}`}>
                            <i className="step-data" />
                            <span>2. 规则配置</span>
                        </div>
                    </div>
                </div>
                <div className="add-content-wrapper">
                    <div className="add-content">
                        <div className="steps-content">
                            {[
                                <BaseInfoForm saveBaseInfo={this.saveBaseInfo} baseFormData={baseFormData} transferList={transferList}/>,
                                <RuleForm 
                                    // saveRule={this.saveRule}
                                    // goToStep={this.goToStep}
                                    baseFormData={baseFormData}
                                    ruleFormData={ruleFormData}
                                    ruleId={ruleId}
                                    setRuleFormData={this.setRuleFormData}
                                    devicegrouplist={devicegrouplist}
                                    productList={productList}
                                />
                            ][current]}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WarningConfig;


