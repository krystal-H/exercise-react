import { post,get, Paths} from "../../../../api"

// 获取产品列表
export const getProductList = (params) => {
    return get(Paths.getAllRelatedProduct,{...params})
}

// 获取设备列表
export const getDeviceListByProductId = (params) => {
    return get(Paths.getDownDevice,{...params})
}

// 获取事件列表
export const getEventList = (params) => {
    return get(Paths.getDownEventList,{...params})
}

// 获取属性或者事件
export const getDownPropOrEventList = (params) => {
    return get(Paths.getDownPropEvent,{...params})
}

// 获取数据源
export const getDownDatasource = (params) => {
    return get(Paths.getDownDatasource,{...params})
}

// 获取表
export const getDownTableByDatasource = (params) => {
    return get(Paths.getDownTableByDatasource,{...params})
}

// 获取表字段
export const getDownFieldsByDatasourceTable = (params) => {
    return get(Paths.getDownFieldsByDatasourceTable,{...params})
}

// 获取流程数据
export const getFlowData = (params) => {
    return get(Paths.getFlowData,{...params},{noInstance:true})
}

// 保存流程数据
export const saveFlowData = (params) => {
    return post(Paths.saveFlowData,{...params},{needJson:true,noInstance:true})
}


