/* eslint-disable eqeqeq */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    getCatalogListAction,
    getProductBaseTypeListAction,
    getAddProductAction
} from '../store/ActionCreator';
import { cloneDeep, isEqual } from 'lodash';
import './productInformation.scss';
import SafetySelectionTips from '../../../../components/SafetySelectionTips/SafetySelectionTips';
import LabelTip from '../../../../components/form-com/LabelTip';

import { Input, Select, Radio, Form, Icon, Checkbox, Row, Col, Button } from 'antd';
import SelectSpan from '../../../../components/form-com/SelectSpan';
import { getUrlParam } from '../../../../util/util';
const { Option } = Select;

const portList = [
    { id: 1, contentText: 1 }, { id: 2, contentText: 2 }, { id: 3, contentText: 3 }, { id: 4, contentText: 4 }, { id: 5, contentText: 5 },
    { id: 6, contentText: 6 }, { id: 7, contentText: 7 }, { id: 8, contentText: 8 }, { id: 9, contentText: 9 }, { id: 10, contentText: 10 }
];

//（直连接入：0-初级鉴权，1-中级鉴权，2-高级鉴权；云接入：0-无认证，1-有认证）
// const authorityTypeList = [ {text:'高级安全认证(推荐)',id:2},{text:'中级安全认证',id:1},{text:'初级安全认证',id:0} ];
const authorityTypeList = [{ text: '初级安全认证', id: 0 }];//20200922，取消高级、中级认证 默认初级（同步4.0的需求）

//提示 1-高级 2-中级 3-做安全认证
const safetySelectionTips_1 = [{ title: '平台生成设备ID/设备密钥' }, { title: '烧录设备ID/设备密钥', explain: '设备注册' }, { title: '使用设备ID/设备密钥正常通讯' }];
const safetySelectionTips_2 = [{ title: '平台导入物理地址', explain: '设备注册' }, { title: '校验设备物理地址' }, { title: '设备存储平台传输的设备ID/设备密钥' }, { title: '使用设备ID/设备密钥正常通讯' }];
const safetySelectionTips_4 = [{ title: '烧录产品秘钥', explain: '设备注册' }, { title: '生成设备ID/设备秘钥' }, { title: '使用设备ID/设备密钥正常通讯' }];
const safetySelectionTips_3 = [{ title: '在平台导入物理地址/SN号/序列号等' }, { title: '生成设备ID/设备密钥', explain: '设备注册' }, { title: '校验设备ID/设备密钥是否合法' }, { title: '使用设备ID/设备密钥正常通讯' }];

