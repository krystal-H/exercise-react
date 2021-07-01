import React from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';

import FlowList from './list'
import RuleDetails from './RuleDetails'

export default function ProjectManage({match}) {
    let {path} = match;

    return (
        <Switch>
            <Route path={`${path}/list`} render={(props) => <FlowList {...props}></FlowList>}></Route>
            <Route path={`${path}/ruledetail/:id`} render={(props) => <RuleDetails {...props}></RuleDetails>}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}
