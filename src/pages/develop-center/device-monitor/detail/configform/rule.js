import React, { Component,useState ,useEffect}  from 'react';
import { Form ,Input,DatePicker,Col,Select,Radio,Button} from 'antd';
import {get,post, Paths} from '../../../../../api';
import { cloneDeep } from "lodash";
import { idName } from '../../../../../components/ObjectView/types';
const formlayout = {
    labelCol: { span:4},
    wrapperCol: { span: 16 },
};
const {Option} = Select
const {RangePicker} = DatePicker

const NUMCAL = [
    {id:'==',nam:'等于'},
    {id:'>',nam:'大于'},
    {id:'>=',nam:'大于等于'},
    {id:'<',nam:'小于'},
    {id:'<=',nam:'小于等于'},
];
const WARNTYPE = [
    {id:'noDeviceData',nam:'设备无数据告警'},
    {id:'peak',nam:'设备数据触发阈值告警'},
    {id:'statistical',nam:'设备时间段内数据汇聚输出'},
    {id:'threshold',nam:'设备数据持续触发阈值告警'},
]
const dftRule = {
    ruleType:"noDeviceData",
    ruleId:"",
    stickTime:"",
    resendIntervalTime:"",
}
const dftPro = {
    info:{
        productId:'',
        productName:''
    },
    rules:[cloneDeep(dftRule)]
}
const dftDevgroup = {
    name:'',
    uniqueId:'',
    products:[cloneDeep(dftPro)]
}
class RuleInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connector_type:'rocketmq',
            connector_topic:'IOT_DEVICE_MONITOR_TOPIC_2021',
            connector_tag:undefined,
            connector_url:undefined,
            campusConf:[cloneDeep(dftDevgroup)]
        }

    }

    componentDidMount() {
        // this.props.onRef(this);
        let {ruleFormData:{sinkConf,campusConf}} = this.props;
        this.setState({...sinkConf,campusConf:cloneDeep(campusConf)})
        
    }
    changeParam=(val,keyname,indexarr)=>{
        let campusConf = cloneDeep(this.state.campusConf)
        let [groupindex,proindex,ruleindex] = indexarr
        if(val.target){
            val = val.target.value
        }
        if(keyname == "fields"){
            val = val.split(',')
        }
        campusConf[groupindex].products[proindex].rules[ruleindex][keyname] = val
        this.setState({campusConf})
    }

    //获取一条规则的表单内容
    getOneWarForm = (ruleType,otherdata,indexarr)=>{
        let {startTime,endTime,stickTime,judgeField,judgeValue,judgeType} = otherdata
        switch (ruleType) {
            case 'noDeviceData':
                let {resendIntervalTime} = otherdata
                return <>
                    <div className='oneline'>
                        <span className='label'>配置时长</span>
                        <Input className='timeinput' value={stickTime} onChange={val=>{this.changeParam(val,'stickTime',indexarr)}}/>毫秒无数据，则触发告警
                    </div>
                    <div className='oneline'>
                        <span className='label'>规则重发时间间隔</span>
                        <Input className='timeinput' value={resendIntervalTime} onChange={val=>{this.changeParam(val,'resendIntervalTime',indexarr)}}/>毫秒
                    </div>
                </>
            case 'peak':
                // let {startTime,endTime,judgeField,judgeValue,judgeType} = otherdata
                return <>
                    <div className='oneline'>
                        <span className='label'>配置起止时间</span>
                        <Input onChange={val=>{this.changeParam(val,'startTime',indexarr)}} placeholder='例：08:30:00' className='hourtime' value={startTime}/><span className='rangeline'>--</span>
                        <Input onChange={val=>{this.changeParam(val,'endTime',indexarr)}} placeholder='例：09:30:00' className='hourtime' value={endTime}/>
                    </div>
                    <div className='oneline'>
                        <span className='label'>比较的字段和值</span>
                        <Input onChange={val=>{this.changeParam(val,'judgeField',indexarr)}} placeholder='输入比较的字段' className='kvinput' value={judgeField} /><span className='rangeline'>:</span>
                        <Input onChange={val=>{this.changeParam(val,'judgeValue',indexarr)}} placeholder='输入字段的值' className='kvinput' value={judgeValue} />
                    </div>
                    <div className='oneline'>
                        <span className='label'>比较方式</span>
                        <Select placeholder='比较方式' defaultValue={'=='} value={judgeType} className='compareselect' onChange={val=>{this.changeParam(val,'judgeType',indexarr)}}>
                            {NUMCAL.map(({id,nam})=><Option key={id} value={id}>{nam}</Option>)}
                        </Select>
                        <span className='desc'>备注：与数据流转rocketMQ中数据做对比。</span>
                    </div>
                </>
            case 'statistical':
                let {fields} = otherdata
                return <>
                    <div className='oneline'>
                        <span className='label'>配置起止时间</span>
                        <Input value={startTime} onChange={val=>{this.changeParam(val,'startTime',indexarr)}} placeholder='例：08:30:00' className='hourtime'/><span className='rangeline'>--</span>
                        <Input value={endTime} onChange={val=>{this.changeParam(val,'endTime',indexarr)}} placeholder='例：09:30:00' className='hourtime'/>
                    </div>
                    <div className='oneline'>
                        <span className='label'>需获取的字段</span>
                        <Input value={fields && fields.join(',') || ''} onChange={val=>{this.changeParam(val,'fields',indexarr)}} placeholder='可输入多个，英文逗号隔开' className='manykey'/>
                    </div>
                    <div className='oneline'><span className='desc solo'>备注：蒋获取的字段k-v值做推送。</span></div>
                </>
            case 'threshold':
                return <>
                    <div className='oneline'>
                        <span className='label'>配置起止时间</span>
                        <Input value={startTime} onChange={val=>{this.changeParam(val,'startTime',indexarr)}} placeholder='例：08:30:00' className='hourtime'/><span className='rangeline'>--</span>
                        <Input value={endTime} onChange={val=>{this.changeParam(val,'endTime',indexarr)}} placeholder='例：09:30:00' className='hourtime'/>
                    </div>
                    <div className='oneline'>
                        <span className='label'>比较的字段和值</span>
                        <Input onChange={val=>{this.changeParam(val,'judgeField',indexarr)}} placeholder='输入比较的字段' className='kvinput' value={judgeField} /><span className='rangeline'>:</span>
                        <Input onChange={val=>{this.changeParam(val,'judgeValue',indexarr)}} placeholder='输入字段的值' className='kvinput' value={judgeValue} />
                    </div>
                    <div className='oneline'>
                        <span className='label'>比较方式</span>
                        <Select onChange={val=>{this.changeParam(val,'judgeType',indexarr)}} placeholder='比较方式' defaultValue={'=='} value={judgeType} className='compareselect'>
                            {NUMCAL.map(({id,nam})=><Option key={id} value={id}>{nam}</Option>)}
                        </Select>
                        <span className='desc'>备注：与数据流转rocketMQ中数据做对比。</span>
                    </div>
                    <div className='oneline'>
                        <span className='label'>持续时长</span><Input onChange={val=>{this.changeParam(val,'stickTime',indexarr)}} className='timeinput' value={stickTime} />毫秒
                    </div>
                </>
            default:
              return null;
          }

    }
    getRuleFormData = ()=>{
        let {connector_type,connector_topic,connector_tag,connector_url,campusConf} = this.state
        let sinkConf = {connector_type}
        if(connector_type=='rocketmq'){
            sinkConf.connector_topic = connector_topic;
            sinkConf.connector_tag = connector_tag;
        }else{
            sinkConf.connector_url = connector_url;
        }
        return {
            sinkConf,
            campusConf:cloneDeep(campusConf)
        }
    }

    handleSubmit = e => {
        const {baseFormData,ruleId} = this.props;
        let data = {
            ...baseFormData,
            ruleConf:JSON.stringify(this.getRuleFormData()),
        },
        url = Paths.addMonitor;
        if(ruleId){
            data.id=ruleId;
            url = Paths.updateMonitor;

        }
        get(url,data).then((res) => {
            console.log(11111,res)
        });
        
        // console.log("--rule---e---",e);
        // e.preventDefault();
        // const { validateFieldsAndScroll } = this.props.form;
        // const { saveRuleInfo} = this.props;
        
        // validateFieldsAndScroll((err, values) => {
        //     console.log(33333,values);
            
        //     if (!err) {
        //         let ruleFormData = this.formDataToState({...values});
        //         saveRuleInfo({ruleFormData,current:2});
        //     }
        // });
    };
    goPre=()=>{
        // this.props.goToStep(0)
        this.props.setRuleFormData(this.getRuleFormData())
    }
    changeNoticeType=(e)=>{
        let connector_type = e.target.value;
        this.setState({connector_type})
    }
    changeUrl=(connector_url)=>{
        this.setState({connector_url})
    }
    //增加规则
    addRule=(groupindex,proindex)=>{
        let campusConf = cloneDeep(this.state.campusConf)
        campusConf[groupindex].products[proindex].rules.push(cloneDeep(dftRule))
        this.setState({campusConf})
    }
    //增加产品
    addPro=(groupindex)=>{
        let campusConf = cloneDeep(this.state.campusConf)
        campusConf[groupindex].products.push(cloneDeep(dftPro))
        this.setState({campusConf})
    }
    //增加分组
    addGroup=()=>{
        let campusConf = cloneDeep(this.state.campusConf)
        campusConf.push(cloneDeep(dftDevgroup))
        this.setState({campusConf})
    }
    //切换索引号为[index,indx,idx]的一条规则类型
    changeWarType = (value,index,indx,idx)=> {
        let campusConf = cloneDeep(this.state.campusConf)
        campusConf[index].products[indx].rules[idx].ruleType = value
        this.setState({campusConf})
    }
    changeGroup = (val,index)=>{
        const campusConf = cloneDeep(this.state.campusConf)
        const [id,name] = val.split('_|_')
        campusConf[index].uniqueId = id
        campusConf[index].name = name
        this.setState({campusConf})

    }
    changePro = (val,index,indx)=>{
        const campusConf = cloneDeep(this.state.campusConf)
        const [id,name] = val.split('_|_')
        campusConf[index].products[indx].info.productId = id
        campusConf[index].products[indx].info.productName = name
        this.setState({campusConf})
    }
    render() {
        const { campusConf,connector_type,connector_topic,connector_tag,connector_url } = this.state;
        // let { getFieldDecorator } = this.props.form;
        const {devicegrouplist,productList} =this.props;
        return <> 
            <Form {...formlayout}>

                <Form.Item label='通知方式'>
                    <Radio.Group value={connector_type} onChange={this.changeNoticeType}>
                        <Radio value="rocketmq">rocketMQ</Radio>
                        <Radio value="dingtalk">钉钉推送</Radio>
                    </Radio.Group>
                </Form.Item>
                {
                    connector_type=='rocketmq'&& <>
                    <Form.Item label='topic' >
                        <Select value={connector_topic}>
                            <Option value={connector_topic}>{connector_topic}</Option>
                        </Select>
                    </Form.Item>
                    {connector_tag&&
                    <Form.Item label='tag' >
                        <Select value={connector_tag}>
                            <Option value={connector_tag}>{connector_tag}</Option>
                        </Select>
                    </Form.Item>}
                    </>||
                    <Form.Item label='钉钉推送地址'>
                       <Input value={connector_url} placeholder='请输入钉钉推送地址' onChange={val=>{this.changeUrl(val)}}/>
                    </Form.Item>
                }
                <div className='devicegroupbox'>
                    {campusConf.map(({uniqueId,name,products},index)=>{
                        return <div key={uniqueId+'_'+index} className='devicegroup'>
                                    <Form.Item className='groupselect' label={`设备分组${ campusConf[1]&&(index+1)||'' }`}>
                                        <Select placeholder='请选择设备分组' value={uniqueId+'_|_'+name} onChange={(val)=>{this.changeGroup(val,index)}}>
                                            {devicegrouplist.map(({id,name})=>{
                                                return <Option key={id} value={id+'_|_'+name}>{name}</Option>

                                            })
                                            }
                                        </Select>
                                    </Form.Item>
                                    <div className='pro-gropubox'>
                                        {products.map(({info,rules},indx)=>{
                                            let {productId,productName} = info;
                                            return <div className='pro-group' key={productId+'_'+indx}>
                                                        <Select className='proselect' placeholder='选择产品'
                                                            showSearch optionFilterProp="children" 
                                                            value={productId+'_|_'+productName}
                                                            onChange={(val)=>{this.changePro(val,index,indx)}}
                                                        >
                                                            {productList.map(({productId,productName} ,index)=>{
                                                                return <Option key={index} value={productId+"_|_"+productName}>{productName}</Option>
                                                            })}
                                                        </Select>


                                                        <div className='rulebox'>
                                                            {rules.map(({ruleType,...otherdata},idx)=>{
                                                                return <div className='rule' key={idx}>
                                                                            <Select placeholder='选择告警方式' onChange={(value)=>{this.changeWarType(value,index,indx,idx)}} value={ruleType} className='typeselect'>
                                                                                {WARNTYPE.map(({id,nam})=><Option key={id} value={id}>{nam}</Option>)}
                                                                            </Select>
                                                                            <div className='onewarn'>
                                                                                {this.getOneWarForm(ruleType,otherdata,[index,indx,idx])}
                                                                            </div>
                                                                        </div>
                                                            })}
                                                            <a className='addbtn' onClick={()=>{this.addRule(index,indx)}}>增加规则</a>
                                                        </div>
                                                    </div>
                                        })}
                                        <a className='addbtn' onClick={()=>{this.addPro(index)}}>增加产品</a>
                                    </div>
                                   
                                </div>
                    })}
                    {campusConf.length<2&&<a className='addbtn' onClick={this.addGroup}>增加分组</a>}
                    
                </div>
            </Form>
           
            <div className='stepbtnbox'>
                <Button className='btn' onClick={this.goPre}>上一步</Button>
                <Button className='btn' type="primary"  onClick={this.handleSubmit}>提&nbsp;交</Button>
            </div>

        </>
    }
}

export const RuleForm = Form.create({
    name: 'ruleForm',
})(RuleInfo);

