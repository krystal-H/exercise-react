import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom';
import { Descriptions ,Button,Table,Divider,Input } from 'antd';
import { connect } from 'react-redux';
import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import { cloneDeep } from 'lodash';
import {get,post, Paths} from '../../../api';
import moment from 'moment';
import { DateTool } from '../../../util/util';
import {UPGRADESTATUS,VERFIRMTYPE,UPDATESTATUS,UPRANGE,TRIGGERTIME} from './store/constData'
import {getVersionList,getExtVerLi} from './store/actionCreators'

const mapStateToProps = state => {
    const {firmwareDetails} = state.get('otaUpgrade')
    return {
        // firmwareDetails
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getVersionLi: param => dispatch(getVersionList(param)),
        // getExtVerLi: param => dispatch(getExtVerLi(param)),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class FirmwareDetails extends PureComponent {
    constructor(props) {
        super(props);
        this.id = props.match.params.id
        this.verid = props.match.params.verid
        this.state = {
            deviceId:undefined,
            list:[],
            pager:{},
            details:{},
        }
        this.columns = [
            { title: '设备ID', dataIndex: 'deviceId'},
            { title: 'MAC地址', dataIndex: 'mac'},
            { title: '产品', dataIndex: 'productName'},
            { title: '设备分组名', dataIndex: 'groupName'},
            { title: '最新升级时间', dataIndex: 'updateTime', 
                render: u => <span>{u && DateTool.utcToDev(u) || '--'}</span>
            },
            { title: '升级前版本', dataIndex: 'beforeVersion'},
            { title: '升级状态', dataIndex: 'upgradeStatus', render:u => (u && UPDATESTATUS[u].nam ) },
            { title: '操作', key: 'act',
                render: (id, {deviceId,upgradeStatus}) => (
                    <span>
                        {
                            upgradeStatus==0&&<a onClick={()=>{this.cancel(deviceId)}}>取消</a>
                        }
                    </span>
                ),
            },
        ]; 

    }
    componentDidMount() {
        this.getList()
        this.getDetail()
    }
    cancel=(deviceId)=>{
        const deviceVersionId = this.verid
        const batchId = this.id
        Modal.confirm({
            title: '取消升级',
            content: `即将取消升级 deviceId 为 ${deviceId} 的设备。`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk:()=>{
                get(Paths.otaCancelDevicePub,{deviceVersionId,batchId,deviceId}).then(() => {
                    let {totalRows,pageIndex} = this.state.pager;
                    pageIndex = (totalRows % ((pageIndex-1)*10))>1?pageIndex:pageIndex-1;
                    this.getList(pageIndex)
                });
            }
          });
        
    }
    getList = (pageIndex=1)=>{
        const deviceVersionId = this.verid
        const batchId = this.id
        const {deviceId} = this.state
        get(Paths.otaGetBatchDevice,{deviceVersionId,batchId,deviceId,pageIndex,pageRows:10}).then(({data}) => {
            const {list=[] ,pager={}} = data
            this.setState({
                list:list.map((li,i)=>({...li,index:i})),
                pager
            }) 
        });
    }
    getDetail=()=>{
        const deviceVersionId = this.verid
        const batchId = this.id
        get(Paths.otaGetBatchInfo,{deviceVersionId,batchId}).then(({data}) => {
            this.setState({details:{...data}}) 
        });
    }
    search = deviceId => {
        this.setState({deviceId},()=>{
            this.getList();
        });
    }
    render() {
        const { pager:{pageIndex,totalRows},list,details:{
            deviceVersionName,

            upgradeStatus=0,
            upgradeRange=0,
            createTime,
            triggerTime,
            beginTime,
            endTime,
            retryCount,
            retryTime,

            deviceVersionType=1,
            firmwareVersionType=1,
        } } = this.state;

        const versionType =  VERFIRMTYPE.find(({value})=> value==deviceVersionType)
        const firmwareVersionTypeNam = versionType.children[firmwareVersionType-1].label

        return (
            <section className="ota-firmwaredetail flex-column">
                <PageTitle title={`OTA升级 / ${deviceVersionName||'固件包'} / ${this.id}`}></PageTitle>
                <header className="page-content-header">
                    <Descriptions title="" className='descriptions' column={4}>
                        <Descriptions.Item label="升级状态">{UPGRADESTATUS[upgradeStatus]}</Descriptions.Item>
                        <Descriptions.Item label="升级范围">{UPRANGE[upgradeRange].nam}</Descriptions.Item>
                        <Descriptions.Item label="发布时间">{createTime && DateTool.utcToDev(createTime)}</Descriptions.Item>
                        <Descriptions.Item label="升级方式">{`${versionType.label}/${firmwareVersionTypeNam}`}</Descriptions.Item>
                        <Descriptions.Item label="升级触发策略">{TRIGGERTIME[triggerTime]}</Descriptions.Item>
                        <Descriptions.Item label="升级开始时间">{beginTime && DateTool.utcToDev(beginTime)}</Descriptions.Item>
                        <Descriptions.Item label="升级结束时间">{endTime && DateTool.utcToDev(endTime)}</Descriptions.Item>
                        <Descriptions.Item label="升级失败重试">{retryTime}次</Descriptions.Item>
                        <Descriptions.Item label="失败重试次数">{retryCount}</Descriptions.Item>
                    </Descriptions> 
                </header>
                <AloneSection title="设备列表">
                    <div className="alone-section-content-default">
                        <Input.Search placeholder="输入设备ID查询"
                            className='search'
                            enterButton
                            maxLength={20}
                            onSearch={value => this.search(value)} 
                        />
                        <Table 
                            rowKey="index"
                            columns={this.columns} 
                            dataSource={list}
                            pagination={{
                                defaultCurrent:pageIndex, 
                                total:totalRows,
                                hideOnSinglePage:false,
                                onChange:val=>{this.getList(val)},
                                current: pageIndex
                            }} 
                        />
                    </div>
                </AloneSection>

            </section>
        )
    }
}