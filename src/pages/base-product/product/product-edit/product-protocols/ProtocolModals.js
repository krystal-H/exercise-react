// 产品-开发中-功能定义（新增自定义、标准功能、删除）

import React, { PureComponent } from 'react';
import { Button, Modal, Form, Input, InputNumber, Icon, Tabs, Select, Table , AutoComplete,Radio,Checkbox} from 'antd';
import { Notification } from '../../../../../components/Notification';
import { cloneDeep } from 'lodash';
import { get, Paths, post } from '../../../../../api';
import { addKeyToTableData, setFuncDataType } from '../../../../../util/util';
import NoSourceWarn from '../../../../../components/no-source-warn/NoSourceWarn';
import DescWrapper from '@src/components/desc-wrapper/DescWrapper';
import TextAreaCounter from '../../../../../components/textAreaCounter/TextAreaCounter';
import ActionConfirmModal from '../../../../../components/action-confirm-modal/ActionConfirmModal';
import AceEditor from "react-ace";

import 'ace-builds/src-noconflict/snippets/json';
import "ace-builds/src-noconflict/theme-github";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const inputStyle = { display: 'inline-block', width: '100px' };
const FUNCTION_DATA_TYPE = [
    {
        name:'字符',
        value: 1
    },
    {
        name:'数值',
        value: 2
    },
    {
        name:'枚举',
        value: 3
    },
    {
        name:'布尔',
        value: 4
    }    
]

/**
 * 自定义协议 新增/编辑框
 */
