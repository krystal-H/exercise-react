import React from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';
import ProjectManage from './project-manage/ProjectManage'
import ServeDevelop from './serve-develop/ServeDevelop'
import ServeDetail from './serve-develop/ServeDetail'
import DataFlow from './data-flow/DataFlow'
import Monitor from './device-monitor'

export default function DevelopCenter({match}) {
    let {path} = match;
    return (
        <Switch>
            <Route path={`${path}/projectManage`} component={ProjectManage}></Route>
            <Route path={`${path}/serveDevelop`} component={ServeDevelop}></Route>
            <Route path={`${path}/serveDetail/:id`} component={ServeDetail}></Route>
            <Route path={`${path}/dataFlow`} component={DataFlow}></Route>
            <Route path={`${path}/deviceMonitor`} component={Monitor}></Route>
            <Redirect to={`${path}/projectManage`}></Redirect>
        </Switch>
    )
}
