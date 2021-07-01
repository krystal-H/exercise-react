import React, { Component,useState ,useEffect}  from 'react';
import { Form ,Input,Row,Col,Select,Radio} from 'antd';
import {get,post, Paths} from '../../../../../../api';
const {Option} = Select
const formlayout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const NUMCAL = [
    {id:'1',nam:'=='},
    {id:'2',nam:'>'},
    {id:'3',nam:'<'},
    {id:'4',nam:'>='},
    {id:'5',nam:'<='},
    {id:'6',nam:'!='},
    {id:'7',nam:'in'},
    {id:'8',nam:'between'},
];
const STRCAL = [
    {id:'1',nam:'='},
    {id:'6',nam:'!='},
    {id:'7',nam:'in'},
]
class RuleInfo extends Component {
    constructor(props) {
        super(props);
        
        this.triggerType = [
            {id:0,nam:'属性触发'},
            {id:1,nam:'事件触发'},
            {id:3,nam:'上线触发'},
            {id:4,nam:'下线触发'},
            {id:2,nam:'上下线触发'}
        ]
        
        this.state = {
            productList:[],//下拉产品列表
            deviceList:[],
            productId:'',
            triggerMode:'',//触发方式
            eventList:[],
            eventIdentifier:'',
            propEventList:[],
            ruletype:"0",//比较方式
        }

    }

    componentDidMount() {
        this.props.onRef(this);
        this.getDownProduct();
        this.stateToFormData();
        
    }

    handleSubmit = e => {
        // console.log("--rule---e---",e);
        // e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { saveRuleInfo} = this.props;
        
        validateFieldsAndScroll((err, values) => {
            
            if (!err) {
                let ruleFormData = this.formDataToState({...values});
                saveRuleInfo({ruleFormData,current:2});
            }
        });
    };
    //获取产品列表
    getDownProduct=()=>{
        get(Paths.getAllRelatedProduct,{pageRows:9999},{loading:true}).then((res) => {
                let productList = res.data.list;
                if(productList&&productList.length&&productList.length>0){
                    this.setState({productList});
                }
        });
    }
    //用接口数据初始化表单并初始化请求下拉列表
    stateToFormData = ()=>{
        let { ruleFormData, form } = this.props;
        if(!ruleFormData.productId) { return }//没有productId属性 代表是新增且没有保存（点击过下一步）过，次时不需要初始化表单 否则出错
        let { setFieldsValue } = form;
        console.log(777,ruleFormData);
        let { productId,deviceIds,triggerMode,connType} = ruleFormData;
        let values = { productId, deviceIds, triggerMode };
        this.setState({productId,triggerMode,ruletype:connType||"0"},()=>{
            this.getDownDevice(productId);
            if(triggerMode<2){
                if(triggerMode==1){//事件
                    this.getEventList();
                    let {eventName,eventIdentifier} = ruleFormData;
                    let eventval = eventIdentifier+","+eventName;
                    values.identifier = eventval;
                    this.getPropEvent(eventval);
                }else if(triggerMode==0){//属性
                    this.getPropEvent();
                }
                values.ruletype = connType || "0";
                for ( let i=0;i < ruleFormData.props.length; i++){
                    let {propName,propIdentifier,propFieldType, judge,propVal} = ruleFormData.props[i];
                    let str = i>0&&"_add"||"";
                    values[`propName${str}`] = `${propIdentifier},${propFieldType},${propName}`;
                    values[`judge${str}`]=judge;
                    values[`propVal${str}`]=propVal;
                }
                console.log(888,values);
            }
            setFieldsValue({...values});
        });

    }
    //表单数据转换为接口所需数据
    formDataToState = (values)=>{
        let { triggerName,productId,deviceIds,triggerMode} = values;
        let resdata ={triggerName,productId,deviceIds,triggerMode}; 
        if(triggerMode<2){//如果是属性或者事件
            let {identifier,ruletype,propName,judge,propVal } = values;
            if(identifier){
                let _event = identifier.split(",");
                resdata.eventName = _event[1];
                resdata.eventIdentifier = _event[0];
            }
            let proparr = propName.split(",");
            let props = [
                { propName:proparr[2], propIdentifier:proparr[0], propFieldType:proparr[1], judge, propVal }
            ];
            if(ruletype !== "0"){//如果是组合条件
                resdata.connType = ruletype;
                let { propName_add, judge_add, propVal_add } = values;
                let proparr_add = propName_add.split(",");
                props.push({ 
                    propName:proparr_add[2], 
                    propIdentifier:proparr_add[0], 
                    propFieldType:proparr_add[1], 
                    judge:judge_add, 
                    propVal:propVal_add
                })

            }
            resdata.props = props;
        }
        return resdata;

    }    
    //获取设备列表 by productId
    getDownDevice=(proid)=>{
        get(Paths.getDeviceList,{productId:proid,pageRows:9999,classType:1,infoType:1},{loading:true}).then((res) => {
            let deviceList = res && res.data && res.data.list || [];   
            // this.props.form.setFieldsValue({
            //     deviceIds:[]
            // })
            this.setState({deviceList});  
        });
    }

