import React, { Component } from 'react';
import { connect } from 'react-redux';
import DoubleBtns from './../../../components/double-btns/DoubleBtns';

import './addRole.scss';

import { Card, Input, Select, Transfer, Tree } from 'antd';

const isChecked = (old, news) => {
    console.log('old,', old,'news',news)
    //old 老数据 news 新数据
    return old.indexOf(news) !== -1;
};

class TreeTransfer extends Component{
    constructor(props){
        super(props);
        this.state = {
            expandedKeys: [],
            autoExpandParent: true,
            checkedKeys: [],
            selectedKeys: []
        };
    }
    componentDidMount() {
        // 获取产品列表
    }
    onExpand = (expandedKeys) => {
        console.log("onExpand", expandedKeys);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
          expandedKeys,
          autoExpandParent: false
        });
    };
    
    onCheck = (checkedKeys) => {
        console.log("onCheck", checkedKeys);
        let checkedKey = this.state.checkedKeys;
        this.setState({ checkedKeys },()=>{
            this.props.targetKeysFunciont(this.state.checkedKeys);
        });
    };
    
    onSelect = (selectedKeys, info) => {
        console.log("onSelect", selectedKeys,info);
        this.setState({ selectedKeys });
    };
    
    renderTreeNodes = (data) =>{
        return data.map((item,index) => {
            if (item.children) {
                return (
                    <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode key={item.key} {...item} />;
        });
    }
    render(){
        let { dataSource, targetKeys, ...restProps } = this.props;
        let {selectedKeys} = this.state;
        let transferDataSource = [];
        function flatten(list = []) {
            list.forEach(item => {
                transferDataSource.push(item);
                flatten(item.children);
            });
        }
        flatten(dataSource);
        console.log('targetKeys',targetKeys)
        return <Transfer
                    {...restProps}
                    targetKeys={targetKeys}
                    dataSource={transferDataSource}
                    className="tree-transfer"
                    render={item => item.title}
                    showSelectAll={true}
                >
                    {({ direction, onItemSelect, onItemSelectAll, selectedKeys }) => {
                        const checkedKeys = [...selectedKeys, ...targetKeys];
                        if (direction === 'left') {
                            return (<Tree
                                        checkable
                                        onExpand={this.onExpand}
                                        expandedKeys={this.state.expandedKeys}
                                        autoExpandParent={this.state.autoExpandParent}
                                        checkedKeys={checkedKeys}
                                        selectedKeys={this.state.selectedKeys}
                                        
                                        onCheck={
                                            (_,
                                                {node: {props: { eventKey }}}
                                            ) => {
                                                onItemSelectAll(_, !isChecked(checkedKeys, _))
                                            }
                                        }
                                        onSelect={(_,{node: {props: { eventKey }}}) => {onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))}}
                                    >
                                        {this.renderTreeNodes(treeData)}
                                    </Tree>
                            );
                        }else{
                            {/* const checkedKeys = [...selectedKeys, ...targetKeys];
                            return (<Tree
                                        onCheck={this.onCheck}
                                        onSelect={this.onSelect}
                                        onCheck={(_,{node: {props: { eventKey }}}) => {onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))}}
                                        onSelect={(_,{node: {props: { eventKey }}}) => {onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))}}
                                        checkable
                                        onExpand={this.onExpand}
                                        expandedKeys={this.state.expandedKeys}
                                        autoExpandParent={this.state.autoExpandParent}
                                        onCheck={(_,{node: {props: { eventKey }}}) => {onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))}}
                                        checkedKeys={this.state.checkedKeys}
                                        onSelect={(_,{node: {props: { eventKey }}}) => {onItemSelect(eventKey, !isChecked(checkedKeys, eventKey))}}
                                        selectedKeys={this.state.selectedKeys}
                                    >
                                        {this.renderTreeNodes(treeData)}
                                    </Tree>
                            ); */}
                            return <div>123</div>
                        }

                    }}
                </Transfer>
    }
}
  
const treeData = [
    {
      title: "家电",
      key: "0-0",
      children: [
        {
          title: "冰箱",
          key: "0-0-0",
          children: [
            { title: "冰箱1", key: "0-0-0-0" },
            { title: "冰箱2", key: "0-0-0-1" },
            { title: "冰箱3", key: "0-0-0-2" }
          ]
        },
        {
          title: "洗衣机",
          key: "0-0-1",
          children: [
            { title: "洗衣机1", key: "0-0-1-0" },
            { title: "洗衣机2", key: "0-0-1-1" },
            { title: "洗衣机3", key: "0-0-1-2" }
          ]
        },
        {
          title: "空调",
          key: "0-0-2"
        }
      ]
    }
  ];
