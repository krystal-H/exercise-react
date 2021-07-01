import React, { Component } from 'react'
import { Button, Icon, Input, Divider,Table } from 'antd'
import {cloneDeep,isEqual} from 'lodash'
import { Paths,post} from '../../../../../../../api'
import {addKeyToTableData} from '../../../../../../../util/util'
import {cloudStatus} from '../../../../../../../configs/text-map';
import {CloudAddForm,CloudUpdate} from './CloudManageModals';
import { setFuncDataType } from '../../../../../../../util/util';

import AloneSection from '../../../../../../../components/alone-section/AloneSection';
import FlowChart from '../../../../../../../components/flow-chart/FlowChart';

const { Search } = Input;


const flowLists = [
    {
        title:'创建定时功能'
    },
    {
        title:'发布定时功能'
    },
    {
        title:'APP端配置'
    },
    {
        title:'APP端应用'
    }
]

export default class CloudManage extends Component {
    state = {
        cloudAddVisible:false,
        cloudAddLoading:false,
        cloudUpdateVisible:false,
        cloudUpdateLoading:false,
        cloudPublishVisible:false,
        cloudOffLineVisible:false,
        cloudEditVisible:false,
        usedPropertys:[],
        operate:'publish'
    }
    constructor(props) {
        super(props);
        this.h5PageColumns = [
            {
                title: '功能名称',
                dataIndex: 'serviceName',
                key: 'serviceName',
                width:200,
            },
            {
                title: '关联协议',
                dataIndex: 'propertyName',
                width:160,
                key: 'propertyName',
                render: (text, record) => (
                    <div>
                        {
                            record.timerServiceDetails.map((item,index) => {
                                return <div key={index}>{item.propertyName}</div>
                            })
                        }
                    </div>
                )
            },
            {
                title: '协议数据标识',
                dataIndex: 'property',
                key: 'property',
                render: (text, record) => (
                    <div>
                        {
                            record.timerServiceDetails.map((item,index) => {
                                return <div key={index}>{item.property}</div>
                            })
                        }
                    </div>
                )
            },
            {
                title: '协议数据类型',
                dataIndex: 'functionDataType',
                key: 'functionDataType',
                width:160,
                render: (text, record) => (
                    <div>
                        {
                            record.timerServiceDetails.map((item,index) => {
                                return <div key={index}>{setFuncDataType(item)}</div>
                            })
                        }
                    </div>
                )
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width:120,
                render: (text, record) => (
                    <span className={`cloud-statu-${record.status}`}>
                        {cloudStatus[record.status]}
                    </span>
                )
            },
            {
                title: '操作',
                key: 'action',
                width:200,
                render: (text, record) => (
                    <span>
                        {
                            record.status != '1' ? 
                            <React.Fragment>
                                <a onClick={this.openModal.bind(this,'cloudEditVisible',record)}>编辑</a>
                                <Divider type="vertical" />
                                <a onClick={this.openModal.bind(this,'cloudUpdateVisible',record,1)}>发布</a>
                                <Divider type="vertical" />
                                <a onClick={this.openModal.bind(this,'cloudUpdateVisible',record,2)}>删除</a>
                            </React.Fragment> :
                            <a onClick={this.openModal.bind(this,'cloudUpdateVisible',record,3)}>下线</a>
                        }
                    </span>
                ),
            }
        ]
    }
    compareServiceList () {
        let {timeServiceList} = this.props;
        if (!this.lastTimeServiceList || !isEqual(this.lastTimeServiceList,timeServiceList)) {
            this.lastTimeServiceList = cloneDeep(timeServiceList);

            let usedPropertys = [];
            
            timeServiceList.forEach(service => {
                usedPropertys = [...service.timerServiceDetails.map(item => item.property),...usedPropertys]
            });

            this.setState({
                usedPropertys
            })
        }
    }
    componentDidMount(){
        this.compareServiceList();
    }
    componentDidUpdate(prevProps, prevState){
        this.compareServiceList();
    }
    SearchInputHandle = (value) => {
        let {getTimeServiceList,productId} = this.props;

        getTimeServiceList({
            productId,
            serviceName:value
        })
    }
    openModal = (type,record,operate) => {
        let _state = {
            [type]:true 
        }

        if (type !== 'cloudAddVisible') { // 记录当前正在操作的服务
            _state.operateService = record
        }

        if (operate) {
            _state.operate = operate
        }

        this.setState(_state)
    }
    close (type) {        
        this.setState({
            [type]:false
        })
    }
    addOkHandle = (data,type) => {
        let {productId,getTimeServiceList} = this.props,
            {operateService} = this.state,
            _data = {...data,productId},
            visible = 'cloudAddVisible';

        if (type === 'edit') {
            _data.serviceId = operateService.serviceId;
            visible = 'cloudEditVisible';
        }

        this.setState({
            cloudAddLoading:true
        })

        post(Paths.saveTimeService,_data).then(res => {
            this.close(visible)
            getTimeServiceList({productId})
        }).finally( () => {
            this.setState({
                cloudAddLoading:false
            })
        })
    }
    updateOkHandle = (operate) => {
        let {operateService} = this.state,
            {getTimeServiceList} = this.props,
            {serviceId,productId} = operateService;

        this.setState({
            cloudUpdateLoading:true
        })

        post(Paths.updateTimeService,{
            serviceId,
            productId,
            type:operate
        }).then(res => {
            this.close('cloudUpdateVisible')
            getTimeServiceList({productId})
        }).finally( () => {
            this.setState({
                cloudUpdateLoading:false
            })
        })
    }
    dealList (timeServiceList) {
        let _timeServiceList = cloneDeep(timeServiceList);
        return addKeyToTableData(_timeServiceList);
    }
    render() {
        let {cloudAddVisible,cloudAddLoading,cloudUpdateVisible,cloudUpdateLoading,cloudEditVisible,usedPropertys,operateService,operate} = this.state,
            {timeServiceList,productProtocolLists,canOperate} = this.props,
            _timeServiceList = this.dealList(timeServiceList),
            _productProtocolLists = productProtocolLists.filter(item => item.dataType == 2); // 云端定时只能添加控制数据
        
        let _columns = cloneDeep(this.h5PageColumns);

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
                                <p>可以使用产品的控制数据功能点，创建定时功能。</p>
                            </div>
                            <div className="descs-item">
                                <p>定时功能确认无误后，可以发布到C家或您创建的APP上。</p>
                            </div>
                            <div className="descs-item">
                                <p>在APP端基于已经发布的定时功能，配置定时任务。</p>
                            </div>
                            <div className="descs-item">
                                <p>满足定时任务的触发条件后，自动发送指令控制设备。</p>
                            </div>
                        </div>
                    </div>
                </AloneSection>
                <section style={{marginTop:0}} className="h5-manage-wrapper section-bg">
                    <h3>定时功能</h3>
                    <div className="page-manage">
                        <div className="tool-area">
                            <div className="searchBox">
                                <Search enterButton maxLength={20} onSearch={value => this.SearchInputHandle(value)} placeholder="请输入功能名称查找"></Search>
                            </div>
                            {
                                canOperate && 
                                <Button type="primary" 
                                    style={{ float: 'right' }} 
                                    onClick={() => this.openModal('cloudAddVisible')}>
                                    <Icon type="plus"/>
                                            创 建
                                </Button>
                            }
                        </div>
                        <div className="h5-manage-tab">
                            <Table columns={_columns}
                                   className="ant-table-fixed" 
                                   dataSource={_timeServiceList}
                                   pagination={false}
                                   />
                        </div>
                    </div>
                </section>
                {/* 创建 */}
                {
                    cloudAddVisible &&
                    <CloudAddForm visible={cloudAddVisible}
                                  productProtocolLists={_productProtocolLists}
                                  type="add"
                                  addLoading={cloudAddLoading}
                                  onAddOkHandle={this.addOkHandle}
                                  usedPropertys={usedPropertys} 
                                  onCancel={this.close.bind(this,'cloudAddVisible')}></CloudAddForm>
                }
                {/* 编辑 */}
                {
                    cloudEditVisible &&
                    <CloudAddForm visible={cloudEditVisible}
                                  type="edit"
                                  addLoading={cloudAddLoading}
                                  productProtocolLists={_productProtocolLists}
                                  onAddOkHandle={this.addOkHandle}
                                  operateService={operateService}
                                  usedPropertys={usedPropertys} 
                                  onCancel={this.close.bind(this,'cloudEditVisible')}></CloudAddForm>
                }
                {/* 删除，下线，发布 */}
                {
                    cloudUpdateVisible && 
                    <CloudUpdate  visible={cloudUpdateVisible}
                                  updateOkHandle={this.updateOkHandle}
                                  operate={operate}
                                  updateLoading={cloudUpdateLoading}
                                  serviceName={operateService.serviceName}
                                  updateCancelHandle={this.close.bind(this,'cloudUpdateVisible')}></CloudUpdate>
                    
                }
            </div>
        )
    }
}
