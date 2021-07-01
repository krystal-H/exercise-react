import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Table, Tag, Card, Divider, Popconfirm } from 'antd';
import moment from 'moment';
import {get, Paths} from '../../../api';
import './roleManagement.scss';
import { deleteRole } from '../store/ActionCreator';
import { DateTool } from '../../../util/util';
import { Notification } from './../../../components/Notification';


const mapStateToProps = state => {
    return {
        // optionsList: state.getIn(['product','optionsList']).toJS(),
    }
}
const mapDispatchToProps = dispatch => {
    return {
        // getCatalogList: () => dispatch(getCatalogListAction()),
        deleteRole: (roleId) => dispatch(deleteRole(roleId))
    }
}
@connect(mapStateToProps, mapDispatchToProps)
// class addProduct extends Component{
export default class RoleManagementList extends Component {
    constructor(props){
        super(props);
        this.state = {
            versionList:[],
            loading:true,
            roleList:[],
            pager:{},
        };
        this.columns = [
            { title: '角色名', dataIndex: 'roleName', key: 'roleName' },
            { title: '备注', dataIndex: 'remark', key: 'remark' },
            { title: '访问方式',key: 'userCategory',dataIndex: 'userCategory',
              render: userCategory => (
                <span>
                  <Tag color={userCategory ==1 ? 'blue' :'green'} >{userCategory ==1 ? '控制台访问用户' :'接口访问用户'}</Tag>
                </span>
              ),
            },
            { title: '最新修改时间', dataIndex: 'modifyTime', key: 'modifyTime', render: text => <span>{DateTool.utcToDev(text)}</span> },
            { title: '操作', key: 'tags', dataIndex: 'tags',
             render:(text, record) => (
                    <span>
                        <a onClick={this.editRole.bind(this,record.roleId,record.roleName,record.remark,record.userCategory)}>编辑</a>
                        <Divider type="vertical" />
                        <Popconfirm 
                            title="你确定要删除该角色吗？"
                            onConfirm={this.deleteRole.bind(this,record.roleId)}
                            okText="是"
                            cancelText="否"
                            placement="topRight"
                        >
                            <a>删除</a>
                        </Popconfirm>
                    </span>
                ),
            },
        ];
        this.pagerIndex = this.pagerIndex.bind(this);
        this.addRole = this.addRole.bind(this);
    }
    //获取角色列表
    getList = (data={}) => {
        get(Paths.getRolePage,data).then((res) => {
            this.setState({
                roleList:res.data.list,
                pager:res.data.pager,
                loading:false,
            });
        });
    }
    componentDidMount() {
        this.getList({pageIndex:1,pageRows:10});
    }
    deleteRole = (roleId) => {
        let pager = this.state.pager,
            { totalRows, pageIndex } = pager;
            pageIndex = (totalRows % ((pageIndex-1)*10))>1?pageIndex:pageIndex-1;
       
        this.props.deleteRole(roleId).then((res) => {
            if(res){
				Notification({type:'success',description:'删除用户角色成功！'});
                this.setState({loading: true});
                this.getList({pageIndex,pageRows:10});
            }
        })
    }
    //查询
    searchProduct = (value = '') => {
        value = value.trim();//去除头尾空格
        this.setState({loading:true},()=>{
            this.getList({pageIndex:1,pageRows:10,roleName:value});
        });
    }
    //添加用户跳转
    addRole(){
        this.props.history.push({
            pathname: '/userCenter/add',
        });
    }
    //编辑
    editRole = (roleId,roleName,remark,userCategory) => {
        roleName =encodeURI(roleName);
        remark = encodeURI(remark);
        window.location.hash = `#/userCenter/add?roleId=${roleId}&roleName=${roleName}&remark=${remark}&userCategory=${userCategory}`;
        // this.props.history.push({
        //     pathname: '/userCenter/add',
        //     state:{
        //         roleId,
        //         roleName,
        //         remark,
        //         userCategory
        //     },
        // });
    }
    pagerIndex(pageIndex){
        this.setState({loading:true},()=>{
            this.getList({pageIndex,pageRows:10});
        });
    }
    render() {
        let { loading, roleList, pager } = this.state;
        return (
            <div className='role-management'>
                <header className="page-content-header">
                    <h3 className="page-name">用户角色</h3>
                    <div>
                        <div className="searchBox">
                            <Input.Search placeholder="请输入用户角色名查找" maxLength={20} onSearch={value => this.searchProduct(value)} enterButton />
                        </div>
                        <div className='butFloatRight'>
                            <Button type="primary" onClick={this.addRole}>创建用户角色</Button>
                        </div>
                    </div>
                </header>
                <Card>
                    <Table 
                        rowKey='roleId'
                        columns={this.columns} 
                        dataSource={roleList} 
                        pagination={{
                            defaultCurrent:pager.pageIndex, 
                            total:pager.totalRows, 
                            current: pager.pageIndex,
                            hideOnSinglePage:false,
                            onChange:this.pagerIndex
                        }}
                        loading={loading}
                    />
                </Card>
            </div>
        );
    }
}