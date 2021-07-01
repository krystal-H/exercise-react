import React, { Component } from 'react';
import {cloneDeep,compact,indexOf} from 'lodash';
import {get, post, Paths} from '../../../api';
import DoubleBtns from './../../../components/double-btns/DoubleBtns';
import NoSourceWarn from './../../../components/no-source-warn/NoSourceWarn';
import { Input, Select, Tree,Radio } from 'antd';
import { getUrlParam } from '../../../util/util';
import { Notification } from './../../../components/Notification';
import PageTitle from '../../../components/page-title/PageTitle';

import './addRole.scss';

const {Option} =  Select;
const consoleList = [
    {
        id:'1',
        text:'产品服务权限'
    },
    {
        id:'2',
        text:'数据对象权限'
    },
    {
        id:'3',
        text:'数据维度权限'
        
    },
    {
        id:'5',
        text:'项目权限'
    }
];
const apiList = [
    {
        id:'2',
        text:'数据对象权限'
    },
    {
        id:'3',
        text:'数据维度权限'
    },
    {
        id:'4',
        text:'API调用权限'
    }
];

let dataList = [];

let editList = [];//记录编辑时，返回的的key数据

let defaultKeyList = [];//记录默认全选得key

class Treefer extends Component{
    constructor(props){
        super(props);
        this.state = {
            
            checkedKeys: [],
            selectedKeys: [],
            expandedKey:[],
        };
    }
    componentDidMount() {
        
    }
    onExpand = (expandedKeys) => {
        if(this.props.terrType==1){
            this.props.onExpand(expandedKeys,false)
        }else{
            this.setState({expandedKey:expandedKeys});
        }
    };
    // 主动触发展开
    triExpand = (keys) => {
        this.setState({
            expandedKey: [...keys]
        })
    }
    
    onCheck = (checkedKeys, e) => {
        this.setState({ checkedKeys },()=>{
            this.props.shuttle(checkedKeys, e)
        });
    };
    
    onSelect = (selectedKeys, info) => {
        this.setState({ selectedKeys });
    };
    // 判断节点及父节点是否需要展示
    checkShow = (checkedKeys, key) => {
        let flag = false;
        checkedKeys.map(item => {
            if(item.indexOf(key) === 0){
                flag = true;
            }
        })

        return flag;
    }

    //过滤树中的选中元素及父元素 给出现选中的父节添加选中标记 
    selectList = (arr,checkedKeys,searchValue,parentItem='') => {
        return arr.map((item,index) => {
            item.tree_show = (this.checkShow(checkedKeys, item.key)||(item.title && item.title.indexOf(searchValue)>-1))?true:false;
            if(parentItem&&item.tree_show){
                parentItem.tree_show = item.tree_show;
            }
            if (item.children) {
                item.children = this.selectList(item.children,checkedKeys,searchValue,item) 
            }
            return item;
        });
    }
    renderTreeNodes = (data) =>{
        let { searchValue, expandedKeys, seek_tree_show, expandedKeys_seek, terrType } = this.props;
        let cloneDeepData = cloneDeep(data);//防止更改原数据，影响下次搜索
        if(seek_tree_show&&terrType===1){
            cloneDeepData = this.selectList(cloneDeepData,expandedKeys_seek,searchValue);
        }
        return cloneDeepData.map((item,index) => {
            if(item){
                let indexs = null,
                    beforeStr = null,
                    afterStr = null,
                    title = null,
                    sign = null;
                if(!!searchValue){
                    indexs = item.title.indexOf(searchValue);
                    beforeStr = item.title.substr(0, indexs);
                    afterStr = item.title.substr(indexs + searchValue.length);
                    title = indexs > -1 ? (<span>{beforeStr}<span style={{ color: '#f50' }}>{searchValue}</span>{afterStr}</span>) :item.tree_show?<span>{item.title}</span>:'';
                }else{
                    title = item.title;
                }
                if (item.children) {
                    return (
                        <Tree.TreeNode  style={{display: title?'block':'none'}} title={title} key={item.key} dataRef={item}>
                            {this.renderTreeNodes(item.children,item)}
                        </Tree.TreeNode>
                    );
                }else{
                    item.title=title;
                    /**
                     * 需要将item里面的title赋值为上面定义的title。不然当没有children的时候，子元素就不显示搜索状态了
                     * 或者将下面得return 写成这样 return <Tree.TreeNode key={item.key} {...item} title={title} />;
                     */ 
                }
                return <Tree.TreeNode style={{display: title?'block':'none'}} key={item.key} {...item} />;
            }
        });
    }
    render(){
        let {selectedKeys,expandedKey} = this.state;
        let {expandedKeys,autoExpandParent,seek_tree_show,expandedKeys_seek,seek_show_node,terrType}=this.props;
        expandedKeys = seek_tree_show ? cloneDeep(seek_show_node) : cloneDeep(expandedKeys);
        let { checkedKeys, type } = this.props;
        return (<Tree
                    checkable
                    autoExpandParent={autoExpandParent}
                    onCheck={this.onCheck}
                    onSelect={this.onSelect}
                    onExpand={(keys, {expanded, node}) => this.onExpand(keys, node)}
                    expandedKeys={terrType==1?expandedKeys:expandedKey}
                    checkedKeys={checkedKeys}
                    selectedKeys={selectedKeys}
                >
                    {this.renderTreeNodes(cloneDeep(this.props.menuList))}
                </Tree>
            );
    }
}