    //获取事件列表  by productId
    getEventList=()=>{
        let {productId} = this.state;
        get(Paths.getDownEventList,{productId},{loading:true}).then((res) => {
            let eventList = res && res.data || [];   
            
            this.setState({eventList});    
        });
    }
    //获取属性列表  by productId、triggerMod（0|1）、eventIdentifier（事件标识）
    getPropEvent=(eventIdentifier)=>{// eventIdentifier 传值则为事件否则为属性
        eventIdentifier = eventIdentifier&&eventIdentifier.split(",")[0] || undefined;
        let { productId } = this.state;
        let property = eventIdentifier&&1||0;
        let params = {productId,property,eventIdentifier};
        get(Paths.getDownPropEvent,params).then((res) => {
            let propEventList = res && res.data || [];   
            this.setState({propEventList});    
        });
    }
    //选择产品框值改变
    productChanged = (productId)=>{
        this.setState({productId});
        this.getDownDevice(productId);

    }
    //选择触发方式框值改变
    triggerModeChanged=(triggerMode)=>{
        if(triggerMode===1){
            this.getEventList();
            this.setState({propEventList:[]});
        }
        if(triggerMode===0){
            this.getPropEvent();
        }
        this.setState({triggerMode});
    }
    //选择事件框值改变
    eventChanged = (eventIdentifier)=>{
        this.setState({eventIdentifier});
        this.getPropEvent(eventIdentifier);

    }
    //选择条件类型框值改变
    ruletypeChanged = (e)=>{
        this.setState({ruletype:e.target.value});

    } 

    //条件规则dom
    getRuleDom = ()=>{
        let { getFieldDecorator } = this.props.form;
        let {triggerMode,ruletype,propEventList} = this.state;
        if(triggerMode !== 0 && triggerMode !==1 ){
            return null;
        }

        return  <>
            <Row gutter={14}>
                <Col span={16}  >
                    <Form.Item label="触发条件类型" labelCol={ {span: 5 }}>
                        {getFieldDecorator('ruletype', {
                            rules: [{ required: true, message: '请选择触发条件'}],
                            initialValue:"0"
                        })(<Radio.Group onChange={this.ruletypeChanged}>
                            <Radio value={"0"}>单条</Radio>
                            <Radio value={"and"}>and 组合</Radio>
                            <Radio value={"or"}>or 组合</Radio>
                        </Radio.Group>
                        )
                        }
                    </Form.Item>
                </Col>
            </Row>
            <SingleRule propEventList={propEventList} getFieldDecorator={getFieldDecorator} add=""/>
            {ruletype !== "0" && <>
            <Row gutter={[14]}><Col span={4} ></Col><Col style={{fontSize:"16px",fontWeight:'bold',marginBottom:'14px'}} span={6} >{ruletype}</Col></Row>
            <SingleRule propEventList={propEventList} getFieldDecorator={getFieldDecorator} add="_add"/>
            </>}
         </>
    }

