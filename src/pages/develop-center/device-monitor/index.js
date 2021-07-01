import React from 'react'
import {Switch,Route,Redirect} from 'react-router-dom';

import List from './List'
import RuleDetails from './detail'

export default function ProjectManage({match}) {
    let {path} = match;

    return (
        <Switch>
            <Route path={`${path}/list`} render={(props) => <List {...props}></List>}></Route>
            <Route path={`${path}/edit/:id`} render={(props) => <RuleDetails {...props}></RuleDetails>}></Route>
            <Route path={`${path}/add`} render={(props) => <RuleDetails {...props}></RuleDetails>}></Route>
            <Redirect to={`${path}/list`}></Redirect>
        </Switch>
    )
}
