import React, { Component } from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {isEmpty} from 'lodash';
import { get,Paths, post } from '../../api';
import {getNewMessageNums} from './store/ActionCreator'
import {getDeveloperInfo} from '../user-center/store/ActionCreator';


import Header from '../../pages/open/header/Header'
import PageTabs from '../../components/page-tabs/PageTabs'
import PageTitle from '../../components/page-title/PageTitle'
import OutsideWrapper from '../../components/outside-wrapper/OutsideWrapper'


import MessageList from './MessageList'
import MessageDetail from './MessageDetail'

import './MessageCenter.scss'

// 把当前redux store state映射到展示组件的props中
const mapStateToProps = state => {
    return {
        developerInfo: state.getIn(['userCenter', 'developerInfo']).toJS(),
        newMessageNums: state.getIn(['message', 'newMessageNums']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getNewMessageNums: () => dispatch(getNewMessageNums()),
        getDeveloperInfo: () => dispatch(getDeveloperInfo()),
    }
}
// 将store中的state及action注册到当前组件，方便组件从props中读取
@connect(mapStateToProps, mapDispatchToProps)
export default class MessageCenter extends Component {
    constructor (props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            messageList: [],
            noticeType:'', // 1-系统公告 2-流程消息 3-服务消息 全部- ''
            read: '', // ''-全部 false-未读 true- 已读
            pager:{
                totalPages:0,
                currPageRows:null
            },
            pageIndex:1
        }
        // 切换左侧消息状态
        this.pageTabClickHandles = [
            () => this.changeRead(''),
            () => this.changeRead(false),
            () => this.changeRead(true),
        ]
    }
    // dom已经挂载
    componentDidMount () {
        console.log('dom已经挂载', this.props)
        let {newMessageNums,getNewMessageNums,getDeveloperInfo,developerInfo} = this.props;

        if (isEmpty(newMessageNums)) {
            getNewMessageNums()
        }

        if (isEmpty(developerInfo)) {
            getDeveloperInfo()
        }

        this.getMessageList()
    }
    getMessageList = (_value,needChangeState) => {
        let { noticeType,read,pageIndex,selectedRowKeys,messageList}= this.state,
            temp = {
                pageIndex,
                pageRows:20,
                noticeType,
                read
            },
            data = {};

        if ((messageList.length > 0) && (selectedRowKeys.length === messageList.length) && temp.pageIndex > 1) {
            temp.pageIndex--
        }

        if (_value !== undefined) {
            temp[needChangeState] = _value

            if (needChangeState !== 'pageIndex') {
                temp['pageIndex'] = 1
            }
        }


        Object.keys(temp).forEach(item => {
            if(temp[item] !== '') {
                data[item] = temp[item]
            }
        })

        return get(Paths.getNoticeList,data,{
            needVersion:1.1,
            loading:true
        }).then(data => {
            let {list,pager} = data.data,
                _data = {
                    messageList:list,
                    pager,
                    selectedRowKeys:[]
                }

                if(needChangeState) {
                    _data[needChangeState] = _value

                    if (needChangeState !== 'pageIndex') {
                        _data['pageIndex'] = 1
                    }
                }

            this.setState(_data)
        })
    }
    changeRead = value => {
        let {read} = this.state,
            {history} = this.props,
            isInlistRoute = !(window.location.hash.indexOf('/messageCenter/detail/') > -1);

        if ((read === value) && isInlistRoute) {
            return;
        }
        
        this.getMessageList(value,'read').then(() => {
            if (!isInlistRoute) {
                history.replace({
                    pathname:'/messageCenter/list'
                })
            }
        })
    }
    changeMessageType = e => {
        let type = e.target.value;

        this.getMessageList(type,'noticeType')
    }
    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys });
    }
    setReaded = (noticeId) => {
        let {selectedRowKeys,messageList} = this.state,
            {getNewMessageNums} = this.props,
            noticeIds = '';

        if (noticeId) {
            noticeIds = noticeId
        } else {
            noticeIds = selectedRowKeys.map(index => messageList[index].noticeId).join(',')
        }


        post(Paths.setRead,{
            noticeIds
        },{
            needVersion:1.1,
            loading:true
        }).then(data => {
            this.getMessageList()
            getNewMessageNums()
        })
    }
    chearSelectedRowKeys = () => {
        this.setState({
            selectedRowKeys:[]
        })
    }
    changePage = (pageIndex) => {
        this.getMessageList(pageIndex,'pageIndex')
    }
    render() {
        console.log(this.props, 'props----')
        let {messageList,selectedRowKeys,pager,noticeType,pageIndex,read} = this.state,
            {match,newMessageNums = {},developerInfo={}} = this.props,
            {path} = match,
            {totalUnRead} = newMessageNums;

        return (
            <OutsideWrapper>
                <div className="page-header-wrapper">
                    <Header newMessageNums={newMessageNums} developerInfo={developerInfo} noCollapsed={true}></Header>
                </div>
                <div className="content-wrapper">
                    <PageTabs Nums={[0,totalUnRead || 0,0]} clickHandles={this.pageTabClickHandles}></PageTabs>
                    <section className="right-wrapper flex-column">
                        <PageTitle noback={true} title="消息中心"></PageTitle>
                        <div className="flex1 scroll-y">
                            <Switch>
                                <Route path={`${path}/list`} 
                                    render={props => 
                                            <MessageList
                                                {...props} 
                                                messageList={messageList} 
                                                selectedRowKeys={selectedRowKeys} 
                                                noticeType={noticeType}
                                                pager={pager}
                                                pageIndex={pageIndex}
                                                changePage={this.changePage} 
                                                onSelectChange={this.onSelectChange}
                                                newMessageNums={newMessageNums}
                                                setReaded={this.setReaded}
                                                read={read}
                                                changeMessageType={this.changeMessageType}></MessageList>}>
                                </Route>
                                <Route path={`${path}/detail/:noticeId`} 
                                    render={props => <MessageDetail {...props} setReaded={this.setReaded}></MessageDetail>}>
                                </Route>
                                <Redirect to={`${path}/list`}></Redirect>
                            </Switch>
                        </div>
                    </section>
                </div>  
            </OutsideWrapper>
        )
    }
}
