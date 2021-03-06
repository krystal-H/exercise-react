import React  from 'react';
import { Button, Modal, Form, Input, Icon, Select,Tabs,Checkbox,Tooltip,Radio} from 'antd';
import { Notification} from '../../../../../../../components/Notification';
import UploadFile from '../../../../../../../components/upFile/UploadFile';
import {Paths,get,axios} from '../../../../../../../api';
import {size} from 'lodash';

import NoSourceWarn from '../../../../../../../components/no-source-warn/NoSourceWarn';
import DescWrapper from '../../../../../../../components/desc-wrapper/DescWrapper';

import IconImg from '../../../../../../../assets/images/product/app-icon.png';
import DefaultIconImg from '../../../../../../../assets/images/product/app-default-icon.png';
import { createArrayByLength ,DateTool, setFuncDataType } from '../../../../../../../util/util';

const { Option } = Select;
const {TabPane}  = Tabs;

const LIST_LENGTH = 10;

export const H5AddForm = Form.create({ 
        name: 'form_in_modal-h5-add',
        onFieldsChange: (props, changedFields, allFields) => {
            let {projectType} = changedFields;
            if(projectType) {
                props.changeProjectTypeInAddForm(projectType.value)
            }
        }
    })(
    class extends React.Component {
        state = {
            templateId:null
        }
        handleSubmit = e => {
            let {form,h5AddOkHandle,sdkEdit,templateDetail} = this.props;
            
            e.preventDefault();
            form.validateFields((err, values) => {
                if (!err) {
                    let {projectType} = values,
                        _data = {...values};
                    if (projectType == '2') {
                        if (templateDetail && templateDetail.templateId) {
                            _data.templateId = templateDetail.templateId
                        }
                        h5AddOkHandle(_data,projectType)
                    } else {

                        if(this.zixInput && this.zixInput.state && this.zixInput.state.fileList && this.zixInput.state.fileList[0]) {
                            this.zixInput.upToTencentCloud(() => {
                                _data.filePath = this.zixInput.state.fileList[0].filesrc;
                                if (!_data.filePath) {
                                    Notification({
                                        type:'error',
                                        message: '??????????????????',
                                        description: '??????????????????????????????'
                                    })
                                    return false;
                                }

                                if (sdkEdit) {
                                    _data.projectId = sdkEdit.projectId;
                                }

                                h5AddOkHandle(_data,projectType)
                            })
                        } else {
                            Notification({
                                type:'error',
                                message: '????????????',
                                description: '?????????????????????????????????'
                            })
                            return false;
                        }
                    }
                }
            });
        }
        render() {
            let { visible, form, onCancel,h5AddLoading, projectType, sdkEdit,openTemplateMarket,templateDetail} = this.props,
                  { getFieldDecorator } = form,
                  templateImg = null;

            if (templateDetail) {
                templateImg = templateDetail['page1'];
            }
            
            let title = sdkEdit ? '??????SDK????????????' :'??????H5??????';

            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={800}
                    title={title}
                    centered={true}
                    closable={false}
                    footer={null}
                    onCancel={onCancel}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <Form {...{ labelCol: { span: 3 }, wrapperCol: { span: 21 } }}
                          labelAlign="left" 
                          onSubmit={this.handleSubmit}>
                            <DescWrapper style={{ marginBottom: 8 }} desc={['???????????????????????????????????????H5??????']}></DescWrapper>
                            <Form.Item label="????????????">
                                {getFieldDecorator('projectName', {
                                    rules: [{ required: true, message: '?????????????????????' },{ max: 20, message: '?????????????????????20' }],
                                    initialValue: sdkEdit ? sdkEdit.projectName : ''
                                })(<Input placeholder="?????????20?????????" />)
                                }
                            </Form.Item>
                            <Form.Item label="????????????">
                                {getFieldDecorator('projectType', {
                                    rules: [{ required: true, message: '?????????????????????' }],
                                    initialValue: projectType
                                })(<Radio.Group disabled={!!sdkEdit}>
                                    <Radio value="2">????????????</Radio>
                                    <Radio value="1">SDK??????</Radio>
                                  </Radio.Group>)}
                                {/* })(<Select style={{ width: 120}} disabled={!!sdkEdit}>
                                        <Option value="2">????????????</Option>
                                        <Option value="1">SDK??????</Option>
                                    </Select>)} */}
                            </Form.Item>
                            <div className="ant-row ant-form-item">
                                <div className="ant-col ant-col-3 ant-form-item-label">
                                </div>
                                <div className="ant-col ant-col-21">
                                    {
                                        (projectType == '1') ? 
                                        <div>
                                            <UploadFile maxsize={5 * 1000}
                                                        isNotImg={true}
                                                        onRef={ref => this.zixInput= ref} 
                                                        format="zix" ></UploadFile>
                                            <div style={{marginTop:'12px',color:'rgba(140,140,140,1)'}}><span>??????zix??????????????????????????????5MB</span></div>
                                            {
                                                sdkEdit && 
                                                <div style={{marginTop:'14px'}}><span>{`?????????????????????${sdkEdit.filePath || ''}`}</span></div>
                                            }
                                        </div> 
                                        : <div className="h5-tool-wrapper">
                                            <div className="blank-wrapper">
                                                {
                                                    templateImg ? 
                                                    <img src={templateImg} alt="????????????"/>
                                                    : <span>????????????</span>
                                                }
                                            </div>
                                            <p onClick={openTemplateMarket}><a className="choose-template">??????H5??????</a></p>
                                        </div>
                                    }
                                </div>
                            </div>
                            <Form.Item wrapperCol={{ span: 24 }}>
                                <div className="form-in-modal-ok-cancel-btn">
                                    <Button type="primary" 
                                            htmlType="submit" 
                                            loading={h5AddLoading}>{sdkEdit ? '??????' : '??????'}</Button>
                                    <Button type="default" 
                                            onClick={onCancel}>??????</Button>
                                </div>
                            </Form.Item>
                    </Form>
                </Modal>
            );
        }
    }
);

