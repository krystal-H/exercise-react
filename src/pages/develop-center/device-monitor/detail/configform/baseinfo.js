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
                <Form.Item label='????????????'>
                    {getFieldDecorator('name', {
                        // initialValue:description,
                        rules: [{ required: true, message: '???????????????????????????'},
                                { max: 50, message: '?????????????????????50' }],
                        
                    })(<Input placeholder="???????????????????????????" />)
                    }
                </Form.Item>
                <TextAreaCounter
                    label="??????"
                    formId='description'
                    astrictNub='100'
                    rows='3'
                    placeholder='??????????????????' 
                    getFieldDecorator={getFieldDecorator}
                    getFieldValue={getFieldValue}
                    // initialValue={name}
                    
                />


                <div className='formitembox'>
                    <Form.Item label="????????????">
                        {getFieldDecorator('transferObj', {rules: [{required: true,message: '???????????????????????????'}],
                            
                        })(<Cascader style={{width:'450px'}}
                                options={getTransferListOptions()}
                                // expandTrigger="hover"
                                placeholder={'???????????? / topic / tag'} 
                            />)
                        }
                    </Form.Item>
                    <div className='tips'>???????????????????????????<a href='#/open/developCenter/dataFlow/list'> ????????????</a></div>
                </div>





                {/* <div className='formitembox'>
                    <Form.Item label='??????????????????'>
                        {getFieldDecorator('transferId', {
                            rules: [{required: true,message: '?????????????????????'}],
                        })
                        (<Select
                            placeholder="???????????????????????????rocketMQ????????????"
                            // onChange={changePro}
                        >
                            {
                                [{productId:12,productName:'??????????????????'}].map(({productId,productName})=>{
                                    return <Option key={productId} value={productId}>{productName}</Option>
                                })

                            }
                        </Select>)}
                    </Form.Item>
                    <div className='tips'>???????????????????????????<a href='#/open/developCenter/dataFlow/list'> ????????????</a></div>
                </div>
                <Form.Item label='????????????Topic'>
                    {getFieldDecorator('transferTopic', {
                        rules: [{required: true,message: '?????????Topic'}],
                    })
                    (<Select
                        placeholder="??????Topic"
                        // onChange={changePro}
                    >
                        {
                            [{productId:1,productName:2}].map(({productId,productName})=>{
                                return <Option key={productId} value={productId}>{productName}</Option>
                            })

                        }
                    </Select>)}
                </Form.Item>
                <Form.Item label='????????????Tag'>
                    {getFieldDecorator('transferTag', {
                        rules: [{required: true,message: '?????????Tag'}],
                    })
                    (<Select
                        placeholder="??????Tag"
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
                <Button className='btn' type="primary"  onClick={goNext}>?????????</Button>
            </div>
    </>
});
