import React, { useState, useEffect, useCallback } from 'react'
import { Tabs,Input,Button,Select,Table,DatePicker} from 'antd'
import PageTitle from '../../../components/page-title/PageTitle'
import AloneSection from '../../../components/alone-section/AloneSection'
import Playground  from '../../data-analysis/components/playground/Playground'
import ReadonlyView from './../../logicDevelop/ReadonlyView/index'
import {useParams} from 'react-router-dom'
import {Paths,get} from '../../../api'
import { getUrlParam } from '../../../util/util'

const {TabPane} = Tabs
const {Option} = Select

export default function ServeDetail() {
    const {id} = useParams()
    const serveName = decodeURI(getUrlParam('serveName'))
    const projectId = decodeURI(getUrlParam('projectId'))
    const type = decodeURI(getUrlParam('type'))

    const [searchData,setSearchData] = useState({searchKey:'',since:null,searchLoading:false})
    const [logData,setLogData] = useState({logList:[],logPager:{}})

    const {searchKey,since,searchLoading} = searchData
    const {logList,logPager} = logData

    const onSearch = () => {
        if (since) {
            let _since = (since.unix() - 8 * 3600) * 1000
            getServiceLog(_since)
            return
        }
        getServiceLog()
    }

    const getServiceLog = useCallback( 
        _since => {
            let _data = {
                serviceId:id,
                tail:100,
                follow:false
            }

            if (_since) {
                _data = _since
            }

            return get(Paths.getServiceLog,_data).then(data => {
                data && data.data && setLogData({...logData,logList:data.data})
            })
        },[id, logData]
    )

    useEffect( () => {
        getServiceLog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[id])

    const changeParam = (key,value) => {
        setSearchData(preData => {
            return {
                ...preData,
                ...{
                    [key]:value
                }
            }
        })
    }

    const columns = [
        {
            title: '调用时间',
            dataIndex: 'timestamp',
            key: 'timestamp'
        },
        {
            title: '节点执行日志',
            dataIndex: 'text',
            key: 'text'
        },
    ]

    return (
        <React.Fragment>
            <PageTitle noback={true}
                title={serveName || '测试'}></PageTitle>
            <AloneSection style={{minHeight:'calc(100% - 102px)'}}>
                <Tabs defaultActiveKey="1">
                    <TabPane tab={"运行数据"} key={1}>
                        <div>
                            <AloneSection>
                                <div className="all-data-wrapper">
                                    <div className="data-item">
                                        <h3>服务总数</h3>
                                        <p>100</p>
                                    </div>
                                    <div className="data-item">
                                        <h3>测试环境</h3>
                                        <p>49</p>
                                    </div>
                                    <div className="data-item">
                                        <h3>正式环境</h3>
                                        <p>51</p>
                                    </div>
                                </div>
                            </AloneSection>
                        </div>
                        {/* TODO:图表 */}
                    </TabPane>
                    <TabPane tab={"服务日志"} key={2}>
                        <div className="serve-log-wrapper">
                            <div style={{ 'marginBottom': '24px' }}>
                                <Select value="" style={{ width: '240px',marginRight:'12px'}}>
                                            <Option value="">错误日志</Option>
                                </Select>
                                <DatePicker style={{ width: '240px',marginRight:'12px'}}
                                            showTime
                                            showToday
                                            value={since}
                                            onChange={(value) => changeParam('since',value)}
                                            ></DatePicker>
                                <Input placeholder="请输入关键字"
                                    style={{ width: '240px',marginRight:'12px'}}
                                    value={searchKey}
                                    onChange={(e) => changeParam('searchKey',e.target.value)}
                                    maxLength={20} />
                                <Button type="primary"
                                        style={{marginRight:'12px'}}
                                        onClick={onSearch}
                                        loading={searchLoading} 
                                        icon="search">查询</Button>
                            </div>
                            <div>
                                <Table  rowKey={"timestamp"}
                                    columns={columns}
                                    dataSource={logList}
                                    pagination={false}></Table>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab={"服务编排"} key={3}>
                       <div className="static-flow-wrapper">
                           <div className="relative-wrapper">
                           {
                               type == 1 ? 
                               <Playground service={{
                                    serviceId : id,projectId
                                }} isStatic={true}></Playground>
                                : <ReadonlyView projectId={projectId} serviceId={id} />
                           }
                           </div>
                       </div>
                    </TabPane>
                </Tabs>
            </AloneSection>
        </React.Fragment>
    )
}
