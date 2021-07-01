import React, { Component } from 'react';
import { BaseInfoForm } from './configform/baseinfo';
import { RuleForm } from './configform/rule';
import { PublictypeForm } from './configform/publictype';
import { get, Paths, post } from '../../../../../api';
import DoubleBtns from '@src/components/double-btns/DoubleBtns';
// import { Notification } from '../../../../../components/Notification';
import PageTitle from '../../../../../components/page-title/PageTitle';

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
            ruleFormData:{},
            piublicFormData:{},
            status:undefined,
        }
        let ruleId = this.props.match.params.id;
        if (ruleId) {
            get(Paths.getWarningConfigDetail, {ruleId}, { loading: true }).then(res => {
                let data = res.data;
                let {name,remark,status,content} = data;
                
                let contobj = JSON.parse(content);
                let {warningWay,warningTitle,warningDetails,waringFreq,emailAddress,...others} = contobj;
                let baseFormData = {name,remark},
                    ruleFormData = others,
                    piublicFormData =  {warningWay,warningTitle,warningDetails,waringFreq,emailAddress};
                this.setState({ruleId,status,baseFormData,ruleFormData,piublicFormData},()=>{console.log(9999,this.state)});
            });
        }
    }
    goToStep = current =>{
        this.setState({current})
    }
    
    saveStepInfo = (obj)=>{
        console.log("------save step value---",obj);
        this.setState(obj,()=>{
            if(!obj.current){//判断是否第三步保存（没有传current）此时做整体提交
                this.commitAll();
            }
        });
    }
    ruleFormSubmit=(form,e)=>{
        this[form].handleSubmit(e)
    }
    commitAll=()=>{
        let {baseFormData,ruleFormData,piublicFormData,ruleId,status} = this.state;
        let otherobj = {...ruleFormData, ...piublicFormData };
        let content = JSON.stringify(otherobj);
        let params = { ...baseFormData, id:ruleId, status, content };
        post(Paths.saveWarningConfig, params, { loading: true }).then(res => {
            this.props.history.push({pathname:"/open/base/device/deviceWarning",page:"2"})
        });
    }

    render() {
        let { current,ruleId,baseFormData,ruleFormData,piublicFormData } = this.state;
        let curStep = ' current-step';
        return (
            <div className="device-warningconfigpage flex-column">
                <PageTitle backHandle={() => this.props.history.push({pathname:"/open/base/device/deviceWarning",page:"2"})} title={ruleId ? '编辑告警配置':'新增告警配置'} />
                <div className="step-header-wrapper">
                    <div className="step-header flex-row" >
                        <div className={`step-item flex-row flex1${(current === 0) && curStep || ''}`}>
                            <i className="step-product" />
                            <span>1. 告警信息</span>
                        </div>
                        <div
                            className={`step-item flex1 flex-row${(current === 1) && curStep || ''}`}>
                            <i className="step-data" />
                            <span>2. 规则配置</span>
                        </div>
                        <div className={`step-item flex1 flex-row${current === 2 && curStep || ''}`}>
                            <i className="step-way" />
                            <span>3. 通知方式</span>
                        </div>
                    </div>
                </div>
                <div className="add-content-wrapper flex1">
                    <div className="add-content">
                        <div className="steps-content">
                            {[
                                <BaseInfoForm onRef={ref => this.baseInfoForm = ref} saveBaseInfo={this.saveStepInfo} baseFormData={baseFormData}/>,
                                <RuleForm onRef={ref => this.ruleForm = ref} saveRuleInfo={this.saveStepInfo} ruleFormData={ruleFormData}/>,
                                <PublictypeForm  onRef={ref => this.publicTypeForm = ref} savPublicWay={this.saveStepInfo} piublicFormData={piublicFormData}/>
                            ][current]}
                        </div>
                        <div className="steps-action">
                            {[
                                <DoubleBtns preBtn={false} nextHandle={ (e)=>this.ruleFormSubmit('baseInfoForm',e) } />,
                                <DoubleBtns preHandle={()=>this.goToStep(0)} nextHandle={ (e)=>this.ruleFormSubmit('ruleForm',e) } />,
                                <DoubleBtns nextText={'提交'} preHandle={()=>this.goToStep(1)} nextHandle={ (e)=>this.ruleFormSubmit('publicTypeForm',e) } />
                            ][current]}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WarningConfig;


