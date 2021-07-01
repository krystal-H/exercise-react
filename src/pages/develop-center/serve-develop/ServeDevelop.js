import React from 'react'
import PageTitle from '../../../components/page-title/PageTitle'
import AloneSection from '../../../components/alone-section/AloneSection'
import FlowChart from '../../../components/flow-chart/FlowChart'

import ServeList from './ServeList'
import './ServeDevelop.scss'

const FLOWLIST = [
    {
        title:'步骤一'
    },
    {
        title:'步骤二'
    },
    {
        title:'步骤三'
    }
]

export default function ServeDevelop() {
    return (
        <>
            <PageTitle noback={true} 
                title="服务开发" ></PageTitle>
            <AloneSection>
                <div className="use-service-flow-wrapper">
                    <FlowChart type={3} flowLists={FLOWLIST}></FlowChart>
                    <div className="extra-descs">
                        <div className="descs-item">
                            <p>新建服务，填写服务名称和关联项目</p>
                        </div>
                        <div className="descs-item">
                            <p>编辑业务逻辑，进行部署调试</p>
                        </div>
                        <div className="descs-item">
                            <p>发布服务，生成正式地址，可以对服务进行启动/停止</p>
                        </div>
                    </div>
                </div>
            </AloneSection>
            <AloneSection style={{minHeight:'calc(100% - 300px)'}}>
                <ServeList></ServeList>
            </AloneSection>
        </>
    )
}
