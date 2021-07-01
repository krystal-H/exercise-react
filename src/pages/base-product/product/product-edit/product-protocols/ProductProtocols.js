// 产品-开发中-功能定义

import React, { Component } from 'react';
import { Tabs, Table, Divider, Button, Icon } from 'antd';
import { Notification} from '../../../../../components/Notification'
import { connect } from 'react-redux';
import { cloneDeep,isArray,isEqual } from 'lodash';
import { ActionCreator } from '../../store';
import { get, Paths, post } from '../../../../../api';
import {addKeyToTableData,countUpdateflag, parseConfigSteps,setFuncDataType} from '../../../../../util/util';
import { ProtocolAddForm, ProtocolDelete, AddStandardProtocol,TslModal } from './ProtocolModals';
import NoSourceWarn from '../../../../../components/no-source-warn/NoSourceWarn';
import DoubleBtns from '@src/components/double-btns/DoubleBtns';
import './ProductProtocols.scss';
import DebuggerModal from './DebuggerModal';
import LabelTip from '@src/components/form-com/LabelTip';

const { TabPane } = Tabs;

const NEED_UPDATE_FLAG_DATATYPE= ['2']; 

const mapStateToProps = state => {
    return {
        productProtocolLists: concatComplexProtocols(state.getIn(['product', 'productProtocolLists']).toJS().filter(item => !!item.dataTypeId)),
        productBaseInfo: state.getIn(['product', 'productBaseInfo']).toJS(),
        productConfigSteps: state.getIn(['product','productConfigSteps']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getProtocolLists: id => dispatch(ActionCreator.getProtocolLists(id)), // 获取产品协议列表
        getConfigSteps: id => dispatch(ActionCreator.getConfigSteps(id)),
        triggerDebugger: (visible, productId) => dispatch(ActionCreator.triggerDebugger(visible, productId)),   //  打开关闭协议脚本窗口
    }
}
// 建复杂协议和普通协议进行一个拼接，展示在同一个列表中
function concatComplexProtocols(productProtocolLists) {
    let _productProtocolLists = cloneDeep(productProtocolLists);

    return _productProtocolLists.map(item => {
        let {list,structDefVOList,arrayDefVOList} = item,
            allList = [];

        if(list){
            allList = [...list]
        }

        // 复杂协议的functionDataType可能对不上
        // complex用来标记此条协议是否是复杂协议
        if(arrayDefVOList) {
            allList = [...allList,...arrayDefVOList.map(item => {return {...item,functionDataType:10,complex:'array'}})]
        }
        if(structDefVOList) {
            allList = [...allList,...structDefVOList.map(item => {return {...item,functionDataType:11,complex:'struct'}})]
        }

        return {...item,allList};
    })
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ProductProtocols extends Component {
    state = {
        curDataTypeId:undefined, // 当前tab对应的协议类别
        curEditProtocol: [], //当前正在编辑的协议
        editVisible: false, // 控制编辑框展示状态
        addVisible: false,// 控制添加框展示状态
        deleteVisible: false, // 控制删除框展示状态
        addType: 'custom', // 添加类型 : 'custom'|'standard'
        addSLoading:false, // 添加标准功能按钮 loading状态控制字段
        addCLoading:false, // 添加自定义功能按钮 loading状态控制字段
        templates:[],  // 未加工过的模板数据
        protocolDictionaryCommonList:undefined, // 记录常用的协议字段列表
        toBeDelectedProtocols:[], // 点击删除时，记录需要被删除的协议
        toBeDelectedIndex:[],
        deleteConfirmLoading:false, // 确认删除时，提交请求的loading
        editConfirmLoading:false,
        addConfirmLoading:false,
        isChangeProductId:false, // 标记是否切换过产品
        isChangeDataTypeId:false, // 标记是否切换过协议tab
        isComplex:false, // 标记是否编辑的是复杂协议
        curDataTypeName:'',// 20200429 daguozi  新增记录dataTypeName字段，仅用于判断当前编辑的协议是（有默认值）否（无默认值） 配置数据
        tslModalVisible:false, // 控制tsl弹框
        tslComfirmLoading:false, // tsl弹框loading
        tslValue: '', // tsl弹框默认中展示的数据
        curTemplates:[] // 当前类型的模板数据 - 此处是充当自定义协议的物标签数据源
    }
    constructor(props) {
        super(props);

        this.recordProtocols = {}
        // 表格columns
        this.columns = [
            {
                title: '来源区分',
                dataIndex: 'isTemplateField',
                key: 'isTemplateField',
                width:'90px',
                render: (text, record, index) => {
                    let {isTemplateField} = record;
                    
                    return <span>{isTemplateField ? '标准': '自定义'}</span>
                }
            },
            {
                title: '数据名称',
                dataIndex: 'propertyName',
                key: 'propertyName',
                // width:'175px',
                render: (text, record, index) => {
                    let {recordResult} = record;

                    const obj = {
                      children: this.dealWhatToShow(record,index,'propertyName') ,
                      props: {},
                    };

                    if (recordResult.isArray) {
                        if (recordResult.isFirst) {
                            obj.props.rowSpan = recordResult.length;
                        } else {
                            obj.props.rowSpan = 0;
                        }
                    }

                    return obj;
                }
            },
            {
                title: '数据标识',
                dataIndex: 'property',
                key: 'property',
                // width:'220px',
                render: (text, record, index) => {
                    return this.dealWhatToShow(record,index,'property')
                }
            },
            {
                title: '数据类型',
                dataIndex: 'javaType',
                key: 'javaType',
                // width:'92px',
                render: (text, record, index) => {
                    return this.dealWhatToShow(record,index,'javaType',true)
                }
            },
            {
                title: '数据区分', // @lei 此字段是因为物模型需求添加的
                dataIndex: 'actionType',
                key: 'actionType',
                // width:'200px',
                render: (text, record, index) => {
                    let {actionType} = record;
                    return <span>{actionType !== undefined ? ['设备状态上传','设备信息通知','设备告警'][actionType] : '--'}</span>
                }
            },
            {
                title: '物标签', // @lei 此字段是因为物模型需求添加的
                dataIndex: 'thingLabelName',
                key: 'thingLabelName',
                // width:'200px'
            },
            {
                title: '数据长度',
                dataIndex: 'length',
                key: 'length',
                // width:'100px',
                render: (text, record, index) => {
                    return this.dealWhatToShow(record,index,'length')
                }
            },
            {
                title: '数据属性',
                dataIndex: 'propertyValueDesc',
                key: 'propertyValueDesc',
                render: (text, record, index) => {
                    return this.dealWhatToShow(record,index,'propertyValueDesc')
                }
            },
            // {
            //     title: '备注',
            //     dataIndex: 'remark',
            //     key: 'remark',
            //     width:'160px',
            //     render: (text, record, index) => {
            //         let {recordResult} = record;

            //         const obj = {
            //           children: this.dealWhatToShow(record,index,'remark') ,
            //           props: {},
            //         };

            //         if (recordResult.isArray) {
            //             if (recordResult.isFirst) {
            //                 obj.props.rowSpan = recordResult.length;
            //             } else {
            //                 obj.props.rowSpan = 0;
            //             }
            //         }

            //         return obj;
            //     }
            // },
            {
                title: '操作',
                key: 'action',
                width:'110px',
                render: (text, record, index) => {
                    let {property,recordResult} = record;

                    const obj = {
                      children: ['Base_Null_Reserved_Null','updateFlag'].includes(property) ? 
                      <span></span> :
                      (
                          <span>
                              <a onClick={this.openEditProtocol.bind(this, record)}>编辑</a>
                              <Divider type="vertical" />
                              <a  onClick={this.deleteProtocol.bind(this, record)}>删除</a>
                          </span>
                      ) ,
                      props: {},
                    };

                    if (recordResult.isArray) {
                        if (recordResult.isFirst) {
                            obj.props.rowSpan = recordResult.length;
                        } else {
                            obj.props.rowSpan = 0;
                        }
                    }

                    return obj;
                }
            }
        ];
        this.columnsSript = [
            {title: "名称", dataIndex: "name", width: "20%"},
            {title: "备注", dataIndex: "remark", width: "30%"},
            {title: "更新时间", dataIndex: "updateTime", width: "30%"},
            {title: "操作", width: "10%", render: () => (
                <a>下载</a>
            )},
        ]
    }
    componentDidMount() {
        this.getProtocols();

        setTimeout( () => {
            // 没有保存过步骤信息，则进行更新
            if (!this.getConfigSteps()){
                let {productId,getConfigSteps} = this.props,
                oldConfigInfo = {},
                _data = {
                    productId,
                    type:1
                };
    
                if (this.configs) {
                    oldConfigInfo = this.configs.configInfo;
                    _data.stepId = this.configs.stepId;
                }
    
                _data.configInfo = JSON.stringify({
                    ...oldConfigInfo,
                    loaded:true
                })
    
                post(Paths.saveConfigSteps,_data).then(
                    res => getConfigSteps(productId)
                )
            }
        },10 * 1000)
    }
    componentDidUpdate() {
        let { productId,productProtocolLists } = this.props,
            {curDataTypeId} = this.state;

        if (productId && productId !== this.lastProductId) { // 切换产品
            if (this.lastProductId !== undefined) {
                this.setState({
                    isChangeProductId:true
                })
            }
            this.getProtocols();
        }

        if (curDataTypeId === undefined && productProtocolLists.length > 0) {
            curDataTypeId = productProtocolLists[0].dataTypeId;
            // 此处日志是为了定位一个线上偶现BUG
            console.log("ProductProtocols -> componentDidUpdate -> curDataTypeId", curDataTypeId)
            this.lastDataTypeId = curDataTypeId;
            this.setState({
                curDataTypeId
            })
        }
    }
    // 解析实际的协议内容
    dealWhatToShow(record,index,key,isFuncDatatype) {
        // 普通协议
        let realRecords = [record];

        // 位协议
        if (record.bitDefList) {
            realRecords = record.bitDefList;
        }

        // 结构体
        if (record.complex === 'struct' && key === 'propertyValueDesc') {
            realRecords = record.byteDefVOList
        }

        return (<div key={index}>
            {
                realRecords.map((item,_index) => {
                    return !isFuncDatatype ? <div key={_index}>{this.getWhatToshow(item,key) || ''}</div> : <div key={_index}>{setFuncDataType(item)}</div>
                })
            }
        </div>)
    }
    getWhatToshow (record,key) {
        let {complex} = record;

        if (key === 'length') {
            if (complex === 'array') {
                if(record.byteDefVO  && record.byteDefVO.length) {
                    return record.length * record.byteDefVO.length
                }
            }
            if (complex === 'struct') {
                if(record.byteDefVOList && record.byteDefVOList.length > 0) {
                   let t = 0;
                   record.byteDefVOList.forEach(item => {
                       t+=item.length
                   })
                   return t
                }
            }
        }

        if (key === 'propertyValueDesc') {
            if (complex === 'array') {
                let {length,byteDefVO} = record;

                return `${length}个${setFuncDataType(byteDefVO)}子元素`
            }
        }

        return  record[key]

    } 
    /* 判断协议是否存在多个同名的情况，需要一起操作（编辑，删除） */
    /* 所谓多协议 指的是同名的协议 协议的协议名是唯一的，同协议名的做同一件事情 */ 
    isArrayInRecordProtocols (record) {
        let {propertyName,dataTypeIndex,property} = record,
            _recordProtocol = this.recordProtocols[`protocolsInDatatype${dataTypeIndex}`],
            result = {
                isArray:false, //是否是多协议
                isFirst:false, // 是否是第一个
                length:null, // 多协议的长度
                array:null // 多协议所有的子协议
            };
        // propertyName为空的不记录，防止不相关的协议记录到一起
        if ( propertyName && _recordProtocol && _recordProtocol[propertyName] && isArray(_recordProtocol[propertyName])) {
            result.isArray = true
            result.array = _recordProtocol[propertyName]
            result.length = _recordProtocol[propertyName].length;
            if (result.length > 0 && _recordProtocol[propertyName][0].property === property) {
                result.isFirst = true
            }
        }

        return result;
    }
    // @lei 记录创建产品时，进行到了哪一步。 协议这一块儿，初次创建时，服务端会塞一些数据，也是通过此字段记录是否进行过
    getConfigSteps = () => {
        let {productConfigSteps} = this.props,
            configs = parseConfigSteps(productConfigSteps,1);

        if (configs) {
            this.configs = configs;
        }
        return configs;
    }
    // 获取常用协议字段列表
    getProtocolDictionaryCommonList(needAddloading){
        let {curDataTypeId} = this.state,
            {deviceTypeId} = this.props.productBaseInfo;

        if(!curDataTypeId) {
            Notification({
                type:'error',
                message: '缺少参数',
                description:'没有获取到dataTypeId'
            })
            return;
        }

        if (needAddloading) {
            this.setState({
                addCLoading:true
            })
        }

        return get(Paths.getProtocolDictionaryCommonList,{
            dataTypeId:curDataTypeId,
            deviceTypeId
        })
    }
    // 获取产品协议列表
    getProtocols() {
        let { productId, getProtocolLists,getConfigSteps } = this.props;
        if (productId) {
            this.lastProductId = productId; // 记录当前的产品ID
            getProtocolLists(productId);
            getConfigSteps(productId);
        }
    }
    // 过滤表格中所需要展示的数据
    // 并且为协议添加 dataTypeIndex recordResult 字段，这两个字段在后续逻辑中很重要，但是在上传协议时，记得一定要删除，否则会报错
    filterProtocol(list,type,dataTypeIndex) {
        let temp = list.filter(item => type ? item.isTemplateField : !item.isTemplateField),
            _temp = cloneDeep(temp);

        return   _temp.map(item => {
                    item.dataTypeIndex = dataTypeIndex;
                    item.recordResult = this.isArrayInRecordProtocols(item)
                    return item;
                });
    }
    /* 会把同名的协议用数组记录下来 */
    recordSamePropertyNameProtocols (protocolsList = []) {
        let _protocolList = cloneDeep(protocolsList);     
        _protocolList.forEach((protocols,index) => {
            let temp = {};
            if (protocols.allList) {
                protocols.allList.forEach(item => {
                    let {propertyName} = item;
                    
                    if (propertyName) {
                        item.dataTypeIndex = index;

                        if(!temp[propertyName]) {
                            temp[propertyName] = item;
                        } else {
                            if(!isArray(temp[propertyName])) {
                                temp[propertyName] = [temp[propertyName],item]
                            } else {
                                temp[propertyName].push(item)
                            }
                        }
                    }
                })
    
                let old = this.recordProtocols[`protocolsInDatatype${index}`];
    
                if (old){
                    this.recordProtocols[`protocolsInDatatype${index}`] = Object.assign({},old,temp)
                } else {
                    this.recordProtocols[`protocolsInDatatype${index}`] = temp;
                }
            }
        })
    }
    /* 记录当前已存在的协议名称 */
    recordExistedPropertyNames () {
        let {productProtocolLists} = this.props,
            {curDataTypeId} = this.state,
            temp = [];

        if (productProtocolLists && curDataTypeId !== undefined) { // 页面刚渲染时，可能没有这两个参数
            let _protocolList = this.getListByDataTypeId();
        
            if (_protocolList && _protocolList.allList) {
                _protocolList.allList.forEach(item => {
                    temp.push(item.propertyName);
                })
            }
        }

        this.existedPropertyNames = temp;
    }
    /**
     * 返回协议展示的表单
     * @param {Object} protocols 待处理的协议对象 （对应于 控制/运行 层级）
     * @param {number} type 展示类型 标准功能：1，非标准功能：0
     * @param {number}} dataTypeIndex 在总协议数组中的index -用于删除时提交整个对象
     */
    getTable (protocols,dataTypeIndex) {
        let temp1 = this.filterProtocol(protocols.allList || [],1,dataTypeIndex), // 标准
            temp2 = this.filterProtocol(protocols.allList || [],0,dataTypeIndex), // 自定义
            temp = [...temp1,...temp2];

        temp = addKeyToTableData(temp).filter(item => item.property !== 'updateFlag');
        
        let _columns = cloneDeep(this.columns);
        if (!this.props.canOperate) {
            _columns.pop();
        }

        if (this.state.curDataTypeId == 2) {
            _columns[4]['title'] = '是否包含';
            _columns[4]['width'] = '90px';
        }

        return (temp.length > 0) 
        ? <Table
            pagination={false}
            columns={_columns}
            className={`ant-table-fixed protocol-content-table`}
            dataSource={temp} />
        : <NoSourceWarn tipText="暂无功能数据"></NoSourceWarn>
    }
    // tab切换时，记录当前的dataTypeId信息
    /**  
        20200429 by daguozi  新增记录dataTypeName字段；
        仅用于判断当前编辑的协议是（有默认值）否（无默认值） 配置数据；
        后台开发说用dataType==5来判断是否配置数据，但是dataType会不会像dataTypeId一样最后被玩坏到不能做为一个“id”；
        实在不想再掺和 dataType 和 dataTypeId 混乱关系之中， 所以这里简单粗暴的用 协议名称 字符串“配置数据” 来判断
    
    */ 
    tabChangeHandle(protocols){
        let {dataTypeId,dataTypeName} = protocols;
        if (this.lastDataTypeId !== undefined && this.lastDataTypeId != dataTypeId){
            this.lastDataTypeId = dataTypeId;
            this.setState({
                isChangeDataTypeId:true
            })
        }
        this.setState({
            curDataTypeId:dataTypeId,
            curDataTypeName:dataTypeName
        })
    }
    getListByDataTypeId () {
        let {productProtocolLists} = this.props,
        {curDataTypeId} = this.state,
        _protocols = productProtocolLists.filter(item => item.dataTypeId == curDataTypeId);

        if(_protocols.length === 0) {
            console.log('未取到对应类型的协议 - curDataTypeId -' + curDataTypeId);
        }

        return cloneDeep(_protocols[0] || {})
    }
    getIndexInProtocolList (protocolArray,isBitDefList,isComplex) {
        let protocols = this.getListByDataTypeId(),
            _protocolArray = cloneDeep(protocolArray);

        if (isBitDefList) {
            let _temp = [];

            protocols.list.forEach((protocol,index) => {

                _protocolArray.forEach(item => delete item.dataTypeIndex);

                if (isEqual(protocol.bitDefList,_protocolArray)) {
                    _temp.push(index)
                }
            })
            return _temp;
        } else {
            let _lists = protocols.list;
            if(isComplex === 'array') {
                _lists = protocols.arrayDefVOList                
            } 

            if(isComplex === 'struct') {
                _lists = protocols.structDefVOList                
            } 

            let lists = _lists.map(item => item.property);

            return protocolArray.map((protocol) => lists.indexOf(protocol.property))
        }
    }
    isBitProtocol (protocol) {
        return !!protocol.bitDefList;
    }
    getCurOperateProtocolAndIndex (record) {
        let _record = [record],
        result = null,
        curProtocol = null,
        protocolIndex = null,
        isBitDefList = false;

        if (this.isBitProtocol(record)) {
            let {dataTypeIndex} = record,
                _bitDefList = cloneDeep(record.bitDefList);

            // 此处为 位协议添加 dataTypeIndex 字段，后续编辑和删除逻辑会用上
            _record = _bitDefList.map(item => {
                item.dataTypeIndex = dataTypeIndex;
                return item
            })

            isBitDefList = true;
        }

        result = this.isArrayInRecordProtocols(record);
        curProtocol = result.isArray ? cloneDeep(result.array) : cloneDeep(_record);
        protocolIndex = this.getIndexInProtocolList(curProtocol,isBitDefList,record.complex);

        return {
            curProtocol,
            protocolIndex,
            isBitDefList,
            isComplex: record.complex || false
        }
    }
    // 编辑
    openEditProtocol = (record) => {
        let {isChangeProductId,protocolDictionaryCommonList,isChangeDataTypeId} = this.state,
            curProtocolAndIndex = this.getCurOperateProtocolAndIndex(record),
            {curProtocol,protocolIndex,isBitDefList,isComplex} = curProtocolAndIndex;

            
        if (isChangeProductId || isChangeDataTypeId || protocolDictionaryCommonList === undefined) {
            this.getProtocolDictionaryCommonList().then(res => {
                let {data} = res;
    
                this.setState({
                    protocolDictionaryCommonList:data,
                    curEditProtocol:curProtocol,
                    editProtocolIndex:protocolIndex,
                    isChangeDataTypeId:false,
                    isChangeProductId:false,
                    editVisible: true,
                    isBitDefList,
                    isComplex
                })
            })
        } else {
            this.setState({
                curEditProtocol:curProtocol,
                editProtocolIndex:protocolIndex,
                editVisible: true,
                isBitDefList,
                isComplex
            })
        }
    }
    editHandle = (protocols) => {        
        let oldProtocols = this.getListByDataTypeId(),
            {editProtocolIndex,isBitDefList,isComplex} = this.state;

        if (isBitDefList) {
            editProtocolIndex.forEach((item,index) => {
                oldProtocols.list[item].bitDefList = protocols;
            }); 
        } else {
            let key = 'list';

            if (isComplex === 'array') {
                key = 'arrayDefVOList'
                if (protocols[0].byteDefVO) {
                    protocols[0].functionDataType = protocols[0].byteDefVO.functionDataType
                }
            } else if(isComplex === 'struct') {
                key = 'structDefVOList'
            }

            oldProtocols[key] = oldProtocols[key].filter((item,index) => !editProtocolIndex.includes(index));
            oldProtocols[key].splice(editProtocolIndex[0],0,...protocols);
        }

        // editProtocolIndex.forEach((item,index) => {
        //     if (isBitDefList) {
        //         oldProtocols.list[item].bitDefList = protocols;
        //     } else {
        //         oldProtocols.list[item] = protocols[index];
        //     }
        // });

        // if (oldProtocols.list) {
        //     // 防止多协议修改为单协议
        //     oldProtocols.list = oldProtocols.list.filter(item => item != undefined);
        // }

        this.setState({
            isBitDefList:false,
            isComplex:false,
            editConfirmLoading:true
        })

        this.saveProtocol(oldProtocols).finally( () => {
            this.setState({
                editConfirmLoading:false,
                editVisible:false
            })
        })
    }
    getTemplates = (productId) => {
        return (
            get(Paths.getProtocolTemplates,{
                productId
            },{
                needVersion:1.1
            }).then(data => {
                let {lists} = data.data;

                if (!lists) {
                    lists = []
                }

                return lists
            })
        )
    }
    // 自定义、标准功能添加
    openAddProtocol = (type = 'custom') => {
        let {productId} = this.props;
        if(type === 'standard') { // 标准功能
            this.setState({
                addSLoading:true
            });

            this.getTemplates(productId).then(lists => {

                this.setState({
                    addType: type,
                    addVisible: true,
                    templates:lists
                })
            }).finally(() => {
                this.setState({
                    addSLoading:false
                })
            })

        } else {// 自定义功能
            let {isChangeProductId,protocolDictionaryCommonList,isChangeDataTypeId,curDataTypeId} = this.state;
            if (isChangeProductId || isChangeDataTypeId || protocolDictionaryCommonList === undefined) {
                this.getProtocolDictionaryCommonList(true).then(res => {
                    let {data} = res;
        
                    this.setState({
                        protocolDictionaryCommonList:data,
                        addType: type,
                        isChangeDataTypeId:false,
                        isChangeProductId:false,
                        addVisible: true
                    })
                }).finally( () => {
                    this.setState({
                        addCLoading:false
                    })
                })

                this.getTemplates(productId).then(lists => {

                    let _list = []

                    if(lists[0] && lists[0].templateList) {
                        _list = lists[0].templateList.filter(item => item.dataType == curDataTypeId)
                    }

                    this.setState({
                        curTemplates:(_list[0] && _list[0].list) || []
                    })
                })
            } else {
                this.setState({
                    addType: type,
                    addVisible: true
                })
            }
        }
    }
    addCustomHandle = (protocols,isComplex) => {
        let oldProtocols = this.getListByDataTypeId(),
            list= oldProtocols.list || [];
        if (isComplex) {
            let {functionDataType,byteDefVO} = protocols[0],
                complexKey = ['arrayDefVOList','structDefVOList'][functionDataType - 10];

            if(functionDataType == 10 && byteDefVO) {
                protocols[0].functionDataType = byteDefVO.functionDataType
            }

            oldProtocols[complexKey] = [...(oldProtocols[complexKey] || []),...protocols]
            
        } else{
            oldProtocols.list = [...list,...protocols];
        }
        
        this.setState({
            addConfirmLoading:true
        })

        this.saveProtocol(oldProtocols).finally( () => {
            this.setState({
                addConfirmLoading:false,
                addVisible:false
            })
        })
    }

    close(modal) {
        this.setState({
            [modal]: false
        })
    }
    deleteProtocol(protocol,event) {
        let curProtocolAndIndex = this.getCurOperateProtocolAndIndex(protocol),
        {curProtocol,protocolIndex,isComplex} = curProtocolAndIndex;
  
       this.setState({
            deleteVisible: true,
            toBeDelectedProtocols:curProtocol,
            toBeDelectedIndex:protocolIndex,
            isComplex
        })
    }
    updateflagToEnd (list) {
        let propertyList = list.map(item => item.property),
            indexs = [];
        indexs[0] = propertyList.indexOf('Base_Null_Reserved_Null');
        indexs[1] = propertyList.indexOf('updateFlag');

        let _list = list.filter(item => {
            return !['Base_Null_Reserved_Null','updateFlag'].includes(item.property);
        })

        if(indexs[0] > 0) {
            _list.push(list[indexs[0]])
        }

        if(indexs[1] > 0) {
            _list.push(list[indexs[1]])
        }


        return _list;
    }
    // 16进制类型的协议，需要控制所有字段的长度和为16的倍数
    dealUpdateProtocols (list,needUpdateFlag,_isComplex) {
        let _list = cloneDeep(list),
            propertyList = list.map(item => item.property),
            countResult = {},
            {productBaseInfo} = this.props;

        if (productBaseInfo && (productBaseInfo.protocolFormat === 1) && !_isComplex) { //CLink标准数据格式（十六进制）
    
            // 控制数据，需要updateFlag
            if (needUpdateFlag) {
    
                if (propertyList.indexOf('updateFlag') < 0) {
                    _list.push({
                        ignore: false,
                        javaType: "HEXSTRING",
                        length: 0,
                        property: "updateFlag",
                        propertyName: "功能变更",
                        propertyValueDesc: "",
                        propertyValueType: "",
                        unit: "",
                    })
                }
                _list = this.updateflagToEnd(_list);
                // 更新 propertyList
                propertyList = _list.map(item => item.property);
                countResult = countUpdateflag(_list);

                if ((countResult.add !== 0) && propertyList.indexOf('Base_Null_Reserved_Null') < 0) {
                    _list.push({
                        bitDefList: null,
                        commonName: "基础功能_保留",
                        functionDataType: 1,
                        gap: null,
                        ignore: true,
                        isSigned: 0,
                        isTemplateField: 0,
                        javaType: "STRING",
                        length: 0,
                        loop: null,
                        mulriple: null,
                        property: "Base_Null_Reserved_Null",
                        propertyName: "保留字",
                        propertyValueDesc: "",
                        propertyValueType: "ENUM",
                        remark: "",
                        unit: null
                    })
                    // 更新 propertyList
                    propertyList = _list.map(item => item.property)
                }
          
                // 计算字节长度
                _list.forEach(item => {
                    if (needUpdateFlag) {
                        if (item.property == 'Base_Null_Reserved_Null') {
                            if(item.length >= countResult.sub && countResult.sub > 0) {
                                item.length -= countResult.sub;
                                this.countType = 'sub';
                            }else {
                                item.length += countResult.add;
                                this.countType = 'add';
                            }
                        }
            
                        if (item.property == 'updateFlag') {
                            item.length = this.countType === 'sub' ? countResult.subupdateflag : countResult.addupdateflag;
                            this.countType = undefined;
                        }
                    }
                })
            } else {
                // 非控制数据
               let allLength =  _list.map(item => item.length).reduce((a,b) => a + b),
                   surplus = allLength % 16;

               if (surplus !== 0) {     
                    if (propertyList.indexOf('Base_Null_Reserved_Null') < 0) {
                        _list.push({
                            bitDefList: null,
                            commonName: "基础功能_保留",
                            functionDataType: 1,
                            gap: null,
                            ignore: true,
                            isSigned: 0,
                            isTemplateField: 0,
                            javaType: "STRING",
                            length: 16 - surplus,
                            loop: null,
                            mulriple: null,
                            property: "Base_Null_Reserved_Null",
                            propertyName: "保留字",
                            propertyValueDesc: "",
                            propertyValueType: "ENUM",
                            remark: "",
                            unit: null
                        })
                        // 更新 propertyList
                        propertyList = _list.map(item => item.property)
                    } else {
                        let temp = _list[propertyList.indexOf('Base_Null_Reserved_Null')];

                        if (temp.length  >= surplus) {
                            temp.length -= surplus;
                        }  else {
                            temp.length += surplus;
                        }
                    }
               }
            }

            // 保留字长度为0时，删除掉
            if (propertyList.indexOf('Base_Null_Reserved_Null') > 0) {

                let temp = _list[propertyList.indexOf('Base_Null_Reserved_Null')]

                if (temp.length  === 0){
                    _list = _list.filter(item => item.property !== 'Base_Null_Reserved_Null')
                }
            }
        }

        _list.forEach(item => { // 补字段，删除无用字段
            if (!item.propertyValueType && item.property !== 'updateFlag' && !_isComplex) {
                if (item.propertyValueDesc) {
                    if (item.propertyValueDesc.indexOf('~') > -1) {
                        item.propertyValueType = 'RANGE'
                    } else if (item.propertyValueDesc.indexOf('|') > -1){
                        item.propertyValueType = 'ENUM'
                    } else {
                        item.propertyValueType = 'BOTH'
                    }
                } else {
                    item.propertyValueType = 'BOTH'
                }
            }

            // 删除自定义字段,否则会导致协议校验不通过
            delete item.dataTypeIndex;
            delete item.key;
            delete item.recordResult;
            delete item.complex

            if (item.bitDefList) {
                item.bitDefList.forEach(_item => {
                    delete _item.dataTypeIndex
                })
            }
        })

        return _list
    }
    saveProtocol (protocols) {
        let {dataType,dataTypeId,productId,protocolFormat,protocolId,list,arrayDefVOList = null,structDefVOList = null} = protocols; 
        
        list =  this.dealUpdateProtocols(list,NEED_UPDATE_FLAG_DATATYPE.includes('' + dataType));

        if (arrayDefVOList && arrayDefVOList.length > 0) {
            arrayDefVOList = this.dealUpdateProtocols(arrayDefVOList,false,true)
        }
        if (structDefVOList && structDefVOList.length > 0) {
            structDefVOList = this.dealUpdateProtocols(structDefVOList,false,true)
        }
 
        return post(Paths.saveProtocol,{
            dataType,
            dataTypeId,
            productId,
            protocolFormat,
            protocolId,
            list,
            arrayDefVOList,
            structDefVOList
        },{
            needJson:true,
            noInstance:true
        }).then(
            res => {
                // 重新拉取数据
                this.getProtocols()
            }
        )
    }
    deleteOkHandle = (needClose = true) => {
        let {toBeDelectedProtocols,toBeDelectedIndex,isComplex} = this.state,
        {productProtocolLists} = this.props,
        {dataTypeIndex} = toBeDelectedProtocols[0];

      
        if(needClose) {
            this.setState({
                deleteConfirmLoading:true
            })
        }
        
        let temp = cloneDeep(productProtocolLists[dataTypeIndex]),
            key = 'list';

        if (isComplex === 'array') {
            key = 'arrayDefVOList'
        } else if(isComplex === 'struct') {
            key = 'structDefVOList'
        }

        // 过滤掉需要被删除的协议
        temp[key]= temp[key].filter((item,index) => !toBeDelectedIndex.includes(index))

        this.saveProtocol(temp).finally( () => {
            if(needClose) {
                this.setState({
                    deleteVisible: false,
                    deleteConfirmLoading:false,
                    isComplex:false
                })
            }
        })
    }
    // 下一步   硬件开发
    goToNextTab = () => {
        let {history,productId} = this.props
        history.push({
            pathname: `/open/base/product/edit/${productId}/projectSelect`
        })
    }
    // 上一步   基础信息
    goToPreTab = () => {
        let {history,productId} = this.props
        history.push({
            pathname: `/open/base/product/edit/${productId}/info`
        })
    }
    exportProtocols = () => {
        let {productId} = this.props,
        url = Paths.exportProtocol + '?productId=' + productId
        
        window.location.href = url;
    }
    openTSLModal = () => {
        let {productId} = this.props

        get(Paths.getTsl,{
            productId
        }).then( (data) => {
            this.setState({
                tslModalVisible:true,
                tslValue: JSON.stringify(JSON.parse(data.data || ''),null,'\t')
            })
        })
    }
    exportTSL = () => {
        let {productId} = this.props,
        url = Paths.exportTsl + '?productId=' + productId
        
        window.location.href = url;
    }
    closeTsl = () => {
        this.setState({
            tslModalVisible:false,
            tslComfirmLoading:false
        })
    }
    render() {
        let { isComplex,curEditProtocol, editVisible, addVisible,editConfirmLoading, addConfirmLoading,deleteVisible,curDataTypeName, curDataTypeId,addType,addSLoading,addCLoading,templates,curTemplates,deleteConfirmLoading,protocolDictionaryCommonList,tslModalVisible,tslComfirmLoading,tslValue} = this.state,
        { productProtocolLists,productId,productBaseInfo, canOperate} = this.props,
        { deviceTypeId,protocolFormat} = productBaseInfo;
        console.log(productProtocolLists, 'listaaaaa')

        // 记录同propertyName的协议，在合并展示，一起编辑/删除时会用到 this.recordProtocols 记录的数据
        this.recordSamePropertyNameProtocols(productProtocolLists);
        // 记录当前dataTypeId下所有协议的名称
        this.recordExistedPropertyNames(productProtocolLists);

        return (
            <div className="product-protocol-wrapper">
                {
                    productProtocolLists.length ?
                    <div className="export-wrapper">
                        <span onClick={this.openTSLModal}><Icon type="book" /> 查看物模型TSL</span>
                        <span  onClick={this.exportProtocols}><Icon type="export" /> 导出完整协议</span>
                    </div> : null
                }
                <Tabs 
                    onChange={activeKey => {this.tabChangeHandle(productProtocolLists[activeKey])}}
                    defaultActiveKey="0">
                        {
                            productProtocolLists.map((protocols, index) =>
                                <TabPane 
                                    tab={protocols.dataTypeName} 
                                    key={index}>
                                        <div className="protocol-item gray-bg">
                                            <div className="standard-protocols">
                                                {/* <>                                 
                                                    <span className="protocol-name">功能</span>
                                                    {
                                                        protocolFormat == 1 &&
                                                        <LabelTip tipPlacement="right" tip="该产品使用CLink标准数据格式（十六进制），每类功能协议数据长度必须满足16字节的整数倍，平台将自动填充保留字段以满足长度规范。"/>
                                                    }
                                                </> */}
                                                {
                                                    canOperate && 
                                                    <div style={{overflow:'hidden'}}>
                                                        <Button className="float-right"
                                                            onClick={() => { this.openAddProtocol('standard') }}
                                                            type="ghost"
                                                            loading={addSLoading}>标准功能添加</Button>
                                                        <Button onClick={() => { this.openAddProtocol('custom') }}
                                                                className="float-right"
                                                                style={{marginRight:'24px'}}
                                                                loading={addCLoading}
                                                                type="ghost">自定义功能添加</Button>
                                                    </div>
                                                }
                                                {
                                                    this.getTable(protocols,index)
                                                }
                                            </div>
                                            {/* 自定义透传才有协议脚本 */}
                                            {
                                                protocolFormat == 3 && 
                                                <div className="protocol-script">
                                                    <span className="protocol-name">数据解析</span>
                                                    <div className="protocol-script-content">
                                                        <div className="protocol-script-title">数据解析脚本</div>
                                                            <div className="protocol-script-example">
                                                                <span>支持开发者自定义解析脚本，将设备上下行的数据，分别解析成平台定义的标准数据格式。</span>
                                                                <Button type="primary" className="protocol-script-btn" onClick={this.props.triggerDebugger.bind(this, true, productId)}>调试上传脚本</Button>
                                                            </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                </TabPane>
                            )
                        }
                </Tabs>
                {/* 上一步、下一步 */}
                {
                    canOperate 
                    ? <div className="com-footer">
                        <DoubleBtns
                            preHandle={this.goToPreTab}
                            nextHandle={this.goToNextTab}
                        ></DoubleBtns>
                    </div>:
                    null
                }     
                           {/* 功能添加弹窗 */}
                {
                    addVisible && 
                    <React.Fragment>
                        {
                            addType === 'custom'
                                ? <ProtocolAddForm 
                                        modalType = 'add'
                                        visible={addVisible} 
                                        addCustomHandle={this.addCustomHandle}
                                        protocolDictionaryCommonList={protocolDictionaryCommonList}
                                        deviceTypeId={deviceTypeId}
                                        existedPropertyNames={this.existedPropertyNames} 
                                        dataTypeId={curDataTypeId} 
                                        dataTypeName={curDataTypeName}
                                        confirmLoading={addConfirmLoading}
                                        templates={curTemplates} 
                                        onCancel={this.close.bind(this, 'addVisible')}>
                                        </ProtocolAddForm>
                                : <AddStandardProtocol 
                                        visible={addVisible} 
                                        templates={templates}
                                        productId={productId}
                                        dataTypeId={curDataTypeId} 
                                        getProtocols={this.getProtocols.bind(this)}
                                        onCancel={this.close.bind(this, 'addVisible')}></AddStandardProtocol>
                        }
                    </React.Fragment>
                }
                {/* 自定义功能编辑和新增使用同一个Form，但是分别由 editVisible 和 addVisible 控制状态*/}
                {
                    editVisible && 
                    <ProtocolAddForm
                        modalType = 'edit' 
                        curEditProtocol={curEditProtocol}
                        isComplex={isComplex}
                        protocolDictionaryCommonList={protocolDictionaryCommonList}
                        deviceTypeId={deviceTypeId}
                        dataTypeId={curDataTypeId}
                        dataTypeName={curDataTypeName}
                        existedPropertyNames={this.existedPropertyNames.filter(item => item !== curEditProtocol[0].propertyName)}  
                        editHandle={this.editHandle}
                        visible={editVisible}
                        confirmLoading={editConfirmLoading} 
                        onCancel={this.close.bind(this, 'editVisible')}></ProtocolAddForm>
                }
                {
                    deleteVisible &&
                    <ProtocolDelete visible={deleteVisible} deleteConfirmLoading={deleteConfirmLoading} deleteOkHandle={this.deleteOkHandle} propertyName={this.state.toBeDelectedProtocols[0].propertyName} deleteCancelHandle={this.close.bind(this, 'deleteVisible')}></ProtocolDelete>
                }
                {
                    TslModal &&
                    <TslModal visible={tslModalVisible} okLoading={tslComfirmLoading} onOkHandle={this.exportTSL} onCancelHandle={this.closeTsl} tslValue={tslValue}></TslModal>
                }
                <DebuggerModal productId={productId} canOperate={canOperate}/>
            </div>
        )
    }
}
