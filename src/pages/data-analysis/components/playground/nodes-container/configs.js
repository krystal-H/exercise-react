import inputImg from './imgs/input.jpg'
import filterImg from './imgs/filter.jpg'
import caclImg from './imgs/cacl.jpg'
import errorImg from './imgs/error.jpg'
import relateImg from './imgs/relate.jpg'
import outputImg from './imgs/output.jpg'

// 节点类型
export const NODE_TYPES = {
    'DATA_INPUT': 2101,
    'DATA_FILTER': 2201,
    'DATA_CACL': 2202,
    'ERROR_CHECK': 2301,
    'TABLE_RELATED':2302,
    'DATA_OUTPUT': 2401
}

// 节点名称
export const NODE_NAMES = {
    [NODE_TYPES.DATA_INPUT]: '输入',
    [NODE_TYPES.DATA_FILTER]: '数据过滤',
    [NODE_TYPES.DATA_CACL]: '聚合计算',
    [NODE_TYPES.ERROR_CHECK]: '异常检测',
    [NODE_TYPES.TABLE_RELATED]: '业务表关联',
    [NODE_TYPES.DATA_OUTPUT]: '输出'
}

// 节点图标
export const NODE_IMGS= {
    [NODE_TYPES.DATA_INPUT] : inputImg,
    [NODE_TYPES.DATA_FILTER]: filterImg,
    [NODE_TYPES.DATA_CACL]: caclImg,
    [NODE_TYPES.ERROR_CHECK]: errorImg,
    [NODE_TYPES.TABLE_RELATED]: relateImg,
    [NODE_TYPES.DATA_OUTPUT]: outputImg
}

// 不能被链接的节点：输入节点
export const NO_LINKED = [NODE_TYPES.DATA_INPUT]

// 不能发起链接的节点：输出节点
export const NO_LAUNCHLINK = [NODE_TYPES.DATA_OUTPUT]

// 工具栏中的节点列表
export const NODE_LISTS = [
    {
        title:'输入',
        nodelists:[{
            nodeType:NODE_TYPES.DATA_INPUT,
            nodeName:NODE_NAMES[NODE_TYPES.DATA_INPUT]
        }]
    },
    {
        title:'基础处理',
        nodelists:[
            {
                nodeType:NODE_TYPES.DATA_FILTER,
                nodeName:NODE_NAMES[NODE_TYPES.DATA_FILTER]
            },
            {
                nodeType:NODE_TYPES.DATA_CACL,
                nodeName:NODE_NAMES[NODE_TYPES.DATA_CACL]
            }
        ]
    },
    {
        title:'高级处理',
        nodelists:[
            // {
            //     nodeType:NODE_TYPES.ERROR_CHECK,
            //     nodeName:NODE_NAMES[NODE_TYPES.ERROR_CHECK]
            // },
            {
                nodeType:NODE_TYPES.TABLE_RELATED,
                nodeName:NODE_NAMES[NODE_TYPES.TABLE_RELATED]
            }
        ]
    },
    {
        title:'输出',
        nodelists:[
            {
                nodeType:NODE_TYPES.DATA_OUTPUT,
                nodeName:NODE_NAMES[NODE_TYPES.DATA_OUTPUT]
            }
        ]
    }
]

// 输入节点的默认输出配置
export const INPUT_DEFAULT_PROPS = [
    {
        srcName:'设备名称',
        srcCode:'deviceId',
        srcType:'varchar',
        srcTableCode :''
    },
    {
        srcName:'时间',
        srcCode:'eventTime',
        srcType:'timestamp',
        srcTableCode :''
    }
]

// 各个节点的默认参数
export const NODE_DEFAULT_INPUTS = {
    [NODE_TYPES.DATA_INPUT] : {
        nodeName:'输入',
        productId:'',
        deviceList:[],
        deviceIds:[],
        propsOrEventList:[],
        propEvent:'0',
        props:[...INPUT_DEFAULT_PROPS],
        eventTimeField:'eventTime',
        propsCodes:[],
        anyContent:"",
        eventList:[],
        eventIdentifier:''
    },
    [NODE_TYPES.DATA_FILTER]: {
        nodeName:'数据过滤',
        condition:'and',
        props:[],
        anyContent:""
    },
    [NODE_TYPES.DATA_CACL]: {
        nodeName:'聚合计算',
        props:[],
        granularity: 0,
        dims:[],
        dimsCode:[],
        measure:[],
        measureCode:[],
        funcs:[],
        windowType:0,
        windowDurings:{
            windowDuring:'',
            windowUnit:'s'
        },
        slideDurings:{
            slideDuring:'',
            slideUnit:'s'
        },
        anyContent:""
    },
    [NODE_TYPES.ERROR_CHECK]: {
        nodeName:'异常检测',
        checkProp:'',
        anyContent:""
    },
    [NODE_TYPES.TABLE_RELATED]: {
        nodeName:'业务表关联',
        datasourceId:'',
        tableCode:'',
        tableList:[],
        filedList:[],
        props:[],
        joinType:0,
        relate:{
            streamFieldCode:'',
            dimFieldCode:'',
        },
        streamTableCode:'',
        selectedRowKeys:[],
        anyContent:""
    },
    [NODE_TYPES.DATA_OUTPUT]: {
        nodeName:'输出',
        datasourceId:'',
        tableCode:'',
        tableList:[],
        props:[],
        filedList:[],
        selectedRowKeys:[],
        anyContent:"",
        dataSource:[]
    }
}