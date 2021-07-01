/* eslint-disable eqeqeq */
// 入口文件-------


import React,{ Component} from 'react';
import { Switch,Route,Redirect} from 'react-router-dom';
import loadable from '@loadable/component';
import {connect} from 'react-redux';
import {getDeveloperInfo,gatMuenList,updateMuenList,getInstanceList} from '../user-center/store/ActionCreator';
import {getNewMessageNums} from '../message-center/store/ActionCreator';

import OutsideWrapper  from '../../components/outside-wrapper/OutsideWrapper';
import Header from './header/Header';
import NavMenu from './nav-menu/NavMenu';
// import ContentBread from './content-bread/ContentBread';
import Base from '../base-product/BaseProduct'; // ------基础产品

import './Open.scss';

// 模块懒加载
const BigDataProduct = loadable( () => import('../big-data-product/BigDataProduct'));
const DevelopCenter = loadable( () => import('../develop-center/DevelopCenter'));

const mapStateToProps = state => {
    return {
        developerInfo: state.getIn(['userCenter', 'developerInfo']).toJS(),
        muenList: state.getIn(['userCenter', 'muenList']).toJS(),
        newMessageNums: state.getIn(['message', 'newMessageNums']).toJS(),
        instanceList: state.getIn(['userCenter', 'instanceList']).toJS()
    }
}

const mapDispatchToProps = dispatch => {
    return {
        getDeveloperInfo: () => dispatch(getDeveloperInfo()),
        updateMuenList: (data) => dispatch(updateMuenList(data)),
        gatMuenList: () => dispatch(gatMuenList()),
        getNewMessageNums: () => dispatch(getNewMessageNums()),
        getInstanceList: (params) => dispatch(getInstanceList(params)),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Open extends Component {
    state = {
        collapsed:false
    }
    setCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed
        })
    }
    
    componentDidMount(){
        // 请求用户信息
        this.props.getDeveloperInfo();
        this.props.getNewMessageNums();
        this.props.getInstanceList();

        if(JSON.parse(localStorage.getItem('menuList'))){
            this.props.updateMuenList(JSON.parse(localStorage.getItem('menuList')));
        }else{
            this.props.gatMuenList()
        }
    }
    render () {
        let { match,routes ,developerInfo,newMessageNums,instanceList} = this.props,
        {collapsed} = this.state,
        {path} = match;
        let muenList = JSON.parse(localStorage.getItem('menuList'))||[];
        return (

            <OutsideWrapper>
                {/* 头部header------- */}
                <section className="page-header-wrapper">
                    <Header developerInfo={developerInfo} collapsed={collapsed} newMessageNums={newMessageNums} setCollapsed={this.setCollapsed} instanceList={instanceList}></Header>
                </section>
                {/* 内容盒子------- */}
                <div className="content-wrapper">
                    {/* 左侧菜单------- */}
                    <div className="left-menus">
                        <NavMenu muenList={muenList} collapsed={collapsed} routes={routes}></NavMenu>
                    </div>
                    {/* 右侧内容显示------- */}
                    <section className="right-wrapper flex-column">
                        {/* 新交互，不需要面包屑 */}
                        {/* <ContentBread location={window.location} routes={routes} /> */}
                        <div className="flex1">
                            <Switch>
                                {
                                    /**
                                     * 为了满足进入页面默认显示一级菜单得首个二级目录
                                     * 这里让后台添加了url，本来想着直接遍历，用url，发现两个问题
                                     * 1.url 跟 component不能公用一个值
                                     * 2.现在得下拉菜单现在是独立前端处理。但是接口还是返回了，处理不能统一。
                                     * 综上述借口所述，简单暴力得字段判断处理了。
                                     */
                                    muenList.map((item,index)=>{
                                        if(item.menuname=='基础产品'){
                                            /**
                                             * -------
                                             * props默认的参数包含{history, location, match, staticContext}
                                             * match:{
                                             *  params: {},
                                             *  path: '/open/base',
                                             *  url: 'open/base'
                                             * }
                                             */ 
                                            return <Route key='基础产品' path={`${path}/base`}
                                                render={(props) => <Base muenList={item.menus} {...props}></Base>}
                                            ></Route>
                                        }else if(item.menuname=='大数据服务'){
                                            return <Route key='大数据服务' path={`${path}/bigData`}
                                                render={props => <BigDataProduct muenList={item.menus} {...props}></BigDataProduct>}
                                            ></Route>
                                        } else if(item.menuname=='开发中心'){
                                            return <Route key='开发中心' path={`${path}/developCenter`}
                                                render={props => <DevelopCenter muenList={item.menus} {...props}></DevelopCenter>}
                                            ></Route>
                                        }
                                    })
                                }
                                
                                <Route key='开发中心' path={`${path}/developCenter`}
                                    render={props => <DevelopCenter {...props}></DevelopCenter>}
                                ></Route>
                                <Redirect from={`${path}/userCenter`} to="/userCenter"></Redirect>
                                <Redirect to={muenList.length>0?`${path}/${muenList[0].url}`:`${path}/base`}></Redirect>
                            </Switch>
                        </div>
                    </section>
                </div>
            </OutsideWrapper>
        )
    }
}