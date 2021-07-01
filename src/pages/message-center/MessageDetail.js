import React from 'react'
import AloneSection from '../../components/alone-section/AloneSection'
import { DateTool } from '../../util/util';
import { get, Paths } from '../../api';


export default class MessageDetail extends React.PureComponent {
    state={
        detail:null
    }

    componentDidMount() {
        this.getMessageDetail()
    }

    getMessageDetail = () => {
        let {match ={},location,setReaded} = this.props,
            {params = {}} = match,
            {noticeId} = params,
            {state = {}} = location,
            {read} = state;
        
        if (noticeId) {
            get(Paths.getNoticeDetail,{
                noticeId
            },{
                needVersion:1.1
            }).then(data => {

                if (read === false) {
                    setReaded(noticeId)
                }

                this.setState({
                    detail:data.data
                })
            })
        }
    }

    goBackList = () => {
        let {history} = this.props; 
        history.replace({
            pathname:'/messageCenter/list'
        })
    }
    
    render () {
        let {detail} = this.state;
        return (
            <AloneSection>
                {
                    detail && 
                    <div className="message-detail-wrapper">
                        <h2 className="message-title">{detail.noticeTitle}</h2>
                        <p className="message-tips">
                            <span><b>发布时间：</b>{DateTool.utcToDev(detail.sendTime)}</span>
                            <span><b>消息类型：</b>{detail.noticeTypeName}</span>
                        </p>
                        <div className="message-content" dangerouslySetInnerHTML={{__html:detail.noticeContent}}>{}</div>
                        <a className="left-top" onClick={this.goBackList}>返回消息列表</a>
                    </div>
                }
            </AloneSection>
        )
    }
}