export const urlPrefix = '/v5/web/open';//是正式接口
// const urlPrefix = '/v1/web/open';//本地调试

let fileTourl = "/v4/web/tencentcloud/upload";
if(window.location.hostname == "open.clife.cn" || window.location.hostname == "cms.clife.cn"){
    fileTourl = "https://cms.clife.cn/v4/web/tencentcloud/upload"
}

let version = '?version=1.1';

const NOT_NEED_PREFIX = ['upFileUrl']

let Paths = {
    /* 上传文件*/
    upFileUrl:fileTourl,

    /* 用户中心*/
    loginCheck: '/common/admin/loginCheck',
    logout: '/common/admin/logout',
    verifyCodeUrl : '/common/admin/getImgVeriCode',
    register:'/public/account/register',
    registerConfirm : '/public/account/registerConfirm',
    resendRegisterEmail : '/public/account/resendRegisterEmail',
    resetPassword:'/public/account/resetPassword',
    subResetPassword:'/reset/sub/resetPwd',
    forgetPasswordAuth : '/reset/forget/auth',
    resendForgetPasswordEmail : '/reset/forget/resendEmail',
    resetAuth: '/reset/auth',
    authConfirm : '/reset/authConfirm',
    resetEmail : '/reset/resetEmail',
    resetEmailConfirm : '/reset/emailConfirm',
    setPassword : '/reset/setPassword',
    getDeveloperInfo : '/developer/getDeveloperInfo',
    upDeveloperInfo : '/developer/updateInfo',
    getRightsOneself : '/rights/getRightsOneself',
    cancelAccount : '/developer/cancelAccount',
    withdraw : '/developer/withdraw',

    /* 产品信息 */
    getProductList: '/product/listAllProductAndAccreditInfo',
    copyProduct: '/product/copy',
    delectProduct: '/product/deleteProduct',
    getProductBaseInfo: '/product/getProduct',
    updateProductBaseInfo: '/product/update',

    /* 协议 */
    getProtocolTemplates: '/protoManage/getProtocolTemplatesByProductId',
    addProtocolTemplates: '/protoManage/saveProtocolTemplates',
    getProtocolList: '/productProtocol/getProtocolListByProductId',
    saveProtocol: '/productProtocol/saveProtocol',
    delProtocol: '/protoManage/delProtocol',
    exportProtocol: '//protoManage/exportProtocolToJson',
    getProtocolDictionaryCommonList: '/protoManage/getProtocolDictionaryCommonList',
    searchProtocolDictionary: '/protoManage/searchProtocolDictionary',
    getSubjectMenu: '/protoManage/getSubjectMenu',
    getSubjectExtendMenu: '/protoManage/getSubjectExtendMenu',
    getFunctionMenu: '/protoManage/getFunctionMenu',
    getFunctionExtendMenu: '/protoManage/getFunctionExtendMenu',
    getTsl:'/tsl/getTSL',
    exportTsl:'/tsl/export',
    saveNoProductId:'/thing/label/saveNoProductId',
    
    /* 页面配置步骤信息*/
    getConfigSteps: '/product/getConfigSteps',
    saveConfigSteps: '/product/saveConfigSteps',

    /* App服务控制 */
    getH5Pages: '/projectManage/getProjectPage',
    getTemplateMarket: '/h5/template/getTemplateMarket',
    getTemplateBaseInfo: '/h5/template/getTemplateBaseInfo',
    getTemplateAnalysis: '/h5/template/getAnalysis',
    useAppPanelTemplate: '/projectManage/useAppPanelTemplate',
    saveProject: '/projectManage/saveProject',
    delProject: '/projectManage/delProject',
    copyProject: '/projectManage/copyProject',
    getAppsByProductId: '/projectManage/getAppsByProductId',
    getFormalPubHistory: '/projectManage/getFormalPubHistory',
    getGreyPubHistory:'/projectManage/getGreyPubHistory',
    garyUpdate: '/projectManage/garyUpdate',
    formalUpdate: '/projectManage/formalUpdate',
    offlineUiDesign: '/projectManage/offlineUiDesign',
    cancelGrayUpdate: '/projectManage/cancelGrayUpdate',

    netWorkDelete: '/device/netWorkLogo/delete',
    netWorkAddAndUpdate: '/device/netWorkLogo/addAndUpdate',
    getLinkConfiguration: '/device/netWorkLogo/getDetail',
    getLinkHelpImg: '/product/help/get',
    saveLinkHelpImg: '/product/help/save',

    /* 云端定时功能 */
    getTimeServiceList: '/timerService/getList',
    updateTimeService: '/timerService/update',
    getTimeService: '/timerService/get',
    saveTimeService: '/timerService/save',

    /* 场景配置服务 */
    getSceneFunctionList: '/scene/getSceneFunctionList',
    addBatchSceneFunction: '/scene/addBatchSceneFunction',
    addOrUpdateSingleCondition: '/scene/addOrUpdateSingleCondition',
    addCustomAction: '/scene/addCustomAction',
    updateSceneFunction: '/scene/updateSceneFunction',
    deleteSceneFunctionById: '/scene/deleteSceneFunctionById',
    auditBatchSceneFunction: '/scene/auditBatchSceneFunction',
    getAuditRecord: '/scene/getAuditRecord',

    /**************************/
    queryServerConfig: '/device/debug/queryServerConfig',//设备调试-获取websocket服务器的IP和端口
    productIdentifier: '/product/getProductIdentifier',//设备调试-根据产品ID获取产品信息
    accessToken: '/device/debug/getAccessToken',//设备调试-获取登录凭证
    dataTypeList: '/device/debug/getDataTypeList', //获取数据类型
    propertyConfig: '/device/debug/getPropertyConfig_v1.1',//根据产品ID获取协议信息
    deviceDebugAccountGetList: "/device/debug/account/getList",//调试账号列表
    deviceDebugAccountInsert: "/device/debug/account/insert",//调试账号添加
    deviceDebugAccountDelete: "/device/debug/account/delete",//调试账号删除
    deviceDebugMacGetList: "/device/debug/mac/getList",//调试MAC列表
    deviceDebugMacInsert: "/device/debug/mac/insert",//调试MAC添加
    deviceDebugMacDelete: "/device/debug/mac/delete",//调试MAC删除
    upgradeDebug: "/device/debug/upgradeDebug",//固件升级调试

    debugSecretList:'/device/debug/mac/debugSecretList',//调试密钥列表
    addDebugMac:'/device/debug/mac/addDebugMac',//调试密钥列表
    delDebugMac:'/device/debug/mac/delDebugMac',//调试密钥列表


    /* 设备数据api start */
    getApiList: '/apiInfo/getOpenApiList',
    getDimensionList: '/dimension/getDimensionList',
    /* 设备数据api end */

    /* 自定义统计方法 start */
    getMethodList: '/stats/customApi/getMethodList',
    getMethodLimit: '/stats/customApi/getMethodLimit',
    getMethodProductList: '/stats/singleMonitor/behavior/getProductList',
    getProtocolListByProductId: '/protoManage/getProtocolListByProductId',
    addMethod: '/stats/customApi/addMethod',
    getMethodDetail: '/stats/customApi/getMethodDeail',
    delMethod: '/stats/customApi/delMethod',
    /* 自定义统计方法 end */

    /**
     * 新建产品 start
     * aize-2019-09-10
     */
    getCatalogList: '/product/getCatalogList',//产品三级类目list
    productBaseTypeList: '/product/baseType/list',//获取产品基本数据类型列表 productBaseTypeList
    addProduct: '/product/addProduct',//新建产品
    /* 新建产品 end */

     /**
     * 硬件开发 start
     * aize-2019-09-11
     */
    moduleBrandList: '/product/moduleBrand/list',//获取模组厂家列表
    getModuleList: '/product/getModuleList',//获取模组列表
    mcuCodeCheck: '/protoManage/mcuCodeCheck',//生成并下载MCU SDK --- 检测与协议得关系
    mcuCodeExport: '/protoManage/mcuCodeExport',//生成并下载MCU SDK
    saveModule: '/product/saveModule',//保存产品所选模组信息
    getModuleInfo:'/product/getModuleInfo',

    /**
     * 固件管理 start
     * aize-2019-09-12
     */
    versionList: '/device/version/list', //固件列表
    getAllDeviceVersionType: '/device/version/getAllDeviceVersionType',//固件类型
    getAllFirmwareVersionType: '/device/version/getAllFirmwareVersionType',//固件模块
    versionAdd: '/device/version/add',//固件添加
    versionDelete: '/device/version/delete',//固件删除
    versionCheckMac: '/device/version/checkMac',//批量导入mac
    versionValidate: '/device/version/validate',//发起验证
    versionPublish: '/device/version/publish',//发布
    /* 固件管理 end */

    /**
     * 商业发布 start
     * aize-2019-09-17
     */
    saveCommerceInfo: '/product/saveCommerceInfo',//保存产品商业化信息
    productPublishAdd: '/productPublish/add',//产品发布
    getCommerceInfo: '/product/getCommerceInfo',//获取商业化信息
    /* 商业发布 end */

    /**
     * 产品-基本信息 start
     * aize-2019-09-18
     */
    getPublishProductInfo: '/product/getPublishProductInfo',///product/getPublishProductInfo

    /*产品-标签*/
    getProductLabelList:'/label/getList',
    getProductLabelBaseList:'/label/getDownList',
    addProductLabel:'/label/add',
    updateProductLabel:'/label/update',
    delProductLabel:'/label/delete',

     /*产品-物标签*/
     getThingLabelList:'/thing/label/getList',

    /*设备管理*/
    
    getUserProduct:'/deviceInfo/getProduct',//获取账号下的产品
    getDeviceStat:'/deviceInfo/deviceStat',//获取设备入网统计
    getDeviceList:'/deviceInfo/getDeviveList',//获取联网设备列表
    getDeviceInfo:'/deviceInfo/get',//获取设备详情
    getDeviceLabelList:'/deviceLabel/getList',//获取设备标签列表
    getLabelBaseList:'/deviceLabel/getDownList',//获取标签库列表
    addDeviceLabel:'/deviceLabel/add',//新增设备标签
    updateDeviceLabel:'/deviceLabel/update',//修改设备标签
    deleteDeviceLabel:'/deviceLabel/delete',//删除设备标签
    exportDeviceList:'/deviceV5/export',//导出数据
    


    /**
     * 账户-访问用户 start
     * aize-2019-10-30
     */
    getChildlist: '/public/account/getChildlist',//获得子账户分页列表
    freezeChild: '/public/account/freezeChild',//停用子账户
    unfreezeChild: '/public/account/unfreezeChild',//启动子账户
    deleteChild: '/public/account/deleteChild',//删除子账户
    getRoleList: '/role/getRoleList',//角色下拉框
    addMultiChild: '/public/account/addMultiChild',//添加用户
    updateChild: '/public/account/updateChild',//添加用户
    getChildWithSecret: '/public/account/getChildWithSecret',//获得单个子账号+secret数据
    getRights: '/rights/getRights',//获得角色/子账户正在使用的角色的权限数据及相关列表
    /* 账户-访问用户 end */

    /**
     * 账户-用户角色 start
     * aize-2019-11-06
     */
    getRolePage: '/role/getRolePage',//获取角色分页列表
    deleteRole: '/role/deleteRole',//获取角色分页列表
    getGroupMenuList: '/rolePlus/getGroupMenuList',//获取账号权限列表
    saveRole: '/rolePlus/saveRole',//获取账号权限列表


    /* 省市联动数据 */
    getProvince: '/stats/analysis/getProvince',
    getCityByProvinceId: '/stats/analysis/getCityByProvinceId',
    /**
     * 数据订阅 start
     * xiao-2019-10-16
     */
    getDataSubscriptionList: '/data/push/config/getList',
    getCurSubscription: '/data/push/config/getByUrlConfId',
    stopCurSubscription: '/data/push/config/stop'+version,
    enabledCurSubscription: '/data/push/config/enabled'+version,
    getProductByDeveloperId: '/data/push/config/getProductByDeveloperId',
    getLabelByProductId: '/data/push/config/getLabelByProductId',
    createSubscription: '/data/push/config/create'+version,
    saveSubscription: '/data/push/config/save'+version,

    /**
     * 基础产品--应用 start
     * xiao-2019-10-17
     */
    getApplicationList: '/devapp/getAppList',
    saveAppBaseInfo: '/devapp/saveAppBaseInfo'+version,
    saveMiniProgramsInfo: '/devapp/saveMiniProgramsInfo'+version,
    deleteRelationProduct: '/devapp/deleteRelaProduct'+version,
    deleteAppVersion: '/devapp/version/delete'+version,
    getAppInfo: '/devapp/getAppInfo',
    updateRelaProduct: '/devapp/updateRelaProduct'+version,
    deleteApp: '/devapp/delete'+version,
    createAppVersion: '/devapp/version/add'+version,
    getAppVersionDetail: '/devapp/version/get',
    getRelaProducts: '/devapp/getRelaProducts',
    getVersionList: '/devapp/getList',
    getDevProductList: '/devapp/getDevProductList',

    /**
     * 控制日志
     */
    getOperateLogList: '/operate/log/getList',

    /**
     * 消息中心
     */

    getNoticeList: '/systemNotice/getNoticeList',
    getNoticeDetail: '/systemNotice/getNoticeDetail',
    setRead: '/systemNotice/setRead',
    getUnreadQuantity: '/systemNotice/getUnreadQuantity',

    /**
     * 产品协议脚本 start
     * zheng-2019-11-28
     */
    getJsContent: '/protoManage/getJsProtoScript',
    sumbitJsContent: '/protoManage/saveJsProtoScript',
    /* 产品协议脚本 end */

    /**
     * 基础产品--产品--设备注册 start
     * xiao-2019-12-02
     */
    getStatisticsData: '/device/register/statistics',
    getDeviceRegisterList: '/device/register/list',
    registerImport: '/device/register/import',
    /**
     * 设备--设备秘钥管理 start
     * xiao-2020-01-06
     */
    getStatistics: '/device/register/senior/statistics',
    getSeniorDeviceList: '/device/register/senior/list',

    //设备告警
    getDeviceWarningTotal: '/warning/info/total',
    getWarningList: '/warning/info/getList',
    saveWarningConfig: '/warning/rule/add',
    getWarningConfigLi: '/warning/rule/getList',
    delWarningConfig: '/warning/rule/delete',
    startWarningConfigLi: '/warning/rule/startRule',
    stopWarningConfig: '/warning/rule/stopRule',
    getWarningConfigDetail: '/warning/rule/get',
    getWarningInfo: '/warning/info/get',
    dealWithWarning: '/warning/info/deal',
    reflushWarningDeviceIds: '/warning/info/flush',

    

    // 远程配置
    getRomoteConfigListByProduct:'/remote/config/product/task/getPage',
    saveRomoteConfig:'/remote/config/product/task/save',
    submitRomoteConfig:'/remote/config/product/task/submit',
    deleteRomoteConfig:'/remote/config/product/task/delete',
    getAllDeviceInfo:'/remote/config/product/device/getAllDeviceInfoPage',
    getDeviceInfoByIdOrMacAddress:'/remote/config/product/device/getDeviceInfoByIdOrMacAddress',
    downloadRemoteDeviceTemplateExcel:'/remote/config/product/device/downloadExcel',
    importRemoteDeviceExcel:'/remote/config/product/device/importExcel',
    getRemoteDetail:'/remote/config/product/task/get',
    getResultTotal:'/remote/config/product/task/getResultTotal',
    getDeviceResultList:'/remote/config/product/task/getResultPager',
    retryByTaskId:'/remote/config/product/task/retry',
    batchRetry:'/remote/config/product/task/batchRetry',
    exportTaskResult:'/remote/config/product/task/exportResult',
    getReceiveMsg:'/remote/config/product/task/getReceiveMsg',
    getRomoteConfigListForDevice:'/remote/config/device/task/getPage',
    getRemoteDetailForDevice:'/remote/config/device/task/get',
    saveRomoteConfigForDevice:'/remote/config/device/task/saveAndSubmit',
    retryByTaskIdForDevice:'/remote/config/device/task/retry',
    getReceiveMsgForDevice:'/remote/config/device/task/getReceiveMsg',

    //实例、授权、数据资产
    getCaseList:'/instance/getList',//登录时获取实例
    getCasePageList:'/instance/getPage',//实例管理实例列表
    updateCaseStatus:'/instance/updateStatus',
    addCase:'/instance/add',
    applySource:'/instance/update',

    getAuthorizeList:'/auth/getList',
    deleAuthorize:'/auth/deleteAuth',
    getAuthList:'/auth/authList',
    addAuthorize:'/auth/add',
    getDownProduct:'/project/device/getDownProduct',//获取下拉框产品列表 多处用到
    getAuthorServeList:'/serve/getServerList',

    getDataAssetsList:'/data/assets/getList',
    getDataAssetsListAuth:'/data/assets/getAssetsList',
    addDataAssets:'/data/assets/add',
    delDataAssets:'/data/assets/delete',
    updateDataAssets:'/data/assets/update',
    getInfoDataAssets:'/data/assets/get',
    testDataAssets:'/data/assets/test',

    //设备分组
    getGroupList:'/group/getList',
    getGroupListAuth:'/group/getGroupList',
    updateGroup:'/group/addOrUpdate',
    deleteGroup:'/group/delete',
    getGroupDetail:'/group/get',
    getGroupDeviceList:'/group/getDeviceList',
    addGroupDevice:'/group/relaDevice',
    getGroupSlctDev:'/group/getRelaList',
    delGroupDevice:'/group/deleteRela',
    getCreateProduct:'/prod/getCreateProduct',
    
    // 项目管理
    getProjectList:'/project/getList',    
    addProject:'/project/add',
    updateProject:'/project/update',
    deleteProject:'/project/delete',
    getProductInProject:'/prod/getProduct',
    getRelaProduct:'/prod/getRelaProduct',
    getRelaDevice:'/project/device/getRelaDevice',
    getDeviceInProject:'/project/device/getDevice',
    getServeList:'/serve/getList',
    serveAdd:'/serve/add',
    serveCopy:'/serveOpe/duplicate',
    serveDelete:'/serve/delete',
    servePublish:'/serveOpe/publish',
    serveInvoke:'/serveOpe/invoke',
    serveCallExplain:'/serveOpe/callExplain',
    getAllRelatedProduct:'/project/device/getDownProduct',
    getAllRelatedDevice:'/project/device/getRelatedDevice',
    unrelaProduct:'/prod/unrelaProduct',
    unrelaDevice:'/project/device/unrelaDevice', 
    relaProduct:'/prod/relaProduct', 
    relaDevice:'/project/device/relaDevice', 
    addDevice:'/project/device/addDevice',
    getServiceLog:'/serveOpe/getServiceLog',
    getFlowData:'/serveOpe/editFlow',
    saveFlowData:'/serveOpe/saveFlow',
    getDataAnlzType:'/serveOpe/getDataAnlzType',
    getInvokeUrl:'/serveOpe/getInvokeUrl',
    parserSql:'/dataAccess/parserSql',
    getServeStatu:'/serve/get',
    getDownTbTreeByDs:'/dataAccess/getDownTbTreeByDs',
    getPublishParam:'/serveOpe/getPublishParam',
    updateServe:'/serve/update',
    sqlTestTslData:'/dataoperate/search/tslData',
    getProLogicTreeData:'/dataoperate/search/struct/product',
    sqlTestProductData:'/dataoperate/search/data/product',
    downTslHistory:'/dataoperate/search/download/history',
    addTslHistory: '/dataoperate/search/dataDownload',
    


    // 数据管理
    getDownDevice:'/project/device/getDevice',
    getDownPropEvent:'/device5/getDownPropEvent',
    getDownDatasource:'/data/assets/getDownDatasource',
    getDownTableByDatasource:'/dataAccess/getDownTableByDatasource',
    getDownFieldsByDatasourceTable:'/dataAccess/getDownFieldsByDatasourceTable',
    getDownEventList:'/device5/getDownEventList',

    //数据流转
    getDataTransferList:'/transfer/getList',
    delOneTransfer:'/transfer/delete',
    saveTransfer:'/transfer/save',
    getDataTransfer:'/transfer/get',
    getTransferMenuList:'/transfer/getMenuList',
    getTransferDataTable:'/transfer/getTableInfo',
    checkSqlTransfer:'/transfer/checkSQL',
    getRocketMQTopicList:'/transfer/getRocketMQTopicList',

    //设备监控
    geMonitorList:'/monitor/list',
    startMonitor:'/monitor/start',
    stopMonitor:'/monitor/stop',
    deleteMonitor:'/monitor/delete',
    addMonitor:'/monitor/add',
    updateMonitor:'/monitor/update',
    getMonitor:'/monitor/get',
    getTransfer4Monitor:'/transfer/getTransferList4Monitor',

    //OTA升级
    otaDevVersionList:'/device/version/5/getList',
    otaGetExtVersion:'/device/version/5/getExtVersion',
    otaAddVersion:'/device/version/5/add',
    otaImportMac:'/device/version/5/importMac',
    otaValidate:'/device/version/5/validate',
    otaDeleteVer:'/device/version/5/delete',
    otaRelease:'/device/version/5/publish',
    otaGetBatch:'/device/version/5/publish/getBatch',
    otaGetVersionDetail:'/device/version/5/version/get',
    otaGetBatchDevice:'/device/version/5/publish/get',
    otaGetBatchInfo:'/device/version/5/publish/getBatchInfo',

    otaCancelDevicePub:'/device/version/5/publish/cancel',
    otaValiGetinfo:'/device/version/5/validate/getInfo',

    

    
    
    
    
};

// 拼接 /v1/web/open
Object.keys(Paths).forEach(key => {
    if(!NOT_NEED_PREFIX.includes(key)) {
        Paths[key] = urlPrefix + Paths[key]
    }
})

export default Paths;
