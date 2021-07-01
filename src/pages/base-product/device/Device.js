import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';
import DeviceList from './online-device/device-list/List';
const DeviceDetails = loadable(() => import('./online-device/device-details/DeviceDetails'));
const deviceSecret = loadable(() => import('./device-secret'));
import DeviceGroup from './device-group/deviceGroup';
import GroupDetails from './device-group/groupDetails';
const DeviceWarning = loadable(() => import('./device-warning'));
const WarningConfig = loadable(() => import('./device-warning/add'));

import './device.scss';
export default function Device({ match }) {
    let { path } = match;
    return (
        <Switch>
            <Route path={`${path}/onlineDevice/list`} component={DeviceList} />
            <Route path={`${path}/onlineDevice/details/:deviceid`} component={DeviceDetails} />
            <Route path={`${path}/deviceSecret`} component={deviceSecret} />

            <Route path={`${path}/groups`} component={DeviceGroup} />
            <Route path={`${path}/groupDetails/:groupid/:groupidid`} component={GroupDetails} />

            <Route path={`${path}/deviceWarning`} component={DeviceWarning} />
            <Route path={`${path}/addWarningConfig`} component={WarningConfig} />
            <Route path={`${path}/warningConfig/:id`} component={WarningConfig} />


            <Redirect to={`${path}/onlineDevice/list`} />
        </Switch>
    )
}
