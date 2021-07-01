import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import ApplicationList from './application-list/index';
import ApplicationAdd from './application-add/index';
import ApplicationDetails from './application-details/index';

export default function Application({ match }) {
    let { path } = match;

    return (
        <Switch>
            <Route path={`${path}/list`} component={ApplicationList} />
            <Route path={`${path}/add`} component={ApplicationAdd} />
            <Route path={`${path}/details/:appId`} component={ApplicationDetails} />
            <Redirect to={`${path}/list`} />
        </Switch>
    )
}
