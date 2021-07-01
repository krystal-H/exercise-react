import React, { PureComponent } from 'react'
import { Link } from 'react-router-dom';
import { Descriptions ,Button,Table,Divider } from 'antd';
import PageTitle from '../../../../components/page-title/PageTitle';
import AloneSection from '../../../../components/alone-section/AloneSection';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import { cloneDeep } from 'lodash';
import {get,post, Paths} from '../../../../api';
import moment from 'moment';
import DeviceList from './groupDeviceList';
import SearchProduct from './searchProduct';
import './deviceGroup.scss';

export default class GroupDetailt extends PureComponent {
    constructor(props) {
        super(props);
        this.id = props.match.params.groupid
        this.groupidid = props.match.params.groupidid

        

        this.defaultListParams = { // 设备列表相关默认请求参数
            pageIndex: 1,
            pageRows: 10,
            id:this.id,
            productId:-1,
            deviceUniqueId:undefined,
        }
        this.addListRefs=null;
        
        this.state = {
            listParams: cloneDeep(this.defaultListParams), // 设备列表的请求参数

            name:'--',
            groupId:'--',
            createTime:'--',
            remark:'--',
            deviceCount:'--',
            activeCount:'--',

            groupDevList:[],
            pager:{},
            productList:[],//下拉产品列表
            addVisiable:false,

            addProductList:[],//添加设备到分组时的产品选择列表

            selectedRowKeys:[],
            delid:'',deldeviceUniqueId:'',
            delVisable:false,


        }
        this.columns = [
            { title: '设备id', dataIndex: 'deviceUniqueId', key: 'deviceUniqueId'},
            { title: '所属产品', dataIndex: 'productName',  key: 'productName'},
            { title: '设备类型', dataIndex: 'productClass',  key: 'productClass',
                render: txt => <span>{txt == 0 && '普通设备' || '网关设备' }</span>},
            { title: '状态', dataIndex: 'status',  key: 'status',
                render: txt => <span>{ {'0':'有效','1':'未激活','2':'在线','3':'离线','4':'禁用'}[txt] }</span>},
            { title: '最后上线时间', dataIndex: 'lastOnlineTime', key: 'lastOnlineTime', 
                render: text => <span>{text && moment(text).add(8,'h').format('YYYY-MM-DD HH:mm:ss') || '--'}</span>
            },
            
            { title: '操作', key: 'action', width:'200px',
                render: (text, record) => (
                    <span>
                        <Link key="detail" to={'/open/base/device/onlineDevice/details/' + record.deviceId}>查看</Link>
                        <Divider type="vertical" />
                        <a onClick={this.openDel.bind(this,record.deviceId,record.deviceUniqueId)} >从分组中删除</a>
                    </span>
                ),
            },
        ];
       

    }
    openDel = (delid,deldeviceUniqueId)=>{
        this.setState({delVisable:true});
        if(delid){
            console.log(delid);
            this.setState({delid,deldeviceUniqueId});
        }

    }
    componentDidMount() {
        this.getDetail();
        this.getDownProduct();
        this.getGroupDevList();
     
    }
    getDetail=()=>{
        get(Paths.getGroupDetail,{id:this.id}).then((res) => {
            let{name,createTime,remark,deviceCount,activeCount,groupId} = res.data;
            this.setState({
                name,
                remark,
                deviceCount,
                activeCount,
                groupId,
                createTime:moment(createTime).add(8,'h').format('YYYY-MM-DD HH:mm:ss'),
            });
        });
    }
    //获取产品下拉列表
    getDownProduct=()=>{
        get(Paths.getDownProduct,{pageRows:999}).then((res) => {
            let productList = res.data.list;
            if(productList&&productList.length&&productList.length>0){
                this.setState({productList});
            }
        });
    }
    //获取分组中的设备列表
    getGroupDevList=()=>{
        let params = cloneDeep(this.state.listParams);
        if(params.productId == -1){delete params.productId}
        get(Paths.getGroupDeviceList,params).then((res) => {
            let {list,pager} = res.data || {};
            this.setState({groupDevList:list,pager});
        });
    }
    //更新请求参数并且重新获取列表
    setParams = (key,val,isnot=false)=>{
        let params = cloneDeep(this.state.listParams);
        params[key] = val || undefined;
        if(key!=="pageIndex"){
            params["pageIndex"] = 1
        }
        
        this.setState({listParams:params},!isnot&&this.getGroupDevList||undefined);
    }
    //打开或关闭添加设备的弹窗
    openCloseAdd=(getList=false)=>{
        let addVisiable = !this.state.addVisiable;
        this.setState({addVisiable});
        if(addVisiable){
            this.addListRefs.setQuestParams("pageIndex",1);
            this.addListRefs.setState({addWay:1});
        }else{
            if(getList){ //关闭弹窗时候，getList 为 true 则需要重新请求列表
                this.getGroupDevList();
            }
        }    
    }
    onSelectRowKeys=(selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };
    //删除组中设备
    delOkCancel=(type)=>{
        let {delid,selectedRowKeys} = this.state;
        if(type == 'ok'){
            post(Paths.delGroupDevice,{id:this.id,deviceIds:delid||selectedRowKeys.join(',')}).then((res) => {
                if(res.code==0){
                    this.getGroupDevList();
                    this.setState({delid:'',delVisable:false,selectedRowKeys:[]});
                }
            });

        }else{
            this.setState({delid:'',delVisable:false});
        }

    }
    render() {
        let {name,createTime,remark,deviceCount,activeCount,groupId,productList,
            groupDevList,addVisiable,selectedRowKeys,
            pager,delVisable,delid,deldeviceUniqueId,addProductList
        } = this.state;
        const rowSelection ={
            selectedRowKeys,
            onChange: this.onSelectRowKeys,
        }
        return (
            <section className="page-main-wrapper groupdetailpage flex-column">
                <PageTitle title="设备分组详情"></PageTitle>
                <header className="page-content-header">
                    <Descriptions title="" className='descriptions' column={2}>
                        <Descriptions.Item label="分组名称" >{name}</Descriptions.Item>
                        <Descriptions.Item label="分组ID">{groupId}</Descriptions.Item>
                        <Descriptions.Item label="创建时间">{createTime}</Descriptions.Item>
                        <Descriptions.Item label="描述">{remark}</Descriptions.Item>
                    </Descriptions>
                    <ul className="device-inine-data">
                        <li>
                            <p><span className="icon-cube"></span>设备总数</p>
                            <span className="count">{deviceCount}</span>
                        </li>
                        <li>
                            <p><span className="icon-cube"></span>激活设备数</p>
                            <span className="count">{activeCount}</span>
                        </li>
                    </ul> 
                    
                </header>
                <AloneSection title="设备列表">
                    <div className="alone-section-content-default">
                        <SearchProduct 
                            productList={productList}
                            changedfunc={val=>{this.setParams('productId',val,true)}} 
                            searchedFunc={val=>{this.setParams('deviceUniqueId',val)}}
                        />
                        <div className='search-box'>
                            <Button className='but-add' type="primary" onClick={this.openCloseAdd}>添加设备到分组</Button>
                        </div>
                        <div>
                            <Button disabled={selectedRowKeys.length==0} className='but-del' type="primary" onClick={this.openDel.bind(this,0)}>删除</Button>
                            <Table 
                                rowKey="deviceId"
                                columns={this.columns} 
                                dataSource={groupDevList}
                                rowSelection={rowSelection}
                                pagination={{
                                    defaultCurrent:pager.pageIndex, 
                                    total:pager.totalRows, 
                                    hideOnSinglePage:false,
                                    onChange:val=>{this.setParams('pageIndex',val)},
                                    current: pager.pageIndex
                                }} 
                            />
                        </div>
                    </div>
                </AloneSection>
               
                <DeviceList 
                    addVisiable={addVisiable} 
                    onRef={ref=>{this.addListRefs = ref}}  
                    productList={addProductList}
                    id={this.id}
                    groupid={this.groupidid}
                    openCloseAdd={this.openCloseAdd}
                />
                
                <ActionConfirmModal
                    visible={delVisable}
                    modalOKHandle={this.delOkCancel.bind(this,'ok')}
                    modalCancelHandle={this.delOkCancel.bind(this,'cancel')}
                    title='从分组中删除'
                    descText={`即将删除${delid?"设备":"选中的"}`}
                    targetName={delid?`${deldeviceUniqueId}`:`${selectedRowKeys.length}个设备`}
                />

            </section>
        )
    }
}
