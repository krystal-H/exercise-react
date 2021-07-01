import React, { Component } from 'react'
import { Button, Icon, Input, Divider,Table } from 'antd'
import { Notification} from '../../../../../../../components/Notification'
import {cloneDeep,flattenDepth} from 'lodash'
import { addKeyToTableData, uniqueItemInArrayByKey} from '../../../../../../../util/util';
import {Paths,post, get} from '../../../../../../../api';
import ActionConfirmModal from '../../../../../../../components/action-confirm-modal/ActionConfirmModal';
import AloneSection from '../../../../../../../components/alone-section/AloneSection';
import FlowChart from '../../../../../../../components/flow-chart/FlowChart';
import {BatchAddForm,CustomForm,ApproverModal,LinkProtocolsForm} from './SceneModals';
import DoubleBtns from '../../../../../../../components/double-btns/DoubleBtns';
import {SceneType,SceneStatus} from '../../../../../../../configs/text-map';
 
// const { Search } = Input;
const NOT_IN_ACTIONS = ['Base_Null_Reserved_Null','updateFlag']; // 控制数据中需要过滤掉的字段

const flowLists = [
    {
        title:'配置自动化'
    },
    {
        title:'验证自动化'
    },
    {
        title:'发布自动化'
    },
    {
        title:'配置场景'
    }
]

