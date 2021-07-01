import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import FirmwareManagement from './FirmwareManagement';
import FirmwareDetails from './FirmwareDetails';
import BatchDetail from './BatchDetail';

function DataSubscription({ match }) {
    let { path } = match;
    // console.log("DataSubscription -> path", path)
    return (
        <Switch>
            <Route path={`${path}/firmwareList`} component={FirmwareManagement} />
            <Route path={`${path}/firmwareDetails/:id`} component={FirmwareDetails} />
            <Route path={`${path}/firmwareBatch/:verid/:id`} component={BatchDetail} />
            <Redirect to={`${path}/firmwareList`} />
        </Switch>
    )
}

export default  DataSubscription;
