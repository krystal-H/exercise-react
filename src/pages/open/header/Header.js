import React,{PureComponent} from 'react'
import {Icon,Modal,Radio} from 'antd'
import {Link,withRouter} from 'react-router-dom';
import {post,Paths} from '../../../api'
import store from '../../../store'
import {updateProductListAction} from '../../../pages/base-product/product/store/ActionCreator'

import './Header.scss'

import LogoImg from '../../../assets/images/logo.png'
import DefaultUserIcon from '../../../assets/images/common/userIcon@2x.png'

const LOGO_TEXT = '物联网云平台';

@withRouter
export default class Header extends PureComponent  {
    state={
        instanceMod:false,
        curInstanceId:localStorage.getItem('superInstanceId')
        
    }
    
    logout = () => {

        post(Paths.logout,{},{loading:true}).then(() => {
            store.dispatch(updateProductListAction({
                list:[],
                pager:{}
            }));
            window.location = window.location.origin + window.location.pathname + '#/account/login';
            localStorage.removeItem('menuList');//推出成功时，清除菜单缓存，只能放在跳转之后再执行。不然退出时就会出错
        })
    }
    getCurInstancenam = ()=>{
        let id = localStorage.getItem('superInstanceId'), { instanceList } = this.props;
        let list = instanceList || [];
        for(let i in list ){
            if(list[i].id == id){
                return list[i].name
            }
        }
        return '--';
    }
    instanceModSwitch = (boo)=>{
        
        this.setState({instanceMod:boo});
    }
    changeInstance = (e)=>{
        let id = e.target.value;
        this.setState({curInstanceId:id});
    }
    getNewPath = ()=>{
        let _harsh = window.location.hash, newpath = '';
        const _patharr = [
            '/open/base/product',
            '/open/developCenter/projectManage',
            '/open/base/device',
            '/open/bigData',
            '/open/base/application'
        ];
        for(let item of _patharr) { 
            if(_harsh.indexOf(item) != -1){
                newpath = item;
                break
            }
        };　
        return newpath

    }
    okChange = ()=>{
        let nowid = this.state.curInstanceId,
            nowloaclid = localStorage.getItem('superInstanceId');
        this.instanceModSwitch(false);

        if(nowid != nowloaclid){
            localStorage.setItem('superInstanceId',nowid);
            let newPath = this.getNewPath();
            if(newPath){
                this.props.history.push({
                    pathname: newPath
                });

            }else{
                window.location.reload();
            }
            
        }
    }
    render () {
        let { instanceMod,curInstanceId } = this.state;
        let {collapsed,setCollapsed,onlyLogo,developerInfo = {},newMessageNums={},noCollapsed = false,instanceList} = this.props,
            {email,account,isSubUser} = developerInfo,
            {totalUnRead} = newMessageNums,
            messageIconClassName = '';
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        
        if (totalUnRead) {
            messageIconClassName += " nums-wrapper"

            if (totalUnRead > 99) {
                totalUnRead = '99+'
                messageIconClassName += " max-num"
            }
        }

        return (<header className="page-header">
            <section className="logo">
                    <img src={LogoImg} alt="logo"/>
                    <span>{LOGO_TEXT}</span>
            </section>
            {/* 新交互，侧边导航收起，不支持展开，注释此菜单 */}
            {
                // !onlyLogo && !noCollapsed &&
                // <span className="menu-icon">
                //     <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'}
                //         onClick={() => setCollapsed(!collapsed)}
                //         ></Icon>
                // </span>
            }
            {
                !onlyLogo && 
                <React.Fragment>
                    
                    {/* 用户中心入口 */}
                    <section className="user-icon-wrapper">
                        <img src={DefaultUserIcon} alt="用户头像" className="user-img"/>
                        <Icon type="caret-down" />
                        <div className="menus-wrapper">
                            <div className="icon-base-info">
                                <span className="single-text" style={{flex:1}}>{email || account || '未获取到邮箱'}</span>
                                <span className="right"
                                    onClick={this.logout}
                                    >
                                    <Icon type="logout" />
                                    &nbsp;退出
                                </span>
                            </div>
                            <div className="user-menus">
                                <div className="menus-item">
                                    <Link to="/userCenter/info" target="_blank">
                                        <span>
                                            <Icon type="user" />
                                            &nbsp;基本资料</span>
                                    </Link>
                                </div>
                                {
                                    // 子账号（isSubUser：1）没有以下内容
                                    (isSubUser === 0 )&& 
                                    <React.Fragment>
                                        <div className="menus-item">
                                            <Link to="/userCenter/security" target="_blank">
                                                <span>
                                                    <Icon type="safety-certificate" />
                                                    &nbsp;安全设置</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/visit" target="_blank">
                                                <span>
                                                    <Icon type="team" />
                                                    &nbsp;访问用户</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/role" target="_blank">
                                                <span>
                                                    <Icon type="cluster" />
                                                    &nbsp;用户角色</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/log" target="_blank">
                                                <span>
                                                    <Icon type="snippets" />
                                                    &nbsp;操作日志</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/case" target="_blank">
                                                <span>
                                                    <Icon type="snippets" />
                                                    &nbsp;实例管理</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/authorize" target="_blank">
                                                <span>
                                                    <Icon type="snippets" />
                                                    &nbsp;授权管理</span>
                                            </Link>
                                        </div>
                                        <div className="menus-item">
                                            <Link to="/userCenter/dataasset" target="_blank">
                                                <span>
                                                    <Icon type="snippets" />
                                                    &nbsp;数据资产</span>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                }
                            </div>
                        </div>
                    </section>
                    {/* 消息中心入口 */}
                    <section className="message-icon">
                        <Link to="/messageCenter" target="_blank">
                            <Icon type="sound" data-nums={totalUnRead} className={messageIconClassName}/>
                        </Link>
                        
                    </section>
                    <section className="instance">
                        <span className='instancenam'>{this.getCurInstancenam()}</span>
                        {
                        instanceList&&instanceList.length>0 &&
                        <span className='btn'onClick={this.instanceModSwitch.bind(this,true)}>切换实例</span>
                        }
                    </section> 


                </React.Fragment>
            }
            {
                instanceList&&instanceList.length>0 && 
                <Modal
                    title="切换实例"
                    visible={instanceMod}
                    width={400}
                    className="instanceMod"
                    onOk={this.okChange}
                    onCancel={this.instanceModSwitch.bind(this,false)}
                >
                    <Radio.Group value={curInstanceId} onChange={this.changeInstance}>
                        {
                            instanceList.map((item,index)=>{
                                    return <Radio style={radioStyle} key={item.id+"_"+index} value={item.id}>{item.name}</Radio>
                            })
                        }
                    </Radio.Group>
                    
                </Modal>

            }
            
        </header>)
    }
}
