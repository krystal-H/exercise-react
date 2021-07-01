import React from 'react';
import { Switch,Route,Redirect } from 'react-router-dom';

import CustomMethodList from './list';
import CustomMethodAdd from './add';
import CustomMethodDetail from './detail';

function CustomMethod({ match }) {
    let {path} = match;
    return (
        <Switch>
            <Route path={`${path}/list`} component={CustomMethodList}></Route>
            <Route path={`${path}/add`} component={CustomMethodAdd}></Route>
            <Route path={`${path}/detail/:apiId`} component={CustomMethodDetail}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}

export default  CustomMethod;
