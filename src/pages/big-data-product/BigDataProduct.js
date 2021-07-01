import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom';

import DeviceDataApi from './device-data-api/deviceDataApi';
import CustomMethod from './custom-method/customMethod';
import DataSubscription from './data-subscription/dataSubscription';
import OtaUp from './ota-upgrade/OtaUpgrade';

export default function BigDataProduct({ match,muenList }) {
    let { path } = match;
    return (
        <Switch>
            {
                muenList.map((item,index)=>{
                    if(item.menuname=='设备数据API'){
                        return <Route key='设备数据API' path={`${path}/deviceDataApi`} component={DeviceDataApi}></Route>
                    }else if(item.menuname=='用户数据API'){
                        return <Route key='用户数据API' path={`${path}/userDataApi`} component={DeviceDataApi}></Route>
                    }else if(item.menuname=='自定义统计方法'){
                        return <Route key='自定义统计方法' path={`${path}/customMethod`} component={CustomMethod}></Route>
                    }else if(item.menuname=='数据订阅'){
                        return <Route key='数据订阅' path={`${path}/dataSubscription`} component={DataSubscription}></Route>
                    }
                })
            }
            <Route key='OTA' path={`${path}/OTA`} component={OtaUp}></Route>
            <Redirect to={`${path}/customMethod`} />
        </Switch>
    )
}
