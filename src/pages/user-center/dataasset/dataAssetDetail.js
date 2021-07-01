import React, { Component,createRef } from 'react';
import {get,post, Paths} from '../../../api';
import {Select, Input,Row ,Col , Button, Card ,Form,Icon} from 'antd';
import PageTitle from '../../../components/page-title/PageTitle';
import TextAreaCounter from '../../../components/textAreaCounter/TextAreaCounter';
import './dataasset.scss';
import {Notification} from '../../../components/Notification';
import ParamsTable from './ParamsTable';


class DataDetailForm extends Component {
    constructor(props){
        super(props);
        // this.ref0 = createRef();
        this.ref1 = createRef();
        this.param ={
            '1':{
                // "addr":"数据源地址",
                // "port":"端口号",
                "userName":"用户名",
                "pwd":"密码",
                "topic":"队列名"
            },
            '2':{
                "addr":"数据源地址",
                "port":"端口号",
                "database":"数据库名",
                "userName":"用户名",
                "pwd":"密码"
            },
            '3':{
                "addr":"url",
                "type":"POST",
                // "param":"参数列表", //参数列表 另外在form表单外特殊处理
            },
            '4':{
                "addr":"数据源地址",
                "port":"端口号",
                "database":"数据库",
                "pwd":"密码"
            },
            '5':{
                // "addr":"数据源地址",
                // "port":"端口号",
                "topic":"队列名",
                "tags":'tags_多个标签请用竖线隔开，例如“a|b|c”'
            },
        }
        
        this.state = {
            typeList:[
                {id:1,name:'mqtt'},
                {id:2,name:'mysql数据库'},
                // {id:3,name:'http服务'},
                {id:4,name:'redis'},
                {id:5,name:'rocketMq'},
            ],
            assetType:1,
            projectList:[],
        };
    }
    componentDidMount() {
        
        let {id} = this.props.match.params;//id 0 新增,非零 编辑或者查看
        get(Paths.getProjectList).then(
            data => {
                data && data.data && this.setState({projectList:data.data});
            }
        )
        
        if(id>0){
            get(Paths.getInfoDataAssets,{id},{loading:true}).then((res) => {
                let {dataJson,name,remark,type,projectId} = res.data;
                let congfidata = this.toFormdata(dataJson,type);
                let setstateobj = { assetType:type };
                if(type==3){
                    // setstateobj.param0 = congfidata.param_0;
                    setstateobj.param1 = congfidata.param_1;
                    delete congfidata.param0;
                    delete congfidata.param1;
                }

                this.setState(setstateobj,()=>{
                    this.props.form.setFieldsValue({
                        type,
                        name,
                        remark,
                        ...congfidata,
                        projectId:projectId && projectId.split(',').map(item=>{return +item}) || []
                    });
                });
            });
        }  
        
    }
    
    getTypeList = ()=>{
        let li = [
            {id:1,name:'mqtt'},
            {id:2,name:'mysql数据库'},
            // {id:3,name:'http服务'},
            {id:4,name:'redis'},
            {id:5,name:'rocketMq'}
        ];
        if(this.props.developerInfo.account==="het-developer"){
            li.push({id:3,name:'http服务'})
        }
        return li;
    }

    //根据不同数据源类型不同的配置参数
    getFormParDom = (environment=0)=>{
        let {getFieldDecorator} = this.props.form;
        let type = this.state.assetType;
        let parobj = Object.assign({},this.param[type+'']);
        let domList = [];

        for ( let k in parobj){
            let labetit = parobj[k].split("_");
            let labelname = labetit[0];
            let idname = `${k}_${environment}`;
            let placeholdertxt = labetit[1] || labetit[0];

            let dom = <Form.Item  label={labelname} key={idname}>
                            {getFieldDecorator(idname, {
                                rules: [{ required: this.configIsRequired(type,k), message: `请输入${labelname}`},{ max: 100, message: '最大输入长度为100' }],
                            })(<Input placeholder={placeholdertxt}
                                 disabled={type==1 && environment==0} 
                                 onChange={ (e)=>{type==1 && environment==1 && this.changeMqtt(e.target.value,`${k}_0`)}} />)
                            }
                        </Form.Item>;

            domList.push(dom);
    
    
        }
        return domList;
    }
    changeMqtt = (val,idname)=>{
        let filval = {[idname]:val}
        this.props.form.setFieldsValue(filval);
    }
    //环境配置里的字段是否必填项
    configIsRequired = (type,key)=>{
        if(type == 4 && key =='pwd'){//redis的密码
            return false;
        }
        if(type == 5 && key =='tags'){//rocketMq的tags
            return false;
        }
        return true;
    }

