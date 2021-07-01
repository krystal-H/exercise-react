import React, { Component } from 'react';
import {Modal, Form,Button,Input,Select,Icon,Divider,InputNumber,Checkbox} from 'antd';
import { Notification} from '../../../../../../../components/Notification';
import {cloneDeep} from 'lodash';
import MyIcon from '../../../../../../../components/my-icon/MyIcon';
import DescWrapper from '../../../../../../../components/desc-wrapper/DescWrapper';
import NoSourceWarn from '../../../../../../../components/no-source-warn/NoSourceWarn';


import './SceneModals.scss'
import { setFuncDataType, DateTool, limitToInt } from '../../../../../../../util/util';
import { SceneConditionRuleParams } from '../../../../../../../configs/text-map';

const {Option} = Select;

const formItemLayout = {
    labelCol: {
        span: 4
    },
    wrapperCol: {
        span: 20
    },
};

export const BatchAddForm = Form.create({
    name:'form_in_modal_batch_add'
})(
    class BatchAdd extends Component {
        state = {
            selectedActionPropertyNames :[],
            selectedConditionPropertyNames : []
        }
        onOk = () => {
            let {batchAddOkHandle} = this.props,
                {selectedActionPropertyNames,selectedConditionPropertyNames} = this.state;
            
            if (selectedActionPropertyNames.length + selectedConditionPropertyNames.length < 1) {
                Notification({
                    type:'warn',
                    message:'缺少参数',
                    description:'请至少选择一个条件或者动作'
                })
                return ;
            }

            batchAddOkHandle({
                selectedActionPropertyNames,
                selectedConditionPropertyNames
            })
        }
        toggleItem = (propertyName,type) => {
            let target = (type === 'condition') ? 'selectedConditionPropertyNames' : 'selectedActionPropertyNames',
                _temp = cloneDeep(this.state[target]);

            if (_temp.includes(propertyName)) {
                _temp = _temp.filter(item => item !== propertyName);
            } else {
                _temp.push(propertyName)
            }

            this.setState({
                [target]: _temp
            })
        }
        render() {

            let {visible,onCancel,actionsProtocolsList = [],conditionsProtocolsList = [],batchAddLoading} = this.props,
            {selectedActionPropertyNames,selectedConditionPropertyNames} = this.state;

            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={1000}
                    title={'批量添加场景动作'}
                    centered={true}
                    closable={false}
                    onCancel={onCancel}
                    confirmLoading={batchAddLoading}
                    onOk={this.onOk}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <DescWrapper desc={["条件、动作下的选项分别为产品运行和控制协议，批量添即将协议和场景功能一对一方式导出，可批量选择多个协议同时导出多个场景功能；"]}></DescWrapper>
                    <div className="height-premit">
                        <section className="modal-content-section-wrapper">
                            <div className="title-in-modal-content">
                                条件：
                            </div>
                            <div className="content-in-modal justify-list-wrapper">
                                {
                                    conditionsProtocolsList.map((item,index) => {
                                        let btnClassName = selectedConditionPropertyNames.includes(item) ? 'primary' : 'default';
                                        
                                        return <span className="justify-list-item" key={index}>
                                            <Button type={btnClassName}
                                                    onClick={() => this.toggleItem(item,'condition')}
                                                    >{item}</Button>
                                        </span>
                                    })
                                }
                            </div>
                        </section>
                        <section className="modal-content-section-wrapper">
                        <div className="title-in-modal-content">
                            动作：
                        </div>
                        <div className="content-in-modal justify-list-wrapper">
                            {
                                actionsProtocolsList.map((item,index) => {
                                    let btnClassName = selectedActionPropertyNames.includes(item) ? 'primary' : 'default';
                                    
                                    return <span className="justify-list-item" key={index}>
                                        <Button type={btnClassName}
                                                onClick={() => this.toggleItem(item,'action')}
                                                >{item}</Button>
                                    </span>
                                })
                            }
                        </div>
                    </section>
                    </div>
                </Modal> 
            )
        }
    }
)

