import React, { Component } from 'react';
import { Tabs, Tree } from 'antd';
import NoSourceWarn from './../../components/no-source-warn/NoSourceWarn';
import './TreeStructureDisplay.scss';

const {TabPane} = Tabs;
const {TreeNode} = Tree;

export default class TreeStructureDisplay extends Component {
    constructor(props){
        super(props);
        this.state = {
            permissionsTabsKey:'1',//tabs 切换key
        };
    }
    callback = (permissionsTabsKey)=>{
        this.setState({permissionsTabsKey});
    }
    //树DOM处理
    renderTreeNodes = data =>
        data.map(item => {
            let title = item.checked?<span className='treeTextColor'>{item.title}</span>:<span>{item.title}</span>
        if (item.children) {
            return (
            <TreeNode title={title} key={item.key} dataRef={item}>
                {this.renderTreeNodes(item.children)}
            </TreeNode>
            );
        }else{
            item.title=title;
            /**
             * 需要将item里面的title赋值为上面定义的title。不然当没有children的时候，子元素就不显示搜索状态了
             * 或者将下面得return 写成这样 return <Tree.TreeNode key={item.key} {...item} title={title} />;
             */ 
        }
        return <TreeNode key={item.key} {...item} />;
    });
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
                item.children = this.rightsList(item.subBoxs,item.key);
                delete item.subBoxs;
            }
            return item;
        });
    }
    /**
     * defaultExpandAll : 是否全量打开树结构
     */ 
    render() {
        let { permissionsTabsKey } = this.state;
        let {productResource,dataObjRightsList = [],dataDimensionRightsList = [],defaultExpandAll = [],apiInvokList = [],userCategory,projectAuthList=[]} = this.props;
        productResource = this.rightsList(productResource);
        dataObjRightsList = this.rightsList(dataObjRightsList);
        dataDimensionRightsList = this.rightsList(dataDimensionRightsList);
        apiInvokList = this.rightsList(apiInvokList);
        projectAuthList= this.rightsList(projectAuthList);
        console.log("TreeStructureDisplay -> render -> defaultExpandAll", defaultExpandAll)
        return (<div className='treeStructureDisplay commonContentBox'>
                    <div className='title'>权限信息</div>
                    <div className='centent'>
                        {
                            userCategory==1?<Tabs defaultActiveKey={permissionsTabsKey} onChange={this.callback}>
                                <TabPane tab="产品服务权限" key="1">
                                    {/* 就是下面这个三目运算符，为什么写一行就会报错？？？ 我裂开了... */}
                                    { productResource.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(productResource)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                                <TabPane tab="数据对象权限" key="2">
                                    { dataObjRightsList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(dataObjRightsList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                                <TabPane tab="数据维度权限" key="3">
                                    { dataDimensionRightsList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(dataDimensionRightsList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                                <TabPane tab="项目权限" key="4">
                                    { projectAuthList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(projectAuthList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>

                                


                            </Tabs>
                            :
                            <Tabs defaultActiveKey={permissionsTabsKey} onChange={this.callback}>
                                <TabPane tab="数据对象权限" key="1">
                                    { dataObjRightsList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(dataObjRightsList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                                <TabPane tab="数据维度权限" key="2">
                                    { dataDimensionRightsList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(dataDimensionRightsList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                                <TabPane tab="API调用权限" key="3">
                                    { apiInvokList.length>0?
                                        <Tree showLine defaultExpandAll={defaultExpandAll} >
                                            {this.renderTreeNodes(apiInvokList)}
                                        </Tree>
                                        :<NoSourceWarn /> }
                                </TabPane>
                            </Tabs>
                        }
                        <p className='annotation'>*注：蓝色为已配置的权限。</p>
                    </div>
                </div>
        )
    }
}
