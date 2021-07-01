import React, { Component,useEffect } from 'react';
import { Form ,Input,Button,Select,Cascader} from 'antd';
import TextAreaCounter from '../../../../../components/textAreaCounter/TextAreaCounter';
const {Option} = Select
const formlayout = {
    labelCol: { span:4},
    wrapperCol: { span: 14 },
};

export default Form.create({
    name: 'monitor-baseinfo',
})(props=>{
    let {
        form:{validateFieldsAndScroll,getFieldValue,getFieldDecorator,resetFields,setFieldsValue},
        saveBaseInfo,
        // baseFormData:{description,name,transferId,transferTopic,transferTag },
        baseFormData,
        transferList,
    } = props;
    useEffect(() => {
        const {description,name,transferId,transferTopic,transferTag } = baseFormData;
        setFieldsValue({description,name,transferId,
            transferTopic,
            transferTag
        }); 
    }, [baseFormData]);

    const goNext = ()=>{
        validateFieldsAndScroll((err, values) => {
            if ("!err") {
                let baseFormData = {...values};
                // console.log(333,baseFormData);
                saveBaseInfo(baseFormData);
            }
        });

    }
    const getTransferListOptions=()=>{
        transferList.map(({transferId,transferName,recoverConfigList=[]})=>{
            let topictagobj = {}
            for(let i=0;i<recoverConfigList.length;i++){
                let topictag = JSON.parse(recoverConfigList[i])
                let {topic,tag} = topictag
                if(topictagobj[topic]){
                    topictagobj[topic].push(tag);
                }else{
                    topictagobj[topic] = [tag]
                }
            }
            let topictaglist = []

            for (let key in topictagobj) {
                console.log(topictagobj[key]) // foo, bar
                let taglist =  topictagobj[key].map((ite)=>{
                    return {value:ite,label:ite}
                })
                topictaglist.push({
                    value:key,
                    label:key,
                    children:taglist
                })
            }
            return {
                value:transferId,
                label:transferName,
                children:topictaglist
            }
        })
    }

   
    return <>
            <Form  {...formlayout} >
                <Form.Item label='规则名称'>
                    {getFieldDecorator('name', {
                        // initialValue:description,
                        rules: [{ required: true, message: '请输入监控规则名称'},
                                { max: 50, message: '最大输入长度为50' }],
                        
                    })(<Input placeholder="请输入监控规则名称" />)
                    }
                </Form.Item>
                <TextAreaCounter
                    label="描述"
                    formId='description'
                    astrictNub='100'
                    rows='3'
                    placeholder='监控规则描述' 
                    getFieldDecorator={getFieldDecorator}
                    getFieldValue={getFieldValue}
                    // initialValue={name}
                    
                />


                <div className='formitembox'>
                    <Form.Item label="数据流转">
                        {getFieldDecorator('transferObj', {rules: [{required: true,message: '请选择数据流转对象'}],
                            
                        })(<Cascader style={{width:'450px'}}
                                options={getTransferListOptions()}
                                // expandTrigger="hover"
                                placeholder={'流转对象 / topic / tag'} 
                            />)
                        }
                    </Form.Item>
                    <div className='tips'>没有数据？请先配置<a href='#/open/developCenter/dataFlow/list'> 数据流转</a></div>
                </div>





                {/* <div className='formitembox'>
                    <Form.Item label='数据流转对象'>
                        {getFieldDecorator('transferId', {
                            rules: [{required: true,message: '请选择流转对象'}],
                        })
                        (<Select
                            placeholder="已发送到消息队列（rocketMQ）中数据"
                            // onChange={changePro}
                        >
                            {
                                [{productId:12,productName:'明长城错错错'}].map(({productId,productName})=>{
                                    return <Option key={productId} value={productId}>{productName}</Option>
                                })

                            }
                        </Select>)}
                    </Form.Item>
                    <div className='tips'>没有数据？请先配置<a href='#/open/developCenter/dataFlow/list'> 数据流转</a></div>
                </div>
                <Form.Item label='流转对象Topic'>
                    {getFieldDecorator('transferTopic', {
                        rules: [{required: true,message: '请选择Topic'}],
                    })
                    (<Select
                        placeholder="选择Topic"
                        // onChange={changePro}
                    >
                        {
                            [{productId:1,productName:2}].map(({productId,productName})=>{
                                return <Option key={productId} value={productId}>{productName}</Option>
                            })

                        }
                    </Select>)}
                </Form.Item>
                <Form.Item label='流转配置Tag'>
                    {getFieldDecorator('transferTag', {
                        rules: [{required: true,message: '请选择Tag'}],
                    })
                    (<Select
                        placeholder="选择Tag"
                        // onChange={changePro}
                    >
                        {
                            [{productId:1,productName:2}].map(({productId,productName})=>{
                                return <Option key={productId} value={productId}>{productName}</Option>
                            })

                        }
                    </Select>)}
                </Form.Item> */}
            </Form>
            <div className='stepbtnbox'>
                <Button className='btn' type="primary"  onClick={goNext}>下一步</Button>
            </div>
    </>
});
