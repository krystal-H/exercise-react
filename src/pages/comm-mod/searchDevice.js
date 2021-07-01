import React,{useState,useEffect} from "react";
import { Input, Select,Button } from "antd";
const {Option} = Select;
const TYPE = ["按产品","按分组"]

export default ({
    list,
    searchedData,
    multiple=false,
    onRef,
    inputkey,
})=> {
    const [type,setType] = useState(0)//查找方式
    const [selectedList,setSelectedList] = useState([-1])
    const [param,setParam] = useState("")//查找关键词（设备id）
    const [searchLoading,setSeachLoading] = useState(false) 
    const [resetLoading,setResetLoding] = useState(false)
    useEffect(() => {
        onRef&&onRef(getdata);
    });
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
    const changeVal = (val)=>{
        setSelectedList([val]);
    }
    //下拉框选中
    const selectedHandle = (val)=>{
        if(val == -1){
            setSelectedList([-1])
        }else{
            setSelectedList((prevli) => {
                let newli = delOneFromArr(prevli,-1);
                return [...newli,val]
            })
        }
    }
    //下拉框中做删除操作
    const deselectHandle = (val)=>{
        setSelectedList((prevli) => {
            return delOneFromArr(prevli,val)
        })

    }
    const reset = () => {
        setType(0);
        setSelectedList([-1]);
        setParam("");
        setResetLoding(true)
        searchedData({}).finally( () => {
            setResetLoding(false)
        })
    }
    const getdata = ()=>{
        let _data = {type};
        param && (_data[inputkey] = param);
        selectedList.length>0&&selectedList[0] !==-1 && (_data.productIds = selectedList.join(","));
        return _data;

    }
    const onSearch = () => {
        setSeachLoading(true);
        searchedData(getdata()).finally( (rrr) => {
            console.log("---rrr--",rrr);
            setSeachLoading(false)
        })
    }
    const changeType = (val)=>{
        setType(val);
        setSelectedList([-1]);

    }


    return (
        <div className='comm-search-box'>
            <Input.Group compact className="inputgroup">
                <Select
                    value={type}
                    onChange={changeType}
                >
                    {TYPE.map((v,i)=>{
                        return <Option key={i} value={i} >{v}</Option>
                    })}
                </Select>
                <Select 
                    showSearch 
                    optionFilterProp="children" 
                    mode={multiple&&"multiple"||""}
                    defaultValue={[-1]}
                    value={selectedList} 
                    onChange={!multiple&&changeVal||void(0)}
                    onSelect={multiple&&selectedHandle||void(0)}
                    onDeselect={multiple&&deselectHandle||void(0)}
                    style={{width: 250}}
                >
                    <Option value={-1} >{`全部${type==0&&"产品"||"分组"}`}</Option>
                    {list[type].map((item ,index)=>{
                        let {productId,id,name,productName} = item;
                        return <Option key={index} value={[productId,id][type]}>{[productName,name][type]}</Option>
                    })}
                </Select>
                {
                    inputkey&&
                    <Input
                        value={param}
                        maxLength={30} 
                        placeholder="请输入设备ID查询" 
                        style={{width: 200}}
                        onChange={(e)=>{setParam(e.target.value)}}
                    />
                }
            </Input.Group>
            <Button type="primary" className="btn"
                onClick={onSearch}
                loading={searchLoading}
                icon="search"
            >查询
            </Button>
            <Button type="default" className="btn"
                loading={resetLoading} 
                onClick={reset}
            >重置
            </Button>
        </div>
    )
    
}