export class H5PagePublish extends React.Component {
    state = {
        selectedAppId:null, 
        status:'1', // ???????????? 1????????????2?????????
        FormalPubHistory:[],
        GrayPubHistory:[]
    }
    getPubHistory = (appId,_name) => {
        let {productId,publishType} = this.props,
            _path = publishType == 3 ? Paths.getGreyPubHistory : Paths.getFormalPubHistory;

        get(_path,{
            appId,
            productId
        }).then(res => {
            this.setState({
                [_name]: res.data
            })
        })
    }
    changeStatus = (value) => {
        this.setState({
            status:value
        })
    }
    selectApp = (type,appId) => {
        let {selectedAppId} = this.state,
            {publishType}  = this.props,
            _name = publishType == 3 ? "GrayPubHistory" : "FormalPubHistory",
            _state = {};
        
        _state.selectedAppId = selectedAppId === appId ? null : appId;

        _state[_name] = []

        if (_state.selectedAppId !== null) {
            this.getPubHistory(appId,_name)
        } 
        
        this.setState(_state)
    }
    getAppListDOM = (type) => {
        let {selectedAppId} = this.state,
            {appsByProductId} = this.props,
            _apps = appsByProductId.filter(item => type == '0' ? item.isOfficialApp : !item.isOfficialApp),
            className = 'app-icon';

        
        return (
            _apps.length > 0 ?
            _apps.map((item) => {
                let {appIcon,appName,appId} = item;

                className = 'app-icon'; // ??????class??????
                
                if (selectedAppId == appId) {
                    className += ' active';
                }
                
                return (
                    <div className="app-item" key={type + '-' + appId} onClick={() => this.selectApp(type,appId)}>
                        <div className={className}>
                            <img src={appIcon || DefaultIconImg} alt="????????????"/>
                        </div>
                        <span className="gray-text app-name">{appName}</span>
                    </div>
                )
            })
            :
            <div style={{textAlign:'center'}} className="explain-text">{`???????????????${type == '0' ? '??????' : "??????"}??????`}</div>  
        )
    }
    okHandle = () => {
        let {publishOkHandle} = this.props,
            {selectedAppId,status} = this.state;


        if (!selectedAppId) {
            Notification({
                type:'warn',
                message: '????????????',
                description: '???????????????APP???????????????'
            })

            return false;
        }

        publishOkHandle({
            newAppIds : '' + selectedAppId,
            status
        })
    }
    render () {
        let {visible,onCancel,projectName,publishLoading,publishType} = this.props,
            {status,FormalPubHistory,GrayPubHistory} = this.state;

        return (
            <Modal
                visible={visible}
                className="self-modal"
                width={700}
                title="??????H5??????"
                okText="??????"
                confirmLoading={publishLoading}
                onOk={this.okHandle}
                cancelText="??????"
                onCancel={onCancel}
                centered={true}
                closable={false}
                maskClosable={false}
                >
                    <div>
                        <p className="desc-content">????????????????????????<span>{projectName}</span></p>
                        <p style={{color:'rgba(0,0,0,0.85)'}}>??????????????????</p>
                        <Tabs defaultActiveKey="0">
                            <TabPane tab="C-Life????????????" key='0'>
                                <div className="app-items-wrapper">
                                    {
                                        this.getAppListDOM('0')
                                    }
                                </div>
                            </TabPane>
                            <TabPane tab="????????????" key='1'>
                                <div className="app-items-wrapper">
                                    {
                                        this.getAppListDOM('1')
                                    }
                                </div>
                            </TabPane>
                        </Tabs>
                        {
                            (publishType == 3 ? (GrayPubHistory.length > 0) : (FormalPubHistory.length > 0)) &&
                            <div className="app-has-pulish">
                                ?????????????????????H5????????????APP??????????????????????????????H5??????
                            </div>
                        }
                        <div className="select-update-type">
                                <div>
                                    <span>????????????:</span>
                                    <Select value={status} 
                                            onChange={value => this.changeStatus(value)}
                                            style={{ width: 100,marginLeft:8}}>
                                        <Option value="1">????????????</Option>
                                        <Option value="2">????????????</Option>
                                    </Select>
                                </div>
                                <p className="update-desc gray-text">{status == '1' ? 'APP????????????????????????????????????????????????????????????' : 'APP?????????????????????????????????????????????????????????????????????'}</p>
                        </div>
                    </div>
            </Modal>
        )
    }
}

