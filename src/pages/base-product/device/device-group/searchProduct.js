import React,{useState} from "react";
import { Input, Select } from "antd";

export default ({productList,changedfunc,searchedFunc})=> {


    const [selectedList,setSelectedList] = useState([-1])

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


    const changeVal = (datali)=>{
       

    }
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

    const deselectHandle = (val)=>{
        setSelectedList((prevli) => {
            return delOneFromArr(prevli,val)
        })

    }


    return (
        <div className='search-box'>
            <Input.Group compact >
                <Select 
                    showSearch 
                    optionFilterProp="children" 
                    // mode="multiple"
                    defaultValue={[-1]}
                    // value={selectedList} 
                    onChange={changedfunc}
                    // onSelect={selectedHandle}
                    // onDeselect={deselectHandle}
                    style={{width: 200}}
                >
                    <Select.Option value={-1} >全部产品</Select.Option>
                    {productList.map((item ,index)=>{
                        return <Select.Option key={index} value={item.productId}>{item.productName}</Select.Option>
                    })}
                </Select>
                <Input.Search 
                    enterButton maxLength={30} 
                    placeholder="请输入设备ID查询" 
                    onSearch={searchedFunc} 
                    style={{width: 300}}
                />
            </Input.Group>
        </div>
    )
    
}
