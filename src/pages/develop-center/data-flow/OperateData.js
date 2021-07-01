import React, {memo, useState, useEffect,useRef } from 'react';
import { Input,Form,Modal,Select} from 'antd';
import { post, Paths} from '../../../api';
import './dataflow.scss';

// const topicList =[
//     [{transferId:1,transferName:11111},{transferId:2,transferName:2222},{transferId:3,transferName:3333}],
//     [1,2,3,4]
// ]
function useCallbackState (od) {//模拟setState的回调
    const cbRef = useRef();
    const [data, setData] = useState(od);
 
    useEffect(() => {
        cbRef.current && cbRef.current(data);
    }, [data]);
 
    return [data, function (d, callback) {
        cbRef.current = callback;
        setData(d);
    }];
}


const {Option} = Select
export default Form.create({
    name: 'add-dataflow-addsend',
})(memo(props=>{
    let {
        operateList,
        transferId,
        form:{validateFieldsAndScroll,getFieldValue,getFieldDecorator,resetFields,validateFields,setFieldsValue},
        operateType,//1 添加转发数据，2 编辑转发数据，3 添加转发错误操作 4 编辑转发错误操作
        transferTargetIndex,
        closeMod,
        transferTargetList,
        transferRecover,

        topicList, 
    } = props;
    // const [optype, setOptype] = useState(0);
    const [optype,setOptype] = useCallbackState(1);
    useEffect(() => {
        
        if(operateType==2||operateType==4){//编辑状态，则需要初始化数据

            let targetType,targetConfig;
            if(operateType==2){//转发操作
                let editobj = transferTargetList[transferTargetIndex]
                targetType = editobj.targetType
                targetConfig = editobj.targetConfig
            }else{
                targetConfig = transferRecover.recoverConfig
                targetType = transferRecover.recoverType
            }
            let targetConfigObj = JSON.parse(targetConfig);

            let {
                transferId,//targetType == 0 时

                topic,//targetType == 1 时
                tag,
            } = targetConfigObj ;
            let filval = {optype:targetType,destination:topic||transferId}
            if(targetType==1){
                filval.tag = tag
            }
            setOptype(targetType)
            setFieldsValue(filval)
            // setOptype(targetType,()=>{alert(123);setFieldsValue(filval)})
            
        }
    }, [operateType]);
    const changeOptype = type=>{
        setOptype(type)
        setFieldsValue({
            destination:undefined
        });
    }
    const okHandle = () => {
        validateFieldsAndScroll((err, values) => {
            if(!err){
                let {optype,destination,tag} = values;
                let destinationdata = optype==0?{ transferId:destination }:{ topic:destination, tag };
                let configjson = JSON.stringify(destinationdata);
                let data = {transferId}
                if(operateType>2){//转发错误操作
                    data.transferRecover={
                        ...transferRecover,
                        recoverType:optype,
                        recoverConfig:configjson
                    }
                }else{//转发操作
                    
                    if(operateType==1){
                        data.transferTargetList = [{targetType:optype,targetConfig:configjson}]
                    }else{
                        let newtransferTarget = {
                            ...transferTargetList[transferTargetIndex],
                            targetType:optype,
                            targetConfig:configjson,
                        };
                        data.transferTargetList = [newtransferTarget];
                    }
                    
                }
                post(Paths.saveTransfer,data,{needJson:true,noInstance:true,loading:true}).then((res) => {
                    closeMod(true);
                    resetFields();
                });
            }  
        });
    }
    const cancelHandle=()=>{
        closeMod();
        resetFields();
    }
    const changeRocketmq=val=>{
        setFieldsValue({
            destination:val
        });
    }
    
    return (
        <Modal
            title={operateType%2==0&&'编辑'||'添加'}
            visible={operateType>0}
            width={600}
            onOk={okHandle}
            onCancel={cancelHandle}
            maskClosable={false}
        >
            <Form labelCol= {{ span:6}} wrapperCol={{span:16}}>
                <Form.Item label='选择操作' >
                    {getFieldDecorator('optype', {
                        rules: [{required: true,message: '请选择操作'}],
                        initialValue:1
                    })
                    (<Select placeholder="选择操作" onChange={changeOptype} >
                        {
                            operateList.map((nam,index)=>{
                                return <Option disabled={index!=1}  key={index} value={index}>{nam}</Option>
                            })

                        }
                    </Select>)}
                </Form.Item>
                {
                    optype==0&&
                    <Form.Item label='数据目的地' >
                        {getFieldDecorator('destination', {
                            rules: [{required: true,message: '请选择数据目的地'}],
                        })
                        (<Select placeholder="请选择">
                            {
                                topicList[0].map(({transferId,transferName})=>{
                                    return <Option key={transferId} value={transferId}>{transferName}</Option>
                                })

                            }
                        </Select>)}
                    </Form.Item>||
                    <>
                        <Form.Item label='数据目的地' >
                            {getFieldDecorator('destination', {
                                rules: [{required: true,message: '请填写数据目的地'}],
                            })
                            (<Input placeholder="自定义或者从平台选择"/>
                            )}
                        </Form.Item>
                        <div className='hidselectbox'>
                            <a>从平台选择</a>
                            <Select className='hidselect' placeholder="请选择" onChange={changeRocketmq}>
                                {
                                    topicList[1].map((val)=>{
                                        return <Option key={val} value={val}>{val}</Option>
                                    })

                                }
                            </Select>
                        </div>
                        <Form.Item label='tag' >
                            {getFieldDecorator('tag', {
                                rules: [{required: true,message: '请填写tag'}],
                            })
                            (<Input placeholder="输入tag"/>
                            )}
                        </Form.Item>
                    </>
                }


                


            </Form>
        </Modal>
    )
}));