import React, { useMemo } from 'react'
import AloneSection from '../../../../../components/alone-section/AloneSection'
import {Table} from 'antd'

const COLUMNS = [
    {
        title: 'Topic',
        dataIndex: 'topic',
        key: 'topic',
    },
    {
        title: '描述',
        dataIndex: 'desc',
        key: 'desc',
    }
]

export default function TopicList({
    productIdHex = "",
    type = 0
}) {

    // const columns = useMemo( () => {
    //     return COLUMNS.slice(type)
    // },[type])

    // const data = [
    //     {
    //         fn:'属性上报',
    //         topic:`/sys/${productIdHex}/thing/event/property/post`,
    //         action:'发布',
    //         desc:'设备属性上报'
    //     },
    //     {
    //         fn:'属性设置',
    //         topic:`/sys/${productIdHex}/thing/service/property/set`,
    //         action:'订阅',
    //         desc:'设备属性设置'
    //     },
    //     {
    //         fn:'事件上报',
    //         topic:`/sys/${productIdHex}/thing/event/\${tsl.event.identifer}/post`,
    //         action:'发布',
    //         desc:'设备事件上报'
    //     },
    //     {
    //         fn:'服务调用',
    //         topic:`/sys/${productIdHex}/thing/service/\${tsl.service.identifer}`,
    //         action:'订阅',
    //         desc:'设备服务调用'
    //     },
    // ]
    const data = [
        {
            fn:'属性',
            topic:`/sys/${productIdHex}/thing/event/property/post`,
            desc:'设备属性上报'
        },
        {
            fn:'事件info',
            topic:`/sys/${productIdHex}/device/thing/event/info/post`,
            desc:'设备信息通知'
        },
        {
            fn:'事件error',
            topic:`/sys/${productIdHex}/device/thing/event/error/post`,
            desc:'设备故障上报'
        },
        {
            fn:'事件alert',
            topic:`/sys/${productIdHex}/device/thing/event/alert/post`,
            desc:'设备告警'
        },
    ]

    return (
        <AloneSection title="topic列表">
            <div style={{padding:'12px'}}>
                <Table columns={COLUMNS} 
                        dataSource={data}
                        key="topic"
                        pagination = {false}
                        />
            </div>
        </AloneSection>
    )
}