export const ProtocolAddForm = Form.create({ name: 'form_in_modal-protocol-add' })(
    class extends React.Component {
        constructor(props) {
            super(props)
            let { curEditProtocol, deviceTypeId,modalType,isComplex } = this.props,
                _curProtocol = [],
                _curParams = [],
                _complexProtocol = null,
                _arrSubLength = 1,
                _fullCoustomData = {

                }

            if (modalType === 'edit') {
                if(isComplex) {
                    let {functionDataType,property,remark,propertyName,length,isTemplateField} = curEditProtocol[0];
                    
                    _complexProtocol = {
                        functionDataType,
                        property,
                        propertyName,
                        remark,
                        isTemplateField
                    }

                    _arrSubLength = length;
                    _curProtocol = isComplex === 'array' ? [curEditProtocol[0].byteDefVO] : [...curEditProtocol[0].byteDefVOList]
                } else {
                    _curProtocol = cloneDeep(curEditProtocol);
                }

                _curParams = this.parseParamsFromCurProtocol(_curProtocol)
                _fullCoustomData = this.parseFullCoustomDataFromCurProtocol(_curProtocol)
            }

            this.state = {
                isShowDataSelect: false,
                deviceTypeId,
                hasProperty: curEditProtocol ? true : false, // 记录是否有正在编辑的数据
                curProtocol: _curProtocol, // 当前操作的协议 注意它的数据形式为 [{},{},{}]
                curParams: _curParams, // 记录当前操作的协议的 协议字段参数
                selectedDictListIndex: null, // 常用协议选择时，选中的协议索引 -- 用于控制active样式
                selectedDisctItem: null, // 选中的协议
                selectedCommonList: [], // 协议中选中的指令索引集 --- 只有 functionDataType = 6 | 7 的协议 可以进行选择，其他的默认为全部指令
                subjectMenu: [], // 查找功能中的 主体 下拉框数据
                subjectExtendMenu: [], // 查找功能中的 主体扩展 下拉框数据 - 只和 deviceTypeId 相关
                functionMenu: [], // 查找功能中的 功能 下拉框数据 - 和主体，dataTypeId联动
                functionExtendMenu: [], // 查找功能中的 功能扩展 下拉框数据 - 和功能联动
                searchLoading: false, // 查询按钮的loading状态控制字段
                searchParams: { // 查询时的参数集
                    subjectId: '',
                    subjectExtendId: '',
                    functionId: '',
                    functionExtendId: ''
                },
                complexProtocol:_complexProtocol, // 复杂协议的外层
                arrSubLength:_arrSubLength, // 数组协议的子元素个数
                fullCoustomData:_fullCoustomData, // 自定义协议的参数记录
                thingLabelData:{} // 当前选中的物标签信息
            }

            this.canCelHandle = this.canCelHandle.bind(this)
        }
        parseFullCoustomDataFromCurProtocol (_curProtocol) {
            let temp = {};

            if(_curProtocol && _curProtocol[0]) {
                let {thingLabel = '',functionDataType = 1,property = ''} = _curProtocol[0]

                temp = {thingLabel,functionDataType,property}
            }

            return temp;
        }
        componentDidMount() {
            let { deviceTypeId } = this.props;
            this.getDistMenus(true, deviceTypeId, false, false)
        }
        componentDidUpdate(prevProps, prevState) {
            let { deviceTypeId } = this.props,
                { subjectMenu } = this.state;
            if (prevProps.deviceTypeId !== deviceTypeId) {
                this.setState({
                    deviceTypeId
                }, () => {
                    // subjectMenu只请求一次；subjectExtendMenu 切换deviceid后需要重新请求
                    this.getDistMenus(!subjectMenu.length, true, false, false)
                })
            }
        }
        verifyParams(_curParams,_curProtocol) {
            let isOk = true,
                {complexProtocol,arrSubLength} = this.state;

            if (!_curProtocol || _curProtocol.length === 0) {
                isOk = false;
            }

            if (complexProtocol && complexProtocol.functionDataType == 10) {
                if(!arrSubLength) {
                    isOk = false;
                }
            }

            if(_curParams[0] instanceof Array) {
                _curParams.map(item => {
                    if (item) {
                        item.map(_item => {
                            if (_item) {
                                let {name,key} = _item;
                                if (name === '' || key=== '') {
                                    isOk = false;
                                }
                            }
                        })
                    }
                })
            } else {
                _curParams.map(item => {
                    if (item) {
                        let {min,max,gap} = item;
                        if (min === '' || max=== '' || gap==='') {
                            isOk = false;
                        }
                    }
                })
            }

            return isOk;
        }
        // 弹框确认 事件
        handleSubmit = e => {
            e.preventDefault();
            this.props.form.validateFields((err, values) => {
                if (!err) {
                    let {curProtocol,curParams,complexProtocol,arrSubLength} = this.state,
                        {existedPropertyNames,dataTypeId} = this.props,
                        {propertyName,remark,defaultPropertyValue,actionType} = values,
                        _curProtocol = cloneDeep(curProtocol),
                        _curParams = cloneDeep(curParams),
                        _complexProtocol = cloneDeep(complexProtocol);
                    
                    if (!this.verifyParams(_curParams,_curProtocol)) {
                        Notification({
                            type:'error',
                            message: '参数缺少',
                            description: '有必填项未填写，请检查表单'
                        })

                        return;
                    }

                    // 协议不能重复；重复的名称如RGB，时间类型协议会通过名称关联
                    if (existedPropertyNames.indexOf(propertyName) > -1) {
                        Notification({
                            type:'error',
                            message: '名称重复',
                            description: '已存在此名称协议，不可重复添加'
                        })

                        return; 
                    }

                    if (dataTypeId == 2) {
                        actionType = actionType ? 0 : undefined
                    }

                    _curProtocol = _curProtocol.map((protocolItem,index) => {
                        let type = this.getEditTypes(protocolItem),
                            propertyValueDesc = '';
                        
                        if (type === '字符型') {
                            return {
                                ...protocolItem,
                                propertyName,
                                remark,
                                defaultPropertyValue,
                                actionType    
                            }
                        } else if (type === '数值型') {
                            let {min,max,gap,mulriple,unit} = _curParams[index];
                            propertyValueDesc = `${min}~${max}`

                            return {
                                ...protocolItem,
                                propertyValueDesc,
                                gap,
                                mulriple,
                                unit,
                                propertyName,
                                remark,
                                defaultPropertyValue,
                                actionType   
                            }
                        } else {
                            let _paramsItem = _curParams[index];
                            
                            propertyValueDesc = _paramsItem.map(item => `${item.key}-${item.name}`).join('|');
 
                            return {
                                ...protocolItem,
                                propertyValueDesc,
                                propertyName,
                                remark,
                                defaultPropertyValue,
                                actionType   
                            }
                        }
                    })

                    if(complexProtocol) {
                        let {functionDataType} = complexProtocol;

                        _complexProtocol = {
                            ...complexProtocol,
                            propertyName,
                            remark
                        }

                        if(functionDataType === 10) {
                            _complexProtocol.length = arrSubLength;
                            // 数组协议 byteDefVO 为 {} 格式的
                            _curProtocol = [{
                                isTemplateField: (_curProtocol[0] && _curProtocol[0].isTemplateField) || 0,
                                ..._complexProtocol,
                                byteDefVO:_curProtocol[0],
                                protocolStructDefVO:null,
                                protocolArrayDefVO:null,
                            }]
                        } else {
                            _curProtocol = [{
                                isTemplateField: (_curProtocol[0] && _curProtocol[0].isTemplateField) || 0,
                                ..._complexProtocol,
                                byteDefVOList:_curProtocol,
                                arrayDefVOList:null,
                                structDefVOList:null
                            }]
                        }
                    }
                    
                    let {addCustomHandle,modalType,editHandle} = this.props;

                    if (modalType === 'add') {
                        addCustomHandle(_curProtocol,!!complexProtocol);
                    } else {
                        editHandle(_curProtocol,!!complexProtocol);
                    }
                }
            });
        }
        // 弹框取消 事件
        canCelHandle() {
            const { onCancel } = this.props;
            onCancel();
        }
        // 控制协议字段选择部分是否展示
        toggleShowDataSelect = () => {
            this.setState((state, props) =>
                ({
                    isShowDataSelect: !state.isShowDataSelect
                })
            )
        }
        // 查找时，各级下拉框数据获取
        getDistMenus(SubjectMenu, _deviceTypeId, subjectId, functionId) {
            let { dataTypeId,deviceTypeId } = this.props;
            if (SubjectMenu) {
                get(Paths.getSubjectMenu).then(
                    res => {
                        let { data } = res;
                        if (data) {
                            this.setState({
                                subjectMenu: data
                            })
                        }
                    }
                )
            }

            if (_deviceTypeId) {
                get(Paths.getSubjectExtendMenu, {
                    deviceTypeId
                }).then(
                    res => {
                        let { data } = res;
                        if (data) {
                            this.setState({
                                subjectExtendMenu: data
                            })
                        }
                    }
                )
            }
            if (subjectId) {
                get(Paths.getFunctionMenu, {
                    subjectId,
                    dataTypeId
                }).then(
                    res => {
                        let { data } = res;
                        if (data) {
                            this.setState({
                                functionMenu: data
                            })
                        }
                    }
                )
            }
            if (functionId) {
                get(Paths.getFunctionExtendMenu, {
                    functionId,
                    deviceTypeId
                }).then(
                    res => {
                        let { data } = res;
                        if (data) {
                            this.setState({
                                functionExtendMenu: data
                            })
                        }
                    }
                )
            }
        }
        // 查询按钮 点击事件
        searchHandle = () => {
            let { searchParams } = this.state,
                { subjectId, functionId } = searchParams,
                isOk = (subjectId !== '') && (functionId!== '');

            if (!isOk) {
                Notification({
                    type:'error',
                    message: '参数缺少',
                    description: '主体（1）和功能（3）为必选字段'
                })
                return
            }

            this.setState({
                searchLoading: true
            })

            get(Paths.searchProtocolDictionary, {
                ...searchParams
            },{
                needVersion:1.1
            }).then(res => {
                let { data } = res;
                if (data) {
                    this.dealDistAndCommonList(data)
                }
            }).finally(() => {
                this.setState({
                    searchLoading: false
                })
            })
        }
        // 常用协议 点击事件
        clickDictList(index) {
            let { protocolDictionaryCommonList } = this.props;

            this.dealDistAndCommonList(protocolDictionaryCommonList[index]);

            this.setState({
                selectedDictListIndex: index
            })
        }
        // 将所选的协议字段处理成 协议所需要的格式，并存入selectedDisctItem，记录selectedCommonList
        dealDistAndCommonList(disctItem) {
            let _selectedDisctItem = cloneDeep(disctItem),
                { functionDataType, commonDetailList = [] } = _selectedDisctItem,
                selectedCommonList = [];

            _selectedDisctItem.commonDetailList = commonDetailList.map((item, index) => {

                let _functionDataType = functionDataType;

                selectedCommonList.push(index)

                // 复杂协议
                if(functionDataType === 10 || functionDataType === 11) {
                    _functionDataType = item.functionDataType
                }

                if (_functionDataType == 2 || _functionDataType == 5 || _functionDataType == 6 || _functionDataType == 8 || (_functionDataType == 7 && index != 1)) {

                    return { ...item, propertyValueType: "RANGE", mark: "数值型", propertyValueDesc: "~", javaType: "LONG" }
                } else {
                    if (_functionDataType == 1) {
                        return { ...item, propertyValueType: "", mark: "字符型", propertyValueDesc: "", javaType: "STRING" }
                    }
                    if (_functionDataType == 4) {
                        return { ...item, propertyValueType: "ENUM", mark: "布尔型", propertyValueDesc: "0-|1-", javaType: "LONG" }
                    }
                    if (_functionDataType == 9) {
                        return { ...item, propertyValueType: "ENUM", mark: "二进制", propertyValueDesc: "0-|1-", javaType: "LONG" }
                    }
                }
                return { ...item, propertyValueType: "ENUM", mark: "枚举型", propertyValueDesc: "-", javaType: "LONG" }
            })

            this.setState({
                selectedDisctItem: _selectedDisctItem,
                selectedCommonList
            })
        }
        commonDetailChangeHandle = (index,key,value) => {
            let { selectedDisctItem } = this.state,
                _selectedDisctItem = cloneDeep(selectedDisctItem);
            
            _selectedDisctItem.commonDetailList[index][key] = value;

            this.setState({
                selectedDisctItem:_selectedDisctItem
            })
        }
        // 选中协议字段后，展示部分
        getSelectedDisctItemDom = () => {
            let { selectedCommonList, selectedDisctItem } = this.state,
                {functionDataType} = selectedDisctItem;

            return <div className="p-data-area">
                <h3>数据定义</h3>
                <h4>{selectedDisctItem.commonName || ''}{
                    [10,11].includes(+functionDataType) && <span className="margin-l-16" style={{fontWeight:'bold'}}>{['数组','结构体'][functionDataType - 10]}</span>}
                </h4>
                {
                    selectedDisctItem.commonDetailList.map((commonDetail, index) => (
                        <div style={{ marginBottom: '8px' }} key={index}>
                            {   
                                [10].includes(+functionDataType) &&
                                <span className="margin-l-16" style={{fontWeight:'bold'}}>子元素：</span>
                            }
                            <span className="margin-l-16">{commonDetail.commonMark}</span>
                            <span className="margin-l-16">{commonDetail.mark}</span>
                            <InputNumber
                                style={{ display: 'inline-block', width: '70px', marginLeft: '16px' }} 
                                min={1} max={1024} 
                                value={commonDetail.functionLength}
                                onChange={value => this.commonDetailChangeHandle(index,'functionLength',value)} 
                                />
                            <span className="margin-l-8">{commonDetail.functionUnit == 1 ? '字节' : '位'}</span>
                            {
                                commonDetail.mark === '数值型' && 
                                <Select value={+commonDetail.isSigned || 0}
                                        onChange={value => this.commonDetailChangeHandle(index,'isSigned',value)}  
                                        style={{ width: 100, marginLeft: '16px' }}>
                                            <Option value={0}>无符号</Option>
                                            <Option value={1}>有符号</Option>
                                </Select>
                            }
                            {
                                [6, 7].includes(selectedDisctItem.functionDataType) &&
                                <span className="margin-l-16 select-icon"
                                    onClick={this.choiceCommonListHandle.bind(this, index)}>
                                    <Icon type="check-circle" theme={selectedCommonList.indexOf(index) > -1 ? 'twoTone' : null} /></span>
                            }
                        </div>
                    ))
                }
            </div>
        }
        // 查找时，各级下拉框切换事件
        changeOptionsHandle = (whice, value) => {
            let { searchParams } = this.state,
                _searchParams = cloneDeep(searchParams);

            _searchParams = Object.assign(_searchParams, {
                [whice]: value
            });

            switch (whice) {
                case 'subjectId':
                    _searchParams.functionId = '';
                    _searchParams.functionExtendId = '';
                    this.getDistMenus(false, false, value, false)
                    break;
                case 'functionId':
                    _searchParams.functionExtendId = '';
                    this.getDistMenus(false, false, false, value)
                    break;
                default:
                    break;
            }

            this.setState({
                searchParams: _searchParams
            })
        }
        getLabelId = property => {
            let {templates,dataTypeId} = this.props,
                label = templates.filter(item => item.property == property);

            if (label.length) {
                let {property,propertyName,javaType} = label[0];

                post(Paths.saveNoProductId,{
                    javaType,
                    protocolType:dataTypeId,
                    labelName:propertyName,
                    labelNameEn:property,
                    labelType:0
                }).then(data => {
                    if (data.data) {
                        this.setState(() => {
                            return {
                                thingLabelData:{
                                    thingLabel:property,
                                    thingLabelName:propertyName,
                                    thingLabelId:data.data.labelId
                                }
                            }
                        },() => {
                            this.changeFullCoustomData('thingLabel',property)
                        })

                        
                    }
                })
            }
        }
        changeFullCoustomData = (type,value) => {

            let {fullCoustomData} = this.state,
                {property} = fullCoustomData;

            if (type === 'functionDataType') {

                if (!property) {
                    Notification({
                        description: '请先输入协议字段'   
                    })
    
                    return
                } 
            } 

            if (type === 'property' && !/^[a-zA-Z]{1}\w{0,49}$/.test(value)) {

                Notification({
                    description: '格式不符合规则'   
                })
            }

            this.setState({
                fullCoustomData:{
                    ...fullCoustomData,
                    [type]:value
                }
            },() => {

                let {fullCoustomData,thingLabelData} = this.state,
                    {property,functionDataType} = fullCoustomData;

                if (property && functionDataType) {

                    let {thingLabelId = '',thingLabel = '',thingLabelName = ''} = thingLabelData



                    this.dealDistAndCommonList({
                        functionDataType,
                        commonDetailList:[
                            {
                                functionDataType,
                                commonMark:property,
                                thingLabelId,
                                thingLabel,
                                thingLabelName
                            }
                        ]
                    })
                }
            })
        }
        // 查找时，下拉框DON
        getOptions = (arr = [],textType) => {
            let random = Math.random() * 1000;

            let temp = arr.map((item, index) => {
                return <Option key={random + index} value={item.menuId}>{item.menuName}</Option>
            })

            temp.unshift(<Option key={random-1} value="">{textType ? '未选择' : '不填写'}</Option>)

            return temp;
        }
        // 部分特殊协议有多个指令时，可选择是否应用
        choiceCommonListHandle(index) {
            let { selectedCommonList } = this.state,
                _selectedCommonList = cloneDeep(selectedCommonList);
            if (selectedCommonList.indexOf(index) > -1) {
                _selectedCommonList = _selectedCommonList.filter(item => item != index);
            } else {
                _selectedCommonList.push(index)
            }
            this.setState({
                selectedCommonList: _selectedCommonList
            })
        }
        parseParamsFromCurProtocol(protocols) {            
            let params = protocols.map(protocol => {
                let type = this.getEditTypes(protocol);

                if (type === '字符型') {
                    return null;
                }

                if (type === '数值型') {          
                    let {propertyValueDesc,gap,mulriple,unit,length,isSigned} = protocol;
                    if (!propertyValueDesc) {
                        propertyValueDesc = '~';
                    }
                    let _params = propertyValueDesc.split('~'),
                        [min,max] = _params,
                        numMin = isSigned ?  - (Math.pow(2, 8 * length - 1) - 1) : 0,
                        maxMax = isSigned ? (Math.pow(2, 8 * length - 1) - 1) : (Math.pow(2, 8 * length) - 1);

                    if (min && min < numMin) {
                        min = numMin
                    } else if (min && min > maxMax) {
                        min=maxMax
                    }
                    if (max && max < numMin) {
                        max = numMin
                    } else if (max && max > maxMax) {
                        max=maxMax
                    }
                    if (gap && gap < 1) {
                        gap = 1
                    } else if (gap && gap > Math.pow(2, 8 * length)) {
                        gap=Math.pow(2, 8 * length)
                    }


                    return {
                        min,
                        max,
                        gap,
                        mulriple,
                        unit
                    }
                } else {
                    let {propertyValueDesc = '|',} = protocol;

                    if (!propertyValueDesc) {
                        propertyValueDesc = '';
                    }
                    let  _params = propertyValueDesc.split('|');
                        
                    return _params.map(item => {
                        let [key,name] = item.split('-');
                        return {
                            key,
                            name
                        }
                    })
                }
            })

            return params;
        }
        // 选择协议字段，确定事件 - 检验 | 传入数据到 curProtocol
        confirmDist = () => {
            let { selectedDisctItem, selectedCommonList,curProtocol } = this.state,
            _selectedDisctItem = null,
            _propertyName = '',
            _remark = '',
            _actionType = null,
            complexProtocol = null,
            isOk = true;

            if (!selectedDisctItem) {
                isOk = false;
            } else {
                _selectedDisctItem = { ...selectedDisctItem, commonDetailList: selectedDisctItem.commonDetailList.filter((item, i) => selectedCommonList.indexOf(i) > -1) };

                if (!_selectedDisctItem || !_selectedDisctItem.commonDetailList || _selectedDisctItem.commonDetailList.length < 1) {
                    isOk = false;
                }

            }

            if (!isOk) {
                Notification({
                    type:'error',
                    message: '参数缺失',
                    description: '请先选择一个协议字段'
                })
                return;
            }

            if (curProtocol && curProtocol[0]) {
                _propertyName = curProtocol[0].propertyName;
                _remark = curProtocol[0].remark;
                _actionType = curProtocol[0].actionType
            }

            let obj = {
                commonName: _selectedDisctItem.commonName,
                functionDataType: _selectedDisctItem.functionDataType,
                bitDefList: _selectedDisctItem.functionDataType != 9 ? null : undefined,
                isSigned: 0,
                gap: null,
                ignore: false,
                isTemplateField: 0,
                javaType: null,
                length: 1,
                loop: null,
                mulriple: null,
                property: "",
                propertyName: _propertyName,
                propertyValueDesc: "",
                propertyValueType: "",
                remark: _remark,
                unit: null,
                actionType:_actionType
            }

            let propertyFrom = this.props.form.getFieldValue('propertyFrom')

            const data = _selectedDisctItem.commonDetailList.map((item) => {
                const { propertyValueDesc, propertyValueType, javaType, isSigned, commonMark, functionLength,functionDataType,commonName,thingLabel,thingLabelId,thingLabelName } = item,
                        temp = {
                            ...obj, length: +functionLength || 1,
                            propertyValueDesc,
                            propertyValueType,
                            functionDataType,
                            javaType,
                            isSigned: +isSigned || 0,
                            property: commonMark,
                            propertyFrom,
                            thingLabel,
                            thingLabelId,
                            thingLabelName
                        }
                    
                    if([10,11].includes(+_selectedDisctItem.functionDataType)) {
                        temp.propertyName = commonName
                    }

                    return temp;
            })

            if([10,11].includes(+_selectedDisctItem.functionDataType)) {
                let {functionDataType,commonMark} = _selectedDisctItem
                complexProtocol={
                    functionDataType,
                    property:commonMark,
                    remark: _remark,
                    propertyName: _propertyName
                }
            }

            let params = this.parseParamsFromCurProtocol(data);

            this.toggleShowDataSelect();
            this.setState({
                curProtocol: data,
                curParams:params,
                hasProperty: data.length > 0,
                complexProtocol
            })
        }
        // 返回协议类型名称
        getEditTypes = (protocolItem) => {
            const { propertyValueType, functionDataType, javaType, propertyValueDesc } = protocolItem;

            if (javaType == "STRING") {
                return "字符型"
            }

            if (functionDataType == 9) {
                return "二进制"
            }

            if (propertyValueType) {
                if (propertyValueType == "RANGE") {
                    return "数值型"
                }

                if (functionDataType == 4) {
                    return "布尔型"
                }

                return "枚举型"
            }

            if (propertyValueDesc) {
                if (propertyValueDesc.indexOf("~") >= 0) {
                    return "数值型"
                }

                return "枚举型"
            }

            return ""
        }
        // propertyValueDesc分拆出来的参数INPUT ，输入控制函数；一维数组时，paramItem传入 -1
        paramOnchangeHandle = (key,protocolIndex,paramItem,value) => {
            if (!value && value !== 0 && value!== '') {
                return ;
            }

            if (('' + value).match(/\||\~/g)) {
                Notification({
                    type:'warn',
                    message: '参数异常',
                    description: "不能输入'|'和'~'字符"
                })
                return
            }

            let {curParams} = this.state,
                _curParams = cloneDeep(curParams);
            
            value = ('' + value).trim();
            
            if (paramItem === -1) {
                _curParams[protocolIndex][key] = value;
            } else {
                _curParams[protocolIndex][paramItem][key] = value;
            }

            this.setState({
                curParams:_curParams
            })
        }
        // 增加/删除 协议参数
        controlParam (index,type,length,paramIndex) {

            let {curParams} = this.state,
                _curParams = cloneDeep(curParams);
            if (type === 'add') {
                let _length = _curParams[index].length;
                if (_length >  Math.pow(2,8 * length)) {
                    Notification({
                        type:'warn',
                        message: '无法添加',
                        description: '参数格式已达到上限'
                    })
                    return false;
                }
                _curParams[index].push({
                    key:'',
                    name:''
                })
            } else {
                _curParams[index] = _curParams[index].filter((item,_index) => _index !== paramIndex);
            }

            this.setState({
                curParams:_curParams
            })
        }
        // 协议字段数据编辑DOM
        getEditItem = (protocolItem, index) => {
            let type = this.getEditTypes(protocolItem),
            {curParams} = this.state,
            { length, property, bitDefList, isSigned, propertyValueType } = protocolItem,
            dataType = typeof (bitDefList) == "undefined",
            unitText = dataType ? '位' : '字节',
            DOM = null,
            _param = curParams[index],
            {functionDataType} = protocolItem,
            keyDisable = [4,9].includes(+functionDataType);
            
            if (type === "字符型") {
                DOM = (<div key={index} className="ant-form ant-form-horizontal form-border edit-item">
                            <p className="protocol-des"><b>{property}</b> <span>{type}</span> <span>{length} {unitText}</span> <span>{propertyValueType == "RANGE" ? isSigned ? '有符号' : '无符号' : ''}</span></p>
                      </div>)
            } else if (type === "数值型") {

                let numMin = isSigned ?  - (Math.pow(2, 8 * length - 1) - 1) : 0,
                    maxMax = isSigned ? (Math.pow(2, 8 * length - 1) - 1) : (Math.pow(2, 8 * length) - 1);

                DOM = (<div key={index} className="ant-form ant-form-horizontal form-border edit-item">
                        <p className="protocol-des"><b>{property}</b> <span>{type}</span> <span>{length} {unitText}</span> <span>{propertyValueType == "RANGE" ? isSigned ? '有符号' : '无符号' : ''}</span></p>
                        <Form.Item label="范围"  className="need-require-lable" style={{ marginBottom: 0 }}>
                            <Form.Item style={inputStyle} >
                                <InputNumber value={_param.min} min={numMin} max={maxMax} defaultValue={1} onChange={value => this.paramOnchangeHandle('min',index,-1,value)}/>
                            </Form.Item>
                            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}> ~ </span>
                            <Form.Item style={inputStyle}>
                                <InputNumber value={_param.max} min={numMin} max={maxMax} defaultValue={1} onChange={value => this.paramOnchangeHandle('max',index,-1,value)}/>
                            </Form.Item>
                        </Form.Item>
                        <Form.Item label="数据间隔" className="need-require-lable">
                            <InputNumber value={_param.gap} max={Math.pow(2, 8 * length)} min={1} style={inputStyle} defaultValue={1} onChange={value => this.paramOnchangeHandle('gap',index,-1,value)} />
                        </Form.Item>
                        <Form.Item label="数据倍数">
                            <AutoComplete
                                dataSource={['10','100','1000']}
                                style={inputStyle}
                                value={_param.mulriple}
                                onSelect={value => this.paramOnchangeHandle('mulriple',index,-1,+value)}
                                />
                            {/* <InputNumber value={_param.mulriple} style={inputStyle} min={1} max={1024} defaultValue={1} onChange={value => this.paramOnchangeHandle('mulriple',index,-1,value)}/> */}
                        </Form.Item>
                        <Form.Item label="单位">
                            <Input value={_param.unit} placeholder="比如：温度，湿度等，选填项" onChange={e => this.paramOnchangeHandle('unit',index,-1,e.target.value)}/>
                        </Form.Item>
                    </div>)
            } else {
                DOM = (<div key={index} className="ant-form ant-form-horizontal form-border edit-item">
                        <p className="protocol-des"><b>{property}</b> <span>{type}</span> <span>{length} {unitText}</span> <span>{propertyValueType == "RANGE" ? isSigned ? '有符号' : '无符号' : ''}</span></p>
                        {
                            _param.map((paramItem,paramIndex) => (
                                <Form.Item key={paramIndex} label={`参数${paramIndex}`} className="need-require-lable" style={{ marginBottom: 0 }}>
                                    <Form.Item style={inputStyle}>
                                        <InputNumber disabled={keyDisable} 
                                               value={paramItem.key}
                                               max={Math.pow(2, 8 * length)}
                                               min={0} 
                                               onChange={value => this.paramOnchangeHandle('key',index,paramIndex,value)}
                                               placeholder="参数"/>
                                    </Form.Item>
                                    <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}> - </span>
                                    <Form.Item style={inputStyle}>
                                        <Input value={paramItem.name}
                                               maxLength={20}
                                               onChange={e => this.paramOnchangeHandle('name',index,paramIndex,e.target.value)} 
                                               placeholder="字符名称"/>
                                    </Form.Item>
                                    {
                                        ((paramIndex > 0) && !keyDisable) &&
                                        <span className="sub-icon" onClick={this.controlParam.bind(this,index,'sub','',paramIndex)}><Icon type="close-circle" /></span>
                                    }
                                </Form.Item>
                            ))
                        }
                        {
                            !keyDisable && 
                            <div className="re-select-property" onClick={this.controlParam.bind(this,index,'add',length)}>
                                添加参数
                            </div>
                        }
                    </div>)
            }

            return DOM
        }
        getParentNode () {    
            return document.body
        }
        
        getDefaultvalueDom(){
            let dom = null;
            let {getFieldDecorator} = this.props.form;
            let {dataType,dataTypeId,dataTypeName} = this.props;
            let {isShowDataSelect ,hasProperty,curProtocol=[],curParams} = this.state;
            if(curProtocol.length&&curProtocol.length>1){
                return null
            }
            let curProtocolitem = curProtocol&&curProtocol[0]||{};
            let defaultval = curProtocolitem.defaultPropertyValue||"";
            let type = this.getEditTypes(curProtocolitem);
            
            if(dataTypeName=='配置数据'&&!isShowDataSelect&&hasProperty){
                if(type==='字符型'||type=='数值型'){
                    dom = <Form.Item label="默认值">
                                {getFieldDecorator('defaultPropertyValue', {
                                    rules: [{ required: true, message: '请输入默认值'},
                                            { max: 30, message: '最大输入长度为30' }],
                                    initialValue: defaultval
                                })(<Input placeholder="请输入默认值" />)
                                }
                        </Form.Item>

                }else if(type==='布尔型'||type=='枚举型'){
                    
                    let par = curParams[0] || [], options = [];
                    for(let i in par){
                        if(par[i].key==''||par[i].name==''){
                            options = [];
                            break;
                        }else{
                            options.push(
                                <Option key={i} value={`${par[i].key}-${par[i].name}`}>{`${par[i].key}-${par[i].name}`}</Option>
                            ); 
                        }
                    }

                    dom=   <Form.Item label="默认值">
                                {getFieldDecorator('defaultPropertyValue', {
                                    rules: [{ required: true, message: '请选择默认值'}],
                                    initialValue: defaultval
                                })(<Select  disabled={options.length==0}>
                                    {options}
                                </Select>)
                                }
                        </Form.Item>
                    
                }


            }
            return dom;
            
        }
        render() {
            let { visible, form, protocolDictionaryCommonList,confirmLoading ,dataTypeId} = this.props,
            { isShowDataSelect, hasProperty, curProtocol,curParams, selectedDictListIndex, selectedDisctItem, subjectMenu, subjectExtendMenu, functionMenu, functionExtendMenu, searchParams, searchLoading,complexProtocol,arrSubLength,fullCoustomData,thingLabelList } = this.state,
            { getFieldDecorator, getFieldValue } = form,
            { subjectId, subjectExtendId, functionId, functionExtendId } = searchParams,
            initPropertyName = (curProtocol && curProtocol[0]) ? curProtocol[0].propertyName : '',
            initRemark = (curProtocol && curProtocol[0]) ? curProtocol[0].remark : '',
            initActionType = (curProtocol && curProtocol[0]) ? (curProtocol[0].actionType !== undefined ? curProtocol[0].actionType : '') : '',
            initPropertyFrom = (curProtocol && curProtocol[0]) ? curProtocol[0].propertyFrom : 0,
            {property,thingLabel,functionDataType} = fullCoustomData;
            
            let _propertyFrom = form.getFieldValue('propertyFrom'),
                _actionType = form.getFieldValue('actionType');

            if (_propertyFrom === undefined) {
                _propertyFrom = initPropertyFrom
            }

            return (
                <Modal
                    visible={visible}
                    className="self-modal"
                    width={980}
                    title="自定义功能添加"
                    centered={true}
                    closable={false}
                    footer={null}
                    onCancel={this.canCelHandle}
                    destroyOnClose={true}
                    maskClosable={false}
                >
                    <Form {...{ labelCol: { span: 4 }, wrapperCol: { span: 20 } }} onSubmit={this.handleSubmit}>
                        <Form.Item label="数据名称">
                            {getFieldDecorator('propertyName', {
                                rules: [{ required: true, message: '请输入数据名称'},
                                        { max: 20, message: '最大输入长度为20' }],
                                initialValue: initPropertyName
                            })(<Input placeholder="请输入数据名称" />)
                            }
                        </Form.Item>
                        {
                            [3].includes(dataTypeId) &&
                            <Form.Item label="数据区分">
                                {getFieldDecorator('actionType', {
                                    rules: [{ required: true, message: '请选择数据区分'}],
                                    initialValue: initActionType
                                })(
                                    <Radio.Group>
                                        <Radio value={0}>设备状态上传</Radio>
                                        <Radio value={1}>设备信息通知</Radio>
                                        <Radio value={2}>设备告警</Radio>
                                    </Radio.Group>
                                )}
                            </Form.Item>
                        }
                        {
                            [2].includes(dataTypeId) &&
                            <Form.Item label="是否包含">
                                {getFieldDecorator('actionType', {
                                    initialValue: initActionType
                                })(
                                    <Checkbox >设备状态上传</Checkbox>
                                )}
                            </Form.Item>
                        }
                        <div className="ant-row ant-form-item">
                            <div className="ant-col ant-col-4 ant-form-item-label">
                                <label className="ant-form-item-required">定义数据</label>
                            </div>
                            {/* 协议字段内容编辑 */}
                            <div className="ant-col ant-col-20">
                                {
                                    /* 是否展示字段编辑部分 */
                                    !isShowDataSelect ? (
                                        hasProperty ?
                                            <div>
                                                {
                                                    (curProtocol && curProtocol.length > 0) && 
                                                    <React.Fragment>
                                                        <div className="item-header">
                                                            <span>{curProtocol[0].commonName}</span>
                                                            <div onClick={this.toggleShowDataSelect} className="re-select-property">
                                                                重新选择
                                                            </div>
                                                        </div>
                                                        <div className="edit-items-wrapper">
                                                            {
                                                                complexProtocol && complexProtocol.functionDataType == 10 &&
                                                                <div key={-1} className="ant-form ant-form-horizontal form-border edit-item">
                                                                    <Form.Item label="子元素个数" className="need-require-lable">
                                                                        <InputNumber min={1} value={arrSubLength} placeholder="请输入数组子元素个数" onChange={value => this.setState({arrSubLength:value})}/>
                                                                    </Form.Item>
                                                                </div>
                                                            }
                                                            {
                                                                curProtocol.map((protocolItem, index) =>
                                                                    {
                                                                        return this.getEditItem(protocolItem, index)
                                                                    }
                                                                )
                                                            }
                                                        </div>
                                                    </React.Fragment>
                                                }
                                            </div>
                                            : <a className="select-a" onClick={this.toggleShowDataSelect}>选择</a>
                                    ) :
                                        (
                                            <Form.Item>
                                                {getFieldDecorator('propertyFrom', {
                                                    rules: [{ required: true, message: '请选择数据区分'}],
                                                    initialValue: initPropertyFrom
                                                })(
                                                    <Radio.Group>
                                                        <Radio.Button  value={0}>协议字典</Radio.Button>
                                                        <Radio.Button  value={1}>完全自定义</Radio.Button>
                                                    </Radio.Group>
                                                )}
                                            </Form.Item>
                                            // <div style={{marginTop:'8px'}}>
                                            //     <Radio.Group>
                                            //         <Radio.Button  value={0}>协议字典</Radio.Button>
                                            //         <Radio.Button  value={1}>完全自定义</Radio.Button>
                                            //     </Radio.Group>
                                            // </div>
                                        )
                                }
                            </div>
                        </div>
                        {/* 协议字段选择 */}
                        {
                            isShowDataSelect && (
                                
                                <div className="ant-row ant-form-item">
                                    <div className="ant-col ant-col-4 ant-form-item-label"></div>
                                    <div className="ant-col ant-col-20 data-select-wrapper">
                                        {
                                            !_propertyFrom ? 
                                            (
                                                <Tabs defaultActiveKey="0">
                                                    {/* 常用协议 点击选择 */}
                                                    {/* 产品验收时，提出屏蔽此项，因与标准协议添加功能重复 */}
                                                    {/* <TabPane tab="常用" key={0}>
                                                        <div className="type-select">
                                                            {
                                                                protocolDictionaryCommonList.length > 0 &&
                                                                protocolDictionaryCommonList.map((item, index) => {
                                                                    let _className = 'span-gap';
                                                                    if (selectedDictListIndex === index) {
                                                                        _className += ' actice-btn'
                                                                    }
                                                                    return <span className={_className}
                                                                        key={index}
                                                                        onClick={this.clickDictList.bind(this, index)}>{item.protocolName}</span>
                                                                })
                                                            }
                                                            {
                                                                <div style={{textAlign:'center'}} className="explain-text">暂无常用协议</div>
                                                            }
                                                        </div>
                                                        {
                                                            selectedDisctItem &&
                                                            this.getSelectedDisctItemDom()
        
                                                        }
                                                    </TabPane> */}
                                                    {/* 下拉框查找*/}
                                                    <TabPane tab='查找' key={1}>
                                                        <div className="type-select">
                                                            <p>请描述这个数据的主体和功能，需要时使用扩展名进一步描述：</p>
                                                            <div className="selects-wrapper">
                                                                <div className="select-item">
                                                                    <Select value={subjectId}
                                                                        onChange={value => { this.changeOptionsHandle('subjectId', value) }}
                                                                        getPopupContainer={this.getParentNode}
                                                                        optionFilterProp="children"
                                                                        showSearch
                                                                        filterOption={(input, option) =>
                                                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                        }
                                                                        style={{ display: "block" }}>
                                                                        {
                                                                            this.getOptions(subjectMenu,true)
                                                                        }
                                                                    </Select>
                                                                    <span className="des"> 数据承载的主体，可以是检测元器件，也可以是设备整机，如“基础功能”；</span>
                                                                </div>
                                                                <div className="select-item">
                                                                    <Select value={subjectExtendId}
                                                                        onChange={value => { this.changeOptionsHandle('subjectExtendId', value) }}
                                                                        optionFilterProp="children"
                                                                        showSearch
                                                                        filterOption={(input, option) =>
                                                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                        }
                                                                        getPopupContainer={this.getParentNode}
                                                                        style={{ display: "block" }}>
                                                                        {
                                                                            this.getOptions(subjectExtendMenu,false)
                                                                        }
                                                                    </Select>
                                                                    <span className="des"> 用来描述主体的词，如室内、室外，主体唯一时可选择不填写；</span>
                                                                </div>
                                                                <div className="select-item">
                                                                    <Select value={functionId}
                                                                        onChange={value => { this.changeOptionsHandle('functionId', value) }}
                                                                        getPopupContainer={this.getParentNode}
                                                                        optionFilterProp="children"
                                                                        showSearch
                                                                        filterOption={(input, option) =>
                                                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                        }
                                                                        style={{ display: "block" }}>
                                                                        {
                                                                            this.getOptions(functionMenu,true)
                                                                        }
                                                                    </Select>
                                                                    <span className="des"> 描述功能的核心词，如开关、模式设置、工作状态、设置值、检测值等；</span>
                                                                </div>
                                                                <div className="select-item">
                                                                    <Select value={functionExtendId}
                                                                        onChange={value => { this.changeOptionsHandle('functionExtendId', value) }}
                                                                        getPopupContainer={this.getParentNode}
                                                                        optionFilterProp="children"
                                                                        showSearch
                                                                        filterOption={(input, option) =>
                                                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                        }
                                                                        style={{ display: "block" }}>
                                                                        {
                                                                            this.getOptions(functionExtendMenu,false)
                                                                        }
                                                                    </Select>
                                                                    <span className="des"> 用来描述功能的词，如“检测值”的功能，可以加上“电压”，“温度”的扩展词细化描述；</span>
                                                                </div>
                                                                <div className="select-item-btn">
                                                                    <Button type="primary" icon="search" loading={searchLoading} onClick={this.searchHandle}>查询</Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TabPane>
                                                </Tabs>
                                            )
                                            :
                                            <>
                                                <div className="ant-row ant-form-item">
                                                    <div className="ant-col ant-col-3 ant-form-item-label ant-form-item-required p-r-12">数据标识</div>
                                                    <div className="ant-col ant-col-21 ant-form-item-control">
                                                        <Input placeholder="仅支持大小字母开头、下划线组成，最多50个字"
                                                               onChange={e => { this.changeFullCoustomData('property', e.target.value) }}
                                                               value={property}
                                                               style={{width:'360px'}}></Input>
                                                    </div>
                                                </div>
                                                <div className="ant-row ant-form-item">
                                                    <div className="ant-col ant-col-3 ant-form-item-label ant-form-item-required p-r-12">数据类型</div>
                                                    <div className="ant-col ant-col-21 ant-form-item-control">
                                                        <Select value={functionDataType}
                                                            onChange={value => { this.changeFullCoustomData('functionDataType', value) }}
                                                            style={{width:'360px',display: "block"}}>
                                                            {
                                                                FUNCTION_DATA_TYPE.map(item => {
                                                                    let {name,value} = item;

                                                                    return <Option key={value} value={value}>{name}</Option>
                                                                })
                                                            }
                                                        </Select>
                                                    </div>
                                                </div>
                                                {
                                                    ((_actionType && dataTypeId == 2) || [3,4].includes(+dataTypeId)) &&
                                                    <div className="ant-row ant-form-item">
                                                        <div className="ant-col ant-col-3 ant-form-item-label p-r-12">绑定物标签</div>
                                                        <div className="ant-col ant-col-21 ant-form-item-control">
                                                            <Select value={thingLabel}
                                                                    style={{width:'360px',display: "block"}}
                                                                    onChange={value => { this.getLabelId(value) }}
                                                                    getPopupContainer={this.getParentNode}
                                                                    optionFilterProp="children"
                                                                    showSearch
                                                                    filterOption={(input, option) =>
                                                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                    }>
                                                                    {
                                                                        (this.props.templates || []).map(item => {
                                                                            let {property,propertyName} = item;
        
                                                                            return <Option key={property} value={property}>{propertyName}</Option>
                                                                        })
                                                                    }
                                                                </Select>
                                                        </div>
                                                    </div>
                                                }
                                            </>
                                        }
                                        {
                                            selectedDisctItem &&
                                            this.getSelectedDisctItemDom()
                                        }
                                        <div className="data-done">
                                            <span onClick={this.confirmDist}>完 成&nbsp;<Icon type="arrow-up" /></span>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        {this.getDefaultvalueDom()}
                        
                        <TextAreaCounter
                            label="备注"
                            formId='remark'
                            astrictNub='200'
                            rows='2' 
                            placeholder='选填项' 
                            getFieldDecorator={getFieldDecorator} 
                            initialVal={initRemark}
                            getFieldValue={getFieldValue}
                        />
                        <Form.Item wrapperCol={{ span: 24 }}>
                            <div className="form-in-modal-ok-cancel-btn">
                                <Button loading={confirmLoading} type="primary" htmlType="submit" onClick={this.handleSubmit}>确定</Button>
                                <Button type="default" onClick={this.canCelHandle}>取消</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            );
        }
    },
);