export class H5TemplateManage extends React.Component {
    constructor (props) {
        super(props);
        let {h5TemplatesLists,firstTemplateDetail,firstTemplateAnalysis} = this.props;
        this.templateLength = h5TemplatesLists.length;
        this.pages = [1,2,3,4,5];
        this.analysisText = ['???????????????????????????','???????????????????????????','???????????????????????????'];
        this.state = {
            curTempLateIndex:0,
            curListIndex:0,
            templateDetail:firstTemplateDetail,
            templateAnalysis:firstTemplateAnalysis,
            curPageIndex:0,
            images:this.parseImages(firstTemplateDetail),
            bigImageIndex:0,
            isKeepEvent:true
        }
    }
    parseImages (templateDetail) {
        let temp = [];
        if(templateDetail){
            this.pages.forEach((item,index) => {
                let img = templateDetail['page' + item];
                if(img) {
                    temp.push(img)
                }
            })
        }
        return temp;
    }
    selectTemplate = () => {
        let {onOk,h5TemplatesLists} = this.props,
            {curTempLateIndex,isKeepEvent} = this.state;

            onOk(h5TemplatesLists[curTempLateIndex],isKeepEvent)
    }
    changeListIndex = (number) => {
        let {curListIndex} = this.state;
        this.setState({
            curListIndex: curListIndex + number
        })
    }
    changeTemplate = (realIndex) => { // ??????????????????????????????????????????

        let {getTemplateDetailAndAnalysis,h5TemplatesLists} = this.props,
            {curTempLateIndex} = this.state,
            {templateId} = h5TemplatesLists[realIndex];
        
        if (realIndex === curTempLateIndex) { // ??????????????????????????????
            return false;
        }
        
            getTemplateDetailAndAnalysis(templateId).then(axios.spread((detail,analysis) => {
                this.setState({
                    curTempLateIndex:realIndex,
                    templateDetail:detail.data,
                    templateAnalysis:analysis.data,
                    images:this.parseImages(detail.data),
                    bigImageIndex:0
                })
            }))
    }
    changeImage = (index) => {
        this.setState({
            bigImageIndex:index
        })
    }
    getTemplateChangeDom = () => {
        let {curTempLateIndex,curListIndex} = this.state,
            contentDom = null,
            tempArray = [], // ????????????????????????????????????????????????????????????????????????????????????????????????
            needNext = false,
            nextListLenght = this.templateLength - curListIndex * LIST_LENGTH;

        if (nextListLenght < LIST_LENGTH + 1) {
            tempArray = createArrayByLength(nextListLenght)
        } else {
            tempArray = createArrayByLength(LIST_LENGTH)
            needNext = true;
        }


        contentDom =  tempArray.map((item,index) => {
            let realIndex = curListIndex * LIST_LENGTH + index,
                className = (curTempLateIndex === realIndex) ? 'active' : null;

            return (<span className={className} 
                          key={index} 
                          onClick={() => this.changeTemplate(realIndex)}>
                             {realIndex + 1}
                          </span>)
        })

        if (curListIndex) {
            contentDom.unshift((<span onClick={() => this.changeListIndex(-1)} key={-1}>&lt;</span>))
        }

        if (needNext) {
            contentDom.push((<span onClick={() => this.changeListIndex(1)} key={11}>&gt;</span>))
        }

        return (
            <div className="item-content flex1">
                {
                    contentDom
                }
            </div>
        )
    }
    getAnalysisDom = () => {
        let {templateAnalysis} = this.state,
            {existOnlyProduct,existOnlyTemplate,paramDiffList} = templateAnalysis;

        return (
            <div className="analysis-wrapper">
                {
                    existOnlyProduct.length > 0 && 
                    this.getAnalysisItem(0,existOnlyProduct)
                }
                {
                    existOnlyTemplate.length > 0 &&
                    this.getAnalysisItem(1,existOnlyTemplate)
                }
                {
                    size(paramDiffList) > 0 &&
                    this.getAnalysisItem(2,paramDiffList)
                }
            </div>
        )
    }
    getAnalysisItem = (type,list) => {

        if (type === 2) {
            let keys = Object.keys(list),
                temp = [];

            keys.forEach(item => {
                temp = [...temp,...list[item]]
            })

            list = temp;
        }

        return (
            <div className="analysis-item">
                <p>{this.analysisText[type]}</p>
                <table>
                    <thead>
                        <tr>
                            <th>????????????</th>
                            <th>????????????</th>
                            <th>????????????</th>
                            <th>????????????</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            list.map((item,index) => {
                            
                                let {existType,propertyName,property,propertyValueDesc} = item;

                                if (type === 2) {
                                    propertyName = (existType ? '?????? : ' : '?????? : ') + propertyName
                                }

                                return (
                                    <tr key={index}>
                                        <td>{propertyName}</td>
                                        <td>{property}</td>
                                        <td>{setFuncDataType(item)}</td>
                                        <td>{propertyValueDesc}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        )
    }
    changeIsKeepEvent = (value) => {
        this.setState({
            isKeepEvent:value
        })
    }
    render () {
        let {visible,onCancel,deviceTypeName} = this.props,
            {templateDetail,images,bigImageIndex,isKeepEvent} = this.state,
            bigImage = null,
            {templateName,createTime,remark} = templateDetail || {};

        if (images.length > 0) {
            bigImage = images[bigImageIndex];
        }

        return (
            <Modal
                visible={visible}
                className="self-modal"
                width={900}
                title="??????????????????"
                onCancel={onCancel}
                footer={null}
                centered={true}
                maskClosable={false}
                closable={true}>
                    {
                        this.templateLength ? 
                        <div className="template-wrapper flex-row">
                            <div className="template-img-area flex-column">
                                <div className="big-img gray-border flex1">
                                    <img src={bigImage} alt="????????????"/>
                                </div>
                                <ul className="img-changes-wrapper">
                                    {
                                        images.map((item,index) => {
                                            let className = 'img-change-item ';
                                            if (index === bigImageIndex) {
                                                className += 'active';
                                            }
                                            return (
                                                <li className={className} key={index} onClick={() => this.changeImage(index)}>
                                                    <img src={item} alt="?????????"/>
                                                </li>)
                                        }
                                        )
                                    }
                                </ul>
                            </div>
                            <div className="template-infos flex1 flex-column">
                                <div className="info-item">
                                    <h2>{templateName}</h2>
                                </div>
                                <div className="info-item flex-row">
                                    <span className="item-title">???????????? : </span>
                                    <div className="flex1">{deviceTypeName}</div>
                                </div>
                                <div style={{marginBottom:'8px'}} className="info-item flex-row">
                                    <span className="item-title">???????????? : </span> 
                                    <div className="item-content flex1">
                                        {
                                            this.getTemplateChangeDom()
                                        }
                                    </div>
                                </div>
                                <div className="template-detail flex1">
                                    <Tabs className="self-tab-wrapper" defaultActiveKey="0">
                                        <TabPane tab="????????????" key='0'>
                                            <p>???????????? : <span>{DateTool.utcToDev(createTime)}</span></p>
                                            <p>???????????? : <span>{remark}</span></p>
                                        </TabPane>
                                        <TabPane tab="????????????" key='1'>
                                            {
                                                this.getAnalysisDom()
                                            }
                                        </TabPane>
                                    </Tabs>
                                </div>
                                <div className="template-actions">
                                    <Button 
                                        type="primary"
                                        onClick={this.selectTemplate} 
                                        size="large">?????????????????????</Button>
                                    <Checkbox
                                        checked={isKeepEvent}
                                        onChange={e => this.changeIsKeepEvent(e.target.checked)}
                                        >
                                            <span>?????????????????? </span> 
                                            <Tooltip title="???????????????????????????????????????">
                                                <Icon type="question-circle" theme="twoTone"/>
                                            </Tooltip>
                                    </Checkbox>
                                </div>
                            </div>
                        </div>
                        : <NoSourceWarn tipText="??????????????????????????????"></NoSourceWarn>
                    }

            </Modal>
        )
    }
}