import React, { Component } from 'react';
import {get,post, Paths} from '../../../api';
import { Cascader, Select, Radio ,Form, Input,Button} from 'antd';
import './authorize.scss'
const { Option } = Select;

class CaseAddForm extends Component {
    constructor(props){
        super(props);
        this.state = {
            authType:0,//授权对象类型，0-产品；1-分组；2-资产
            searchType:0,//查询类型
           productList:[],
           deviceGroupList:[],
           dataAsset:[
               {
                   value: 1,
                   label: 'mqtt',
                   isLeaf:false,
                },
                {
                    value: 2,
                    label: 'mysql数据库',
                    isLeaf:false,
                 },
                //  {
                //     value: 3,
                //     label: 'http服务',
                //     isLeaf:false,
                //  },
                 {
                    value: 4,
                    label: 'redis',
                    isLeaf:false,
                 },
                 {
                    value: 5,
                    label: 'rocketMq',
                    isLeaf:false,
                 },
            ],
           dataInstanceList:[],
           searched:false,
           apiList:[]
        };
    }
    componentDidMount() {
        this.props.onRef(this);
        get(Paths.getCreateProduct,{pageRows:999}).then(res => {
            let productList = res.data.list || [];
            this.setState({productList});
        });
        get(Paths.getGroupListAuth,{pageRows:999}).then(res => {
            let deviceGroupList = res.data.list || [];
            this.setState({deviceGroupList});
        });
        get(Paths.getAuthorServeList,{pageRows:999,proEnv:2}).then(data => {
                const {list} = (data && data.data) || {list:[]};
                this.setState({apiList:list});
            }
        )
    }
    onChangeAuthType = (e)=>{
        this.setState({
            authType:e.target.value
        });

    }
    loadData=(selectedOptions)=>{
        const targetOption = selectedOptions[0];
        targetOption.loading = true;
        get(Paths.getDataAssetsListAuth,{
            pageRows:999,
            type:targetOption.value,
        }).then((res) => {
            targetOption.loading = false;
            let list = res.data.list || [];
            targetOption.children = list.map(item=>{
                return {label: item.name,value: item.id,}
            });
            this.setState({
                dataAsset: [...this.state.dataAsset],
            });
            


        });
    }
    cngSearchType =(searchType)=>{
        this.setState({searchType});
    }
    searchInstance=(keyval)=>{
        let searchType = this.state.searchType;
        if(keyval){//搜索被授权主体列表
            get(Paths.getAuthList,{type:searchType,param:keyval,pageRows:999}).then((res) => {
                if(res.code==0){
                    let dataInstanceList = res.data&&res.data.list || [];
                    this.setState({dataInstanceList,searched:true});
                }
            });
        }
    }
    getInstanceOptions = ()=>{
        let dataInstanceList = this.state.dataInstanceList;
        return dataInstanceList.map((itm)=>{
            let child = itm.instanceVos.map((_itm)=>{
                return {
                    value:_itm.id,
                    label:_itm.name || '--',
                }
            });
            return {
                value:`${itm.developerId},${itm.account}`,
                label:itm.account ||  '--',
                children:child
            }
        });
     }

    render() {
        let {authType,dataAsset,productList,deviceGroupList,apiList,searched } =this.state;
        let formlayout = {
            labelCol: { span: 5 },
            wrapperCol: { span: 18 },
        };
        let { getFieldDecorator} = this.props.form;
        let proselect = <Select
                            showSearch
                            placeholder="选择产品"
                            optionFilterProp="children"
                        >
                            {
                                productList.map((item,index)=>{
                                    return <Option key={index} value={item.productId}>{item.productName}</Option>
                                })

                            }
                        </Select>,
            devicegroupselect = <Select
                                    showSearch
                                    placeholder="选择设备组"
                                    optionFilterProp="children"
                                >
                                    {
                                        deviceGroupList.map((item,index)=>{
                                            return <Option key={index} value={item.id}>{item.name}</Option>
                                        })

                                    }
                                </Select>,
            datassetselect = <Cascader options={dataAsset} loadData={this.loadData} placeholder="请选择数据资产源" />,
            apiselect = <Select
                            showSearch
                            placeholder="选择API"
                            optionFilterProp="children"
                        >
                            {
                                apiList.map((item,index)=>{
                                    return <Option key={index} value={item.id}>{item.name}</Option>
                                })

                            }
                        </Select>;
        let tobojselect = {'0':proselect,'1':devicegroupselect,'2':datassetselect,'3':apiselect}[authType];

        return ( 
                <Form  {...formlayout} onSubmit={this.handleSubmit}>
                    <Form.Item label="授权对象类型">
                        {getFieldDecorator('authType', {rules: [{required: true,message: '请选择授权对象类型'}],
                            initialValue: 0
                        })(<Radio.Group onChange={this.onChangeAuthType}>
                            <Radio value={0}>产品</Radio>
                            <Radio value={1}>设备分组</Radio>
                            <Radio value={2}>数据资产源</Radio>
                            <Radio value={3}>API权限调用</Radio>
                          </Radio.Group>)
                        }
                    </Form.Item>
                    <Form.Item label="授权对象">
                        {getFieldDecorator({'0':'proid','1':'groupid','2':'toobjid','3':'apiid'}[authType], {
                            rules: [{required: true,message: '请选择授权对象'}],
                        })
                        (tobojselect)}
                    </Form.Item>
                    <Form.Item label="被授权主体">
                        {getFieldDecorator('authorizedType', {rules: [{required: true,message: '请选择被授权主体类型'}],
                            initialValue: 0
                        })(<Radio.Group>
                            <Radio value={0}>实例</Radio>
                          </Radio.Group>)
                        }
                    </Form.Item>
                    <div className='searchlistbox'>
                        <Input.Group compact className='searchbox'>
                            <Select style={{ width: '25%' }} defaultValue={0} onChange={this.cngSearchType}>
                                <Option value={0}>账户名</Option>
                                <Option value={1}>产品名</Option>
                            </Select>
                            <Input.Search style={{ width: '75%' }} placeholder="输入查询关键字"  
                                onSearch={this.searchInstance}
                            />
                        </Input.Group>
                        <Form.Item label="">
                            {getFieldDecorator('instanceObj', {rules: [{required: true,message: '请选择被授权实例'}],
                                
                            })(<Cascader style={{width:'450px'}}
                                    options={this.getInstanceOptions()}
                                    expandTrigger="hover"
                                    placeholder={searched&&'选择实例'||'请先在搜索框输入关键字查询'}
                                    disabled={!searched}
                                    
                                />)
                            }
                        </Form.Item>
                    </div>

                    
                    <Form.Item label="授权策略">
                        {getFieldDecorator('authPolicy', {rules: [{required: true,message: '请选择授权策略'}],
                            initialValue: 0
                        })(<Radio.Group>
                            <Radio value={0}>默认策略</Radio>
                          </Radio.Group>)
                        }
                    </Form.Item>




                    
                </Form>
               
          
        )
    }
}
export const AddForm = Form.create({
    name: 'caseAdd',
})(CaseAddForm);
