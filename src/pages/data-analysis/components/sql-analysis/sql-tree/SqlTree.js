import React,{useState, useEffect, useCallback} from 'react'
import {Tree,Input,Select,Radio} from 'antd'

import './SqlTree.scss'
import { get, Paths } from '../../../../../api'

const {Search} = Input
const {TreeNode} = Tree
const {Option} = Select

export function TslTree({
    setSelectedData,
    setPropsProductId,
    productId,
}) {
   
    const [prolist,setProlist] = useState([])
    const [treedatatype,setTreedatatype] = useState(0)//要单表查询，所以临时加一个提前预选是查设备属性表还是设备事件表的判断
    const [treeData,setTreeData] = useState([])
    const [treemetData,setTreemetData] = useState({properties:[],events:[]})
   

    const getTSLData = productId => {
        get(Paths.getTsl,{
            productId:productId
        }).then( ({data}) => {
            const {properties=[],events=[]} = JSON.parse(data)
            setTreemetData({properties,events})//记录数据 供切换表类型的时候重新画树
            setTreeData(getTreeData(properties,events))
            
        })
    }

    //获取产品列表
    const getProList = ()=>{
        get(Paths.getProductList,{ pageRows:9999, instanceId:2 },{ needVersion:1.2 }).then((res) => {
          let productList = res.data&&res.data.list || [];
          setProlist(productList)
        }); 
    }
    //改变产品
    const changePro = (proid)=>{
        setPropsProductId(proid)
        setTreeData([])
    }

    // 特殊情况太多 舍弃递归方式
    const getTreeData = (properties=treemetData.properties,events=treemetData.events,type=treedatatype)=>{

        let properTree = properties.map(({name,dataType:{type}})=>{
            return {
                key:`设备属性表.${name}`,
                title:`${name} (${type})`
            }
        })
        let eventsTree = events.map(({identifier,name,outputData})=>{
            let havechildren = outputData&&outputData.length>0;
            let res = {
                title: name,
                key: '_events_'  + '|' + identifier,
                disabled:true
            }
            if(havechildren){
                res.children = outputData.map(({name,dataType:{type}})=>{
                    return {
                        key:`设备事件表.${name}`,
                        title:`${name} (${type})`,
                    }
                })
            }
            return res
        })
        let res = [
                    {
                        title: '设备属性表',
                        key:'设备属性表',
                        children:properTree
                    },
                    {
                        title: '设备事件表',
                        key:'设备事件表',
                        children:eventsTree
                    }
                ][type]
        return [
            {
                title: '设备属性表',
                key:'设备属性表',
                children:properTree
            },
            {
                title: '设备事件表',
                key:'设备事件表',
                children:eventsTree
            }
        ]
    } 

    useEffect( () => {
        getProList()
    },[])
    useEffect( () => {
        // if(metadata.length>0){
            // let treetype = metadata[0].indexOf('properties')==-1 && 1 || 0;
            // setTreedatatype(treetype)
            // setCheckedKeys(metadata)
        // }
    },[])
    useEffect( () => {
       if(productId){
        getTSLData(productId)
       } 
    },[productId])

    const changeTreedatatype=e=>{
       let type = e.target.value;
       setTreedatatype(type)
       setTreeData(getTreeData(undefined,undefined,type))
       
    }

    const onSelect = (val)=>{
        console.log(val)
        setSelectedData(val)

    }

    return (
        <div className="sql">
            {/* <div className="title">
                <span>数据源类型</span>
                <span className="select-wrapper">
                    <Radio.Group defaultValue={0}>
                        <Radio value={0}>物模型</Radio>
                        <Radio value={1} disabled={true}>外部数据源</Radio>
                    </Radio.Group>
                </span>
            </div> */}
            
            <div className="tree-content">
                    
                    {/* <Radio.Group value={treedatatype} onChange={changeTreedatatype} style={{margin:'10px'}}>
                        <Radio value={0}>设备属性表</Radio>
                        <Radio value={1}>设备事件表</Radio>
                    </Radio.Group> */}
                    <Select className='proselect' placeholder="请先选择产品"  value={productId} onChange={changePro} showSearch optionFilterProp="children">
                        {
                            prolist.map(({productId,productName})=>{
                                return <Option key={productId} value={productId}>{productName}</Option>
                            })
                        }
                    </Select>
                    <Tree
                        autoExpandParent={true}
                        defaultExpandAll={true}
                        treeData = {treeData}
                        onSelect={onSelect}
                    >
                    </Tree>
            </div>
        </div>
    )
}

export function ProTree({
    setSelectedData,
    proLogicData
}) {

    const getTreeData = ()=>{
        let fatherkey = ''
        const getChildren = (data)=>{
            let tree = []
            
            for(let key in data){
                let val = data[key]
                let onenode = {
                    title:key,
                    key:fatherkey&&`${fatherkey}.${key}`||key
                }

                if(val && typeof val === 'object'){
                    fatherkey = fatherkey&&`${fatherkey}.${key}` || key;
                    onenode.children = getChildren(val)
                }else{
                    onenode.title = `${key} (${val})`
                }
                tree.push(onenode)

            }
            fatherkey = '';
            return tree
        }
        return getChildren(proLogicData)

    }
    const treeData = getTreeData()
    
    useEffect( () => {
    },[])

    const onSelect = (val)=>{
        console.log(val)
        setSelectedData(val)

    }

    return (
        <div className="sql">
            <div className="tree-content">
                <Tree
                    autoExpandParent={true}
                    defaultExpandAll={true}
                    treeData = {treeData}
                    onSelect={onSelect}
                >
                </Tree>
            </div>
        </div>
    )
}



// var oText = document.getElementById('textarea');
//      document.onclick = function(e){
//          if(e.target.tagName=="TEXTAREA"){
//              alert(getCursortPosition(oText));
//          }
//      }
//     function getCursortPosition(obj) {
//         var cursorIndex = 0;
//         if (document.selection) {
//             // IE Support
//             obj.focus();
//             var range = document.selection.createRange();
//             range.moveStart('character', -obj.value.length);
//             cursorIndex = range.text.length;
//         } else if (obj.selectionStart || obj.selectionStart==0) {
//             // another support
//             cursorIndex = obj.selectionStart;
//         }
//         return cursorIndex;
//     }


