import React, { PureComponent } from 'react'
import {Link, withRouter} from 'react-router-dom';
import { Menu, Icon } from 'antd';
import MyIcon from '../../../components/my-icon/MyIcon';
import {isEqual} from 'lodash';

import './NavMenu.scss';

const { SubMenu } = Menu;

//校验一、二级菜单是否有权限
function AuthorityToJudge (muenList=[],name='') {
    name = name.indexOf('*')>-1?name.slice(1):name;
    return muenList.indexOf(name);
}
class NavMenu extends PureComponent {
    state = {
        defaultSelectedKeys: ['1'],
        defaultOpenKeys: ['sub1'],
    }

    componentWillMount(){
        const {routes, history , muenList} = this.props;
        let pathname = history.location.pathname;

        if (pathname === '/open' && muenList[0] && muenList[0].menus && muenList[0].menus[0]) { // 登录入口进来时开始渲染此组件时，pathname为 /open
            pathname += `/${muenList[0].url}/${muenList[0].menus[0].url}`
        }
        
        routes.map((item, index) => {
            item.routes && item.routes.map(inner => {
                if(pathname.indexOf(item.path) >= 0 && pathname.indexOf(inner.path) >= 0){
              
                    this.setState({
                        defaultOpenKeys: [`${item.menuId}`],
                        defaultSelectedKeys: [`${inner.menuId}`]
                    })
                }
            })
        })
    }

    componentDidMount(){
       this.update(this.props.muenList);
    }

    update = (data, list = []) => {// 后台返回的所有菜单名不分级别 存在数组 this.muenList 里（权限竟然是根据菜单中文名匹配，所以牵扯很多烂事，比如需要修改菜单名的时候）
        for (let i = 0; i < data.length; i++) {
            let menu = data[i];
            let { menuname, menus } = menu;
            if(menuname === '大数据服务'){//后台修改太难了，前端修正菜单文案
                menuname = '数据服务'
            }
            if(menuname === '入网设备管理'){//后台修改太难了，前端修正菜单文案
                menuname = '设备管理'
            }
            list.push(menuname);
            menus.length && this.update(menus, list);
        }
        list = [...list,
            '开发中心',
            '项目管理',
            '服务开发',
            '设备分组管理',
            '设备告警',
            // '数据流转',
            // '设备监控',
            'OTA升级'
        ]
        this.muenList = list;
    }
    componentDidUpdate(propsold,stateold){
        if(!isEqual(propsold.muenList, this.props.muenList)){
            this.update(this.props.muenList);
        }
    }
    render() {
        let {collapsed,routes} = this.props;
        const {defaultSelectedKeys, defaultOpenKeys} = this.state;

        return (
            <div className="menu-wapper">
                <Menu
                    defaultSelectedKeys={defaultSelectedKeys}
                    defaultOpenKeys={defaultOpenKeys}
                    mode="inline"
                    theme="dark"
                    inlineIndent={18}
                    inlineCollapsed={collapsed}
                    className="self-menu"
                    forceSubMenuRender={true}
                >
                    {
                        routes.map((item,index) => {
                            if(AuthorityToJudge(this.muenList,item.text)!=-1){
                                let {navMenu,menuIcon,text,routes} = item;
                                if (navMenu) {
                                    return (
                                        <SubMenu
                                            key={`${item.menuId}`}
                                            title={
                                                <span>
                                                    {menuIcon.indexOf('icon-') > -1 ? <MyIcon type={menuIcon}></MyIcon> : <Icon type={menuIcon} />}
                                                    <span>{dealMenuText(text)}</span>
                                                </span>
                                            }
                                        >
                                            {
                                                routes.length > 0 &&
                                                routes.map((_item) => {
                                                    if(AuthorityToJudge(this.muenList,_item.text)!=-1){
                                                        let {navMenu,text,path,hasSubMenu,routes} = _item;
                                                        // 前端过滤 设备数据和用户数据菜单
                                                        let menuName = dealMenuText(text);
                                                        if(menuName === "设备数据" || menuName === "用户数据"){
                                                            return null;
                                                        }
                                                        if(hasSubMenu){
                                                            return (
                                                                <SubMenu
                                                                    key={`${_item.menuId}`}
                                                                    title={
                                                                        <span>
                                                                            <span>{dealMenuText(text)}</span>
                                                                        </span>
                                                                    }
                                                                >
                                                                    {
                                                                        routes.length > 0 &&
                                                                        routes.map((_item) => {
                                                                            if(AuthorityToJudge(this.muenList,_item.text)!=-1){
                                                                                let {navMenu,text,path} = _item;
                                                                                if (navMenu) {
                                                                                    return (
                                                                                        <Menu.Item key={`${_item.menuId}`}>
                                                                                            <Link to={path}>{dealMenuText(text)}</Link>
                                                                                        </Menu.Item>
                                                                                    )
                                                                                }
                                                                                return null
                                                                            }
                                                                        })
                                                                    }
                                                                </SubMenu>
                                                            )
                                                        }else if (navMenu) {
                                                            return (
                                                                <Menu.Item key={`${_item.menuId}`}>
                                                                    <Link to={path}>{dealMenuText(text)}</Link>
                                                                </Menu.Item>
                                                            )
                                                        }
                                                        return null
                                                    }
                                                })
                                            }
                                        </SubMenu>
                                    )
                                }
                                return null
                            }
                        })
                    }
                </Menu>
            </div>
        )
    }
}


function dealMenuText(text) {
    let subText = text.substr(0, 4);
    if (text.indexOf('*') > -1) {
        return text.slice(1);
    }
    if (subText === '设备数据' || subText === '用户数据') {
        return subText;
    }
    return text;
}


export default withRouter(NavMenu)
