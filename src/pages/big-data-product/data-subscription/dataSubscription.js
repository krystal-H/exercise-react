import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import DataSubscriptionList from './list';
import DataSubscriptionAdd from './add';
import DataSubscriptionDetail from './detail';

function DataSubscription({ match }) {
    let { path } = match;
    console.log("DataSubscription -> path", path)
    return (
        <Switch>
            <Route path={`${path}/list`} component={DataSubscriptionList} />
            <Route path={`${path}/add`} component={DataSubscriptionAdd} />
            <Route path={`${path}/edit/:urlConfId`} component={DataSubscriptionAdd} />
            <Route path={`${path}/detail/:urlConfId`} component={DataSubscriptionDetail} />
            <Redirect to={`${path}/list`} />
        </Switch>
    )
}

export default  DataSubscription;
