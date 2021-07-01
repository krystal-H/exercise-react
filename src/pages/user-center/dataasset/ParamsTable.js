import React, { memo, forwardRef, useState,useImperativeHandle } from 'react'
import { Divider,Input,Select,Icon   } from 'antd';
import './dataasset.scss';
const {Option} = Select;
const MUSTTYPE = {
    "0":"否",
    "1":"是"
};
const VALUETYPE = {
    "string":"字符串",
    "number":"数字"
}

function ParamsTableHooks({list=[]},paramsref ) {

    const [sourcelist,setSourcelist] = useState(list);
    const [editIndex,setEditIndex] = useState(-1);
    useImperativeHandle(paramsref, () => {
        // 这个函数会返回一个对象
        // 该对象会作为父组件 current 属性的值
        return {sourcelist}
    }, [sourcelist]);

    const delPar = (i)=>{
        setSourcelist((li)=>{
            let newli = li.map(item=>item)
            newli.splice(i,1);
            return newli;
        });

    }

    const addPar = ()=>{
        setSourcelist((li)=>{
            let newli = li.map(item=>item)
            newli.push({
                name:"",
                type:"string",
                must:"0",
                defaultVal:"",
                desc:""
            });
            return newli;
        })
    }

    const changeData = (which,val)=>{

        setSourcelist((li)=>{
            let newli = li.map((item,index)=>{
                let newitem = Object.assign({},item);
                newitem[which] = val;
                if(index==editIndex) return newitem;
                return item;
            });
            return newli;
        });

    }

    const getListHtml = ()=>{
        let html = sourcelist.map((item,i) => {
            let {name,type,must,defaultVal,desc} = item;
            if(editIndex == i){
                let typeoptions  =  [];
                for(let k in VALUETYPE){
                    typeoptions.push(
                        <Option key={k} value={k}>{VALUETYPE[k]}</Option>
                    );
                }
                return  <tr key={'tr_'+i} >
                            <td>
                                <Input value={name} onChange={(e)=>{changeData("name",e.target.value)}}/>
                            </td>
                            <td>
                                <Select value={type} onChange={(val)=>{changeData("type",val)}}>
                                    {typeoptions}
                                </Select>
                            </td>
                            <td>
                                <Select value={must} onChange={(val)=>{changeData("must",val)}}>
                                    <Option value="0">否</Option>
                                    <Option value="1">是</Option>
                                </Select>
                            </td>
                            <td>
                                <Input value={defaultVal} onChange={(e)=>{changeData("defaultVal",e.target.value)}} />
                            </td>
                            <td>
                                <Input value={desc} placeholder="描述" onChange={(e)=>{changeData("desc",e.target.value)}}/>
                            </td>
                            
                            <td>
                                <a onClick={()=>{delPar(i)}} href='javascript:'> <Icon type="minus" /> </a>
                            </td>
                        </tr>;

            }else{
                return <tr key={'tr_'+i} onClick={()=>{setEditIndex(i)}}>
                            <td>{name}</td><td>{VALUETYPE[type]}</td><td>{MUSTTYPE[must]}</td><td>{defaultVal}</td><td>{desc}</td>
                        </tr>;
            }
        });
        return html;
    }


    return (
       
        <div className="paramtable">
            { sourcelist.length>0 &&
            <table className="labeltable" onMouseLeave={()=>{setEditIndex(-1)}}>
                <thead >
                    <tr>
                        <th style={{width:"20%"}}>参数名</th>
                        <th style={{width:"15%"}}>类型</th>
                        <th style={{width:"15%"}}>是否必选</th>
                        <th style={{width:"18%"}}>默认值</th>
                        <th style={{width:"26%"}}>描述</th>
                        <th style={{width:"6%",cursor:'pointer'}} title='添加参数'><a  onClick={addPar} href='javascript:'><Icon type="plus" /></a></th>
                        
                    </tr>
                </thead>
                <tbody>
                    {getListHtml()} 
                </tbody>
            </table> || 
            <div className='tempdatabox'> 暂无参数，<a  onClick={addPar} href='javascript:'>点击添加</a> </div>}
            
        </div> 
    )
}

export default memo(forwardRef(ParamsTableHooks));