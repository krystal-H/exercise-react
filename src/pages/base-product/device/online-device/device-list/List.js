import React, { PureComponent } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Input,Button , Pagination, Select, Table,Icon,Tooltip } from 'antd';
import {get, Paths} from '../../../../../api';
import { getUserProductListAction,getDeviceStatAction,getDeviceListAction } from '../store/ActionCreator';
import AloneSection from '../../../../../components/alone-section/AloneSection';
import PageTitle from '../../../../../components/page-title/PageTitle';
import CommSearchMod from '../../../../comm-mod/searchDevice';

import { Notification } from "../../../../../components/Notification";
const {Option} = Select
const RE = {'1':undefined,'2':true,'3':false}
const mapStateToProps = state => {
    return {
        productList: state.getIn(['device', 'productList']).toJS(),
        deviceStat: state.getIn(['device', 'deviceStat']).toJS(),
        deviceList: state.getIn(['device', 'deviceList']).toJS(),
        freshStatu: state.getIn(['device', 'freshStatu']),//统计数据的刷新状态
    }
}
const mapDispatchToProps = dispatch => {
    return {
        getProductList: data => dispatch(getUserProductListAction(data)),
        getDeviceStat: data => dispatch(getDeviceStatAction(data)),
        getDeviceList: data => dispatch(getDeviceListAction(data)),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
export default class List extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // productId:-1,//当前的产品id,默认-1  表示“全部产品”
            groupList:[],
            countDataParams:{
                classType:1,
                productId:undefined,
                subgroupId:undefined,
            },
            listParams: {
                pageIndex: 1,
                pageRows: 10,
                infoType:1,
                field:undefined,
                labelKey:undefined,
                labelValue:undefined,
                innet:1,
                online:1,

            }, // 获取设备列表相关请求参数
        }
    }
    componentDidMount() {
        this.getProductList();
        this.getGroupList();
        this.getDeviceStat();
        this.getDeviceList();
        
    }

    // 获取产品列表
    getProductList=()=>{
        this.props.getProductList({
            pageIndex: 1,
            pageRows: 9999,//全部展示在下拉框里
        });
    }
    // 获取分组列表
    getGroupList=()=>{
        get(Paths.getGroupList,{pageIndex:1,pageRows:9999}).then((res) => {
            this.setState({
                groupList:res.data&&res.data.list||[]
            });
        });
    }
    // 统计接口的请求参数（也是列表请求的部分参数）
    getCountDataParams= (typename='classType') =>{//typename 在列表请求和统计请求里两个地方的字段名不一样
        let {classType,productId,subgroupId} = this.state.countDataParams;
        // console.log(555,this.state.countDataParams);
        let _param = {[typename]:classType};
        if(classType == 1){
            _param.productId = productId
        }else if(classType == 2){
            _param.subgroupId = subgroupId
        }
        return _param;
    }
    getListParams = ()=>{
        let listParams = {...this.state.listParams};
        let {innet,online} = listParams;
        
        listParams.innet = RE[innet];
        listParams.online = RE[online];
        return listParams;

    }
    // 获取设备统计
    getDeviceStat=()=>{
        return this.props.getDeviceStat(this.getCountDataParams("type"));
    }
    // 获取设备列表
    getDeviceList=()=>{
        let _paramCount = this.getCountDataParams("classType");
        let _listParams = this.getListParams();
        return this.props.getDeviceList({..._paramCount,..._listParams});
    }
    //设备相关筛选条件的改变
    onChangeListParams = (paramNam,val) =>{
        console.log(paramNam,val);
        let newlistParams = {...this.state.listParams};
        newlistParams[paramNam] = val.trim && val.trim() || val || undefined;
        this.setState({listParams:newlistParams});
        
    }
    //设备相关筛选的查询按钮
    inquireDeviceList=()=>{
        let listParams = {...this.state.listParams} ;
        listParams.pageIndex = 1;
        this.setState({
            listParams
        }, this.getDeviceList)
    }
    //产品、分组的查询按钮
    searchedData=(_questpam)=>{
        let {type=0,productIds} = _questpam;
        console.log(99,_questpam);
        this.setState({
            countDataParams:{
                classType:++type,
                productId:productIds,
                subgroupId:productIds,
            },
        },()=>{
            this.getDeviceList()
            this.getDeviceStat()
        })
        return Promise.resolve(1);//配合公共组件须要返回一个promise才可以
    }
    //分页页码改变
    changePage=(pageIndex)=> {
        let newparams = {...this.state.listParams};
        newparams.pageIndex = pageIndex;
        this.setState({
            listParams:newparams
        }, this.getDeviceList)
    }
    //设备相关筛选的重置
    resetSearch=()=>{
        this.setState({  
            listParams:{
                pageIndex: 1,
                pageRows: 10,
                infoType:1,
                field:undefined,
                labelKey:undefined,
                labelValue:undefined,
                innet:1,
                online:1
            } 
        },this.getDeviceList);
    }
    exportData = () => {
        let superInstanceId = localStorage.getItem("superInstanceId");
        let params = {
            superInstanceId,
            ...this.getCountDataParams(),
            ...this.getListParams(),
        }

        
        let paramstr = '?';
        for (let k in params){
            if(params[k] !== undefined){
                paramstr += `${k}=${params[k]}&`

            }
            
        }
        
        const _href = window.location.origin + Paths.exportDeviceList + paramstr.replace(/&$/, "");
        
        try {
            window.open(_href);
            // window.location.href = _href
        } catch (e) {
            Notification({
                description: e,
                type: "error",
            });
        }
    }
    render() {
        let { listParams,groupList } = this.state,
            { productList,deviceStat,deviceList,freshStatu } = this.props,
            {pager={},list=[]} = deviceList,
            columns=[
                { title: "设备ID", dataIndex: "deviceUniqueId", key: "deviceUniqueId" },
                { title: "物理地址", dataIndex: "deviceMac", key: "deviceMac" },
                { title: "产品", dataIndex: "productName", key: "productName" },
                { title: "分类", dataIndex: "productType", key: "productType" },
                { title: "所属分组", dataIndex: "groupName", key: "groupName" },

                { title: "类型", dataIndex: "productClass", key: "productClass",
                    render(productClass) {
                        return {"0":"普通设备","1":"网关设备"}[productClass] || "--";  
                    }
                },
                { title: "操作", key: "opt_detail",
                    render: (text, record) => (
                        <span>
                            <Link key="detail" to={'/open/base/device/onlineDevice/details/' + record.deviceId}>查看</Link>
                        </span>
                    ),
                }
            ],
            {exception,total,totalActive,todayActive} = deviceStat,
            {pageIndex,pageRows,infoType,field,labelKey,labelValue,innet,online} = listParams;


            return (
            <section className="page-main-wrapper flex-column devicelistpage">
                <PageTitle noback={true} title="设备管理"></PageTitle>
                <header className="page-content-header">
                    <CommSearchMod
                        list={[productList,groupList]}
                        searchedData={this.searchedData}
                    ></CommSearchMod>
                    <div className="count-data-box">
                        <ul className="device-inine-data">
                            <li>
                                <p><span className="icon-cube"></span>当前异常数</p>
                                <span className="count">{exception || 0}</span>
                            </li>
                            <li>
                                <p><span className="icon-cube"></span>累计设备总数</p>
                                <span className="count">{total || 0}</span>
                            </li>
                            <li>
                                <p><span className="icon-cube"></span>累计入网总数</p>
                                <span className="count">{totalActive || 0}</span>
                            </li>
                            <li>
                                <p><span className="icon-cube"></span>今日入网总数</p>
                                <span className="count">{todayActive || 0}</span>
                            </li>
                        </ul>
                        <div className="device-refresh" onClick={this.getDeviceStat}>
                            <span>刷新</span>
                            <Icon type="sync" className="device-refresh-icon" spin={!freshStatu}/>
                        </div>
                    </div>
                </header>
                <div className="flex-column flex1">
                    <AloneSection title="联网设备列表">
                        <div className="alone-section-content-default">
                        <Tooltip title="最多导出1千条数据" placement="top">
                        <a href='javascript:void(0)' className='btn-exportdata' onClick={this.exportData}>导出数据</a>
                        </Tooltip>
                            
                            <div className='lineSearchBox'>
                                <div className='search-info-box'>
                                    <div className='searchBox'>
                                        <Input.Group compact>
                                            <Select className='type-select' value={infoType} onChange={(val)=>{this.onChangeListParams("infoType",val)}}>
                                                <Option value={1}>设备ID</Option>
                                                <Option value={2}>物理地址</Option>
                                            </Select>
                                            <Input className='input' maxLength={100} value={field} placeholder="请输入设备ID号"  onChange={e=>{this.onChangeListParams("field",e.target.value)}} />
                                        </Input.Group>
                                    </div>
                                    <span className='margin-left-10px' >设备标签：</span>
                                    <Input className='input' placeholder="请输入标签Key" maxLength={100} value={labelKey}  onChange={e=>{this.onChangeListParams("labelKey",e.target.value)}} />
                                    <Input className='input margin-left-10px' placeholder="请输入标签Value" maxLength={100} value={labelValue}  onChange={e=>{this.onChangeListParams("labelValue",e.target.value)}} />
                                    <Select className='type-select margin-left-10px' value={innet} onChange={(val)=>{this.onChangeListParams("innet",val)}}>
                                        <Option value={1}>已/未入网</Option>
                                        <Option value={2}>已入网</Option>
                                        <Option value={3}>未入网</Option>
                                    </Select>
                                    <Select className='type-select margin-left-10px' value={online} onChange={(val)=>{this.onChangeListParams("online",val)}}>
                                        <Option value={1}>在/离线</Option>
                                        <Option value={2}>在线</Option>
                                        <Option value={3}>离线</Option>
                                    </Select>
                                </div>
                                <div className='searchBut'>
                                    <Button className='btn' type="primary" onClick={this.inquireDeviceList}>查询</Button><Button className='btn' onClick={this.resetSearch}>重置</Button>
                                </div>
                            </div>
                            <Table
                                className='devicetablelist'
                                rowKey='deviceUniqueId'
                                dataSource={list}
                                columns={columns}
                                pagination={false}
                            />
                        </div>
                        <div className="list-pagination">
                            {
                                pager && pager.totalRows>0 &&
                                <Pagination className="self-pa"
                                    total={pager.totalRows}
                                    current={pageIndex}
                                    defaultCurrent={1}
                                    defaultPageSize={pageRows}
                                    onChange={(page) => this.changePage(page)}
                                    showTotal={total => <span>共 <a>{total}</a> 条</span>}
                                    showQuickJumper
                                    hideOnSinglePage
                                ></Pagination>
                            }
                        </div>
                    </AloneSection>
                </div>
            </section>
        )
    }
}