    render() {
        let { productList,deviceList,triggerMode,productId,eventList } = this.state;
        let { getFieldDecorator } = this.props.form;
        return ( 
            <Form >
                <Row gutter={14}>
                    <Col span={10}  >
                        <Form.Item label="触发对象" {...formlayout}>
                            {getFieldDecorator('triggerName', {
                                rules: [{ required: true, message: '请选择触发对象'}],
                                initialValue:'deviceTrigger'
                                
                            })(<Select >
                                <Option value="deviceTrigger">设备触发</Option>
                            </Select>)
                            }
                        </Form.Item>
                    </Col>
                    <Col span={7}  >
                        <Form.Item >
                            {getFieldDecorator('productId', {
                                rules: [{ required: true, message: '请选择产品'}],
                            })(
                                <Select showSearch optionFilterProp="children" onChange={this.productChanged} placeholder='请选择产品'>
                                    {
                                        productList.map(item => {
                                            const {productId,productName} = item;
                                            return <Option key={productId} value={productId}>{productName}</Option>
                                        })
                                    }
                                </Select>
                            )
                            }
                        </Form.Item>
                    </Col>
                    <Col span={7}  >
                        <Form.Item >
                            {getFieldDecorator('deviceIds', {
                                rules: [{ required: true, message: '请选择设备'}],
                            })(
                                <Select allowClear mode="multiple" placeholder='请选择设备'>
                                    {
                                        deviceList.map(({deviceId,deviceMac}) => {
                                            return <Option key={deviceId} value={deviceId}>{deviceMac}</Option>
                                        })
                                    }
                                </Select>
                            )
                            }
                        </Form.Item>
                    </Col> 
                </Row>
                <Row gutter={14}>
                    <Col span={10}  >
                        <Form.Item label="触发方式" {...formlayout}>
                            {getFieldDecorator('triggerMode', {
                                rules: [{ required: true, message: '请选择触发方式'}],
                                
                            })(
                                <Select disabled={!productId} placeholder='请选择触发方式' onChange={this.triggerModeChanged}>
                                    {
                                        this.triggerType.map(item => {
                                            const {id,nam} = item;
                                            return <Option key={id} value={id}>{nam}</Option>
                                        })
                                    }
                                </Select>
                            )
                            }
                        </Form.Item>
                    </Col>
                    {   
                        triggerMode===1 && 
                        <Col span={7}  >
                            <Form.Item >
                                {getFieldDecorator('identifier', {
                                    rules: [{ required: true, message: '请选择事件'}],
                                })(
                                    <Select placeholder='请选择事件' onChange={this.eventChanged}>
                                        {
                                            eventList.map(item => {
                                                const {identifier,name} = item;
                                                return <Option key={identifier} value={identifier + "," + name}>{name}</Option>
                                            })
                                        }
                                    </Select>
                                )
                                }
                            </Form.Item>
                        </Col> 
                    }
                </Row>
                {this.getRuleDom()}
            </Form>
        )
    }
}

export const RuleForm = Form.create({
    name: 'ruleForm',
})(RuleInfo);


const SingleRule = prop => {
    
    const [propType, setPropType] = useState('');
    const [judgeDesc, setJudgeDesc] = useState('请输入比较值');
    useEffect(() => {
        
    }, []);
    
    const propNameChanged = (val)=>{
        let type = val.split(",")[1];
        setPropType(type);
    }
    const judgeChanged = (val)=>{
        let desc = "请输入比较直";
        if(val=="in"){
            desc = "多个值请以逗号隔开";
        }else if(val=="between"){
            desc = "逗号隔开起始值，例如“1,5” ";
        }
        setJudgeDesc(desc);
    }
    let { propEventList=[],getFieldDecorator,add } = prop;
    return (
        <Row gutter={14}>
            <Col span={10}  >
                <Form.Item label="触发规则" {...formlayout}>
                    {getFieldDecorator(`propName${add}`, {
                        rules: [{ required: true, message: '请选择属性'}],
                        // initialValue:''
                        
                    })(
                        <Select showSearch optionFilterProp="children" onChange={propNameChanged} placeholder='请选择属性'>
                            {
                                propEventList.map(item => {
                                    const {srcCode,srcName,srcType} = item;
                                    return <Option key={srcCode} value={srcCode+','+srcType+','+srcName}>{`${srcName}( ${srcCode} )`}</Option>
                                })
                            }
                        </Select>
                    )
                    }
                </Form.Item>
            </Col>
            <Col span={4}  >
                <Form.Item >
                    {getFieldDecorator(`judge${add}`, {
                        rules: [{ required: true, message: '请选择比较方式'}],
                    })(
                        <Select  onChange={judgeChanged} placeholder='比较方式'>
                            {
                                ((propType == "char" || propType=="string") && STRCAL || NUMCAL).map(item => {
                                    const {id,nam} = item;
                                    return <Option key={id} value={nam}>{nam}</Option>
                                })
                            }
                        </Select>
                    )
                    }
                </Form.Item>
            </Col>
            <Col span={10}  >
                <Form.Item >
                    {getFieldDecorator(`propVal${add}`, {
                        rules: [{ required: true, message: '请输入比较值'}],
                    })(
                        <Input placeholder={judgeDesc} />
                    )
                    }
                </Form.Item>
            </Col> 
        </Row>
        
    );
};
