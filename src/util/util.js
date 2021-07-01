
import CryptoJS from 'crypto-js';
import moment from 'moment';
import {Paths} from '../api';
import {trim,cloneDeep} from 'lodash';
import {notification} from 'antd';

/**
 * 对密码进行加密
 * @param {string} value
 */
export function encryption(value) {
        // 加密
        let md5 = CryptoJS.MD5(value),
            utf8 = CryptoJS.enc.Utf8.parse(md5),
            base64 = CryptoJS.enc.Base64.stringify(utf8) || utf8.toString(CryptoJS.enc.Base64);

         return base64;
}
/**
 * 将对象转换为Formdata
 * @param {object} obj 待转换对象
 */
export function objToFormdata(obj = {}) {
    let keys = Object.keys(obj),
        temp = new FormData();

    keys.forEach(key => {
        temp.append(key,obj[key])
    })
    // for(var pair of temp.entries()) {//可打印FormData的值
    //     console.log(pair[0]+ ', '+ pair[1]); 
    //  }
    return temp;
}

/**
 * 为table控件的数据源加上key字段
 * @param {array} arr 待处理的数据数组
 */
export function addKeyToTableData(arr = []) {
    return arr.map((item,index) => {
        if (item.key === undefined) {
            item.key = index;
        }
        return item
    })
}

/**
 * 解析配置步骤的内容
 * @param {array} configs 配置数组
 * @param {number} type 所需要解析的类型
 */
export function parseConfigSteps (configs = [],type) {
    let _configs= configs.filter(item => item.type == type),
        temp = null;
    if (_configs.length > 0) {
        let {configInfo,stepId,type} = _configs[0]
        temp = {
            configInfo: JSON.parse(configInfo),
            stepId,
            type
        }
    }
    return temp;
}

/**
 * 返回updateflag的计算结果
 * @param {array} datalist 控制协议的list
 */
export function countUpdateflag (datalist) {
    // console.log("datalist------",datalist);
    //控制协议 字节长度和（其他字节和 + updateflag ）是16整数倍，updateFlag=（其他字段/8 向上取整）
    //validProtocolLength ： 控制协议 的 除了updateflag 的其他长度之和
    let validProtocolLength = 0;
    for (var i = 0; i < datalist.length - 1; i++) {
        validProtocolLength += +datalist[i].length;
    }

    //A: a+b = 16n (n= 1、2、3...)
    //B: 8b = a+k ( k=0 到7 )
    let addcount = // =16n
        validProtocolLength % 16 == 0
            ? validProtocolLength + 16
            : Math.ceil(validProtocolLength / 16) * 16,
        rightinput = false,
        result = {
            add: 0,
            sub: 0,
            updateflag: parseInt(Math.ceil(validProtocolLength / 8)), //updateflag 的字节长度 当前updateflag
            addupdateflag:0,//通过增补保留字后标准的updateflag
            subupdateflag:0,//通过减小保留字后标准的updateflag
        };
    // A: a+b = 16n (n= 1、2、3...)
    // B: 8b = a+k ( k=0到7 )
    // B和A =>
    // C: b = (16n + k)/9
    // D: a = (8*16n-k)/9
    // 又：b 为整数即： (16n + k)%9 == 0 （由A知： a b 只要一个是整数另一个必是整数）
    //计算result.add, 当前还需要用户增加的最小字节长度（以满足配置条件）
    for (addcount; ; addcount += 16) {
        for (var k = 0; k < 8; k++) {
            if ((addcount + k) % 9 == 0 && (addcount * 8 - k) / 9 >= validProtocolLength) {
                // console.log("---成立---",addcount,k);
                rightinput = (addcount * 8 - k) / 9;
                if (rightinput == validProtocolLength) {
                    result.sub = 0;
                }
                result.add = rightinput - validProtocolLength;
                result.addupdateflag = parseInt(Math.ceil(rightinput / 8));
                break;
            }
        }
        if (rightinput) {
            break;
        }
    }
    //计算result.sub, 当前还需要用户减去的最小字节长度（以满足配置条件）
    if (rightinput != validProtocolLength) {
        addcount = addcount - 16;
        let rightinput_sub = false;
        for (addcount; addcount > 15; addcount -= 16) {
            for (var k = 0; k < 8; k++) {
                if ((addcount + k) % 9 == 0 && (addcount * 8 - k) / 9 <= validProtocolLength) {
                    rightinput_sub = (addcount * 8 - k) / 9;
                    result.sub = validProtocolLength - rightinput_sub;
                    result.subupdateflag = parseInt(Math.ceil(rightinput_sub / 8));
                    break;
                }
            }
            if (rightinput_sub) {
                break;
            }
        }
    }
    return result;
}

