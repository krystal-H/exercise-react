/**
 * 产品页面容器(列表、新建、编辑、详情)
 */

import React from 'react';
import { Switch,Route,Redirect } from 'react-router-dom';
import loadable from '@loadable/component';


import ProductList from './product-list/List'; // ------产品列表
import {ProductInformation} from './add/ProductInformation'; // ------新建产品
// import ProductDetails from './product-details/ProductDetails';
const ProductEdit = loadable( () => import('./product-edit/ProductEdit')); // ------开发中状态——编辑  
const ProductDetails = loadable(() => import("./product-details/ProductDetails"))

// 编辑下边有基础信息、功能定义、硬件开发、服务配置、商业发布几项


const DeviceDebugging = loadable( () => import('./deviceDebugging/deviceDebuggerTest/StartTest'));

export default function Product({ match }) {
    let {path} = match;

    return (
        <Switch>
            {/* 列表 */}
            <Route path={`${path}/list`} component={ProductList}></Route>
            {/* 新建产品 */}
            <Route path={`${path}/add`} component={ProductInformation}></Route>
            {/* 编辑 */}
            <Route path={`${path}/edit/:id`} component={ProductEdit}></Route>
            <Route path={`${path}/details/:id`} component={ProductDetails}></Route>
            <Route path={`${path}/deviceDebugging`} component={DeviceDebugging}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}
