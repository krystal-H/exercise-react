import React, { PureComponent,useEffect } from 'react';
import {Modal, Table,Radio,Form,Select,Upload,Button } from 'antd';
import moment from 'moment';
import {get,post, Paths} from '../../../../api';
import SearchProduct from './searchProduct';
import './deviceGroup.scss';

export default class GroupDetailt extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            addWay:1,
            listLoading:false,
            list:[],
            pager:{},
            selectedRowKeys:[],
            addListParams:{
                pageIndex: 1,
                pageRows: 8,
                id:props.id,
                productId:-1,
                deviceUniqueId:undefined,
            },
            addProductList:[],
            
        };
        this.columns = [
            { title: '设备id', dataIndex: 'deviceUniqueId', key: 'deviceUniqueId'},
            { title: '所属产品', dataIndex: 'productName',  key: 'productName'},
            { title: '状态', dataIndex: 'status',  key: 'status',
                render: txt => <span>{ {'0':'有效','1':'未激活','2':'在线','3':'离线','4':'禁用'}[txt] }</span>},
            { title: '最后上线时间', dataIndex: 'lastOnlineTime', key: 'lastOnlineTime', 
                render: text => <span>{text && moment(text).add(8,'h').format('YYYY-MM-DD HH:mm:ss') || '--'}</span>
            }
        ];
    }
    componentDidMount() {
        this.props.onRef(this);
        this.getCreateProduct();
    }
    //获取产品下拉列表
    getCreateProduct = ()=>{
        get(Paths.getCreateProduct,{pageRows:999}).then((res) => {
            let addProductList = res.data.list;
            if(addProductList&&addProductList.length&&addProductList.length>0){
                this.setState({addProductList});
            }
           
        });
    }
    //获取列表
    getGroupAddDevList = ()=>{
        this.setState({listLoading:true})
        let{addListParams}=this.state;
        let params = {...addListParams}
        if(params.productId == -1){delete params.productId}
        get(Paths.getGroupSlctDev,params).then((res) => {
            let {list,pager} = res.data || {};
            if(res.code==0){
                this.setState({list,pager});
            }
        }).finally(()=>{
            this.setState({listLoading:false})
        });
    }
    //更新请求参数并获取列表
    setQuestParams=(key,val,isnot=false)=>{ //isnot 更新完state后是否需要请求列表
        let prestate = {...this.state.addListParams};
        prestate[key] = val || undefined;
        if(key!=="pageIndex"){
            prestate["pageIndex"] = 1
        }
        this.setState({addListParams:prestate},!isnot && this.getGroupAddDevList || undefined);

    }
    //更新选中的数据列表
    onSelectRowKeys=(selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };
    //确认添加
    addDeviceOk=()=>{
        let {addWay,selectedRowKeys} = this.state;
        if(addWay==1){
            let addlist = selectedRowKeys;
            if(addlist.length>0){
                post(Paths.addGroupDevice,{id:this.props.id,deviceIds:addlist.join(',')}).then((res) => {
                    this.setState({selectedRowKeys:[]});
                    this.props.openCloseAdd(true); 
                });
            }
        }else if(addWay==2){
            this.publicTypeForm();

        }

        
    }
    addUPload=(params)=>{
        params.groupId = this.props.groupid;
        params.type = 1;
        post(Paths.addDevice,params).then((res) => {
            // this.setState({selectedRowKeys:[]});
            this.props.openCloseAdd(true); 
        });

    }
    changeAddWay=(e)=>{
        let addWay = e.target.value;
        this.setState({addWay});

    }
    render() {
        let { addVisiable,openCloseAdd} =this.props;
        let { selectedRowKeys, list, pager, addWay,listLoading, addProductList } =this.state;
        const rowSelection ={
            selectedRowKeys,
            onChange: this.onSelectRowKeys,
        }
        return (
            <Modal
                title="添加设备到分组"
                visible={addVisiable}
                width={750}
                onOk={this.addDeviceOk}
                onCancel={()=>{openCloseAdd(false)}}
                maskClosable={false}
                closable={false}
                className="groupadd-device-modal"
            >
                <div className="addtype" >
                    <Radio.Group value={addWay} onChange={this.changeAddWay}>
                        <Radio value={1}>查找选择</Radio>
                        <Radio value={2}>本地导入</Radio>
                    </Radio.Group>
                </div>
                {
                addWay==1 ?
                <div className="">
                    <SearchProduct 
                        productList={addProductList}
                        changedfunc={val=>{this.setQuestParams('productId',val,true)}} 
                        searchedFunc={val=>{this.setQuestParams('deviceUniqueId',val)}}
                    />
                    <div className='list-content'>
                        <Table 
                            rowKey="deviceId"
                            columns={this.columns} 
                            dataSource={list}
                            rowSelection={rowSelection}
                            loading={!!listLoading}
                            pagination={{
                                defaultCurrent:pager.pageIndex, 
                                total:pager.totalRows, 
                                onChange:val=>{this.setQuestParams('pageIndex',val)},
                                current: pager.pageIndex
                            }} 
                        />
                    </div>
                </div> : 
                <UploadDevice productList={addProductList} onRef={ref => this.publicTypeForm = ref} addUPload={this.addUPload}></UploadDevice>
                }
            </Modal>


            
        )
    }
}


const UploadDevice =  Form.create({ name:'form-upload-device' })(function ({
    form,
    productList,
    onRef,
    addUPload,
}) {
    // const [labelList,setLabelList] = useState([])
    useEffect(() => {
        onRef(returnFormData);
        // console.log(222,returnFormData);
    }, []);
    const {getFieldDecorator,validateFields} = form;
    const returnFormData = ()=>{
        validateFields((err,values)=>{
            console.log(3333,values);
            if (!err){
                let {data,productId} = values,
                _data = '';

                if (data && data.fileList && data.fileList.length) {
                    let temp = data.fileList[0]

                    if (temp && temp.response && temp.response.data) {
                        _data = temp.response.data.url
                    }
                }
                let params = {
                    productId,
                    data:_data
                }
                addUPload(params)
            }
        })

    }

    const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 10 }
    };


    return (
        <div>
        <Form {...formItemLayout}>
            <Form.Item label="产品">
                {getFieldDecorator('productId', {
                    rules: [{ required: true, message: '请选择产品！' }],
                    initialValue:''
                })(
                    <Select showSearch optionFilterProp="children" placeholder="请选择产品">
                        <Select.Option value="" disabled selected>请选择产品</Select.Option>
                        {
                            productList.map(item => {
                                let {productName,productId} = item;
                                return (<Select.Option key={productId} value={productId}>{productName}</Select.Option>)
                            })
                        }
                    </Select>
                )}
            </Form.Item>
            <Form.Item label="上传文件">
                {getFieldDecorator('data', {
                    rules: [{ required: true, message: '请上传文件！' }],
                    // initialValue:[],
                })(
                    <Upload
                        accept='.xls,.xlsx' 
                        action={Paths.upFileUrl}
                        data={{
                            appId: 31438,
                            domainType: 4,
                        }}>
                        <Button type="primary" icon="upload">上传文件</Button><span style={{marginLeft:"15px"}}>仅支持.xls,.xlsx格式文件</span>
                    </Upload>
                )}
                <a href="http://skintest.hetyj.com/31438/6b0b20891e06ac31d0eed37a5083cca9.xlsx">下载模板</a>
            </Form.Item>
        </Form>
    </div>
    )
})

