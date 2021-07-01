// import { notification } from 'antd';
import { post, Paths } from '../api';

// function prompt (str) {
//     notification.open({
//         message: '文件上传提示',
//         description:str,
//         style: {
//           width: 500,
//           marginLeft: 335 - 600,
//         },
//       });
// }

export function UpFileToCloud (file,backfunc,index,timeout=1000*30) {
    let parameterobj = {
        appId:31438,
        domainType:4
    }
    parameterobj.file = file;

    post(Paths.upFileUrl,parameterobj,{needFormData:true,loading:true},{timeout}).then((model) => {
        if(model.code==0){
           let src = model.data.url;
           backfunc(src,index);
        }else{
            backfunc(null,index);
        }
    });
};