export default class SceneManage extends Component {
    state = {
        // searchInputValue:'', // 查询关键字
        sceneFunctionList:[], // 场景功能列表 - 接口返回后更新
        batchAddVisible:false, // 批量添加弹框状态
        batchAddLoading:false, // 批量添加弹框中提交按钮loading状态
        customVisible:false, // 自定义添加弹框状态
        linkProtocolsVisible:false, // 自定义添加动作时，关联控制协议的弹框状态
        selectedActions:[], // 自定义添加动作时，已选择的动作
        customLoading:false, // 自定义添加弹框中提交按钮loading状态
        approverVisible:false, // 审批记录弹框状态
        approverLoading:false, // 审批记录按钮loading - 触发时请求审批记录数据
        allActionProtocols:[], // 记录所有的控制数据协议
        allCondtionProtocols:[], // 记录所有的运行数据协议
        conditionsProtocolsList:[], // 可用的控制数据名称集合 - 过滤掉NOT_IN_ACTIONS中的字段
        actionsProtocolsList:[], // 可用的运行数据名称集合
        usedConditions:[], // 已用的运行数据名称集合
        usedActions:[], // 已用的控制数据名称集合
        auditRecordList:[], // 审核记录数据
        deleteVisible:false, // 删除弹框状态
        deleteLoading:false, // 删除提交按钮loading
        verifyLoading:false, // 提交验证按钮loading
        curSceneItem:null, // 当前操作的场景数据 - 删除，编辑时记录
        sceneStatus:null // 场景的审核状态
    }
    constructor(props) {
        super(props);
        this.getSceneFunctionList();
        this.sceneListColumns = [
            {
                title: '功能名称',
                dataIndex: 'name',
                key: 'name',
                width:'160px'
            },
            {
                title: '类型',
                dataIndex: 'cmdType',
                key: 'cmdType',
                width:'100px',
                render: (text, record) => (
                    <span>
                        {SceneType['' + record.cmdType]}
                    </span>
                )
            },
            {
                title: '触发协议',
                dataIndex: 'cmdList',
                key: 'cmdList',
                render: (text, record) => {
                    
                    let {cmdList} = record;
                    
                    cmdList = uniqueItemInArrayByKey(cmdList,'cmdName');

                    return (
                        <span>
                            {cmdList.map(item => item.cmdName).join('，')}
                        </span>
                    )
                }
            },
            {
                title: '触发参数',
                dataIndex: 'paramList',
                key: 'paramList',
                width:340,
                render: (text, record) => (
                    <span>
                        {record.paramList ? record.paramList.map(item => {
                            let {paramName,paramRule,paramMinValue,paramMaxValue} = item;

                            if (paramRule == 1) {
                                return ` ${paramName} : 大于 ${paramMinValue} `
                            } else if (paramRule == 2) {
                                return ` ${paramName} : 小于 ${paramMaxValue} `
                            } else {
                                return ` ${paramName} : 范围 ${paramMinValue} ~ ${paramMaxValue} `
                            }
                        }).join('；') : null}
                    </span>
                )
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width:'120px',
                render: (text, record) => (
                    <span className={`verify-statu-${record.status}`}>
                        {SceneStatus['' + record.status]}
                    </span>
                )
            },
            {
                title: '操作',
                key: 'action',
                width:120,
                render: (text, record) => {
                    let {status,cmdType} = record;
                    /* 1-未提交， 2-审核中， 3-已发布，4- 驳回 */
                    return (
                        <span>
                            {
                                [1,4].includes(+status) && (cmdType == '1') &&
                                <React.Fragment>
                                        <a onClick={ e => this.openModal('customVisible',record)}>编辑</a>
                                    <Divider type="vertical" />
                                </React.Fragment>
                            }
                            {
                                [1,3,4].includes(+status) && 
                                <React.Fragment>
                                    <a onClick={ e => this.openModal('deleteVisible',record)}>删除</a>
                                </React.Fragment>
                            }
                        </span>
                    )
                },
            }
        ]
    }
    componentDidMount(){
        this.dealProtocols();
    }
    dealProtocols = () => {
        let {productProtocolLists = []} = this.props,
        conditionsProtocolsList = [],
        actionsProtocolsList = [],
        allCondtionProtocols = [],
        allActionProtocols = [];

        productProtocolLists.forEach( item => {
            let {dataType,list} = item,
                propertyNameObj = {}

            // 控制数据协议
            if (dataType === 2) {
                
                // 过滤掉不支持的协议，过滤掉没有参数的协议
                allActionProtocols = list.filter( _list => {
                    return (!NOT_IN_ACTIONS.includes(_list.property)) && (!!_list.propertyValueDesc);
                })

                actionsProtocolsList = [...new Set(allActionProtocols.map(item => item.propertyName))]
            }
            // 运行数据协议
            if (dataType === 3) {
                // 运行数据过滤多协议类型
                list.forEach(_list => {
                    let {propertyName} = _list;
    
                    if (propertyNameObj[propertyName]) {
                        propertyNameObj[propertyName] = propertyNameObj[propertyName] + 1;
                    } else {
                        propertyNameObj[propertyName] = 1;
                    }
                })

                // 过滤掉没有参数的协议 和 多协议类型
                allCondtionProtocols = cloneDeep(list).filter(item => !!item.propertyValueDesc && (propertyNameObj[item.propertyName] === 1));
                conditionsProtocolsList = [...new Set(allCondtionProtocols.map(item => item.propertyName))]
            }
        })

        this.setState({
            allActionProtocols,
            allCondtionProtocols,
            conditionsProtocolsList,
            actionsProtocolsList
        })
    }
    componentDidUpdate(prevProps){
        if (prevProps.productId !== this.props.productId) {
            this.getSceneFunctionList();
        }

        if (prevProps.productProtocolLists.length < 1 && this.props.productProtocolLists.length >= 1) {
            this.dealProtocols();
        }
    }
    // SearchInputHandle = value => {
    //     this.setState({
    //         searchInputValue:value
    //     })
    // }
    getSceneFunctionList = () => {
        let {productId} = this.props,
        {searchInputValue} = this.state;
        
        if (productId) { //  防止还未获取到ID时导致的报错
            get(Paths.getSceneFunctionList,{
                productId,
                // name:searchInputValue
            },{
                loading:true
            }).then(data => {
                let _list = data.data && data.data.list || [],
                    usedConditions = [],
                    usedActions = [],
                    sceneStatus = null;
                    
                    _list.forEach(item => {
                        let {cmdType,cmdList = [],status} = item
                        
                        if (cmdList.length === 1) {
                            cmdList.forEach(_item => {
                                if (cmdType == 1) {
                                    usedConditions.push(_item.cmdName)
                                }
                                if (cmdType == 2) {
                                    usedActions.push(_item.cmdName)
                            }
                        })
                        
                        // 有任何一个记录在审核中，就认为此场景是审核状态
                        if (status == 2) {
                            sceneStatus = 'verify'
                        }
                    }                   
                })
                this.setState({
                    sceneFunctionList:_list,
                    usedConditions,
                    usedActions,
                    sceneStatus
                })
            })
        }
    }
    openModal = (type,record) => {
        let _state = {
            [type]:true 
        }

        if (record) {
            // let {cmdList,cmdType} = record;

            _state.curSceneItem = cloneDeep(record);


            // if (cmdType == 2) { // 动作不再支持编辑
            //     _state.selectedActions = cmdList.map(item => item.cmdName);
            // }
        }

        this.setState(_state)  
    }
    close (type) {   
        
        let _data = {
            [type]:false
        }

        if (type === 'customVisible') {
            _data.selectedActions = [];
        }

        if (['customVisible','deleteVisible'].includes(type)) {
            _data.curSceneItem = null
        }
        
        this.setState(_data)
    }
    batchAddOkHandle = data => {
        let {selectedActionPropertyNames,selectedConditionPropertyNames} = data,
            {productId} = this.props,
            _data = {productId},
            conditionsTemp = selectedConditionPropertyNames.map(item => {
                let temp = this.getConditionProtocolByPropertyName(item);

                return temp.map(_item => {
                    let {property,propertyName,gap,mulriple,propertyValueType,propertyValueDesc} = _item,
                        temp = {
                            cmdField:property,
                            cmdName:propertyName,
                            cmdType:1,
                            paramList:[
                                {
                                    paramType:propertyValueType,
                                    paramValue:propertyValueDesc
                                }
                            ]
                        }

                    if(!isNaN('' + gap)){
                        temp.step = gap;
                    }

                    if (!isNaN('' + mulriple)) {
                        temp.mutiple = mulriple
                    }
                    
                    return {
                        cmdList:[temp]
                    };
                })
            }),
            actionsTemp = selectedActionPropertyNames.map(item => {
                let temp = this.getActionDetailByPropertyName(item);
                    
                return {
                    cmdList: temp.map(_item => {
                        let {property,propertyName,gap,mulriple,propertyValueType,propertyValueDesc} = _item,
                            temp = {
                                cmdField:property,
                                cmdName:propertyName,
                                cmdType:2,
                                paramList:[
                                    {
                                        paramType:propertyValueType,
                                        paramValue:propertyValueDesc
                                    }
                                ]
                            };
    
                        if(!isNaN('' + gap)){
                            temp.step = gap;
                        }
    
                        if (!isNaN('' + mulriple)) {
                            temp.mutiple = mulriple
                        }
    
                        return temp;
                    })
                }
            });


            _data.deviceCmdList = flattenDepth(actionsTemp.concat(conditionsTemp),1)

        this.setState({
            batchAddLoading:true
        })

        post(Paths.addBatchSceneFunction,_data,{
            needJson:true,
            noInstance:true
        }).then( data => {
            this.close('batchAddVisible')
            this.getSceneFunctionList()
        }).finally( () => {
            this.setState({
                batchAddLoading:false
            })
        })
    }
    customOkHandle = (data,type) => {
        let {productId} = this.props,
            {selectedActions,curSceneItem} = this.state,
            _data = {},
            path = Paths.addOrUpdateSingleCondition;
        
        if (type == 1) {
            _data = {
                ...data,
                productId
            }

            // 更新
            if (curSceneItem) {
                _data.deviceCmdId = curSceneItem.deviceCmdId
            }
        } else {

            if (selectedActions.length < 1) {
                Notification({
                    type:'warn',
                    message:'缺少参数',
                    description:'请为动作关联协议'
                })

                return false;
            }

            let cmdList = selectedActions.map(item => {
                let temp = this.getActionDetailByPropertyName(item);

                return temp.map(_item => {
                    let {property,gap,mulriple,propertyValueType,propertyValueDesc} = _item,
                        temp = {
                            cmdField:property,
                            cmdName:item,
                            paramList:[
                                {
                                    paramType:propertyValueType,
                                    paramValue:propertyValueDesc
                                }
                            ]
                        }

                        if(!isNaN('' + gap)){
                            temp.step = gap;
                        }

                        if (!isNaN('' + mulriple)) {
                            temp.mutiple = mulriple
                        }

                    return temp;
                })
            })
            
            _data = {
                ...data,
                productId,
                deviceCmdParam:{
                    cmdParamType:'6',
                    cmdList:flattenDepth(cmdList,1)
                }
            }

            path = Paths.addCustomAction
        }

        this.setState({
            customLoading:true
        })

        post(path,_data,{
            needJson:true,
            noInstance:true
        }).then(data => {
            this.close('customVisible')
            this.getSceneFunctionList()
        }).finally(() => {
            this.setState({
                customLoading:false
            })
        })
    }
    LinkProtocolsOkhandle = data => {
        this.operateSelectedActions(data,'add');
        this.close('linkProtocolsVisible');
    }
    deleteOkHandle = () => {
        let {curSceneItem} = this.state,
            {productId} = this.props,
            {deviceCmdId,cmdType} = curSceneItem;

        this.setState({
            deleteLoading:true
        })

        post(Paths.deleteSceneFunctionById,{
            deviceCmdId,
            cmdType,
            productId
        }).then(data => {
            this.close('deleteVisible')
            this.getSceneFunctionList()
        }).finally(() => {
            this.setState({
                deleteLoading:false
            })
        })
    }
    operateSelectedActions = (propertyNamesArray,type = 'add') => {
        let {selectedActions} = this.state,
            _newSelectedActions = [];
        if(type === 'add') {
            _newSelectedActions = [...new Set(propertyNamesArray)]
        }

        if (type === 'delete') {
            _newSelectedActions = selectedActions.filter(item => item !== propertyNamesArray[0])
        }

        this.setState({
            selectedActions: _newSelectedActions
        })
    }
    getActionDetailByPropertyName = propertyName => {
        let {allActionProtocols} = this.state;
            
        return  allActionProtocols.filter(item => item.propertyName === propertyName);
    }
    getConditionProtocolByPropertyName = propertyName => {
        let {allCondtionProtocols} = this.state;
            
        return  allCondtionProtocols.filter(item => item.propertyName === propertyName);
    }
    // 提交审核
    submitVerify = () => {
        let {productId} = this.props,
            {sceneFunctionList} = this.state,
            list = [];

            sceneFunctionList.forEach((item) => {
                let {deviceCmdId,cmdType,status} = item;

                // 提交草稿状态的数据
                if (status == 1) {
                    list.push({
                        deviceCmdId,
                        cmdType
                    })
                }
            })

        this.setState({
            verifyLoading:true
        })

        post(Paths.auditBatchSceneFunction,{
            productId,
            list
        },{
            needJson:true,
            loading:true,
            noInstance:true
        }).then(data => {
            this.getSceneFunctionList()
        }).finally(() => {
            this.setState({
                verifyLoading:false
            })
        })
    }
    // 获取审批记录
    getAuditRecord = () => {
        let {productId} = this.props;

        this.setState({
            approverLoading:true
        })

        get(Paths.getAuditRecord,{
            productId
        }).then(
            data => {
                this.setState({
                    auditRecordList: data.data || [],
                    approverVisible:true
                })
            }
        ).finally( () => {
            this.setState({
                approverLoading:false
            })
        })
    }
    resetSelectedActions = () => {
        this.setState({
            selectedActions:[]
        })
    }
    render() {
        let {searchInputValue,sceneStatus,auditRecordList,verifyLoading,sceneFunctionList,batchAddVisible,selectedActions,approverLoading,customVisible,approverVisible,linkProtocolsVisible,conditionsProtocolsList,actionsProtocolsList,customLoading,curSceneItem,deleteVisible,deleteLoading,batchAddLoading,usedConditions,usedActions} = this.state,
            {canOperate} = this.props,
            _columns = cloneDeep(this.sceneListColumns);
        let _conditionsProtocolsList = conditionsProtocolsList.filter(item => !usedConditions.includes(item)),
            _actionsProtocolsList = actionsProtocolsList.filter(item => !usedActions.includes(item)),
            isVerifing = (sceneStatus === 'verify'),
            hasRecordtoVerify = false;

        sceneFunctionList.forEach(item => {
            // 存在草稿状态的场景，才允许提交
            if (+item.status === 1) {
                hasRecordtoVerify = true
            }
        });

        
        if(!canOperate) {
            _columns.pop()
        }

        return (
            <div className="app-control-wrapper">
                <AloneSection style={{margin:'0 0 24px'}} title="使用流程">
                    <div className="use-service-flow-wrapper">
                        <FlowChart type={3} flowLists={flowLists}></FlowChart>
                        <div className="extra-descs">
                            <div className="descs-item">
                                <p>进入产品设备联动服务，配置自动化条件和动作</p>
                            </div>
                            <div className="descs-item">
                                <p>通过调试白名单对草稿状态下条件和动作全功能调试验证，验证完成提交发布申请。</p>
                            </div>
                            <div className="descs-item">
                                <p>审核通过，完成配置的条件和动作上线，上线后可供用户正常使用。</p>
                            </div>
                            <div className="descs-item">
                                <p>使用已发布的自动化条件和动作配置场景。</p>
                            </div>
                        </div>
                    </div>
                </AloneSection>
                <section style={{marginTop:0}} className="h5-manage-wrapper section-bg">
                    <h3>场景功能配置</h3>
                    <div className="page-manage">
                        <div className="tool-area clearfloat">
                            {/* <div className="search">
                                <Search enterButton
                                    value={searchInputValue}
                                    onChange={e => this.SearchInputHandle(e.target.value)}
                                    onSearch={this.getSceneFunctionList}
                                    maxLength={20}
                                    placeholder="请输入场景名称查找"></Search>
                            </div> */}
                            {
                                canOperate && 
                                <React.Fragment>
                                    <Button type="primary" 
                                            style={{ float: 'right' }} 
                                            onClick={() => this.openModal('customVisible')}>
                                                <Icon type="plus"/> 自定义 </Button>
                                    <Button type="primary" 
                                            style={{ float: 'right',marginRight:'24px' }} 
                                            onClick={() => this.openModal('batchAddVisible')}>
                                                <Icon type="plus"/> 批量添加 </Button>
                                </React.Fragment>
                            }
                            <Button type="primary" 
                                    style={{ float: 'right',marginRight:'24px' }}
                                    loading={approverLoading} 
                                    onClick={() => this.getAuditRecord()}>
                                         最新审批记录 </Button>
                        </div>
                        <div className="h5-manage-tab">
                            <Table columns={_columns}
                                   className="ant-table-fixed" 
                                   dataSource={addKeyToTableData(sceneFunctionList)}
                                   pagination = {false}
                                   />
                        </div>
                    </div>
                    {
                        canOperate &&
                        <DoubleBtns preBtn={false} 
                            nextHandle={this.submitVerify}
                            nextLoading={verifyLoading}
                            nextDisable={isVerifing || !hasRecordtoVerify} 
                            nextText={isVerifing ? '审核中':'提交验证'}></DoubleBtns>
                    }
                </section>
                {
                    batchAddVisible &&
                    <BatchAddForm visible={batchAddVisible}
                                  batchAddOkHandle={this.batchAddOkHandle}
                                  openModal={this.openModal}
                                  conditionsProtocolsList={_conditionsProtocolsList}
                                  actionsProtocolsList={_actionsProtocolsList}
                                  batchAddLoading={batchAddLoading} 
                                  onCancel={() => this.close('batchAddVisible')}></BatchAddForm>
                }
                {
                    customVisible &&
                    <CustomForm visible={customVisible}
                                openModal={this.openModal}
                                customOkHandle={this.customOkHandle}
                                selectedActions={selectedActions}
                                resetSelectedActions={this.resetSelectedActions}
                                conditionsProtocolsList={_conditionsProtocolsList}
                                getActionDetailByPropertyName={this.getActionDetailByPropertyName}
                                getConditionProtocolByPropertyName={this.getConditionProtocolByPropertyName}
                                editScene={curSceneItem}
                                operateSelectedActions={this.operateSelectedActions}
                                customLoading={customLoading} 
                                onCancel={() => this.close('customVisible')}></CustomForm>
                }
                {
                    approverVisible &&
                    <ApproverModal visible={approverVisible}
                                   auditRecordList={auditRecordList}
                                   onCancel={() => this.close('approverVisible')}></ApproverModal>
                }
                {
                    linkProtocolsVisible &&
                    <LinkProtocolsForm visible={linkProtocolsVisible}
                                       actionsProtocolsList={_actionsProtocolsList}
                                       LinkProtocolsOkhandle={this.LinkProtocolsOkhandle}
                                       selectedActions={selectedActions}
                                       onCancel={() => this.close('linkProtocolsVisible')}></LinkProtocolsForm>
                }
                {
                    deleteVisible && 
                    <ActionConfirmModal
                        visible={deleteVisible}
                        modalOKHandle={this.deleteOkHandle}
                        modalCancelHandle={() => this.close('deleteVisible')}
                        targetName={curSceneItem.name}
                        confirmLoading={deleteLoading}
                        title={'删除场景'}
                        descGray={true}
                        descText={'即将删除的场景'}
                        needWarnIcon={true}
                        tipText={'场景删除后将无法找回，是否确认删除？'}
                    ></ActionConfirmModal>
                }
            </div>
        )
    }
}