export const CustomForm = Form.create({
    name:'form_in_modal_custom_add'
})(
    class Custom extends Component {
        constructor (props) {
            super(props)

            let paramList = [],
                {editScene} = this.props;
        
            if (editScene && editScene.paramList) {
                paramList = editScene.paramList
            }

            this.state = {
                paramList,
                curEditParamIndex: -1,
                tempParams:null,
                isNewAdd:false
            }

            this.isShowParamArea = false;
        }
        handleSubmit = e => {
            e.preventDefault();

            if (this.isEditIng()){
                return ;
            }

            this.props.form.validateFields((err, values) => {
                if(!err){

                    let {customOkHandle,getConditionProtocolByPropertyName} = this.props,
                    {paramList} = this.state,
                    {name,cmdType,cmdName} = values,
                    data = null;

                    if ( paramList.length < 1) {

                        if (this.isShowParamArea) {
                            Notification({
                                type:'warn',
                                message: '缺少参数',
                                description: '请至少添加一组参数'
                            })
                            return ;
                        }

                        if (cmdType == 1) {
                            let {propertyValueDesc,propertyValueType} = getConditionProtocolByPropertyName(cmdName)[0];

                            paramList.push({
                                paramPropertyValueDesc:propertyValueDesc,
                                paramPropertyValueType:propertyValueType
                            })
                        }
                    }

                    if(cmdType == 1){
                        let {property,gap,mulriple,propertyName} = getConditionProtocolByPropertyName(cmdName)[0];
                            
                        data = {
                            name,
                            cmdField:property,
                            cmdName:propertyName,
                            deviceCmdParam:{
                                cmdParamType:'1',
                                costumParamList:cloneDeep(paramList)
                            }
                        }

                        if(!isNaN('' + gap)){
                            data.step = gap;
                        }
    
                        if (!isNaN('' + mulriple)) {
                            data.mutiple = mulriple
                        }
                        
                    } else {
                        data = {
                            name
                        }
                    }

                    customOkHandle(data,cmdType)
                }
            });
        }
        getConditionDesc = propertyName => {
            let _temp = this.props.getConditionProtocolByPropertyName(propertyName),
                {propertyValueDesc = '~',gap} = _temp[0] || {};

            return (
                <div className="ant-row ant-form-item">
                    <DescWrapper desc={[<span>条件关联协议 "<a>{propertyName}</a>" ，协议范围: <a>{propertyValueDesc}</a>，精度为: <a>{gap}</a>。</span>]}></DescWrapper>
                </div>
            )
        }
        getIsShowParamArea = (propertyName,cmdType )=> {
            if (!propertyName) {
                return false;
            }
            let _temp = this.props.getConditionProtocolByPropertyName(propertyName);

            if(cmdType == 2) {
                return false;
            }

            if(_temp[0]) {
                return setFuncDataType(_temp[0]) === '数值型' ? true : false;
            }

            return false;
        }
        
        getTableDom = (propertyName) => {
            let {paramList,curEditParamIndex} = this.state,
            content = null,
            conditionProtocol = this.props.getConditionProtocolByPropertyName(propertyName),
            {propertyValueDesc = '~'} = conditionProtocol[0],
            [min,max] = propertyValueDesc.split('~');
            min = +min;
            max = +max;

            content = paramList.map((item,index) => {
                let {paramName,paramRule,paramMinValue,paramMaxValue} = item;

                if (index === curEditParamIndex) {
                    return (
                        <tr key={index}>
                            <td>
                                <Input style={{width:"260px"}}
                                       maxLength={14}
                                       value={paramName} 
                                       onChange={e => this.paramChangeHandle('paramName',e.target.value)} 
                                       placeholder="请输入功能名称"></Input>
                            </td>
                            <td>
                                <Select style={{width:"80px"}}
                                        value={paramRule}
                                        onChange={value => this.paramChangeHandle('paramRule',value)} >
                                            <Option value={1}>大于</Option>
                                            <Option value={2}>小于</Option>
                                            <Option value={3}>范围</Option>
                                </Select>
                            </td>
                            <td>
                                {
                                    (paramRule == 1) ? <InputNumber min={min}
                                                                    max={max}
                                                                    formatter={limitToInt}
                                                                    parser={limitToInt}
                                                                    onChange={value => this.paramChangeHandle('paramMinValue',value)} 
                                                                    value={paramMinValue} style={{width:"160px"}}></InputNumber> :
                                    (paramRule == 2) ? <InputNumber max={max}
                                                                    min={min}
                                                                    formatter={limitToInt}
                                                                    parser={limitToInt}
                                                                    onChange={value => this.paramChangeHandle('paramMaxValue',value)} 
                                                                    value={paramMaxValue} style={{width:"160px"}}></InputNumber> :
                                    <React.Fragment>
                                        <InputNumber min={min}
                                                     max={max - 1}
                                                     formatter={limitToInt}
                                                     parser={limitToInt}
                                                     onChange={value => this.paramChangeHandle('paramMinValue',value)} 
                                                     value={paramMinValue} style={{width:"70px"}}></InputNumber>  
                                                        <span> ~ </span> 
                                        <InputNumber  max={max}
                                                      min={min + 1}
                                                      formatter={limitToInt}
                                                      parser={limitToInt}
                                                      onChange={value => this.paramChangeHandle('paramMaxValue',value)} 
                                                      value={paramMaxValue} style={{width:"70px"}}></InputNumber>
                                    </React.Fragment> 
                                }
                            </td>
                            <td><a onClick={this.saveParam}>保存</a> <Divider type="vertical"></Divider> 
                                <a onClick={this.cancelParamEdit}>取消</a>
                            </td>
                        </tr>
                    )
                }

                return (
                    <tr key={index}>
                        <td>{paramName}</td>
                        <td>{SceneConditionRuleParams[paramRule]}</td>
                        {
                            (paramRule == 1) ? <td>触发值： &gt; {paramMinValue}</td> :
                            (paramRule == 2) ? <td>触发值： &lt; {paramMaxValue}</td> :
                                               <td>触发值：{paramMinValue} ~ {paramMaxValue}</td>
                        }                        
                        <td>
                            <a onClick={() => this.editConditionParams(index)}>编辑</a> 
                            <Divider type="vertical"></Divider> 
                            <a onClick={() => this.deleteConditionParams(index)}>删除</a>
                        </td>
                    </tr>
                )
            })

            return (content.length > 0) ? (
                    <table className="my-table">
                        <thead>
                            <tr>
                                <th>参数名称</th>
                                <th>规则</th>
                                <th>触发值</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {content}
                        </tbody>
                    </table>) :
                    null
        }
        conditionAddParam = () => {

            if (this.isEditIng()) {
                return;
            }

            let {paramList} = this.state;



            let _paramList = cloneDeep(paramList),
                _default = {
                    paramName:'',
                    paramRule:1,
                    paramMinValue:'',
                    paramMaxValue:''
                };
            
            _paramList.push(_default);
            
            this.setState({
                paramList:_paramList,
                curEditParamIndex: _paramList.length - 1,
                isNewAdd:true,
                tempParams:cloneDeep(_default)
            })
        }
        paramChangeHandle = (whice,value) => {
            let {curEditParamIndex,paramList} = this.state,
                _paramList = cloneDeep(paramList),
                {paramMaxValue,paramMinValue,paramRule} = _paramList[curEditParamIndex];

            if (paramRule === 3) {
                if (whice === 'paramMinValue') {
                    if ((paramMaxValue !== '') && (+paramMaxValue <= value)) {
                        value = +paramMaxValue - 1
                    }
                }
                if (whice === 'paramMaxValue') {
                    if ((paramMinValue !== '') && (+paramMinValue >= value)) {
                        value = +paramMinValue + 1
                    }
                }
            }
            
            _paramList[curEditParamIndex][whice] = (value === null) ? '' : value;

            if (whice === 'paramRule') {
                _paramList[curEditParamIndex]['paramMinValue'] = '';
                _paramList[curEditParamIndex]['paramMaxValue'] = '';
            }

            this.setState({
                paramList:_paramList
            })
        }
        editConditionParams = (index) => {

            if (this.isEditIng()) {
                return;
            }

            let {paramList} = this.state;

            this.setState({
                curEditParamIndex:index,
                tempParams:cloneDeep(paramList[index])
            })
        }
        deleteConditionParams = (index) => {
            if (this.isEditIng()) {
                return;
            }

            let {paramList} = this.state,
                _paramList = cloneDeep(paramList);
            
            _paramList.splice(index,1);

            this.setState({
                paramList:_paramList
            })
        }
        isEditIng = () => {
            let {curEditParamIndex} = this.state;

            if (curEditParamIndex !== -1) {
                Notification({
                    type:'warn',
                    message:'操作不规范',
                    description:'有正在编辑的参数，请先保存'
                })
                return true;
            }
            return false
        }
        saveParam = () => {
            let {curEditParamIndex,paramList} = this.state,
                {paramName,paramRule,paramMinValue,paramMaxValue} = paramList[curEditParamIndex];

            if ([paramName,paramRule,paramMinValue].includes('') && [paramName,paramRule,paramMaxValue].includes('')) {
                Notification({
                    type:'warn',
                    message:'参数缺失',
                    description:'所有的参数都必须填写'
                })
                return;
            }

            this.setState({
                tempParams:null,
                curEditParamIndex:-1,
                isNewAdd:false
            })
        }
        cancelParamEdit = () => {
            let {paramList,curEditParamIndex,tempParams,isNewAdd} = this.state,
                _paramList = cloneDeep(paramList);

            
            if (!isNewAdd) {
                _paramList[curEditParamIndex] = tempParams;
            } else {
                _paramList.splice(curEditParamIndex,1);
            }

            this.setState({
                paramList:_paramList,
                curEditParamIndex:-1,
                tempParams:null,
                isNewAdd:false
            })
        }
        changeCmdName = value => {
            this.setState({
                paramList:[],
                curEditParamIndex:-1
            })
        }
        changeCmdType = value => {
            let {resetSelectedActions} = this.props;
            this.setState({
                paramList:[],
                curEditParamIndex:-1
            })
            resetSelectedActions()
        }
        render() {
            let {visible,onCancel,form,customLoading,editScene,conditionsProtocolsList=[],selectedActions=[],openModal,operateSelectedActions,getActionDetailByProperty} = this.props,
                {name,cmdType,cmdList} = editScene || {},
                { getFieldDecorator,getFieldValue } = form,
                _cmdType =  getFieldValue('cmdType'),
                _conditionProtocolName = getFieldValue('cmdName');

                if (!this.firstRendered) {
                    _cmdType = cmdType || 1;
                    _conditionProtocolName = cmdList ? (cmdList && cmdList[0] && cmdList[0].cmdName ): ''

                    this.firstRendered = true;
                }

                this.isShowParamArea = this.getIsShowParamArea(_conditionProtocolName,_cmdType);

            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={800}
                    title={'自定义配置'}
                    centered={true}
                    closable={false}
                    footer={null}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                     <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <Form.Item label="场景名称">
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入场景名称' },
                                        { max: 20, message: '最大输入长度为20' }
                                        ],
                                initialValue:name || ''
                            })(<Input placeholder="请输入场景名称" />)
                            }
                        </Form.Item>
                        <Form.Item label="场景类型">
                            {getFieldDecorator('cmdType', {
                                rules: [{ required: true}],
                                initialValue: _cmdType
                            })(<Select style={{width:"300px"}} onChange={this.changeCmdType} disabled={!!editScene}>
                                    <Option value={1}>条件</Option>
                                    <Option value={2}>动作</Option>
                                </Select>)}
                        </Form.Item>
                        {/* 条件部分 */}
                        {
                            _cmdType != 2 && (
                            <React.Fragment>
                                <Form.Item label="关联协议">
                                    {getFieldDecorator('cmdName', {
                                        rules: [{ required: true,message: '请选个一个协议'}],
                                        initialValue: _conditionProtocolName
                                    })(<Select style={{width:"300px"}} onChange={this.changeCmdName}>
                                            <Option value="" key={-1}>请选择</Option>
                                            {
                                                conditionsProtocolsList.map((item,index) => {
                                                    return <Option key={index} value={item}>{item}</Option>
                                                })
                                            }
                                        </Select>)}
                                </Form.Item>
                                {
                                    _conditionProtocolName && (
                                        this.isShowParamArea ? 
                                        this.getConditionDesc(_conditionProtocolName) :
                                        <DescWrapper desc={['非数值型协议不支持参数编辑']}></DescWrapper>
                                    )
                                }
                                {   
                                    // 非数值型的协议不编辑参数
                                    this.isShowParamArea &&
                                    <React.Fragment>
                                        <div className="ant-row ant-form-item">
                                            <div className="ant-col ant-col-4 ant-form-item-label">
                                                <label className="ant-form-item-required">功能参数映射</label>
                                            </div>
                                            <div style={{textAlign:'right',lineHeight:'40px'}} className="ant-col ant-col-20">
                                                <a onClick={this.conditionAddParam}><Icon type="plus"/> 添加</a>
                                            </div>
                                        </div>
                                        <Form.Item wrapperCol={{ span: 24 }}>
                                            {
                                                this.getTableDom(_conditionProtocolName)
                                            }
                                        </Form.Item>
                                    </React.Fragment>
                                }
                            </React.Fragment>)
                        }
                        {/* 动作编辑部分 */}
                        {
                            _cmdType == 2 && (
                                <Form.Item wrapperCol={{ span: 24 }}>
                                    <div className="ant-col ant-col-4 ant-form-item-label">
                                        <label className="ant-form-item-required">关联协议</label>
                                    </div>
                                    <div className="ant-col ant-col-20 link-protocol-wrapper">                     
                                        <div style={{padding:0}} className="justify-list-wrapper">
                                            {
                                                selectedActions.map((item,index) => {                                                     
                                                    return (
                                                        <span key={index} className="justify-list-item link-protocol-item">
                                                            {item}
                                                            <span onClick={() => operateSelectedActions([item],'delete')}>X</span>
                                                        </span>
                                                    )
                                                })
                                            }
                                            <a style={{padding:"0 24px 12px 0"}} 
                                            className="justify-list-item"
                                            onClick={() => openModal('linkProtocolsVisible')}
                                            ><Icon type="plus"/> 添加</a>
                                        </div>
                                    </div>
                                </Form.Item>
                            )
                        }
                        {/* 操作按钮 */}
                        <Form.Item wrapperCol={{ span: 24 }}>
                            <div className="form-in-modal-ok-cancel-btn">
                                <Button loading={customLoading} type="primary" htmlType="submit">确定</Button>
                                <Button type="default" onClick={onCancel}>取消</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal> 
            )
        }
    }
)

