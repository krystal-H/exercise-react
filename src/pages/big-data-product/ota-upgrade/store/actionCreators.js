import { get, Paths } from '../../../../api';
import * as actionTypes from './actionTypes';

export const getProductList = param => {
    return (dispatch) => {
        get(Paths.getCreateProduct,param).then(res => {
            let li = res.data.list || [];
            dispatch({
                type: actionTypes.GETPROLIST,
                productList:li,
            });
        });
    }
}

export const getVersionList = (params={}) => {
    const defaultparams  = {pageIndex:1,pageRows:10}
    return (dispatch) => {
        get(Paths.otaDevVersionList,{...defaultparams,...params}).then(({data={}}) => {
            dispatch({
                type: actionTypes.GETVERLI,
                versionList:data,
            });
        }); 
    }
}

export const getExtVerLi = param => {
    return (dispatch) => {
        if(param){
            get(Paths.otaGetExtVersion,param).then(({data}) => {
                dispatch({
                    type: actionTypes.EXTVERLI,
                    extVerisonLi:data||[],
                });
            });
        }else{
            dispatch({
                type: actionTypes.EXTVERLI,
                extVerisonLi:[],
            });
        } 
    }
}

export const getDeviceGroupLi = () => {
    return (dispatch) => {
        get(Paths.getGroupList,{pageRows:9999}).then(({data={}}) => {
            dispatch({
                type: actionTypes.DEVGROUPLIST,
                deviceGorupLi:data.list||[],
            });
        }); 
    }
}

export const sendFirmwareDetails = detail => {
    console.log(999,detail)
    return (dispatch) => {
        dispatch({
            type: actionTypes.FIRMWAREDETAIL,
            firmwareDetails:detail,
        });
        
    }
}




    

