/**
 * 
 * @param {*} target Dom对象
 * @param {*} backfunc 有参数 backfunc 表示是 图片预览，没有则表示只是返回普通文件名。（调用的时候根据需求传backfunc）
 * @param {*} limitCallback 回调函数
 */

export function FileUpload (target, backfunc, limitCallback ) {
    let format = target.getAttribute('data-format'), //格式（format）、大小（maxsize） 校验标准
        maxsize = (target.getAttribute('data-maxsize') && target.getAttribute('data-maxsize') - 0) || 500; //默认限制不超过500KB
    let upsize = 1024 * 1024 * 10; //初始化实际上传文件的格式、大小
    let filename = target.value;
    if (maxsize) {
        //验证文件占存大小
        if (window.ActiveXObject && !target.files) {
            let fileSystem = new ActiveXObject('Scripting.FileSystemObject');
            let file = fileSystem.GetFile(filename);
            upsize = file.Size;
        } else {
            upsize = target.files[0].size;
        }
        if (upsize > maxsize * 1024) {
            if (limitCallback) {
                limitCallback('文件大小不能超过' + maxsize + 'KB');
            } else {
                alert('文件大小不能超过' + maxsize + 'KB');
            }
            target.value = '';
            return null;
        }
    }
    if (format) {
        //验证文件格式
        let arr = format.split(',');
        let upformat = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(),
            find = false;
        for (let i in arr) {
            if (arr[i].toLowerCase() == upformat) {
                find = true;
                break;
            }
        }
        if (!find) {
            if (limitCallback) {
                limitCallback('请选择' + format + '格式的文件');
            } else {
                alert('请选择' + format + '格式的文件');
            }
            target.value = '';
            return null;
        }
    }
    if (backfunc) {
        if (window.FileReader) {
            // html5方案
            let fr = new FileReader(),
                fire = target.files[0];
            fr.onload = function (e) {
                backfunc(e.target.result);
            };
            fr.readAsDataURL(fire);
        } else {
            // 降级处理
            backfunc(filename);
        }
    } else {
        return filename;
    }
}; 