    //切换数据源类型
    changeType=(assetType)=>{
       this.setState({assetType});

    }
    
    //保存
    handleSubmit = (e)=>{
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((err, values) => {
            if(!err){
                let {name,remark,type,projectId} = values;
                let paramsobj = {name,remark,type,dataJson: this.getJsonStr(values),projectId:projectId&&projectId.join(',')},
                    requesturl = Paths.addDataAssets;
                let id = this.props.match.params.id;
                if(id!=0){
                    requesturl = Paths.updateDataAssets;
                    paramsobj.id = id;
                }

                // console.log('...paramsobj...',paramsobj);return;
                post(requesturl,paramsobj).then((res) => {
                    if(res.code==0){
                        window.location.hash='/userCenter/dataasset';
                    }
                });
            }
        });
    }

    //过滤掉http服务参数列表里没填参数名的行
    filterParams =(list)=>{
        let newarr = [];
        list.forEach(item=>{
            if(item.name){
                newarr.push(item);
            }
        })
        return newarr;
    }

    //环境配置参数由表单数据转为接口所需格式
    getJsonStr=(values,environment)=>{
        let dataJsonObj ={}, obj0 = {}, obj1={};
        let dataobj = Object.assign({},values);

        if(this.state.assetType==3){//http服务
            // let list0 = this.ref0.current.sourcelist;
            let list1 = this.ref1.current.sourcelist,
                filterlist = this.filterParams(list1);//过滤掉没填参数名的行
            dataobj.param_0 = filterlist;
            dataobj.param_1 = filterlist;
        }

        // if(dataobj.type == 5){//type=5 的取消了addr 、port、groupName三个字段 所以此处不需要再做本来需要的特殊处理
        //     let {addr_0,port_0,addr_1,port_1,} = dataobj;
        //     dataobj['addr_0'] = addr_0+":"+port_0;
        //     dataobj['addr_1'] = addr_1+":"+port_1;
        //     delete dataobj.port_0;
        //     delete dataobj.port_1;
        // }
        for(let keyname in dataobj){
            if(keyname.indexOf('_0') > -1){
                obj0[keyname.slice(0,-2)] = dataobj[keyname]
            }
            if(keyname.indexOf('_1') > -1){
                obj1[keyname.slice(0,-2)] = dataobj[keyname]
            }
        }

        if(environment!=0){//保存的时候没有传environment
            dataJsonObj['1'] = obj1;
        }
        if(environment!=1){
            dataJsonObj['0'] = obj0;
        }
        let jsonStr = JSON.stringify(dataJsonObj);


        return jsonStr;
    }
    //环境配置参数由接口返回数据转为表单格式数据,用于详情页初始化表单
    toFormdata=(jsonstr,type)=>{
        let dataJsonObj = JSON.parse(jsonstr),formdata = {};
        let obj0 = dataJsonObj['0'] || {}, obj1=dataJsonObj['1'] || {};

        // if(type==5){//type=5 的取消了addr 、port、groupName三个字段 所以此处不需要再做本来需要的特殊处理
        //     let addr_0 = obj0['addr'];
        //     let addr_1 = obj1['addr'];
        //     let arr0 = addr_0.split(':'), arr1 = addr_1.split(':');
        //     obj0['addr'] = arr0[0]; obj0['port'] = arr0[1];
        //     obj1['addr'] = arr1[0]; obj1['port'] = arr1[1];
        // }

        for(let keyname in obj0){
            formdata[keyname+'_0'] = obj0[keyname];
        }
        for(let keyname in obj1){
            formdata[keyname+'_1'] = obj1[keyname];

        }
        console.log('formdata--',formdata);
        return formdata;

    }