const mapStateToProps = state => {
    return {
        // optionsList: state.getIn(['product','optionsList']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getCatalogList: () => dispatch(getCatalogListAction()),
    }
}
@connect(mapStateToProps, mapDispatchToProps)
// class addProduct extends Component{
export default class AddRole extends Component {
    constructor(props){
        super(props);
        this.state = {
            targetKeys: [],
        };
        this.handleChange = this.handleChange.bind(this);
        this.click_1 = this.click_1.bind(this);
        this.click_2 = this.click_2.bind(this);
        // this.generateTree = this.generateTree.bind(this);
        // this.isChecked = this.isChecked.bind(this);
        // this.TreeTransfer = this.TreeTransfer.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    componentDidMount() {
        // 获取产品列表
    }
    handleChange(val){
        console.log('val----访问设置', val)
    }
    searchProduct(val){
        console.log('val----查找权限', val)
    }
    //新建取消-回到列表
    click_1(){

    }
    //新建保存
    click_2(){

    }
    onChange (targetKeys) {
        console.log('Target Keys:', targetKeys);
        this.setState({ targetKeys });
    };
    targetKeysFunciont = (targetKeys) => {
        this.setState({targetKeys});
    }
    render() {
        let { targetKeys } = this.state;
        return (
            <div className='role-add'>
                {/* <Card> */}
                    <div className='commonContentBox'>
                        <div className='title'>创建用户角色</div>
                        <div className='centent'>
                            <div className='common_title_input'>
                                <span className='common_title'>用户角色名:</span>
                                <div className='common_content'>
                                    <Input className='input' placeholder="20个字符以内" allowClear={true} />
                                </div>
                            </div>
                            <div className='common_title_input'>
                                <span className='common_title'>备注:</span>
                                <div className='common_content'>
                                    <Input className='input' placeholder="20个字符以内" allowClear={true} />
                                </div>
                            </div>
                            <div className='common_title_input'>
                                <span className='common_title'>访问方式:</span>
                                <div className='common_content'>
                                    <Select defaultValue='1' style={{ width: 150 }} onChange={this.handleChange}>
                                        <Select.Option value="1">控制台权限</Select.Option>
                                        <Select.Option value="2">接口访问</Select.Option>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='commonContentBox'>
                        <div className='title'>权限配置</div>
                        <div className='centent jurisdiction-box'>
                            <div className='common_title_input'>
                                <span className='common_title'>访问方式:</span>
                                <div className='common_content'>
                                    <Select defaultValue='1' style={{ width: 150 }} onChange={this.handleChange}>
                                        <Select.Option value="1">产品服务权限</Select.Option>
                                        <Select.Option value="2">数据对象权限</Select.Option>
                                        <Select.Option value="3">数据维度权限</Select.Option>
                                    </Select>
                                    &nbsp;&nbsp;&nbsp;&nbsp;
                                    <Input.Search  style={{ width:'200px' }} placeholder="请输入关键字查找" maxLength={20} onSearch={value => this.searchProduct(value)} enterButton />
                                </div>
                            </div>
                            {/* <div className='jurisdiction'>
                                产品服务权限
                            </div> */}
                        </div>
                        <div className='centent jurisdiction-box'>
                            <div className='common_title_input'>
                                <div style={{marginLeft:0}}>
                                    <span className='common_title'>已选权限:</span>
                                    <div className='float-right explainLink-N'>全部清除</div>
                                </div>
                            </div>
                            {/* <div className='jurisdiction'>
                                <div className=''>已选权限</div>
                            </div> */}
                        </div>
                        <div>
                            <TreeTransfer dataSource={treeData} targetKeys={targetKeys} targetKeysFunciont={this.targetKeysFunciont} onChange={this.onChange} />
                        </div>
                    </div>
                {/* </Card> */}
                <DoubleBtns
                    preHandle={this.click_1}
                    preText='取消'
                    nextHandle={this.click_2}
                    nextText='创建角色'
                />
            </div>
        );
    }
}