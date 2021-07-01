/* eslint-disable array-callback-return */
// 基础产品-------


import React from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';
import loadable from '@loadable/component';

const Product = loadable(() => import('./product/Product')); // ------产品
const Device = loadable(() => import('./device/Device'));
const Application = loadable(() => import('./application/Application'));
// 基础产品菜单路由跳转-------产品、设备、应用
export default function BaseProduct({match,muenList}) {
    let {path} = match;
    return (
        <Switch>
            {
                muenList.map((item,index) => {
                    if(item.menuname==='产品'){
                        return <Route key='产品' path={`${path}/product`} component={Product}></Route>
                    }else if(item.menuname==='设备'){
                        return <Route key='设备' path={`${path}/device`} component={Device}></Route>
                    }else if(item.menuname==='应用'){
                        return <Route key='应用' path={`${path}/application`} component={Application}></Route>
                    }
                })
            }
            <Redirect to={`${path}/${muenList[0].url}`} />
        </Switch>
    )
}