/**
 * 自定义协议 删除框
 */
export function ProtocolDelete({ visible, deleteOkHandle, deleteCancelHandle, propertyName, deleteConfirmLoading }) {
    return (
        <ActionConfirmModal
            visible={visible}
            modalOKHandle={deleteOkHandle}
            confirmLoading={deleteConfirmLoading}
            modalCancelHandle={deleteCancelHandle}
            targetName={propertyName}
            title={'删除协议'}
            descGray={true}
            needWarnIcon={true}
            descText={'即将删除的协议'}
        >
        </ActionConfirmModal>
    )
}

/**
 * 标准协议 添加框
 */
export class AddStandardProtocol extends PureComponent {

    constructor(props) {
        super(props)

        let {dataTypeId} = this.props

        this.state = {
            selectedRowKeys: [],
            okLoading: false,
            actionTypeValues:[]
        }

        /**
         * 标准协议列表 列配置
         */
        this.columns = [
            {
                title: '数据名称',
                dataIndex: 'propertyName',
                key: 'propertyName',
                width: '150px',
                render: (text,record) => {
                    let {propertyName,bits} = record,
                        dom = [];

                    if (bits && bits.length > 0) {
                        bits.forEach( (item,index) => {
                            dom.push(<div key={index}>{item.propertyName}</div>)
                        })
                    } else {
                        dom.push(<span  key={0}>{propertyName}</span>)
                    }
                    return dom;
                }
            },
            {
                title: '数据标识',
                dataIndex: 'property',
                key: 'property',
                width: '150px',
                render: (text,record) => {
                    let {property,bits} = record,
                        dom = [];

                    if (bits && bits.length > 0) {
                        bits.forEach( (item,index) => {
                            dom.push(<div key={index}>{item.property}</div>)
                        })
                    } else {
                        dom.push(<span key={0}>{property}</span>)
                    }
                    return dom;
                }
            },
            {
                title: '数据类别',
                dataIndex: 'dataTypeName',
                key: 'dataTypeName',
                width: '100px'
            },
            {
                title: '数据类型',
                dataIndex: 'javaType',
                key: 'javaType',
                width: '100px',
                render: (text,record) => {
                    let {bits} = record,
                        dom = [];

                    if (bits && bits.length > 0) {
                        bits.forEach( (item,index) => {
                            dom.push(<div key={index}>{setFuncDataType(item)}</div>)
                        })
                    } else {
                        dom.push(<span key={0}>{setFuncDataType(record)}</span>)
                    }
                    
                    return dom;
                }
            },
            {
                title: '数据属性',
                dataIndex: 'propertyValueDesc',
                key: 'propertyValueDesc',
                width: '200px',
                render: (text,record) => {
                    let {propertyValueDesc,bits,functionDataType,openByteProtocol,openByteProtocolList,property,length} = record,
                        dom = [];

                    if (bits && bits.length > 0) {
                        bits.forEach( (item,index) => {
                            dom.push(<div key={index}>{item.propertyValueDesc}</div>)
                        })
                    } else {

                        if (functionDataType === 10) {
                            dom.push(<div key={property}>{`${length}个${setFuncDataType(openByteProtocol)}子元素`}</div>)
                        } else if(functionDataType === 11 && openByteProtocolList) {
                            openByteProtocolList.forEach( (item,index) => {
                                dom.push(<div key={index}>{item.propertyValueDesc}</div>)
                            })
                        } else {   
                            dom.push(<span key={0}>{propertyValueDesc}</span>)
                        }
                    }
                    return dom;
                }
            },
            {
                title: dataTypeId == 2 ? '是否包含' : '数据区分',
                dataIndex: 'dataTypeId',
                key: 'dataTypeId',
                render: (text,record,index) => {
                    let {dataType} = record;

                    if ([2,3].includes(dataType)) {
                        return (
                            dataType == 2 ?
                            <span>
                                <Checkbox checked={this.state.actionTypeValues[index]} onChange={e => this.changeActionValues(index,e.target.checked,true)}>设备状态上传</Checkbox>
                            </span>
                            :
                            <span>
                                <Radio.Group value={this.state.actionTypeValues[index]} onChange={e => this.changeActionValues(index,e.target.value)}>
                                    <Radio value={0}>设备状态上传</Radio>
                                    <Radio value={1}>设备信息通知</Radio>
                                    <Radio value={2}>设备告警</Radio>
                                </Radio.Group>
                            </span>
                        )
                    }

                    return null
                }
            }
        ];
    }

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    }

    changeActionValues = (index,value,bl = false) => {

        let temp = [...this.state.actionTypeValues]

        temp[index] = bl ? !temp[index] : value

        this.setState({
            actionTypeValues:temp
        })
    }

    onOkHandle() {
        let { templates, productId, getProtocols,dataTypeId } = this.props,
            { selectedRowKeys,actionTypeValues} = this.state;

        if (selectedRowKeys.length > 0) {
            this.setState({
                okLoading: true
            })
            let selectProtocols = selectedRowKeys.map(key => {

                let temp = {
                    ...this.templatesList[key]
                }

                if (actionTypeValues[key] !== undefined) {

                    if (dataTypeId == 2) {
                        if (actionTypeValues[key]) {
                            temp.actionType = 0
                        }
                    } else {
                        temp.actionType = actionTypeValues[key]
                    }

                }

                return temp
            }),
                _templateList = cloneDeep(templates[0].templateList); // 新版接口，只会返回一个模板 所以这里用 templates[0]

            // 处理提交的数据 -- 此接口要上传所有的模板协议回去 WTF!!!
            selectProtocols.forEach(protocol => {
                let { dataTypeIndex, protocolIndex,complex,actionType } = protocol,
                    key = 'list';

                if (complex === 'array') { key = 'openArrayProtocolList'}
                if (complex === 'struct') { key = 'openStructProtocolList'}

                _templateList[dataTypeIndex][key][protocolIndex].isSelect = 1;

                if (actionType !== undefined) {
                    _templateList[dataTypeIndex][key][protocolIndex].actionType = actionType;
                }
            })

            post(Paths.addProtocolTemplates, {
                productId,
                templateId: this.templateId,
                data: JSON.stringify(_templateList)
            },{
                needVersion:1.1
            })
                .then(res => {
                    // 请求成功后，恢复state,关闭弹框
                    this.onCancelHandle()
                    // 父组件重新获取数据
                    getProtocols()
                })
                .finally(() => {
                    this.setState({
                        okLoading: false
                    })
                })
        } else {
            Notification({
                type:'warn',
                message: '操作异常',
                description: '请先选择数据'
            })
        }
    }

    onCancelHandle() {
        let { onCancel } = this.props;

        this.setState({
            selectedRowKeys: []
        })
        onCancel();
    }

    dealTemplateProtocol(lists) {
        if (lists.length === 0) {
            return lists;
        }
        let _lists = cloneDeep(lists),
            templateList = _lists[0].templateList,
            temp = [],
            {dataTypeId} = this.props;

        this.templateId = _lists[0].templateId;

        if (templateList) {
            templateList.forEach((item, itemIndex) => {
                let {dataTypeName,dataType,list,openArrayProtocolList,openStructProtocolList} = item,
                    dataTypeIndex = itemIndex;

                if (dataTypeId == dataType) {
                    if (list) {
                        list.forEach((protocol, index) => {
                            protocol.dataType = dataType;
                            protocol.dataTypeName = dataTypeName;
                            protocol.dataTypeIndex = dataTypeIndex; // 记录此index是为了方便提交数据时修改值
                            protocol.protocolIndex = index; // 记录此index是为了方便提交数据时修改值
                            protocol.complex = false;
        
                            if (!protocol.isSelect) {
                                temp.push(protocol);
                            }
                        })
                    }
    
                    if (openArrayProtocolList) {
                        openArrayProtocolList.forEach((protocol, index) => {
                            protocol.dataType = dataType;
                            protocol.dataTypeName = dataTypeName;
                            protocol.dataTypeIndex = dataTypeIndex; // 记录此index是为了方便提交数据时修改值
                            protocol.protocolIndex = index; // 记录此index是为了方便提交数据时修改值
                            protocol.complex = 'array';
                            protocol.functionDataType = 10
                            
                            if (!protocol.isSelect) {
                                temp.push(protocol);
                            }
                        })
                    }
    
                    if (openStructProtocolList) {
                        openStructProtocolList.forEach((protocol, index) => {
                            protocol.dataType = dataType;
                            protocol.dataTypeName = dataTypeName;
                            protocol.dataTypeIndex = dataTypeIndex; // 记录此index是为了方便提交数据时修改值
                            protocol.protocolIndex = index; // 记录此index是为了方便提交数据时修改值
                            protocol.complex = 'struct';
                            protocol.functionDataType = 11;
                            
                            if (!protocol.isSelect) {
                                temp.push(protocol);
                            }
                        })
                    }
                }
            })
        }

        return addKeyToTableData(temp);
    }

    render() {
        let { visible, templates } = this.props,
            { selectedRowKeys, okLoading } = this.state;

        this.templatesList = this.dealTemplateProtocol(templates);

        const rowSelection = {
            selectedRowKeys,
            fixed: 'right',
            onChange: this.onSelectChange,
        };

        return (
            <Modal
                visible={visible}
                className="self-modal fiexed-selected-right"
                width={1000}
                title="标准功能定义"
                okText="确定"
                confirmLoading={okLoading}
                onOk={this.onOkHandle.bind(this)}
                cancelText="取消"
                onCancel={this.onCancelHandle.bind(this)}
                centered={true}
                closable={false}
                destroyOnClose={true}
                maskClosable={false}>
                <p className="modal-content-p" style={{ 'marginBottom': '24px' }}>C-Life云基于在智能家电产品领域多年的经验积累，给很多类目的产品提供了标准的功能定义供您选用。</p>
                {
                    this.templatesList.length > 0
                        ? <Table pagination={false}
                            rowSelection={rowSelection}
                            columns={this.columns}
                            scroll={{ y: 300 }}
                            dataSource={this.templatesList}></Table>
                        : <NoSourceWarn tipText="没有标准功能"></NoSourceWarn>
                }
            </Modal>
        )
    }
}

export function TslModal ({
    visible,
    okLoading,
    onOkHandle,
    onCancelHandle,
    tslValue
}) {
    return (
        <Modal
            visible={visible}
            className="self-modal"
            width={500}
            title="查看物模型TSL"
            okText="导出模型文件"
            confirmLoading={okLoading}
            onOk={onOkHandle}
            cancelText="关闭"
            onCancel={onCancelHandle}
            centered={true}
            closable={false}
            destroyOnClose={true}
            maskClosable={false}
        >
            <div style={{padding:'12px'}}>
                {/* 可嵌入代码的编辑器 */}
                <AceEditor
                    mode="json"
                    theme="github"
                    height="500px"
                    width="100%"
                    value={tslValue}
                    showGutter={false}
                    showPrintMargin={false}
                    // enableBasicAutocompletion={true}
                    readOnly={true}
                    name="tsl-edit"
                    editorProps={{ $blockScrolling: true }}/>
            </div>
        </Modal>
    )
} 