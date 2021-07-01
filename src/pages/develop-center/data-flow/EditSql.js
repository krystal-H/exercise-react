import React, {memo, useState, useEffect } from 'react';
import { Input,Form,Modal,Select} from 'antd';
import { get,post, Paths} from '../../../api';
import CodeView from "../../../components/CodeView2";
const {Option} = Select

export default Form.create({
    name: 'add-dataflow-editsql',
})(memo(props=>{
    let {
        form:{validateFieldsAndScroll,getFieldValue,getFieldDecorator,resetFields,validateFields,setFieldsValue},
        visable,
        tableData,
        productList,
        closeMod,
        transferId,
        transferSQL:{
            transferSQL='SELECT \n\nFROM \n\nWHERE',
            productId,
            deviceIdList,
            isAllDevice=0,
            transferSQLId
        },
    } = props;
    const [codestr, setCodestr] = useState(transferSQL);
    const [completers, setCompleters] = useState([]);
    const [devicelist, setDevicelist] = useState([]);
    // const [selectedList,setSelectedList] = useState([])

    useEffect(() => {
        const _compdata = getCompleters();
        setCompleters(_compdata)
        if(transferSQLId){
            let selectval = isAllDevice==0 && [-1] || deviceIdList;
            setFieldsValue({
                transferSQL,
                productId,
                deviceIdList:selectval
            });

            // setSelectedList(selectval)

        }

    }, [tableData]);

    //将数据表结构 转化为SQL编辑器里所需要的关键词提示
    const getCompleters = ()=>{
        let completers = [];
        // console.log(111,tableData)
        Object.keys(tableData||{}).forEach(key => {
            completers.push(getOneCompleter(key,'数据表'))
            tableData[key].forEach((_t)=>{
                completers.push(getOneCompleter(_t,'表属性'))
            })

        })
        return (completers.length>0 && completers || null)
    }
    const getOneCompleter = (val,type)=>{
        return {
            name: 'name',
            value: val,
            score: 100,
            meta:type
        }
    }
    //改动SQL语句
    const changeCode = (val)=>{
        setCodestr(val)
        setFieldsValue({
            transferSQL: val,
        });
        // validateFields(["sql"]);

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
    //下拉框中做删除操作
    // const deselectHandle = (val)=>{
    //     let prevli = getFieldValue('deviceIdList');
    //     setFieldsValue({
    //         deviceIdList:delOneFromArr(prevli,val)
    //     });

    // }
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
    //提交操作
    const addOk = () => {
        validateFieldsAndScroll((err, values) => {
            console.log(999,values);
            if(!err){
                let {deviceIdList} = values,isAllDevice=1;
                if(deviceIdList[0] == -1){
                    isAllDevice=0
                    deviceIdList = null
                }
                // let isAllDevice = deviceIdList[0] == -1 ? 0 : 1;
                let idparam = transferSQLId&&{transferSQLId}||{};
                post(Paths.saveTransfer,{
                    transferId,
                    transferSQL:{
                        ...values,
                        isAllDevice,
                        ...idparam,
                        deviceIdList
                    }
                },{needJson:true,noInstance:true}).then((res) => {
                    closeMod(true);
                    resetFields();
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
        <Modal
            title='编写SQL'
            visible={visable}
            width={700}
            onOk={addOk}
            onCancel={addCancel}
            maskClosable={false}
        >
            <Form>
                
                <Form.Item labelCol= {{ span:3}} wrapperCol={{span:21}}>
                    <CodeView
                        mode='mysql'
                        height={200}
                        code={codestr}
                        completers={completers}
                        onChange={(val) => {changeCode(val)}}
                    />
                    {getFieldDecorator("transferSQL", {
                        initialValue: codestr,
                        rules: [{required: true,message: '请编写SQL'}],
                    })(<Input type="hidden" />)}
                </Form.Item>
                <Form.Item label='选择产品' labelCol= {{ span:3}} wrapperCol={{span:12}}>
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
                <Form.Item label='选择设备' labelCol= {{ span:3}} wrapperCol={{span:12}}>
                    {getFieldDecorator('deviceIdList', {
                        rules: [{required: true,message: '请选择设备'}],
                    })
                    (<Select
                        showSearch
                        mode='multiple'
                        placeholder="选择设备"
                        optionFilterProp="children"
                        
                        // value={selectedList}
                        onSelect={selectedHandle}
                        // onDeselect={deselectHandle}
                    >
                        {
                            devicelist.length>0&&<Option value={-1} >全部设备</Option>
                        }
                        {
                            
                            // devicelist.map(({deviceId,deviceMac})=>{
                            //     return <Option key={deviceId} value={deviceId}>{deviceMac}</Option>
                            // })
                            devicelist.map(({deviceId,deviceMac})=>{
                                return <Option key={deviceId} value={deviceId}>{deviceMac}</Option>
                            })
                        }
                    </Select>)}
                </Form.Item>

                
                
            </Form>
        </Modal>
    )
}));