// 生成权限树
function formatTree(tree, pre){
    return tree && tree.length ? tree.map(item => {
        if(item){
            return {
                key: pre + item.key,
                title: item.title,
                children: formatTree(item.children, pre)
            }
        }
        return {}
    }): []
}

export default class AddRole extends Component {
    constructor(props){
        super(props);
        let roleName = decodeURI(getUrlParam('roleName'))&&decodeURI(getUrlParam('roleName'))!='null'?decodeURI(getUrlParam('roleName')):'';
        let remark = decodeURI(getUrlParam('remark'))&&decodeURI(getUrlParam('remark'))!='null'?decodeURI(getUrlParam('remark')):'';
        this.state = {
            roleName:roleName||'',//角色名称
            remark:remark||'',//备注
            userCategory:getUrlParam('userCategory')||'1',//角色种类（1-控制台访问用户的角色；2-接口访问用户的角色）
            hideData:[],//用来兼容3.0/4.0

            expandedKeys:[],//展开的节点
            expandedKeys_seek:[],//搜索时默认展开的节点、显示节点
            seek_show_node:[],//搜索时张开收起节点

            seek_tree_show:false,
            searchValue:'',//搜索的内容
            autoExpandParent:false,
            permissionAssignment:getUrlParam('userCategory')==2?'2':'1',// 1,产品服务权限  2,数据对象权限  3,数据维度权限 4,API调用权限

            productResource:[],//产品服务
            productResource_key_left:[],//产品服务-选中key
            right_productResource:[],//产品服务-右边展示
            productResource_key_right :[],

            apiRightsList:[],//api权限数据
            apiRightsList_key_left:[],//api权限数据-选中key
            right_apiRightsList:[],//api权限数据-右边展示

            dataObjRightsList:[],//数据对象权限
            dataObjRightsList_key_left:[],//数据对象权限-选中key
            right_dataObjRightsList:[],//数据对象权限-右边展示
            dataObjRightsList_key_right:[],//api权限数据-右边展示

            dataDimensionRightsList:[],//数据维度权限
            dataDimensionRightsList_key_left:[],//数据维度权限-选中key
            right_dataDimensionRightsList:[],//数据维度权限-右边展示

            projectRightsList:[],//项目权限
            projectRightsList_key_left:[],//项目权限-选中key
            right_projectRightsList:[],//项目权限-右边展示
        };
        this.click_1 = this.click_1.bind(this);
        this.click_2 = this.click_2.bind(this);
    }
    //树数据处理  
    rightsList = (arr,key) => {
        let keyDisposes = null;
        return arr.map((item,index) => {
            if(key){
                keyDisposes = key+'-'+index;
            }else{
                keyDisposes = '0-'+index
            }
            let title = item.boxName||item.groupName;
            if(title&&title.indexOf('#')!=-1){
                title = title.split('#');
                title = title[0];
            }
            item.title = title;
            item.key = keyDisposes;
            if (item.subBoxs) {
                item.children = this.rightsList(item.subBoxs,item.key) 
            }
            defaultKeyList.push(keyDisposes);
            return item;
        });
    }
    //获取编辑得数据处理
    editList = (arr) => {
        arr.map((item,index) => {
            if(item.checked&&item.subBoxs&&item.subBoxs.length>0){
                this.editList(item.subBoxs);
            }else{
                if(item.checked){
                    editList.push(item.key);
                }
            }
            return false;
        });
    }
    edit = (arr) => {
        this.editList(arr);
        let list = cloneDeep(editList);
            editList = [];
        return list;
    }
    // 获得所有权限菜单列表 getGroupMenuList
    getRights = () => {
        /**
         *   menuCode: productService   dataObject     dataDimension   apiInvok
         *   menuName: 产品服务权限      数据对象权限    数据维度权限     API调用权限
         * */
        let roleId = getUrlParam('roleId');
        let data = {
            version:1.2,
            userCategory:this.state.userCategory
        };
        let tag = false;
        if(roleId){
            data.roleId = roleId;
            tag = true;
        }
        get(Paths.getRights,data,{loading:true}).then((res) => {
            if(res.code==0){
                let arr = res.data;
                let productResource = [],
                    apiRightsList = [],
                    dataObjRightsList = [],
                    dataDimensionRightsList = [],
                    projectRightsList=[],
                    hideDataList = [];
                    
                let productResource_key_left=[],//产品服务-选中key
                    apiRightsList_key_left=[],//api权限数据-选中key
                    dataObjRightsList_key_left=[],//数据对象权限-选中key
                    dataDimensionRightsList_key_left=[],//数据维度权限-选中key
                    projectRightsList_key_left=[];
                    // defaultKeyList;
                for (let a = 0; a < arr.length; a++) {
                    let item = arr[a];
                    if(item.menuCode=='productService'){//1
                        //默认全选操作---下面同步
                        let list = cloneDeep(this.rightsList(item.checkBoxGroupList));
                        productResource = list;
                        productResource_key_left = cloneDeep(defaultKeyList);
                        defaultKeyList = [];
                    }
                    if(item.menuCode=='apiInvok'){//4
                        let list = cloneDeep(this.rightsList(item.checkBoxGroupList));
                        apiRightsList = list;
                        apiRightsList_key_left = cloneDeep(defaultKeyList);
                        defaultKeyList = [];
                    }
                    if(item.menuCode=='dataObject'){//2
                        let list = cloneDeep(this.rightsList(item.checkBoxGroupList));
                        dataObjRightsList = list;
                        dataObjRightsList_key_left = cloneDeep(defaultKeyList);
                        defaultKeyList = [];
                    }
                    if(item.menuCode=='dataDimension'){//3
                        let list = cloneDeep(this.rightsList(item.checkBoxGroupList));
                        dataDimensionRightsList = list;
                        dataDimensionRightsList_key_left = cloneDeep(defaultKeyList);
                        defaultKeyList = [];
                    }
                    if(item.menuCode=='projectAuth'){//5
                        let list = cloneDeep(this.rightsList(item.checkBoxGroupList));
                        projectRightsList = list;
                        projectRightsList_key_left = cloneDeep(defaultKeyList);
                        defaultKeyList = [];
                    }


                    
                    if(item.menuCode=='hideData'){
                        hideDataList = item.checkBoxGroupList;
                    }
                }
                if(tag){//编辑
                    let productResource_key = cloneDeep(this.edit(productResource));//产品服务-选中key
                    let apiRightsList_key = cloneDeep(this.edit(apiRightsList));//API-选中key
                    let dataObjRightsList_key = cloneDeep(this.edit(dataObjRightsList));//数据对象-选中key
                    let dataDimensionRightsList_key = cloneDeep(this.edit(dataDimensionRightsList));//数据维度-选中key
                    let projectRightsList_key = cloneDeep(this.edit(projectRightsList));//5
                    this.setState({
                        productResource,
                        apiRightsList,
                        dataObjRightsList,
                        dataDimensionRightsList,
                        projectRightsList,
                        hideDataList:hideDataList,

                        //下面的内容 - 编辑页面进来处理后数据。
                        expandedKeys:[],
                        
                        productResource_key_left: productResource_key,
                        //产品服务-右边展示
                        right_productResource:compact(this.processingData_2(this.processingData_1(this.selectList(productResource,productResource_key,false,false,true)))),
                        // productResource_key_right : productResource_key,

                        dataObjRightsList_key_left: dataObjRightsList_key,
                        //数据对象-右边展示
                        right_dataObjRightsList:compact(this.processingData_2(this.processingData_1(this.selectList(dataObjRightsList,dataObjRightsList_key,false,false,true)))),
                        // dataObjRightsList_key_right : dataObjRightsList_key,

                        dataDimensionRightsList_key_left: dataDimensionRightsList_key,
                        //数据维度-右边展示
                        right_dataDimensionRightsList:compact(this.processingData_2(this.processingData_1(this.selectList(dataDimensionRightsList,dataDimensionRightsList_key,false,false,true)))),
                        // dataDimensionRightsList_key_right : dataDimensionRightsList_key,

                        apiRightsList_key_left: apiRightsList_key,
                        //API-右边展示
                        right_apiRightsList:compact(this.processingData_2(this.processingData_1(this.selectList(apiRightsList,apiRightsList_key,false,false,true)))),
                        // apiRightsList_key_right : apiRightsList_key,

                        projectRightsList_key_left: projectRightsList_key,
                        right_projectRightsList:compact(this.processingData_2(this.processingData_1(this.selectList(projectRightsList,projectRightsList_key,false,false,true)))),
                       
                    });
                }else{//新建
                    productResource = this.selectList(productResource,productResource_key_left);
                    apiRightsList = this.selectList(apiRightsList,apiRightsList_key_left);
                    dataObjRightsList = this.selectList(dataObjRightsList,dataObjRightsList_key_left);
                    dataDimensionRightsList = this.selectList(dataDimensionRightsList,dataDimensionRightsList_key_left);
                    projectRightsList = this.selectList(projectRightsList,projectRightsList_key_left);
                    this.setState({
                        productResource,//产品服务
                        productResource_key_left,//产品服务-选中key
                        right_productResource:productResource,
            
                        apiRightsList,//api权限数据
                        apiRightsList_key_left,//api权限数据-选中key
                        right_apiRightsList:apiRightsList,
            
                        dataObjRightsList,//数据对象权限
                        dataObjRightsList_key_left,//数据对象权限-选中key
                        right_dataObjRightsList:dataObjRightsList,
            
                        dataDimensionRightsList,//数据维度权限
                        dataDimensionRightsList_key_left,//数据维度权限-选中key
                        right_dataDimensionRightsList:dataDimensionRightsList,

                        projectRightsList,
                        projectRightsList_key_left,
                        right_projectRightsList:projectRightsList,

                        hideDataList:hideDataList,
                    });
                }
            }
        });
    }
    componentDidMount() {
        this.getRights();
    }    
    generateList = data => {
        for (let i = 0; i < data.length; i++) {
            let node = data[i];
            let { key, title } = node;
            dataList.push({ key, title });
            if (node.children) {
                this.generateList(node.children);
            }
        }
        return dataList;
    };
    getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
          const node = tree[i];
          if (node.children) {
            if (node.children.some(item => item.key === key)) {
              parentKey = node.key;
            } else if (this.getParentKey(key, node.children)) {
              parentKey = this.getParentKey(key, node.children);
            }
          }
        }
        return parentKey;
    };
    /**
     * 选择、输入操作事件
     * type 1:角色名称 2:备注 3:访问方式 4:权限配置 5:权限搜索 
     */
    inputOrSelect = (type,e) => {
        switch (type) {
            case 1:
                this.setState({roleName:e.target.value});
            break;
            case 2:
                this.setState({remark:e.target.value});
            break;
            case 3:
                editList = [];
                this.setState({
                    //清空下面得树相关的选择内容
                    expandedKeys:[],
                    productResource_key_left:[],//产品服务-选中key
                    right_productResource:[],//产品服务-右边展示

                    apiRightsList_key_left:[],//api权限数据-选中key
                    right_apiRightsList:[],//api权限数据-右边展示

                    dataObjRightsList_key_left:[],//数据对象权限-选中key
                    right_dataObjRightsList:[],//数据对象权限-右边展示

                    dataDimensionRightsList_key_left:[],//数据维度权限-选中key
                    right_dataDimensionRightsList:[],//数据维度权限-右边展示

                    projectRightsList_key_left:[],
                    right_projectRightsList:[],
                },()=>{
                    let val = e.target.value;
                    if(val==1){
                        this.setState({userCategory:val,permissionAssignment:'1'},()=>{
                            this.getRights()
                        }) 
                    }else{
                        this.setState({userCategory:val,permissionAssignment:'2'},()=>{
                            this.getRights()
                        });
                    }
                });
            break;
            case 4:
                this.setState({
                    expandedKeys_seek:[],//搜索时默认展开的节点、显示节点
                    seek_show_node:[],//搜索时张开收起节点
                    seek_tree_show:false,
                    searchValue:'',
                    expandedKeys:[],
                },()=>{
                    this.setState({permissionAssignment:e});
                })
            break;
            case 5:
                let { permissionAssignment, productResource, apiRightsList, dataObjRightsList, dataDimensionRightsList,projectRightsList } = this.state,
                    gData = [];
                if(permissionAssignment==1){
                    gData = cloneDeep(productResource)
                }else if(permissionAssignment==2){
                    gData = cloneDeep(dataObjRightsList)
                }else if(permissionAssignment==3){
                    gData = cloneDeep(dataDimensionRightsList)
                }else if(permissionAssignment==4){
                    gData = cloneDeep(apiRightsList)
                }else if(permissionAssignment==5){
                    gData = cloneDeep(projectRightsList)
                }
                let expandedKeys = this.generateList(gData).map(item => {
                    if (item.title && item.title.indexOf(e) > -1) {
                        return this.getParentKey(item.key, gData);
                    }
                    return null;
                }).filter((item, i, self) => item && self.indexOf(item) === i);
                // 所有节点的父节点夜需要展开 start
                function spreadKeys(key_str){
                    const key_str_arr = key_str.split('-');
                    let list = [];
                    let str = key_str_arr[0];
                    for(let i = 1; i < key_str_arr.length; i++){
                        str+= '-' + key_str_arr[i];
                        list.push(str);
                    }
                    return list;
                }
                let targetKeys = [];
                expandedKeys.map(item => {
                    targetKeys = targetKeys.concat(spreadKeys(item))
                })
                targetKeys = Array.from(new Set(targetKeys));
                // 所有节点的父节点夜需要展开 end
                this.setState({
                    expandedKeys_seek:cloneDeep(targetKeys),
                    searchValue: e,
                    autoExpandParent: false,
                    seek_tree_show:true,
                    seek_show_node:cloneDeep(targetKeys),
                });
            break;
            default: break;
        }
    }
    //新建取消-回到列表
    click_1(){
        this.props.history.push({
            pathname: '/userCenter/role'
        });
    }
    //新建保存
    click_2(){
        /*
            roleName//角色名称
            remark//角色描述
            roleId//角色Id，传roleId表示修改角色 不传表示新建角色
            dataJson//isSuperAuth为空时必传，否则不必传，json数据参数：[{},{}]
            userCategory//角色种类（1-控制台访问用户的角色；2-接口访问用户的角色）
            
            roleName:'',//角色名称
            remark:'',//备注
            userCategory:'1',//角色种类（1-控制台访问用户的角色；2-接口访问用户的角色）
        */ 
        let roleId = getUrlParam('roleId')||'';
        let {
            roleName,remark,userCategory,
            productResource,apiRightsList,dataObjRightsList,dataDimensionRightsList,projectRightsList,hideDataList,
        } = this.state;
        let warningtips = '';
        if(roleName==''){
            warningtips = '请填写角色名'
        }else if(remark==''){
            warningtips = '请填写备注'
        }
        if(warningtips){
            Notification({type:'warn',description:warningtips});
            return
        }
        let dataJson = [];
        let data = {
                roleName,
                userCategory,
                version:1.1
            };
        if(roleId){
            data.roleId = roleId;
        }
        if(remark){
            data.remark = remark;
        }
        if(userCategory==1){
            dataJson = [ ...(this.deleteDate(cloneDeep(projectRightsList))), ...(this.deleteDate(cloneDeep(productResource))), ...(this.deleteDate(cloneDeep(dataObjRightsList))), ...(this.deleteDate(cloneDeep(dataDimensionRightsList))), ...hideDataList]
        }else{
            dataJson = [ ...(this.deleteDate(cloneDeep(dataObjRightsList))), ...(this.deleteDate(cloneDeep(apiRightsList))), ...(this.deleteDate(cloneDeep(dataDimensionRightsList))), ...hideDataList ]
        }
        data.dataJson = JSON.stringify(dataJson);
        post(Paths.saveRole,data,{loading:true}).then((res) => {
            if(res.code==0){
				Notification({type:'success',description:'用户角色保存成功！'});
                this.props.history.push({
                    pathname: '/userCenter/role'
                });
            }
        });
    }
    deleteDate = (arr) => {
        return arr.map((item,index) => {
            delete item.children;

            if (item.subBoxs) {
                this.deleteDate(item.subBoxs);
            }
            return item;
        });
    }
    onExpand = (type,expandedKeys,state) => {
        let seek_tree_show = this.state.seek_tree_show;
        if(type==1){
            if(seek_tree_show){
                let seek_show_node = cloneDeep(expandedKeys);
                this.setState({
                    seek_show_node,
                    autoExpandParent: state,
                });
            }else{
                this.setState({
                    expandedKeys:expandedKeys,
                    autoExpandParent: state,
                });
            }
        }else{
            this.setState({
                autoExpandParent: state,
            });
        }
    }
    //过滤checkeds字段为true的进行返回。
    processingData_2 = (arr) => {
        return arr.map((item,index) => {
            if(item.checkeds){
                let obj = {
                    key:item.key,
                    title:item.title
                };
                if (item.children){
                    obj.children = this.processingData_2(item.children) 
                }
                return obj;
            }
        });
    }
    /**
     * selectList processingData_1 两个函数里面得 checkeds前端判断使用 checked后台记录是否勾选得字段
     * 尝试过用同一个字段，但是有点小问题，时间紧任务重，如果有来日再优化吧。
     */
    //给选择中的树加标记字段，给父节电添加选中标记 arr当前树元素  parentItem父元素
    processingData_1 = (arr,parentItem) => {
        return arr.map((item,index) => {
            if(item.checkeds&&parentItem){
                parentItem.checkeds = true;
                parentItem.checked = true;
            }
            if (item.children){
                item.children = this.processingData_1(item.children,item) 
            }
            return item;
        });
    }
    // 判断节点及父节点是否需要展示
    checkShow = (checkedKeys, key) => {
        let flag = false;
        checkedKeys.map(item => {
            if(item.indexOf(key) === 0){
                flag = true;
            }
        })

        return flag;
    }
    //过滤树中的选中元素及父元素 给出现选中的父节添加选中标记 
    selectList = (arr,checkedKeys,key,parentItem,tag) => {
        let checkedKeyList = cloneDeep(checkedKeys);
        return arr.map((item,index) => {
            if(tag){
                item.checkeds = item.checked;
            }else{
                item.checkeds = this.checkShow(checkedKeyList,item.key)?true:false;
                item.checked = this.checkShow(checkedKeyList,item.key)?true:false;
            }
            if(item.checkeds&&parentItem){
                parentItem.checkeds = true;
            }
            if (item.children) {
                item.children = this.selectList(item.children,checkedKeyList,item.key,item,tag) 
            }
            return item;
        });
    }
    //左边选中树选中显示
    leftShuttle = (type,checkedKeys, e) => {
        let key = e.node.props.eventKey;
        let { productResource, apiRightsList, dataObjRightsList, dataDimensionRightsList,projectRightsList } = this.state;
        if(type==1){
            let right_productResource = compact(this.processingData_2(this.processingData_1(this.selectList(productResource,checkedKeys))))
            this.setState({ productResource_key_left:checkedKeys, right_productResource });
            key = 'productService-' + key;
        }else if(type==2){
            let right_dataObjRightsList = compact(this.processingData_2(this.processingData_1(this.selectList(dataObjRightsList,checkedKeys))))
            this.setState({ dataObjRightsList_key_left:checkedKeys, right_dataObjRightsList });
            key = 'dataObject-'+key;
        }else if(type==3){
            let right_dataDimensionRightsList = compact(this.processingData_2(this.processingData_1(this.selectList(dataDimensionRightsList,checkedKeys))))
            this.setState({ dataDimensionRightsList_key_left:checkedKeys, right_dataDimensionRightsList });
            key = 'dataDimension-'+key;
        }else if(type==4){
            let right_apiRightsList = compact(this.processingData_2(this.processingData_1(this.selectList(apiRightsList,checkedKeys))))
            this.setState({ apiRightsList_key_left:checkedKeys, right_apiRightsList });
            key = 'api-'+key;
        }else if(type==5){
            let right_projectRightsList = compact(this.processingData_2(this.processingData_1(this.selectList(projectRightsList,checkedKeys))))
            this.setState({ projectRightsList_key_left:checkedKeys, right_projectRightsList });
            key = 'projectAuth-'+key;
        }
        
        let str_arr = key.split('-');
        let str = str_arr[0];
        let res = [str];
        for(let i = 1; i < str_arr.length - 1; i++){
            str += '-' + str_arr[i];
            res.push(str);
        }
        this.refTree.triExpand(res);
    }
    //右边边选中树选中显示
    rightShuttle = (type,checkedKeys) => {

    }
    //清空树的checked
    removeChecked = (arr) => {
        return arr.map((item,index) => {
            item.checked = false;
            if (item.children) {
                item.children = this.removeChecked(item.children) 
            }
            return item;
        });
    }
    //全部清空
    removeAll = (type) => {
        /**
         * type:对应四个类型
         */ 
        let { productResource, dataObjRightsList, dataDimensionRightsList, apiRightsList,projectRightsList } = this.state;
        this.setState({
            productResource:this.removeChecked(productResource), productResource_key_left:[], right_productResource:[],
            dataObjRightsList:this.removeChecked(dataObjRightsList), dataObjRightsList_key_left:[], right_dataObjRightsList:[],
            dataDimensionRightsList:this.removeChecked(dataDimensionRightsList), dataDimensionRightsList_key_left:[], right_dataDimensionRightsList:[],
            apiRightsList:this.removeChecked(apiRightsList), apiRightsList_key_left:[], right_apiRightsList:[],
            projectRightsList:this.removeChecked(projectRightsList), projectRightsList_key_left:[], right_projectRightsList:[],
        })
    }
    //清空以选list对应的数据
    deleteChooseList = (checkedKeyRight,rightList,strList) => {
        for (let a = 0; a < strList.length; a++) {
            let itemS = strList[a];
            let tag = false;    //判断选中数据里面是否存在对应的数据，false则一个都不存在，就删除掉rightList中对应的数据，不显示
            let keyName = ''; //记录当前对比的数据的key
            for (let b = 0; b < checkedKeyRight.length; b++) {
                let itemR = checkedKeyRight[b];
                if((itemR.split('-')[0])==itemS){
                    tag = true;
                    keyName = '';
                    break;
                }else{
                    keyName = itemS;
                }
            }
            if(!tag){
                for (let a = 0; a < rightList.length; a++) {
                    if(rightList[a].key===keyName){
                        rightList.splice(a,1);
                    }
                }
            }
        }
        return rightList;
    }
    render() {
        let { productResource, apiRightsList, dataObjRightsList, dataDimensionRightsList, projectRightsList,
            expandedKeys, expandedKeys_seek, seek_show_node, seek_tree_show, searchValue, autoExpandParent,
            productResource_key_left, dataObjRightsList_key_left, dataDimensionRightsList_key_left, apiRightsList_key_left,projectRightsList_key_left,
            right_productResource, right_dataObjRightsList, right_dataDimensionRightsList, right_apiRightsList,right_projectRightsList,
            roleName, remark, userCategory, permissionAssignment 
        } = this.state;

        let rightList = [
            {
                key: "dataObject",
                title: "数据对象权限",
                children: formatTree(cloneDeep(right_dataObjRightsList), "dataObject-")
            },
            {
                key: "dataDimension",
                title: "数据维度",
                children: formatTree(cloneDeep(right_dataDimensionRightsList), "dataDimension-")
            }
        ];
        let checkedKeyRight = [
            ...dataObjRightsList_key_left.map(item => "dataObject-"+item),
            ...dataDimensionRightsList_key_left.map(item => "dataDimension-"+item),
        ];

        if(userCategory==1){
            rightList.unshift({
                key: "productService",
                title: "产品服务权限",
                children: formatTree(cloneDeep(right_productResource), 'productService-')
            });
            checkedKeyRight = checkedKeyRight.concat(productResource_key_left.map(item => "productService-"+item));
            rightList.push({
                key: "projectAuth",
                title: "项目权限",
                children: formatTree(cloneDeep(right_projectRightsList), "projectAuth-")
            });
            checkedKeyRight = checkedKeyRight.concat(projectRightsList_key_left.map(item => "projectAuth-"+item));
        }else{
            rightList.push({
                key: "api",
                title: "API调用权限",
                children: formatTree(cloneDeep(right_apiRightsList), "api-")
            });
            checkedKeyRight = checkedKeyRight.concat(apiRightsList_key_left.map(item => "api-"+item))
        }
        
        let showSelectList = [],
            checked_key_left = [],
            right_list = [],
            checked_key_right = [];
        if(permissionAssignment==1){
            showSelectList = cloneDeep(productResource);
            checked_key_left = productResource_key_left;
            right_list = cloneDeep(right_productResource);
            checked_key_right = productResource_key_left;
        }else if(permissionAssignment==2){
            showSelectList = cloneDeep(dataObjRightsList);
            checked_key_left = dataObjRightsList_key_left;
            right_list = cloneDeep(right_dataObjRightsList);
            checked_key_right = dataObjRightsList_key_left;
        }else if(permissionAssignment==3){
            showSelectList = cloneDeep(dataDimensionRightsList);
            checked_key_left = dataDimensionRightsList_key_left;
            right_list = cloneDeep(right_dataDimensionRightsList);
            checked_key_right = dataDimensionRightsList_key_left;
        }else if(permissionAssignment==4){
            showSelectList = cloneDeep(apiRightsList);
            checked_key_left = apiRightsList_key_left;
            right_list = cloneDeep(right_apiRightsList);
            checked_key_right = apiRightsList_key_left;
        }else if(permissionAssignment==5){
            showSelectList = cloneDeep(projectRightsList);
            checked_key_left = projectRightsList_key_left;
            right_list = cloneDeep(right_projectRightsList);
            checked_key_right = projectRightsList_key_left;
        };
        let tag = getUrlParam('roleId')?true:false;//记录是编辑还是新建。

        this.deleteChooseList(checkedKeyRight,rightList,['productService','dataObject','dataDimension','api']);//清空以选list对应的数据 -- 必须放在最后处理数据。

        return (
            <div className='role-add'>
                <PageTitle backHandle={() => this.props.history.goBack()} title={tag?'编辑角色':'创建角色'} />
                <div className='commonContentBox'>
                    <div className='title'>基础信息</div>
                    <div className='centent'>
                        <div className='common_title_input'>
                            <span className='common_title mustiinput'>用户角色名:</span>
                            <div className='common_content'>
                                <Input className='input' maxLength={20} value={roleName} placeholder="20个字符以内" allowClear={true} onChange={this.inputOrSelect.bind(this,1)} />
                            </div>
                        </div>
                        <div className='common_title_input'>
                            <span className='common_title mustiinput'>备注:</span>
                            <div className='common_content'>
                                <Input className='input' maxLength={20} value={remark} placeholder="20个字符以内" allowClear={true} onChange={this.inputOrSelect.bind(this,2)} />
                            </div>
                        </div>
                        <div className='common_title_input'>
                            <span className='common_title'>访问方式:</span>
                            <div className='common_content'>
                                {
                                    tag?<span style={{lineHeight: '32px'}}>{userCategory==1?'控制台访问':'接口访问'}</span>:
                                    <Radio.Group defaultValue="1" onChange={this.inputOrSelect.bind(this,3)}>
                                        <Radio value="1">控制台权限</Radio>
                                        <Radio value="2">接口访问</Radio>
                                    </Radio.Group>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='commonContentBox'>
                        <div className='title'>权限配置{tag?null:<span className='postil'>*注：新建角色进入时，所有权限默认全部选中</span>}</div>
                        <div className=' jurisdiction-box ratio' >
                            <div className='common_content'>
                                <Select value={permissionAssignment} style={{ width: 150 }} onChange={this.inputOrSelect.bind(this,4)}>
                                    {
                                        userCategory==1?consoleList.map((item,index)=>{
                                            return <Option key={item.id+'consoleList'} value={item.id}>{item.text}</Option>
                                        })
                                        :apiList.map((item,index)=>{
                                            return <Option key={item.id+'apiList'} value={item.id}>{item.text}</Option>
                                        })
                                    }
                                </Select>
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <Input.Search style={{ width:'188px' }} placeholder="请输入关键字查找" maxLength={20} onSearch={this.inputOrSelect.bind(this,5)} enterButton />
                            </div>
                        </div>
                        <div className=' jurisdiction-box placeholder'></div>
                        <div className='tree-fer'>
                            <div className='jurisdiction'>
                                {
                                    showSelectList.length>0?<Treefer 
                                                                shuttle={this.leftShuttle.bind(this,permissionAssignment)} 
                                                                menuList={showSelectList}
                                                                expandedKeys={expandedKeys}
                                                                seek_tree_show={seek_tree_show}
                                                                expandedKeys_seek={expandedKeys_seek}
                                                                checkedKeys={checked_key_left}
                                                                searchValue={searchValue}
                                                                autoExpandParent={autoExpandParent}
                                                                onExpand={this.onExpand.bind(this,1)}
                                                                seek_show_node={seek_show_node}
                                                                terrType={1}
                                                                type={"left"}
                                                            />
                                                            :
                                                            <NoSourceWarn />
                                }
                            </div>
                            <div className='shuttle'>
                            </div>
                            <div className='jurisdiction-select-show'>
                                <span className='common_title'>已选权限:</span>
                                <div className='select-show-box'>
                                    <Treefer 
                                        shuttle={this.rightShuttle.bind(this,permissionAssignment)}
                                        menuList={rightList} 
                                        checkedKeys={checkedKeyRight}
                                        onExpand={this.onExpand.bind(this,2)}
                                        terrType={2}
                                        type={"right"}
                                        ref={(refTree => this.refTree = refTree)}
                                    />
                                </div>
                                <div className='empty'onClick={this.removeAll.bind(this,permissionAssignment)}>全部清除</div>
                            </div>
                        </div>
                    </div>
                <DoubleBtns
                    preHandle={this.click_1}
                    preText='取消'
                    nextHandle={this.click_2}
                    nextText={tag?'保存角色':'创建角色'}
                />
            </div>
        );
    }
}