export const DateTool = {

    pekingToStr(pekingStr) {
        let t = moment(pekingStr);
        return t.format('YYYY-MM-DD HH:mm:ss');
    },
    // utc时间串转本地时间串
    utcToDev(utcString) {
        let t = moment(utcString);
        t.add(t.utcOffset() / 60, 'h');
        return t.format('YYYY-MM-DD HH:mm:ss');
    },
    /**
     * time:        时间戳
     * fmt:         字符串时间格式
     * timezone:    默认时区为0时区
     */
    formatDate(time, fmt, timezone = 0) {
        if (!time) return '';
        let timestamp = time + timezone * 60 * 60 * 1000;
        let date = new Date(timestamp);
        let o = {
            "M+": (date.getMonth() + 1),
            "d+": date.getDate(),
            "h+": date.getHours(),
            "m+": date.getMinutes(),
            "s+": date.getSeconds(),
            "q+": (Math.floor((date.getMonth() + 3) / 3)), // 季度
            "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    },
};

/**
 * 协议类型的展示文案判断规则
 * @param {object} item 协议子项
 */
export function setFuncDataType (item){
    const {functionDataType, propertyValueType, propertyValueDesc, javaType} = item;
    const types = ["字符型", "数值型", "枚举型", "布尔型", "绝对时间", "相对时间", "循环时间", "RGB颜色", "二进制","数组","结构体"];

    if(functionDataType && types[functionDataType-1]){
        return types[functionDataType-1];
    }else if(javaType && (javaType == "STRING" || javaType == "HEXSTRING")){
        return javaType == "STRING" ? "字符型" :  "十六进制"
    }else if(propertyValueType){
        return propertyValueType == "RANGE" ? "数值型" : "枚举型"
    }else if(propertyValueDesc){
        if(propertyValueDesc.indexOf('~') > -1){
            return "数值型"
        }else{
            return "枚举型"
        }
    }
}

/**
 * 校验文件是否符合指定的类型和大小规范 {isOk : true,size : true,type : true}
 * @param {file} fileList
 * @param {array} typeArray 类型数组 eg:['png','zip']
 * @param {number} sizeKb 文件大小，以kb为单位，默认值为500
 */
export function checkFileTypeAndSize(fileList,typeArray = [],sizeKb = 500) {

    let temp = {
        isOk : true,
        size : true,
        type : true
    };

    typeArray = typeArray.map(item =>{
        return '.' + ('' + item).trim()
    });
    sizeKb = sizeKb * 1000; // kb -> 字节

    fileList.forEach(file => {
        let {name,size} = file,
            _type = '';

        if (name) {
            _type = '' + name.match(/\..+$/g) || '';

            if (!typeArray.includes(_type)) {
                temp.isOk = false;
                temp.type = false;
            }

            if (size > sizeKb) {
                temp.isOk = false;
                temp.size = false;
            }
        }
    })

    return temp;
}

/**
 * 获取url问号之后的param参数的value
 * @param {string} paramName 参数名称
 */
export function getUrlParam (paramName){
    if (paramName && typeof paramName == 'string') {
        var sValue = '';
        var re = new RegExp(paramName + '=([^&=]+)');
        var st = null;
        st = window.location.search.match(re) || window.location.hash.match(re);
        if (st && st.length == 2) {
            st[1] = st[1].replace(/^\s*|\s*$/g, '');
            sValue = st[1];
            if (sValue == '') {
                return null;
            } else {
                return sValue;
            }
        } else {
            return st;
        }
    }
}

/**
 * 返回指定长度的数组；可用于遍历场景
 * @param {number} length 必选 指定数组的长度
 * @param {any}} item 可选 指定数据的填充项
 */
export function createArrayByLength(length,item = '') {
    return new Array(length).fill(item);
}

/**
 * 获取验证码图片地址
 */
export function getVcodeImgUrl () {
    return `${Paths.verifyCodeUrl}?t=${new Date().getTime()}`
}

/**
 *
 * @param str 需要转换的字符串
 * @param num 中间转成“*”的字符数
 * @returns {string}
 */
export function strToAsterisk(str, num) {
    str = str + '';
    let totallength = str.length;
    if (num < totallength) {
        let frontlen = Math.floor((totallength - num) / 2);

        let frontstr = str.substring(0, frontlen),
            betweenstr = str.substring(frontlen, frontlen + num),
            afterstr = str.substring(frontlen + num),
            starstr = betweenstr.replace(/\S/g, '*');
        return frontstr + starstr + afterstr;
    } else {
        return str.replace(/\S/g, '*');
    }
}

/**
 * 子账号账号管理
 * @param val 需要检测的账号
 */
export function checkAccount (val) {
    // 验证账户格式
    var reg = /^[a-zA-Z\d\_]{6,14}$/;
    // val = trim(val);
    return reg.test(val);
};

/**
 * 粘贴内容到粘贴板
 * @param {string} str 内容
 */
export function copyTextToClipBoard (str = '') {

    if (document.execCommand) {

        let tempInput = document.createElement('input');

        tempInput.setAttribute('style','height:0,width:0,visibility: hidden;');
        tempInput.setAttribute('value', str);

        document.body.appendChild(tempInput);

        tempInput.select();

        // 复制
        document.execCommand('copy');
        
        notification.success({
            message:'复制成功'
        })

        // 销毁无用元素
        document.body.removeChild(tempInput);
    } else {
        notification.warn({
            message:'该浏览器不支持复制'
        })
    }
}

/**
 * 将数值或者数值字符串限制为整数 --- 用于inputNumber
 * @param {string|number} value 待转换的值
 */
export function limitToInt (value) {
    // eslint-disable-next-line no-useless-escape
    const reg = /^(\-)?(\d*)\.*$/;

    // 处理负数
    if (value === '-') {
        return value
    }

    if (isNaN(+value)) {
        return '';
    }

    return ('' + value).replace(reg,'$1$2')
}

/**
 * 将数接口返回得文件列表，传入处理成满足回填得格式。
 * @param [] arr 待转换的值
 */
export function UploadFileDataBackfill (arr) {
    arr = arr||[];//arr为null得时候，在传入参数时加得默认值不生效。所以写在下面了。
    return arr.map((item,index)=>{
        return {//文件参数以[{},{}]格式回填
                uid: -index, // 文件唯一标识，建议设置为负数，防止和内部产生的 id 冲突
                name: item.filename||item.filesrc,
                status: 'done',
                url: item.filesrc,
            }
    });
}


/**
 * 目标数组按照子项的某个属性值进行去重，属性值相同的只保留第一个
 * @param {array} array 目标数组 [{},{},{}]
 * @param {string} key 需要过滤的key值
 */
export function uniqueItemInArrayByKey (array = [],key = '') {
    let temp = {};
    array = cloneDeep(array);

    return array.filter(item => {
        let value = item[key]

        if(temp[value]) {
            return false;
        }

        temp[value] = true;
        return true;
    })
}

export function openNewWindow(hash,search) {
    const {origin,pathname} = window.location;

    let url = `${origin}${pathname}#${hash}` 

    if (search) {
        url += `?${search}`
    }

    const newWindow = window.open(url, '_blank');
    newWindow.focus();  
}

//密码校验正则式（8到18位须同时包含字母、数字、符号）
export const psdPattern = /^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[~!@#$%^&*])[0-9a-zA-Z~!@#$%^&*]{8,18}$/
