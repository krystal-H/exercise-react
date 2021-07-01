/* 项目开始开发时，所有的控件都由此处引入，项目的路由全都使用此文件控制，但是会导致 按路由模块懒加载时import的子组件还是会打包到主js中 ，所以放弃使用该文件控制整个项目路由 */
/* 此文件需要保留，因为面包屑控件需要此文件；不过不再在这里引入模块组件 */

import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';

/*Open是业务入口页面*/
import Open from '../pages/open/Open';

import LogicDevelop from "../pages/logicDevelop";

/*账号管理页面 */
const Account = loadable( () => import('../pages/user-center/Account'))

/*消息中心页面 */
const MessageCenter = loadable( () => import('../pages/message-center/MessageCenter'))


const UserCenter = loadable( () => import('../pages/user-center/UserCenter'))

const DataAnalysis = loadable( () => import('../pages/data-analysis/DataAnalysisi'))

export const routes = [
    {
        path: '/open',
        component: Open,
        routes: [
            {
                path: '/open/base',
                text: '*基础产品',
                navMenu:true,
                menuIcon:'icon-chanpin1',
                menuId:12695,
                routes: [
                    {
                        path: '/open/base/product',
                        text:'产品',
                        navMenu:true,
                        menuId:12712,
                        routes: [
                            {
                                path: '/open/base/product/list',
                            },
                            {
                                path: '/open/base/product/add',
                                text: '新建产品',
                            },
                            {
                                path: '/open/base/product/edit/:id',
                                text: '*产品编辑',
                                routes: [
                                    {
                                        path: '/open/base/product/edit/:id/protocols',
                                        text:'功能定义'
                                    },
                                    {
                                        path: '/open/base/product/edit/:id/projectSelect',
                                        text: '硬件开发',
                                    },
                                    {
                                        path: '/open/base/product/edit/:id/service',
                                        text:'服务配置',
                                        routes:[
                                            {
                                                path: '/open/base/product/edit/:id/service/serviceselect',
                                            },
                                            {
                                                path: '/open/base/product/edit/:id/service/appcontrol',
                                            },
                                            {
                                                path: '/open/base/product/edit/:id/service/cloudtime',
                                            },
                                            {
                                                path: '/open/base/product/edit/:id/service/scenelink',
                                            }
                                        ]
                                    },
                                    {
                                        path: '/open/base/product/edit/:id/commercialInfo',
                                        text:'商业发布',
                                    },{
                                        path: '/open/base/product/edit/:id/applyRelease',
                                        text:'申请发布',
                                    }
                                ]
                            },
                            {
                                path: '/open/base/product/details/:id',
                                text: '产品详情'
                            },
                            {
                                path: '/open/base/product/deviceDebugging',
                                text: '硬件调试',
                            },
                            {
                                redirect: '/open/base/product/list'
                            }
                        ]
                    },
                    {
                        path: '/open/base/device',
                        text:'设备',
                        menuId:12714,
                        hasSubMenu:true,
                        routes: [
                            {
                                path: '/open/base/device/onlineDevice',
                                text:'设备管理',
                                menuId: 13094,
                                navMenu:true,
                                routes: [
                                    {
                                        path: '/open/base/device/onlineDevice/list',
                                    },
                                    {
                                        path: '/open/base/device/onlineDevice/details/:id',
                                        text: '设备详情'
                                    },
                                    {
                                        redirect: '/open/base/device/onlineDevice/list'
                                    }
                                ]
                            },
                            {
                                path: '/open/base/device/deviceSecret',
                                text:'设备秘钥管理',
                                menuId: 13095,
                                navMenu:true,
                                routes: [
                                    {
                                        path: '/open/base/device/deviceSecret/list',
                                    },
                                    {
                                        redirect: '/open/base/device/deviceSecret/list'
                                    }
                                ]
                            },
                            {
                                path: '/open/base/device/groups',
                                text:'设备分组管理',
                                menuId: 19999,
                                navMenu:true,
                                routes: [
                                    {
                                        path: '/open/base/device/groups/details',
                                        text: '分组详情'
                                    }
                                ]
                            },
                            {
                                path: '/open/base/device/deviceWarning',
                                text:'设备告警',
                                menuId: 29999,
                                navMenu:true,
                                routes: [
                                    {
                                        path: '/open/base/device/groups/details',
                                        text: '分组详情'
                                    }
                                ]
                            },
                        ]
                    },
                    
                    {
                        path: '/open/base/application',
                        text:'应用',
                        navMenu:true,
                        menuId:12719,
                        routes: [
                            {
                                path: '/open/base/application/list',
                            },
                            {
                                path: '/open/base/application/add',
                            },
                            {
                                path: '/open/base/application/details/:appId',
                                text: '应用详情'
                            },
                            {
                                redirect: '/open/base/application/list'
                            }
                        ]
                    },
                    {
                        redirect: '/open/base/product'
                    }
                ]
            },
            {
                path: '/open/bigData',
                text: '*数据服务',
                navMenu:true,
                menuIcon:'icon-dashujufenxi',
                menuId:12696,
                routes: [
                    {
                        path: '/open/bigData/deviceDataApi',
                        text: '设备数据API',
                        navMenu:true,
                        menuId:12723,
                        routes: [
                            {
                                path: '/open/bigData/deviceDataApi/list'
                            },
                            {
                                redirect: '/open/bigData/deviceDataApi/list'
                            }
                        ]
                    },
                    {
                        path: '/open/bigData/userDataApi',
                        text: '用户数据API',
                        navMenu:true,
                        menuId:12724,
                        routes: [
                            {
                                path: '/open/bigData/userDataApi/list'
                            },
                            {
                                redirect: '/open/bigData/userDataApi/list'
                            }
                        ]
                    },
                    {
                        path: '/open/bigData/customMethod',
                        text: '自定义统计方法',
                        navMenu:true,
                        menuId:12725,
                        routes: [
                            {
                                path: '/open/bigData/customMethod/list'
                            },
                            {
                                path: '/open/bigData/customMethod/add',
                                text: '新增统计方法',
                            },
                            {
                                path: '/open/bigData/customMethod/detail/:apiId',
                                text: '统计方法详情',
                            },
                            {
                                redirect: '/open/bigData/customMethod/list'
                            }
                        ]
                    },
                    {
                        path: '/open/bigData/dataSubscription',
                        text: '数据订阅',
                        navMenu:true,
                        menuId:12726,
                        routes: [
                            {
                                path: '/open/bigData/dataSubscription/list',
                                text: '订阅列表',
                            },
                            {
                                path: '/open/bigData/dataSubscription/add',
                                text: '新增订阅',
                            },
                            {
                                path: '/open/bigData/dataSubscription/detail/:apiId',
                                text: '详情',
                            },
                            {
                                redirect: '/open/bigData/dataSubscription/list'
                            }
                        ]
                    },
                    {
                        path: '/open/bigData/OTA',
                        text: 'OTA升级',
                        menuId:126123116,
                        navMenu:true,
                        // routes: [
                        //     {
                        //         path: '/open/developCenter/monitor/list'
                        //     },
                        //     {
                        //         path: '/open/developCenter/monitor/ruledetail/:id'
                        //     },
                        //     {
                        //         redirect: '/open/developCenter/monitor/list'
                        //     }
                        // ]
                    },
                    {
                        redirect: '/open/bigData/deviceDataApi'
                    }
                ]
            },
            {
                path: '/open/developCenter',
                text: '*开发中心',
                navMenu:true,
                menuIcon:'cluster',
                menuId:126123112,
                routes: [
                    {
                        path: '/open/developCenter/projectManage',
                        text: '项目管理',
                        menuId:126123111,
                        navMenu:true,
                        routes: [
                            {
                                path: '/open/developCenter/projectManage/list'
                            },
                            {
                                path: '/open/developCenter/projectManage/detail/:projectId'
                            },
                            {
                                redirect: '/open/developCenter/projectManage/list'
                            }
                        ]
                    },
                    {
                        path: '/open/developCenter/serveDevelop',
                        text: '服务开发',
                        menuId:12612311,
                        navMenu:true,
                        routes: [
                            {
                                path: '/open/developCenter/serveDevelop/list'
                            },
                            {
                                redirect: '/open/developCenter/serveDevelop/list'
                            }
                        ]
                    },
                    {
                        path: '/open/developCenter/dataFlow',
                        text: '数据流转',
                        menuId:126123114,
                        navMenu:true,
                        routes: [
                            {
                                path: '/open/developCenter/dataFlow/list'
                            },
                            {
                                path: '/open/developCenter/dataFlow/ruledetail/:id'
                            },
                            {
                                redirect: '/open/developCenter/dataFlow/list'
                            }
                        ]
                    },
                    {
                        path: '/open/developCenter/deviceMonitor',
                        text: '设备监控',
                        menuId:126123115,
                        navMenu:true,
                        // routes: [
                        //     {
                        //         path: '/open/developCenter/monitor/list'
                        //     },
                        //     {
                        //         path: '/open/developCenter/monitor/ruledetail/:id'
                        //     },
                        //     {
                        //         redirect: '/open/developCenter/monitor/list'
                        //     }
                        // ]
                    },
                    
                ]
            },
            {
                redirect: '/open/base'
            }
        ]
    },
    {
        path: '/account',
        component: Account
    },
	{
        path: '/logicDevelop/:projectId/:serviceId',
        component: LogicDevelop
    },
    {
        path: '/userCenter',
        component:UserCenter,
        routes:[
            {
                path: '/userCenter/info',
                text: '基本资料',
                routes:[
                    {
                        path: '/userCenter/info/base',
                    },
                    {
                        path: '/userCenter/info/resetPassword',
                        text: '重置密码'
                    },
                    {
                        path: '/userCenter/info/subResetPassword',
                        text: '重置登录密码'
                    },
                    {
                        path: '/userCenter/info/updateEmail',
                        text: '修改邮箱'
                    },
                    {
                        path: '/userCenter/info/closeAccount',
                        text: '注销账号'
                    }
                ]
            },
            {
                path: '/userCenter/visit',
                text: '*访问用户'
            },
            {
                path: '/userCenter/role',
                text: '*用户角色'
            },
            {
                path: '/userCenter/log',
                text: '*操作日志'
            },
        ]
    },
    {
        path: '/messageCenter',
        component: MessageCenter
    },
    {
        path: '/dataAnalysis/:projectId/:serviceId',
        component: DataAnalysis
    },
    {
        redirect: '/account'
    }
];


export function PrivateRoute({ component: Component, redirect, path, isOk = false , ...rest }) {

    return (
        <Route
            path={path}
            render={props =>{
                return isOk ? (
                    <Component {...props} {...rest}/>
                    ) :
                    <Redirect to={redirect}></Redirect>
                }
            }
        />
    )
}

export function RouteWithSubRoutes(route) {
    let { path, component: Component, redirect, ...rest } = route;

    if (Component) {
        return (
            <Route
                path={path}
                render={props => (
                    <Component {...props} {...rest} />
                )}
            />
        );
    }

    return <Redirect to={redirect}></Redirect>
}
