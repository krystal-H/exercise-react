import React from 'react';
import { Switch,Route,Redirect } from 'react-router-dom';

import DeviceDataApiList from './list';

function DeviceDataApi({ match }) {
    let { path } = match;

    return (
        <Switch>
            <Route path={`${path}/list`} component={DeviceDataApiList}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}

export default  DeviceDataApi;
