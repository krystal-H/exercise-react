import { notification } from 'antd';

/**
 * @param {*} target Dom对象
 * @param {*} isNotImage true 表示是普通文件文件，false表示是图片文件。
 */

function prompt (str) {
    notification.open({
        message: '文件上传提示',
        description:str,
        style: {
          width: 500,
          marginLeft: 335 - 600,
        },
      });
}

export function CheckUpFile (target) {
    let format = target.getAttribute('data-format'), //格式（format）、大小（maxsize） 校验标准
        maxsize = (target.getAttribute('data-maxsize') && target.getAttribute('data-maxsize') - 0) || 500, //默认限制不超过500KB
        upsize = 1024 * 1024 * 10; //初始化实际上传文件的格式、大小
    let localsrc = target.value;
    if (maxsize) {
        //验证文件占存大小
        if (window.ActiveXObject && !target.files) {
            let fileSystem = new ActiveXObject('Scripting.FileSystemObject');
            let file = fileSystem.GetFile(localsrc);
            upsize = file.Size;
        } else {
            upsize = target.files[0].size;
        }
        if (upsize > maxsize * 1024) {
            prompt('文件大小不能超过' + maxsize+ 'KB');
            target.value = '';
            return false;
        }
    }
    if (format) {
        //验证文件格式
        let arr = format.split(',');
        let upformat = localsrc.substring(localsrc.lastIndexOf('.') + 1).toLowerCase(),
            find = false;
        for (let i in arr) {
            if (arr[i].toLowerCase() == upformat) {
                find = true;
                break;
            }
        }
        if (!find) {
            prompt('请选择' + format + '格式的文件');
            target.value = '';
            return false;
        }
    }
    return true; 
}; 