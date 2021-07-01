import React from 'react'
import AloneSection from '../../components/alone-section/AloneSection'
import {Radio,Table,Button} from 'antd';
import { DateTool, addKeyToTableData } from '../../util/util';
import {Link} from 'react-router-dom';

const defaultPageRows = 20;


const columns = [
    {
        title: '消息标题',
        dataIndex: 'noticeTitle',
        render:(text,record) => {
            let {noticeTitle,noticeId,read} = record;

            return <Link className={read ? 'gray' : ''} to={{
                pathname: `/messageCenter/detail/${noticeId}`,
                state: { read}
            }}>{noticeTitle}</Link>
        }
    },
    {
        title: '消息类型',
        dataIndex: 'noticeTypeName',
        width:'300px',
    },
    {
        title: '时间',
        width:'400px',
        dataIndex: 'sendTime',
        render: (text, record) => {
            let { sendTime } = record;
            return <span>{DateTool.utcToDev(+sendTime)}</span>
        }
    }
];

export default function MessageList({messageList = [],selectedRowKeys,noticeType,changeMessageType,setReaded,onSelectChange,newMessageNums,pager,pageIndex,changePage,read}) {

    let btnDisable = (selectedRowKeys.length > 0),
        {totalUnRead,processUnRead,serviceUnRead,publicUnRead} = newMessageNums,
        showReadNums = !(read === true);

    messageList = addKeyToTableData(messageList)

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        getCheckboxProps:record => ({
            disabled: record.read
        })
    };

    return (
        <AloneSection>
            <div className="message-wrapper">
                    <Radio.Group value={noticeType + ''} onChange={changeMessageType}>
                        <Radio.Button value="">全部类型消息 {showReadNums ? dealNums(totalUnRead) : ''}</Radio.Button>
                        <Radio.Button value="2">&nbsp;&nbsp;流程消息 {showReadNums ? dealNums(processUnRead) : ''}</Radio.Button>
                        <Radio.Button value="3">&nbsp;&nbsp;服务消息 {showReadNums ? dealNums(serviceUnRead) : ''}</Radio.Button>
                        <Radio.Button value="1">&nbsp;&nbsp;公告消息 {showReadNums? dealNums(publicUnRead) : ''}</Radio.Button>
                    </Radio.Group>
                <Button style={{float:'right'}} 
                        disabled={!btnDisable} 
                        onClick={() => setReaded()}
                        type="primary">标记已读</Button>
            </div>
            <section className="table-wrapper">
                <Table rowSelection={rowSelection} 
                       dataSource={messageList} 
                       columns={columns}
                       pagination={{
                        total:pager.totalRows,
                        current:pageIndex,
                        defaultCurrent:1,
                        defaultPageSize:defaultPageRows,
                        onChange:(page) => changePage(page),
                        showTotal:total => <span>共 <a>{total}</a> 条</span>,
                        showQuickJumper:true,
                        hideOnSinglePage:true
                        }} ></Table>
            </section>
        </AloneSection>
    )
}

function dealNums(num) {
    if(!num) {
        return ''
    }

    if (num > 99) { num = '99+'}

    return `(${num})`
} 