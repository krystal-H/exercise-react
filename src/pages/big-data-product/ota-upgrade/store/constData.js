export const VERTYPE = [
    {id:1,nam:'模组固件'},
    {id:2,nam:'MCU固件'},
    {id:4,nam:'系统固件'},
]
export const STATUSTAG = [//0：待验证 1：验证中 2：已发布,3 验证完成
    { nam:'待验证', color:'blue'},
    { nam:'验证中', color:'gold'},
    { nam:'已发布', color:'green'},
    { nam:'验证完成', color:'lime'},
]

export const UPDATESTATUS = [
    { nam:'待升级', color:'blue'},
    { nam:'升级中', color:'gold'},
    { nam:'升级成功', color:'green'},
    { nam:'升级失败', color:'magenta'},
    { nam:'取消', color:'geekblue'},
    { nam:'下载结束', color:'geekblue'},
    { nam:'重置升级', color:'geekblue'},
    
]

export const VERFIRMTYPE = [
    {
        value:1,
        label:'模组固件',
        children:[
            {
                value:1,
                label:'bootLoader'
            },
            {
                value:2,
                label:'servicePack'
            },
            {
                value:3,
                label:'hetProtocol'
            },
        ]
    },
    {
        value:2,
        label:'MCU固件',
        children:[
            {
                value:1,
                label:'controlboard'
            },
            {
                value:2,
                label:'displayboard'
            },
            {
                value:3,
                label:'driveboard'
            },
        ]
    },
    {
        value:4,
        label:'系统固件',
        children:[
            {
                value:1,
                label:'Android系统'
            },
            {
                value:2,
                label:'Linux系统'
            }
        ]
    },
]

export const formrules = {
    strextVer:/^[a-zA-Z0-9_\-\.]{1,30}$/,
    verNam:/^[a-zA-Z0-9\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]{0,39}$/,
    mainVer:/^[0-9]*$/,
    url:/https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/,
}
export const UPDATETYPE = [
    {id:1,nam:'普通升级',desc:'用户可感知，升级触发时用户可以在app上查看到升级提醒，确认后才能升级'},
    {id:2,nam:'强制升级',desc:'用户可感知，在app上查看到升级提示，无需确认自动开始升级'},
    {id:3,nam:'静默升级',desc:'用户无感知，无需确认，设备主动请求升级'},
    {id:4,nam:'推送升级',desc:'用户无感知，无需确认，平台主动推送下发升级到设备（需配置升级策略）'},
]

export const UPRANGE = [
    {id:0,nam:'全部设备'},
    {id:1,nam:'设备分组'},
    {id:2,nam:'指定设备'},
]
export const RERTYTIME = [
    {id:0,nam:'不重试'},
    {id:1,nam:'30分钟后'},
    {id:2,nam:'1小时后'},
]
export const RERTYCOUNT = [
    {id:1,nam:'1 次'},
    {id:2,nam:'2 次'},
    {id:3,nam:'3 次'},
]
export const TRIGGERTIME =['触发升级','定时升级']
export const PACKAGETYPE =['整包','差分包']
export const UPGRADESTATUS = ['升级中','已完成']
