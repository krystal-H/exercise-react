import * as ActionTypes from './ActionTypes';
import {get,Paths} from '../../../api';
import { fromJS } from 'immutable';


export const changeLoginModalStatu= (statu) => {
  return {
    type: ActionTypes.SHOW_LOGIN_MODAL,
    statu
  }
}

export const updateDeveloperInfo= (info) => {
  return {
    type: ActionTypes.UPDATE_DEVELOPER_INFO,
    info:fromJS(info)
  }
}

export const getDeveloperInfo= () => {
  return (dispatch,getState) => {
    get(Paths.getDeveloperInfo,{},{
      needVersion:1.1,
      loading: true
    }).then((res) => {
      let info = res.data,
          action = updateDeveloperInfo(info);
      dispatch(action);
    });
  }
}
//保存菜单
export const gatMuenList = () => {
  return (dispatch,getState) => {
    get(Paths.getGroupMenuList,{version:1.1}).then((res) => { //获取权限菜单
      if(res.code==0){
        localStorage.setItem('menuList', JSON.stringify(res.data));
        let  action = updateMuenList(res.data);
        dispatch(action);
      }else{
        localStorage.removeItem('menuList');
      }
    });
  }
}
export const updateMuenList= (data) => {
  return {
    type: ActionTypes.MUEN_LIST,
    data:fromJS(data)
  }
}

// 删除用户角色
export const deleteRole = (roleId) => {
  return (dispatch) => {
    return get(Paths.deleteRole,{roleId}, {loading: true}).then((res) => {
        if(res.code === 0){
            return Promise.resolve(1);   
        }
        return Promise.resolve(0);
    }).catch(err => Promise.resolve(0));
  }
}

// 实例列表
export const updateInstanceList= (data) => {
  return {
    type: ActionTypes.UPDATE_INSTANCELIST,
    data:fromJS(data)
  }
}

export const getInstanceList= (params ={}) => {
  return (dispatch,getState) => {
    get(Paths.getCaseList,params).then((res) => {
      let data = res.data,
          action = updateInstanceList(data);
      dispatch(action);
    });
  }
}