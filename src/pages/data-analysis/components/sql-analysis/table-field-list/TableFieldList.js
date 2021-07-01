import React from 'react'
import {Table} from 'antd'
import { cloneDeep } from "lodash";

export default function TableFieldList({
    fieldList,
}) {

    let newdata = fieldList.map((itm,index)=>{
        let newitm = cloneDeep(itm)
        newitm.id = index + 1;
        return newitm

    })

    let colum = Object.keys(fieldList[0]).map((item)=>{
        return {
            title: item,
            dataIndex: item,
        }
    })

    return (
        
        <div className="table-filed-content">
            <Table rowKey="id"
                columns={[{title:'序号',dataIndex:'id'},...colum]}
                dataSource={newdata}
                scroll={{ y: 400 }}
                pagination={false}/>
        </div>
    )
}
