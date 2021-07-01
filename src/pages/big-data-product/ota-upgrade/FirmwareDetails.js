import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom';
import { Descriptions ,Button,Table,Divider,Input } from 'antd';
import { connect } from 'react-redux';
import PageTitle from '../../../components/page-title/PageTitle';
import AloneSection from '../../../components/alone-section/AloneSection';
import { cloneDeep } from 'lodash';
import {get,post, Paths} from '../../../api';
import { DateTool } from '../../../util/util';
import {UPRANGE,UPDATETYPE,TRIGGERTIME,PACKAGETYPE,VERFIRMTYPE,VERTYPE,STATUSTAG,UPDATESTATUS} from './store/constData'
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
        this.state = {
            batchId:undefined,
            list:[],
            pager:{},
            details:{},

        }
        this.columns = [
            { title: '批次ID', dataIndex: 'batchId',},
            { title: '发布时间', dataIndex: 'createTime', 
                render: c => <span>{c && DateTool.utcToDev(c) || '--'}</span>
            },
            { title: '升级范围', dataIndex: 'upgradeRange', render: u => UPRANGE[u].nam},
            { title: '升级方式', dataIndex: 'upgradeType', render: u => UPDATETYPE[u-1].nam},
            { title: '升级策略', dataIndex: 'triggerTime', render: t => TRIGGERTIME[t] },
            { title: '升级状态', dataIndex: 'upgradeStatus', render: u => ['升级中','已完成'][u] },
            { title: '操作', key: 'id',
                render: (id, {batchId}) => (
                    <span>
                        <a onClick={()=>{this.toBatchDetail(batchId)}}>查看</a>
                        {/* {
                            record.upgradeStatus==0&&<>
                                <Divider type="vertical" />
                                <a>取消</a>
                            </>
                        } */}
                    </span>
                ),
            },
        ];
       

    }
    toBatchDetail = batchId=>{
        window.location.hash = `#/open/bigData/OTA/firmwareBatch/${this.props.match.params.id}/${batchId}`;
    }

    componentDidMount() {
        this.getBatch()
        this.getDetail()
    }
    getBatch = (pageIndex=1)=>{
        const deviceVersionId = this.props.match.params.id
        const {batchId} = this.state
        get(Paths.otaGetBatch,{deviceVersionId,batchId,pageIndex,pageRows:10}).then(({data}) => {
            const {list=[] ,pager={}} = data
            this.setState({list,pager}) 
        });
    }
    getDetail=()=>{
        const deviceVersionId = this.props.match.params.id
        get(Paths.otaGetVersionDetail,{deviceVersionId}).then(({data}) => {
            this.setState({details:{...data}}) 
        });
    }
    search = batchId => {
        this.setState({batchId},()=>{
            this.getBatch();
        });
    }
    render() {
        const { pager:{pageIndex,totalRows},list,details:{
            deviceVersionName,packageType,productName,
            deviceVersionType=1,firmwareVersionType=1,
            uploadTime,mainVersion,extVersion,totalVersion
        } } = this.state;

        const versionType =  VERFIRMTYPE.find(({value})=> value==deviceVersionType)
        const firmwareVersionTypeNam = versionType.children[firmwareVersionType-1].label

        return (
            <section className="ota-firmwaredetail flex-column">
                <PageTitle title={"OTA升级 / "+ deviceVersionName}></PageTitle>
                <header className="page-content-header">
                    <Descriptions title="" className='descriptions' column={4}>
                        <Descriptions.Item label="包类型">{PACKAGETYPE[packageType]}</Descriptions.Item>
                        <Descriptions.Item label="所属产品" >{productName}</Descriptions.Item>
                        <Descriptions.Item label="固件类型">{`${versionType.label}/${firmwareVersionTypeNam}`}</Descriptions.Item>
                        <Descriptions.Item label="上传时间">{uploadTime && DateTool.utcToDev(uploadTime)}</Descriptions.Item>
                        <Descriptions.Item label="内部版本号">{mainVersion}</Descriptions.Item>
                        <Descriptions.Item label="外部版本号">{extVersion}</Descriptions.Item>
                        <Descriptions.Item label="固件系列标识">{totalVersion}</Descriptions.Item>
                    </Descriptions> 
                </header>
                <AloneSection title="批次列表">
                    
                    <div className="alone-section-content-default">
                        <Input.Search placeholder="输入发布批次ID查询"
                            className='search'
                            enterButton
                            maxLength={20}
                            onSearch={value => this.search(value)} 
                        />
                        <Table 
                            rowKey="batchId"
                            columns={this.columns} 
                            dataSource={list}
                            pagination={{
                                defaultCurrent:pageIndex, 
                                total:totalRows,
                                hideOnSinglePage:false,
                                onChange:val=>{this.getBatch(val)},
                                current: pageIndex
                            }} 
                        />
                    </div>
                </AloneSection>

            </section>
        )
    }
}
