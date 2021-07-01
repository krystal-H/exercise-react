import React from 'react'
import { Breadcrumb, Icon } from 'antd';
import { Link } from 'react-router-dom';

import './ContentTitle.scss';
/**
 * @param {Array} breads  参数格式为 [{path:string,icon:string,text:string}]
 */

export default function contentBread({location,routes}) {
    let breads = [],
        separator = ">";
    let hash = location?location.hash.slice(2):'',  //  #/xxx/xxx/xxx   去除#/
        hashArr = hash.split('/'),                  //  切割为数组  
        pathNub = 1,                                //  初始值
        pathList = [],
        pathVluText = '',
        productId = hash.match(/[\d]+/g); // 获取路由中的产品id  PS:如果路径中再出现其他的数字，此种方式就不在适用，需要再进行更改

    for (let a = 0; a < hashArr.length; a++) {      //将切割得数组，转换为需要得格式
        if(!!hashArr[a]){
            pathVluText += '/'+hashArr[a];
            if (+hashArr[a+1]) { // 此处是处理 /edit/:id 类型的路由，两个参数代表一个层级
                pathVluText += '/'+hashArr[a+1];
                a++
            }
            pathList.push({pathVlu:pathVluText});
        }
    }
    function breadsObj (routes){
        for(let a=0; a<routes.length; a++){
            let item = routes[a];
            if(pathNub<pathList.length){

                let paths = pathList[pathNub].pathVlu||'',
                {path,text,routes} = item;
                if (path) { //  /edit/:id 是不会等于 /edit/1234 所有进行一波替换 
                    path = path.replace(':id',productId);
                }
                if(paths == path){
                    pathNub++;
                    if(text){
                        let _obj = {
                            path,
                            text,
                            needLink:true
                        }
                        if(text.indexOf('*') > -1) { // 文字带*的不加跳转路由
                            _obj.text = text.slice(1);
                            _obj.needLink = false;
                        }
                        breads.push(_obj);
                    }
                    if( routes){
                        breadsObj(item.routes)
                    }else{
                        return false;
                    }
                }
            }else{
                return false;
            }
        }
    }
    if(routes){
        breadsObj(routes);
    }

    return (
        <div className="content-title-wrapper">
            {
                <Breadcrumb separator={separator}>
                    {
                        breads.map((bread,index) => (                        
                            <Breadcrumb.Item key={index}>
                                    {
                                        bread.needLink ? 
                                        <Link to={bread.path || null}>
                                            {
                                                index === 0 &&
                                                <Icon type='home' />
                                            }
                                            {
                                                bread.text &&
                                                <span>{bread.text}</span>
                                            }
                                        </Link> :
                                        <span>
                                            {
                                                index === 0 &&
                                                <Icon type='home' />
                                            }
                                            {
                                                bread.text &&
                                                <span style={{paddingLeft:'4px'}}>{bread.text}</span>
                                            }
                                        </span>
                                    }
                                </Breadcrumb.Item>)
                        )
                    }
                </Breadcrumb>
            }
        </div>
    )
}
