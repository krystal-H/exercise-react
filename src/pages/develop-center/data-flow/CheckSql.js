import React, {memo, useState, useEffect } from 'react';
import { Input,Form,Button,Select,Drawer,Popover,Icon} from 'antd';
import { get,post, Paths} from '../../../api';
import CodeView from "../../../components/CodeView2";
import {Notification} from '../../../components/Notification';
import ObjectView from "../../../components/ObjectView";
const {Option} = Select

export default Form.create({
    name: 'add-dataflow-checksql',
})(memo(props=>{
    let {
        transferId,
        form:{validateFieldsAndScroll,getFieldValue,getFieldDecorator,resetFields,setFieldsValue},
        visable,
        productList,
        closeMod,
    } = props;
    const [codestr, setCodestr] = useState('{\n\n}');
    const [devicelist, setDevicelist] = useState([]);
    const [checkResult, setCheckResult] = useState(undefined);

    useEffect(() => {
        
    }, []);
    //改动SQL语句
    const changeCode = (val)=>{
        setCodestr(val)
        setFieldsValue({
            payload: val,
        });

    }
    //选择产品下拉
    const changePro=productId=>{
        get(Paths.getDeviceList,{classType:1,pageRows:9999,infoType:1,productId},{loading:true}).then(({data}) => {
            setDevicelist(data&&data.list||[])
            setFieldsValue({
                deviceIdList:[]
            });
        });
    }

    //自定义设备列表操作
    // 下拉框选中
    const selectedHandle = (val)=>{
        if(val == -1){
            setFieldsValue({
                deviceIdList:[-1]
            });
        }else{
            let prevli = getFieldValue('deviceIdList');
            let newli = delOneFromArr(prevli,-1);
            console.log(888,prevli,newli);
            setFieldsValue({
                // deviceIdList:[...newli,val]
                deviceIdList:[...newli]
            });
        }
    }
    //从已选设备中删除一项
    const delOneFromArr = (arr,val) => {
        let index = arr.findIndex(_val=>{
            return val == _val
        });
        let newli = [...arr];
        if(index>-1){
            newli.splice(index,1)
        }
        return newli
    }
    //调试
    const checkSql = () => {
        validateFieldsAndScroll((err, values) => {
            console.log(999,values);
            if(!err){
                let {deviceIdList,productId,payload} = values;
                try {
                    payload = JSON.parse(payload);
                } catch (err) {
                    console.log('eeeeee',err);
                    Notification({
                        description:'Payload数据请输入正确的json格式',
                    });
                    return
                }
                let isAllDevice = deviceIdList[0] == -1 ? 0 : 1;
                let data = {
                    transferSQL:{ transferId,productId,isAllDevice,deviceIdList },
                    payload:payload
                }
                setCheckResult(undefined)
                post(Paths.checkSqlTransfer,data,{needJson:true,noInstance:true}).then((res) => {
                    setCheckResult(res.data)
                });
            }  
        });
    }
    //取消操作
    const addCancel=()=>{
        closeMod();
        resetFields();
    }
    return (
        <Drawer
            title='SQL调试'
            visible={visable}
            width={480}
            onClose={addCancel}
        >
            <Form>
                <Form.Item label='产品' labelCol= {{ span:24}} wrapperCol={{span:12}}>
                    {getFieldDecorator('productId', {
                        rules: [{required: true,message: '请选择产品'}],
                    })
                    (<Select
                        showSearch
                        placeholder="选择产品"
                        optionFilterProp="children"
                        onChange={changePro}
                    >
                        {
                            productList.map(({productId,productName})=>{
                                return <Option key={productId} value={productId}>{productName}</Option>
                            })

                        }
                    </Select>)}
                </Form.Item>
                <Form.Item label='设备' labelCol= {{ span:24}} wrapperCol={{span:12}}>
                    {getFieldDecorator('deviceIdList', {
                        rules: [{required: true,message: '请选择设备'}],
                    })
                    (<Select
                        showSearch
                        mode='multiple'
                        placeholder="选择设备"
                        optionFilterProp="children"
                        onSelect={selectedHandle}
                    >
                        {
                            devicelist.length>0&&<Option value={-1} >全部设备</Option>
                        }
                        {
                            devicelist.map(({deviceId,deviceMac})=>{
                                return <Option key={deviceId} value={deviceId}>{deviceMac}</Option>
                            })
                        }
                    </Select>)}
                </Form.Item>
                
                <Form.Item 
                    label= {
                        <Popover 
                            content={'设备使用自定义 Topic 时 Payload 数据格式即为上报的数据'} 
                            overlayClassName="draw-popover"
                        >Payload数据 <Icon type="question-circle" />
                        </Popover>
                    }
                    labelCol= {{ span:24}} wrapperCol={{span:24}}>
                    <CodeView
                        mode='json'
                        height={200}
                        code={codestr}
                        onChange={(val) => {changeCode(val)}}
                    />
                    {getFieldDecorator("payload", {
                        initialValue: codestr,
                        rules: [{required: true,message: '请编写Payload数据'}],
                    })(<Input type="hidden" />)}
                </Form.Item>  
            </Form>
            <Button className='' type="primary" onClick={()=>{checkSql()}} >调 试</Button>
            {checkResult && <ObjectView keyName="调试结果" data={checkResult} />}
        </Drawer>
    )
}));
