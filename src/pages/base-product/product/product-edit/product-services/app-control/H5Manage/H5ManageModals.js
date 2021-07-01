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
                                        message: '上传文件失败',
                                        description: '未获取到上传文件路径'
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
                                message: '参数缺失',
                                description: '请选择文件后再进行创建'
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
            
            let title = sdkEdit ? '编辑SDK开发页面' :'创建H5页面';

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
                            <DescWrapper style={{ marginBottom: 8 }} desc={['您可以选择任意一种方式创建H5页面']}></DescWrapper>
                            <Form.Item label="产品名称">
                                {getFieldDecorator('projectName', {
                                    rules: [{ required: true, message: '请输入产品名称' },{ max: 20, message: '最大输入长度为20' }],
                                    initialValue: sdkEdit ? sdkEdit.projectName : ''
                                })(<Input placeholder="不超过20个字符" />)
                                }
                            </Form.Item>
                            <Form.Item label="开发模式">
                                {getFieldDecorator('projectType', {
                                    rules: [{ required: true, message: '请选择开发类型' }],
                                    initialValue: projectType
                                })(<Radio.Group disabled={!!sdkEdit}>
                                    <Radio value="2">在线拖拽</Radio>
                                    <Radio value="1">SDK开发</Radio>
                                  </Radio.Group>)}
                                {/* })(<Select style={{ width: 120}} disabled={!!sdkEdit}>
                                        <Option value="2">在线拖拽</Option>
                                        <Option value="1">SDK开发</Option>
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
                                            <div style={{marginTop:'12px',color:'rgba(140,140,140,1)'}}><span>支持zix压缩文件，大小不超过5MB</span></div>
                                            {
                                                sdkEdit && 
                                                <div style={{marginTop:'14px'}}><span>{`原开发包链接：${sdkEdit.filePath || ''}`}</span></div>
                                            }
                                        </div> 
                                        : <div className="h5-tool-wrapper">
                                            <div className="blank-wrapper">
                                                {
                                                    templateImg ? 
                                                    <img src={templateImg} alt="模板图片"/>
                                                    : <span>空白模板</span>
                                                }
                                            </div>
                                            <p onClick={openTemplateMarket}><a className="choose-template">选择H5模板</a></p>
                                        </div>
                                    }
                                </div>
                            </div>
                            <Form.Item wrapperCol={{ span: 24 }}>
                                <div className="form-in-modal-ok-cancel-btn">
                                    <Button type="primary" 
                                            htmlType="submit" 
                                            loading={h5AddLoading}>{sdkEdit ? '保存' : '创建'}</Button>
                                    <Button type="default" 
                                            onClick={onCancel}>取消</Button>
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
        status:'1', // 升级类型 1：普通，2：强制
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

                className = 'app-icon'; // 重置class的值
                
                if (selectedAppId == appId) {
                    className += ' active';
                }
                
                return (
                    <div className="app-item" key={type + '-' + appId} onClick={() => this.selectApp(type,appId)}>
                        <div className={className}>
                            <img src={appIcon || DefaultIconImg} alt="应用图标"/>
                        </div>
                        <span className="gray-text app-name">{appName}</span>
                    </div>
                )
            })
            :
            <div style={{textAlign:'center'}} className="explain-text">{`该产品暂无${type == '0' ? '官方' : "私有"}应用`}</div>  
        )
    }
    okHandle = () => {
        let {publishOkHandle} = this.props,
            {selectedAppId,status} = this.state;


        if (!selectedAppId) {
            Notification({
                type:'warn',
                message: '参数缺失',
                description: '请选中一个APP再进行发布'
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
                title="发布H5页面"
                okText="发布"
                confirmLoading={publishLoading}
                onOk={this.okHandle}
                cancelText="取消"
                onCancel={onCancel}
                centered={true}
                closable={false}
                maskClosable={false}
                >
                    <div>
                        <p className="desc-content">即将发布的页面：<span>{projectName}</span></p>
                        <p style={{color:'rgba(0,0,0,0.85)'}}>发布到应用：</p>
                        <Tabs defaultActiveKey="0">
                            <TabPane tab="C-Life官方应用" key='0'>
                                <div className="app-items-wrapper">
                                    {
                                        this.getAppListDOM('0')
                                    }
                                </div>
                            </TabPane>
                            <TabPane tab="私有应用" key='1'>
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
                                该产品已发布过H5页面到该APP，继续发布将替换掉原H5页面
                            </div>
                        }
                        <div className="select-update-type">
                                <div>
                                    <span>发布模式:</span>
                                    <Select value={status} 
                                            onChange={value => this.changeStatus(value)}
                                            style={{ width: 100,marginLeft:8}}>
                                        <Option value="1">普通升级</Option>
                                        <Option value="2">强制升级</Option>
                                    </Select>
                                </div>
                                <p className="update-desc gray-text">{status == '1' ? 'APP将显示升级提醒，用户可以选择升级或不升级' : 'APP将显示升级提醒，用户必须确认升级才可以继续使用'}</p>
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
        this.analysisText = ['仅存在产品中的协议','仅存在模板中的协议','参数存在差异的协议'];
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
    changeTemplate = (realIndex) => { // 切换模板时，重新获取模板详情

        let {getTemplateDetailAndAnalysis,h5TemplatesLists} = this.props,
            {curTempLateIndex} = this.state,
            {templateId} = h5TemplatesLists[realIndex];
        
        if (realIndex === curTempLateIndex) { // 点击当前，不触发请求
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
            tempArray = [], // 此数组仅用于遍历，无实际意义，它的长度应为当前展示的模板样式个数
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
                            <th>协议名称</th>
                            <th>协议标识</th>
                            <th>协议类型</th>
                            <th>协议参数</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            list.map((item,index) => {
                            
                                let {existType,propertyName,property,propertyValueDesc} = item;

                                if (type === 2) {
                                    propertyName = (existType ? '模板 : ' : '产品 : ') + propertyName
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
                title="选择页面模板"
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
                                    <img src={bigImage} alt="模板图片"/>
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
                                                    <img src={item} alt="小图标"/>
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
                                    <span className="item-title">模板类型 : </span>
                                    <div className="flex1">{deviceTypeName}</div>
                                </div>
                                <div style={{marginBottom:'8px'}} className="info-item flex-row">
                                    <span className="item-title">模板样式 : </span> 
                                    <div className="item-content flex1">
                                        {
                                            this.getTemplateChangeDom()
                                        }
                                    </div>
                                </div>
                                <div className="template-detail flex1">
                                    <Tabs className="self-tab-wrapper" defaultActiveKey="0">
                                        <TabPane tab="模板信息" key='0'>
                                            <p>发布时间 : <span>{DateTool.utcToDev(createTime)}</span></p>
                                            <p>模板说明 : <span>{remark}</span></p>
                                        </TabPane>
                                        <TabPane tab="模板分析" key='1'>
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
                                        size="large">使用选中的模板</Button>
                                    <Checkbox
                                        checked={isKeepEvent}
                                        onChange={e => this.changeIsKeepEvent(e.target.checked)}
                                        >
                                            <span>保留模板事件 </span> 
                                            <Tooltip title="保留模板所有交互，协议逻辑">
                                                <Icon type="question-circle" theme="twoTone"/>
                                            </Tooltip>
                                    </Checkbox>
                                </div>
                            </div>
                        </div>
                        : <NoSourceWarn tipText="没有配置模板数据哦！"></NoSourceWarn>
                    }

            </Modal>
        )
    }
}