const statusText = ['审核中','全部验证通过','验证未通过','部分验证通过']

export class ApproverModal extends Component {

    render() {

        let {visible,onCancel,auditRecordList=[]} = this.props;
        
        return (
            <Modal
                visible={visible}
                className="self-modal"
                width={1000}
                title={'验证审批记录'}
                centered={true}
                closable={true}
                footer={null}
                onCancel={onCancel}
                destroyOnClose={true}
                maskClosable={false}
            >
                <div className="height-premit">
                    {
                        (auditRecordList.length > 0) ? 
                        auditRecordList.map((item,index) => {
                            let {status,remark,createTime} = item;
                            return (
                                <section key={index} className="approver-item">
                                    <div style={{marginTop:0}} className="title-in-modal-content">
                                        <span className={`color${status}`}><MyIcon type="icon-arrrow-right"></MyIcon> {statusText[+status]}</span>
                                        <span className="float-right">{DateTool.utcToDev(createTime)}</span>
                                    </div>
                                    <div className="approver-content">
                                        <div className="content-replys">
                                            <p className="bold-text">验证回复：</p>
                                            <p>{remark}</p>
                                        </div>
                                    </div>
                                </section>
                            )
                        }) :
                        <NoSourceWarn tipText="没有审批记录"></NoSourceWarn>
                    }
                </div>
            </Modal> 
        )
    }
}


