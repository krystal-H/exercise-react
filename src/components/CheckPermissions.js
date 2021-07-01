import {Notification} from './Notification';


/**
 * 页面元素级的权限ID： *（id会变，得根据名称name判断）
 * 基础产品 - 
 *      产品 - 
 *      设备 - 基本信息 : 12714   设备影子 : 12717(需求搁置，暂时用不上)    设备标签 : 12718
 *      应用 - 创建应用 : 12720   关联产品 : 12721    发布版本 : 12722
 * 
 * menuList : 存在localStorage中的缓存菜单权限数据
 * id : 当前点击的模块权限ID *（id会变，得根据名称name判断）
 * tag (true/false) : 记录当前调用的元素是否有访问权限
 */ 
let tag = false;
export function CheckPermissions (name) {
    let menuList = JSON.parse(localStorage.getItem('menuList'));
    check(menuList,name);
    if(!tag){
        Notification({
            description:'您暂时没有'+name+'权限，请联系管理员开通权限'
        });
    }
    let sign = tag;
    tag = false;//给返回值赋值，再重置，使第二次权限判断不受影响
    return sign;
}
//递归查询
function check (menuList,name) {
    menuList.map((item,index) => {
        if(item.menuname==name){
            tag = true;
        }else{
            if (item.menus&&!tag) {
                check(item.menus,name);
            }
        }
    });
}