    //测试 环境配置
    testConfig=(environment)=>{
        const {getFieldsValue } = this.props.form;
        let formdata = Object.assign({},getFieldsValue());
        let {name,remark,type} = formdata;
        if(!name){
            Notification({type:'warn',description:'数据资源名称不能为空'});
            return;
        }
        if(!remark){
            Notification({type:'warn',description:'数据资源描述不能为空'});
            return;
        }
        for(let keyname in formdata){
            if(keyname.indexOf('_'+environment) > -1 && !formdata[keyname] && this.configIsRequired(type,keyname.slice(0,-2)) ){
                // console.log( type,keyname);
                Notification({type:'warn',description:`请将${environment==1?'测试':'生产'}环境配置完整`});
                return;
            }
        }
        post(Paths.testDataAssets,{name,remark,type,dataJson: this.getJsonStr(formdata,environment)}).then((res) => {
            Notification({type:'success',description:'通过'}); 
        });
    }
    
    
    render() {
        let {assetType,projectList,param0,param1} = this.state;
        let typeList = this.getTypeList();
        
        let formlayout = {
            labelCol: { span: 2 },
            wrapperCol: { span: 12 },
        };
        let { getFieldDecorator,getFieldValue } = this.props.form;
        let {id,readOnly} = this.props.match.params;
        let pageTit = readOnly?'详情':(id==0&&'创建数据资产源'||'修改数据资产源');
        let isdisabled = readOnly==1;
        return (

            <div className="asset-detail-page">
                <PageTitle backHandle={() => this.props.history.goBack()} title="数据资产源" />
                <div className='commonContentBox'>
                    <div className='title'>{pageTit}</div>
                    <div className='centent' style={{position:'relative'}}>

                        <Form {...formlayout} onSubmit={this.handleSubmit}>
                            <Form.Item label="类型">
                                {getFieldDecorator('type', {
                                    rules: [{required: true,message: '请选择数据资产源类型'}],
                                    initialValue: 1
                                })
                                (<Select placeholder="选择类型" onChange={this.changeType}
                                >
                                    {
                                        typeList.map((item)=>{
                                            return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                                        })
                                    }
                                </Select>)}
                            </Form.Item>
                            <Form.Item label="所属项目">
                                {getFieldDecorator('projectId', {
                                    // rules: [{required: true,message: '请选择所属项目'}],
                                    // initialValue: [1,2,3]
                                })
                                (<Select placeholder="选择所属项目" allowClear mode="multiple" disabled={isdisabled}
                                >
                                    {
                                        projectList.map((item,index)=>{
                                            return <Select.Option key={index} value={item.projectId}>{item.name}</Select.Option>
                                        })
                                    }
                                </Select>)}
                            </Form.Item>
                            <Form.Item label="名称">
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: '请输入数据源名称'},
                                            { max: 20, message: '最大输入长度为30' }],
                                    // initialValue: ''
                                })(<Input placeholder="数据源名称" />)
                                }
                            </Form.Item>
                            <TextAreaCounter ref="pramsRef2"
                                label="描述"
                                formId='remark'
                                astrictNub='200'
                                rows='3'
                                isRequired={true}
                                placeholder='数据资产源描述' 
                                getFieldDecorator={getFieldDecorator}
                                getFieldValue={getFieldValue}
                            />

                            <Row gutter={24}>
                                    <Col span={12}>
                                        <Card title="测试环境配置：" className='titleenvironment' bordered={false}>
                                            {assetType&&this.getFormParDom(1)}
                                            {/* {assetType==3&&<ParamsTable ref={this.ref1} list={param1}/>} */}
                                            {/* {!isdisabled && <a className='testbtn' onClick={this.testConfig.bind(this,1)} >测试</a>} */}
                                        </Card>
                                </Col>
                                <Col span={12}>
                                        <Card title="生产环境配置：" className='titleenvironment' bordered={false}>
                                            {assetType&&this.getFormParDom(0)}
                                            {/* {assetType==3&&<ParamsTable ref={this.ref0} list={param0}/>} */}
                                            {/* {!isdisabled && <a className='testbtn' onClick={this.testConfig.bind(this,0)} >测试</a>} */}
                                        </Card>
                                </Col>
                            </Row>
                            {assetType==3&&<ParamsTable ref={this.ref1} list={param1}/>}
                            <Row gutter={48}>
                                <Col span={12}>
                                    {!isdisabled && <a className='testbtn' onClick={this.testConfig.bind(this,1)} >测试</a>}
                                </Col>
                                <Col span={12}>
                                    {!isdisabled && <a className='testbtn' onClick={this.testConfig.bind(this,0)} >测试</a>}
                                </Col>
                            </Row>
                            {   !isdisabled&&
                                <div className='btnbox'>
                                    <Button  className='btn' onClick={() => this.props.history.goBack()} >取消</Button>
                                    <Button type="primary" htmlType="submit" className='btn'>保存</Button>
                                </div>
                            }
                        </Form>

                        {isdisabled&&<div className='mask'></div>}
                    </div>
                    
                </div>
                
            </div>
          
        )
    }
}
export default Form.create({
    name: 'dataassetdetail',
})(DataDetailForm);