export const LinkProtocolsForm = Form.create({
    name:'link_protocols_add'
})(
    class LinkProtocols extends Component {
        state = {
            newSelectedActions:[]
        }
        onOk = () => {
            let {newSelectedActions} = this.state,
                {LinkProtocolsOkhandle} = this.props;

            if(newSelectedActions.length < 1) {
                Notification({
                    type:'warn',
                    message:'缺少参数',
                    description:'请先选择控制数据'
                })
                return;
            }

            LinkProtocolsOkhandle(newSelectedActions);
        }
        checkboxChangeHandle = checkedValue => {
            this.setState({
                newSelectedActions: checkedValue
            })
        }
        render() {

            let {visible,onCancel,actionsProtocolsList=[],selectedActions=[]} = this.props;
            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={1000}
                    title={'添加协议'}
                    centered={true}
                    closable={false}
                    onCancel={onCancel}
                    onOk={this.onOk}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <DescWrapper desc={["动作类型的添加可以选择单个或者多个协议组合成一个功能"]}></DescWrapper>
                    <div className="height-premit">
                        <section className="modal-content-section-wrapper">
                            <div className="title-in-modal-content">
                                控制数据
                            </div>
                            <Checkbox.Group style={{ width: '100%'}}
                                            defaultValue={selectedActions}
                                            onChange={this.checkboxChangeHandle}
                                            className="justify-list-wrapper">
                                {
                                    actionsProtocolsList.map((item,index) => {
                                        return (
                                            <span key={index} className="justify-list-item single-text limit-width">
                                                <Checkbox value={item}>{item}</Checkbox>
                                            </span>
                                        )
                                    })
                                }
                            </Checkbox.Group>
                        </section>
                    </div>
                </Modal> 
            )
        }
    }
)