const mapStateToProps = state => {
    return {
        optionsList: state.getIn(['product', 'optionsList']).toJS(),
        productBaseTypeList: state.getIn(['product', 'productBaseTypeList']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getCatalogList: () => dispatch(getCatalogListAction()),
        getProductBaseTypeList: () => dispatch(getProductBaseTypeListAction()),
        getAddProduct: (data) => dispatch(getAddProductAction(data)),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
class ProductInformationForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            productName: '',
            thirdCategoryId: '',
            optionsList: {},
            productBaseTypeList: {},
            accessDeviceList: [],//接入方式列表
            accessModeId: 0,//接入ID
            apnTypeList: [],//产品类型列表
            productClassId: 0,//产品类型ID
            protocolFormatList: [],//协议格式
            protocolFormat: 1,//协议格式ID
            distributionNetworkList: [],//配网方式列表-默认列表
            netTypeIdsList: null,//配网方式列表-选择通讯技术过滤的列表 
            netTypeId: '',//配网ID
            technicalSolutionList: [],//普通设备 - 通讯技术列表
            gatewayTchnicalSolutionList: [],//网关设备 - 通讯技术列表
            bindType: '',//通讯技术ID
            associatedGatewayList: [],//关联网关多选列表
            isRelatedGateway: 1,//是否关联网关
            portShow: 0,//端口下拉框 是否控制类（0-否，1-是）
            portNumber: 1,//端口数量
            authorityType: 0,//（直连接入：0-初级鉴权，1-中级鉴权，2-高级鉴权；云接入：0-无认证，1-有认证）
            selectedOptions: [],
        }
        this.changeSelect = this.changeSelect.bind(this);
        this.changeJoinUp = this.changeJoinUp.bind(this);
        this.dataProcessor = this.dataProcessor.bind(this);
        this.createProduct = this.createProduct.bind(this);
        this.changeProName = this.changeProName.bind(this);
    }
    componentDidMount() {
        // 获取产品列表
        this.props.getCatalogList();
        this.props.getProductBaseTypeList();
        this.props.form.setFieldsValue({
            associatedGatewayList: 1,
            authorityType: 0
        });
    }
    // 监听state变化
    componentWillReceiveProps(props) {
        if (!isEqual(props.productBaseTypeList, this.state.productBaseTypeList)) { //前后两者一样就不更新
            let arr = props.productBaseTypeList.data || [];
            let { accessDeviceList, apnTypeList, protocolFormatList, distributionNetworkList, technicalSolutionList } = this.state;
            for (let a = 0; a < arr.length; a++) {
                let item = arr[a];
                if (item.type == 1) {
                    accessDeviceList.push(item);
                } else if (item.type == 2) {
                    apnTypeList.push(item);
                } else if (item.type == 3) {
                    protocolFormatList.push(item);
                } else if (item.type == 4) {
                    distributionNetworkList.push(item);
                } else if (item.type == 5) {
                    technicalSolutionList.push(item);
                }
            }
            this.setState({
                productBaseTypeList: props.productBaseTypeList,
                accessDeviceList, apnTypeList, protocolFormatList, distributionNetworkList, technicalSolutionList
            }, () => {
                this.props.form.setFieldsValue({
                    accessModeId: accessDeviceList[0].baseTypeId,
                    productClassId: apnTypeList[0].baseTypeId
                });
            });
        }
        if (!isEqual(props.optionsList, this.state.optionsList)) {  //前后两者一样就不更新
            this.setState({ optionsList: props.optionsList })
        }
    }
    //改变产品名称回调
    changeProName(e) {
        this.setState({ productName: e.target.value });
    }
    //选择类目
    changeSelect(value, selectedOptions) {
        if (selectedOptions[2] && selectedOptions[2].defaultDeviceSubtype) {
            this.setState({ portShow: selectedOptions[2].defaultDeviceSubtype.controlClass });
        } else {
            this.setState({ portShow: 0 });
        }
        this.setState({ selectedOptions });
    }
    //选择事件
    changeJoinUp(type, value, netTypeIds) {
        // accessModeId:0,//接入ID          type:1
        // productClassId:0,//产品类型ID    type:2
        // protocolFormat:1,//协议格式ID    type:3
        // netTypeId:'',//配网ID            type:4
        // bindType:'',//通讯技术ID         type:5
        //isRelatedGateway 是否关联网关     type:6
        //associatedGatewayList[a].selected关联网关多选   type:7
        //portNumber    端口数量            type:8
        //authorityType 安全认证级别        type:9
        if (type == 1) {
            value = value.target.value;
            this.props.form.resetFields('authorityType');
            this.setState({ accessModeId: value });
            if (value == 0) {
                this.props.form.setFieldsValue({
                    authorityType: 0
                });
            } else {
                this.props.form.setFieldsValue({
                    authorityType: 1
                });
            }
        } else if (type == 2) {
            value = value.target.value;
            this.props.form.resetFields('bindType');
            this.props.form.resetFields('associatedGatewayList');
            if (value == 1) {//网关设备
                let gatewayTchnicalSolutionList = [],
                    associatedGatewayList = [];
                for (let a = 0; a < this.state.technicalSolutionList.length; a++) {
                    let item = this.state.technicalSolutionList[a];
                    if (item.isShow != null) {
                        item.isShow == 0 ? gatewayTchnicalSolutionList.push(item) : associatedGatewayList.push(item);
                    }
                }
                this.setState({ gatewayTchnicalSolutionList, associatedGatewayList });
            }
            this.setState({ productClassId: value });
        } else if (type == 3) {
            this.setState({ protocolFormat: value });
        } else if (type == 4) {
            this.setState({ netTypeId: value });
        } else if (type == 5) {
            //根据选择的通讯技术中的netTypeIds，匹配distributionNetworkList中id为netTypeIdsList中的过滤，再显示出来。
            let list = this.state.distributionNetworkList,
                distributionNetworkList = [],
                netTypeIdsList = netTypeIds.split(',');
            for (let a = 0; a < list.length; a++) {
                let item_a = list[a];
                for (var b = 0; b < netTypeIdsList.length; b++) {
                    let item_b = netTypeIdsList[b];
                    if (item_a.baseTypeId == item_b) {
                        distributionNetworkList.push(item_a);
                    }
                }
            }
            this.setState({ bindType: value, netTypeIdsList: distributionNetworkList });
        } else if (type == 6) {
            this.setState({ isRelatedGateway: value.target.value });
        } else if (type == 7) {
            let associatedGatewayList = this.state.associatedGatewayList;
            associatedGatewayList[value].selected = !associatedGatewayList[value].selected;
            this.setState({ associatedGatewayList });
        } else if (type == 8) {
            this.setState({ portNumber: value });
        } else if (type == 9) {
            this.setState({ authorityType: value });
        }
    }
    // 三级类目---数据处理为满足 antd 得数据结构
    dataProcessor(optionsList) {
        let arr = [];
        if (optionsList.length > 0) {
            for (let a = 0; a < optionsList.length; a++) {
                let obj = cloneDeep({});
                let item_a = optionsList[a];
                obj.value = item_a.categoryId;
                obj.label = item_a.categoryName;
                obj.key = 'one' + a;
                obj.children = [];
                if (item_a.subCategoryList.length > 0) {
                    for (let b = 0; b < item_a.subCategoryList.length; b++) {
                        let item_b = cloneDeep(item_a.subCategoryList[b]);
                        obj.children.push({
                            value: item_b.subCategoryId,
                            label: item_b.subCategoryName,
                            key: 'two' + b
                        });
                        obj.children[b].children = [];
                        if (item_b.deviceTypeList.length > 0) {
                            for (let c = 0; c < item_b.deviceTypeList.length; c++) {
                                let item_c = item_b.deviceTypeList[c];
                                obj.children[b].children = obj.children[b].children ? obj.children[b].children : [];
                                obj.children[b].children.push({
                                    value: item_c.deviceTypeId,
                                    label: item_c.deviceTypeName,
                                    key: 'three' + c,
                                    defaultDeviceSubtype: item_c.defaultDeviceSubtype
                                });
                            }
                        } else {
                            obj.children[b].children.push({ value: '', label: '' });
                        }
                    }
                    arr.push(obj);
                } else {
                    obj.children = [{ value: '', label: '', children: [{ value: '', label: '' }] }];
                    arr.push(obj);
                }
            }
        }
        return arr;
    }
    // 创建产品 保存操作
    createProduct(e) {
        console.log(this.props.form, 'create')
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                let {
                    // version:1.1,
                    accessModeId,
                    productClassId,
                    protocolFormat,
                    productName,
                    thirdCategoryId,
                    bindType,
                    netTypeId,
                    authorityType,
                    associatedGatewayList,
                    portNumber
                } = { ...values };
                thirdCategoryId = thirdCategoryId[2] ? thirdCategoryId[2] : '';
                let data = {
                    version: 1.2,
                    accessModeId,
                    productClassId,
                    protocolFormat,
                    productName,
                    thirdCategoryId,
                    bindType,
                    netTypeId,
                    authorityType,
                    portNumber: portNumber
                };
                if (productClassId == 0) {
                    data.isRelatedGateway = associatedGatewayList;
                } else {
                    let gatewayCommType = '';
                    for (let a = 0; a < associatedGatewayList.length; a++) {
                        gatewayCommType += ',' + associatedGatewayList[a];
                    }
                    data.gatewayCommType = gatewayCommType.slice(1, gatewayCommType.length);
                }

                if (getUrlParam('projectId')) {
                    data.projectId = getUrlParam('projectId')
                }

                this.props.getAddProduct(data);
            }
        });
    }

    // 取消保存
    handleBack = () => {
        this.props.history.go(-1);
    }
    render() {
        let { optionsList, accessDeviceList, apnTypeList, protocolFormatList, distributionNetworkList, netTypeIdsList, technicalSolutionList, associatedGatewayList, gatewayTchnicalSolutionList,
            accessModeId, productClassId, protocolFormat, bindType, netTypeId, portShow, portNumber, authorityType
        } = this.state;
        distributionNetworkList = netTypeIdsList ? netTypeIdsList : distributionNetworkList;
        let categoryList = [];
        if (optionsList.data && optionsList.data.length > 0) {
            categoryList = this.dataProcessor(optionsList.data);
        }
        let communicationList = productClassId == 0 ? technicalSolutionList : gatewayTchnicalSolutionList;
        let safetySelectionTips = accessModeId == 0 ? ({ '0': safetySelectionTips_4, '1': safetySelectionTips_2, '2': safetySelectionTips_1 }[authorityType]) : safetySelectionTips_3;
        const { getFieldDecorator, getFieldValue } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 3 },
                sm: { span: 3 },
            },
            wrapperCol: {
                xs: { span: 15 },
                sm: { span: 15 },
            },
        };
        // let productName = getFieldValue('productName');
        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit} className='productInformation'>
                <div className='commonContentBox basicsInfoBox'>
                    <div className='title'>产品基础信息</div>
                    <div className='centent'>
                        <Form.Item label="产品名称" hasFeedback>
                            {getFieldDecorator('productName', {
                                rules: [{ required: true, message: '请填写名称' }, { max: 20, message: '最大输入长度为20' }]
                            })(
                                <Input className='input' style={{ width: '350px' }} placeholder="请输入您的产品名称" />
                            )}
                        </Form.Item>
                        <Form.Item label={
                            <LabelTip label="所属分类" tip="平台定义了产品分类的标准功能模型，您可以直接选用，也可以根据实际需要添加自定义功能。" />
                        } hasFeedback>
                            {getFieldDecorator('thirdCategoryId', {
                                rules: [{ required: true, message: '请选择产品分类!' }]
                            })(
                                // <Cascader getPopupContainer={triggerNode => triggerNode.parentElement} className='select' style={{width:'350px'}} options={categoryList} onChange={this.changeSelect} expandTrigger="hover" placeholder="请选择类目" />
                                <SelectSpan options={categoryList} onChange={this.changeSelect} placeholder="请选择类目" style={{ width: '350px' }} />
                            )}
                        </Form.Item>
                        <Form.Item label="接入方式" hasFeedback>
                            {getFieldDecorator('accessModeId', {
                                rules: [{ required: true, message: '请选择接入设备!' }]
                            })(
                                <Radio.Group onChange={this.changeJoinUp.bind(this, 1)}>
                                    {
                                        accessDeviceList.length > 0 ? accessDeviceList.map((item, index) => {
                                            return <Radio key={'接入设备' + index} value={item.baseTypeId}>{item.baseTypeName}</Radio>
                                        }) : null
                                    }
                                </Radio.Group>,
                            )}
                        </Form.Item>
                        <Form.Item colon={false} wrapperCol={{ offset: 3 }}>
                            {(
                                <div className='aListInfo'>
                                    {accessModeId === 0 ?
                                        <div className='joinUpExplain_explainPng'>
                                            <p>设备直连C-Life平台，适合新产品开发接入</p>
                                            <div className='explainPng'></div>
                                        </div>
                                        : <div className='joinUpExplain_thePhirdParty'>
                                            <p>产品不直连C-Life云，已接入的云平台与C-Life云对接，适合已上市产品接入</p>
                                            <div className='thePhirdParty'></div>
                                        </div>}
                                </div>
                            )}
                            {/* <a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank' ><span className='ant-form-text'><Icon type="exclamation-circle-o" />&nbsp;如何选择接入方式？</span></a> */}
                        </Form.Item>
                        <Form.Item label={
                            <LabelTip label="产品类型" tip={
                                productClassId === 0 ? '一般可联网的设备，包括可通过路由器，基站连接网络的设备，也包括可通过网关设备连接网络的设备。'
                                    :
                                    '设备本身可连接网络，同时可代理其他通信方式的设备联网，具备管理能力。'
                            } />
                        } hasFeedback>
                            {getFieldDecorator('productClassId', {
                                rules: [{ required: true, message: '请选择产品类型!' }]
                            })(
                                <Radio.Group onChange={this.changeJoinUp.bind(this, 2)}>
                                    {
                                        apnTypeList.map((item, index) => {
                                            return <Radio key={'产品类型' + index} value={item.baseTypeId}>{item.baseTypeName}</Radio>
                                        })
                                    }
                                </Radio.Group>
                            )}
                        </Form.Item>
                        {
                            portShow === 1 ?
                                <Form.Item label="控制端口" hasFeedback>
                                    {getFieldDecorator('portNumber', {
                                        rules: [{ required: true, message: '请选择控制端口!' }]
                                    })(
                                        <Select getPopupContainer={triggerNode => triggerNode.parentElement} style={{ width: '240px' }} onChange={this.changeJoinUp.bind(this, 8)}>
                                            {
                                                portList.map((item, index) => {
                                                    return <Option key={item.id + index} value={item.id}>{item.contentText}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                                : null
                        }
                    </div>
                </div>
                <div className='commonContentBox technicalProtocolsBox'>
                    <div className='title'>产品技术方案</div>
                    <div className='centent'>
                        <Form.Item label="通信方式" hasFeedback>
                            {getFieldDecorator('bindType', {
                                rules: [{ required: true, message: '请选择通讯技术!' }]
                            })(
                                <Select getPopupContainer={triggerNode => triggerNode.parentElement} placeholder="请选择通信方式" style={{ width: '240px' }}>
                                    {
                                        communicationList.map((item, index) => {
                                            return <Option key={'通讯技术' + index} value={item.baseTypeId} onClick={this.changeJoinUp.bind(this, 5, item.baseTypeId, item.netTypeIds)}>{item.baseTypeName}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        {
                            accessModeId === 0 ?
                                <Form.Item label="协议格式" hasFeedback>
                                    {getFieldDecorator('protocolFormat', {
                                        rules: [{ required: true, message: '请选择协议格式！' }]
                                    })(
                                        <Select getPopupContainer={triggerNode => triggerNode.parentElement} placeholder="请选择协议格式" style={{ width: '240px' }} onChange={this.changeJoinUp.bind(this, 3)}>
                                            {
                                                protocolFormatList.map((item, index) => {
                                                    return <Option key={'协议格式' + index} value={item.baseTypeId}>{item.baseTypeName}</Option>
                                                })
                                            }
                                        </Select>
                                    )}
                                </Form.Item>
                                : <Form.Item label="协议格式" hasFeedback>
                                    {getFieldDecorator('protocolFormat')(
                                        <span>CLink标准数据格式（JSON）</span>
                                    )}
                                </Form.Item>
                        }
                        <Form.Item label="配网方式" hasFeedback>
                            {getFieldDecorator('netTypeId', {
                                rules: [{ required: true, message: '请选择配网方式' }]
                            })(
                                <Select getPopupContainer={triggerNode => triggerNode.parentElement} placeholder="请选择配网方式" style={{ width: '240px' }} onChange={this.changeJoinUp.bind(this, 4)}>
                                    {
                                        distributionNetworkList.map((item, index) => {
                                            return <Option key={'配网方式' + index} value={item.baseTypeId}>{item.baseTypeName}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item label="安全认证级别" hasFeedback>
                            {getFieldDecorator('authorityType', {
                                rules: [{ required: true, message: '请填写名称' }]
                            })(
                                <Radio.Group>
                                    {
                                        accessModeId === 0 ?
                                            authorityTypeList.map((item, index) => {
                                                return <Radio key={'安全认证级别' + index} value={item.id} onClick={this.changeJoinUp.bind(this, 9, item.id)} >
                                                    {item.text}
                                                </Radio>
                                            })
                                            :
                                            <Radio value={1} onClick={this.changeJoinUp.bind(this, 9, 1)} >安全认证(推荐)</Radio>
                                    }
                                </Radio.Group>
                            )}
                            {/* <a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank' ><span className='ant-form-text'><Icon type="exclamation-circle-o" />如何选择安全认证级别？</span></a> */}
                        </Form.Item>
                        <Form.Item colon={false} wrapperCol={{ offset: 3 }}>
                            <div className='msgSelectBox'>
                                <SafetySelectionTips flowLists={safetySelectionTips}></SafetySelectionTips>
                            </div>
                        </Form.Item>
                        <Form.Item label={productClassId === 0 ? "是否接入网关" : "网关通信方案"} hasFeedback>
                            {getFieldDecorator('associatedGatewayList', {
                                rules: [{ required: true, message: '请选择关联网关' }]
                            })(
                                productClassId === 0 ?
                                    <Radio.Group onChange={this.changeJoinUp.bind(this, 6)}>
                                        <Radio value={1}>接入</Radio>
                                        <Radio value={0}>不接入</Radio>
                                    </Radio.Group>
                                    :
                                    <Checkbox.Group style={{ width: '50%' }}>
                                        <Row>
                                            {
                                                associatedGatewayList.map((item, index) => {
                                                    return <Col span={8} key={'网关通信方案' + index}>
                                                        <Checkbox value={item.baseTypeId}>{item.baseTypeName}</Checkbox>
                                                    </Col>
                                                })
                                            }
                                        </Row>
                                    </Checkbox.Group>
                            )}
                        </Form.Item>
                    </div>
                </div>
                <div className='commonButBox'>
                    <Button className="addProductBut" type={"primary"} onClick={this.createProduct}>确定</Button>
                    <Button className="addProductBut" type={"default"} onClick={this.handleBack}>取消</Button>
                </div>
            </Form>
        );
    }
}
export const ProductInformation = Form.create({
    name: 'productInformation',
})(ProductInformationForm);