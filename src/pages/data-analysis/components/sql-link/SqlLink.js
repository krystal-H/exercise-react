import React,{useState,useEffect,useMemo} from 'react'
import {Collapse} from 'antd';
import CodeEdit from '../sql-analysis/code-edit/CodeEdit';
import {InputConfigModal,OutputConfigModal} from './Modals'
import {getFlowData,saveFlowData,getProductList} from '../playground/apis'
import {saveNodes} from '../../subjects'
import './SqlLink.scss'
import { Notification } from '../../../../components/Notification';

const { Panel } = Collapse;

export default function SqlLink({
    service
}) {

    const [sqlText,setSqlText] = useState('')
    const [inputData,setInputData] = useState([])
    const [productList,setProductList] = useState([])
    const [outputData,setOutputData] = useState([])
    const [inputModalVisible,setInputVisible] = useState(false)
    const [outputModalVisible,setOutputVisible] = useState(false)
    const [editOutputIndex,setEditOutputIndex] = useState(-1)


    useEffect(() => {
        const {projectId,serviceId} = service

        // 获取产品列表
        projectId && getProductList({projectId,pageRows: 9999}).then(data => {
            data && data.data && data.data.list && setProductList([...data.data.list])
        })

        // 获取流程数据
        serviceId && getFlowData({serviceId}).then(data => {
            if (data.data) {
              let {flowNodeList = []} = data.data

              if (flowNodeList && flowNodeList.length > 0) {
                  let _data = flowNodeList[0],
                      {input} = _data || {};

                  if (input) {
                      let {inputTable,outputTable,sql} = JSON.parse(input) || {};

                       setInputData(inputTable || [])
                       setOutputData(outputTable || [])
                       setSqlText(sql || '')
                  }
              }
            }
        })
    },[service])
    

    useEffect( () => {
        const save = saveNodes.asObservable().subscribe(res => {
            const {projectId,serviceId} = service
            saveFlowData({
                projectId,
                serviceId,
                lines:'',
                nodes:[
                    {
                        id:1,
                        pid:null,
                        nodeName:'flinkSql',
                        nodeType:2501,
                        location:'',
                        input:JSON.stringify(
                            {
                                nodeType:2501,
                                inputTable:inputData,
                                outputTable:outputData,
                                sql:sqlText
                            }
                        ),
                        output:''
                    }
                ]
            }).then(() => {
                Notification({
                    type:'success',
                    message:'保存成功'
                })
            })
        })

        return () => {
            save.unsubscribe()
        }

    },[service,sqlText,inputData,outputData])

    const curOutputData = useMemo(() => {
        return editOutputIndex === -1 ? {
            code:'',
            dsType:'',
            dsId:'',
            tableCode:'',
            fieldsList:[],
            tableList:[],
            dataSourceList:[],
            fields:[],
            selectedRowKeys:[]
        } : outputData[editOutputIndex]
    }, [editOutputIndex,outputData])

    const changeOutput = data => {
        let _outputData = [...outputData];

        if(editOutputIndex > -1) {
            _outputData[editOutputIndex] = data
        } else {
            _outputData.push(data)
        }

        setOutputData(_outputData)
    }

    const edit = (type,index) => {
        if (type === 'input') {
            setInputVisible(true)
        } else {
            setEditOutputIndex(index)
            setOutputVisible(true)
        }
    }

    const deleteData = (type,index) => {
        if (type === 'input') {
            setInputData([])
        } else {
            setOutputData(pre => {
                return [...pre.slice(0,index),...pre.slice(index+1)]
            })
        }
    }

    return (
        <section className="sql-link-wrapper">
            <div className="left-wrapper">
                <div className="input-wrapper">
                    <div className="input-title">
                        输入表管理
                        <span className={inputData.length > 0 ? 'disabled' : ''} onClick={inputData.length > 0 ? null :() => setInputVisible(true)}>添加输入</span>
                    </div>
                    <div className="table-content">
                        <Collapse defaultActiveKey={[]}>
                            {
                                inputData.map((item,index) => {
                                    let {code,fields} = item;

                                    return code ? <Panel header={
                                        <div>
                                            <span>
                                                {code}
                                            </span>
                                            <div style={{float:'right',marginRight:'12px'}} onClick={e => e.stopPropagation()}>
                                                <span onClick={() => edit('input')}>编辑</span> | <span onClick={() => deleteData('input')}>删除</span>
                                            </div>
                                        </div>
                                    } key={code + index}>
                                        <div>
                                            {
                                                fields.map((_item,_index) => {
                                                    let {code,type} = _item;

                                                    return <div className="field-p" key={index+code}>
                                                        <span>{code}</span>
                                                        <span>{type}</span>
                                                    </div>
                                                })
                                            }
                                        </div>
                                    </Panel> : null
                                })
                            }
                        </Collapse>
                    </div>
                </div>
                <div className="output-wrapper">
                    <div className="input-title">
                        输出表与维表管理
                        <span onClick={() => setOutputVisible(true)}>添加输出或维表</span>
                    </div>
                    <div className="table-content">
                        <Collapse defaultActiveKey={['1']}>
                            {
                                outputData.map((item,index) => {
                                    let {code,fields} = item;

                                    return code ? <Panel header={
                                        <div>
                                            <span>
                                                {code}
                                            </span>
                                            <div style={{float:'right',marginRight:'12px'}} onClick={e => e.stopPropagation()}>
                                                <span onClick={() => edit('output',index)}>编辑</span> | <span onClick={() => deleteData('output',index)}>删除</span>
                                            </div>
                                        </div>
                                    } key={code + index}>
                                        <div>
                                            {
                                                fields.map((_item,_index) => {
                                                    let {code,type} = _item;

                                                    return <div className="field-p" key={index+code}>
                                                        <span>{code}</span>
                                                        <span>{type}</span>
                                                    </div>
                                                })
                                            }
                                        </div>
                                    </Panel> : null
                                })
                            }
                        </Collapse>
                    </div>
                </div>
            </div>
            <div className="right-wrapper">
                <CodeEdit sqlText={sqlText} setSqlText={setSqlText}></CodeEdit>
            </div>
            {
                inputModalVisible &&
                <InputConfigModal
                    inputData={inputData[0] || {}} 
                    visible={inputModalVisible}
                    productList={productList}
                    setInputData={setInputData} 
                    cancelHandle={() => setInputVisible(false)}></InputConfigModal>
            }
            {
                outputModalVisible && 
                <OutputConfigModal
                    inputData={curOutputData} 
                    visible={outputModalVisible}
                    changeOutput={changeOutput} 
                    cancelHandle={() => {setOutputVisible(false);setEditOutputIndex(-1)}}></OutputConfigModal>
            }
        </section>
    )
}