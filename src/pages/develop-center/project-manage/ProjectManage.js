import React from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';

import ProjectList from './ProjectList'
import ProjectDetail from './ProjectDetail'

import './ProjectManage.scss'

export default function ProjectManage({match}) {
    let {path} = match;

    return (
        <Switch>
            <Route path={`${path}/list`} render={(props) => <ProjectList {...props}></ProjectList>}></Route>
            <Route path={`${path}/detail/:id`} render={(props) => <ProjectDetail {...props}></ProjectDetail>}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}
