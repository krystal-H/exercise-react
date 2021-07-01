import * as actionTypes from './actionTypes';

const defaultState = {
    productList: [],
    versionList:{
        list:[],
        pager:{}
    },
    extVerisonLi:[],
    deviceGorupLi:[],
    firmwareDetails:{}
};
const {
    GETPROLIST,
    GETVERLI,
    EXTVERLI,
    DEVGROUPLIST,
    FIRMWAREDETAIL
} = actionTypes


export default (state = defaultState, {
    type,
    productList,
    versionList,
    extVerisonLi,
    deviceGorupLi,
    firmwareDetails,
}) => {
    switch (type) {
        case GETPROLIST:
            return {...state,productList}
        case GETVERLI:
            return {...state,versionList}
        case EXTVERLI:
            return {...state,extVerisonLi}
        case DEVGROUPLIST:
            return {...state,deviceGorupLi}
        case FIRMWAREDETAIL:
            return {...state,firmwareDetails}
        default:
            return state;
    }
}
