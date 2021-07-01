import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { actionCreators } from '../store';
import { get, Paths } from '../../../../api';
import { DateTool } from '../../../../util/util';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import { Notification } from '../../../../components/Notification';
import PageTitle from '../../../../components/page-title/PageTitle';
import {
    Table,
    Divider,
} from 'antd';

import './style.scss'

class CustomMethod extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            showDeleteDialog: false,
            curApiId: undefined,
            methodName: '',
        }
    }

    componentDidMount = () => {
        this.props.getMethodList({
            pageIndex: 1,
            pageRows: 10,
        });
    };

    onChange = pageNumber => {
        this.props.getMethodList({
            pageIndex: pageNumber,
            pageRows: 10,
        });
    };

    delMethod = (apiId) => {
        get(Paths.delMethod, {
            apiId
        }).then((res) => {
            const code = res.code;
            if (code === 0) {
                Notification({
                    type:'success',
                    description:'删除统计方法成功',
                });
                this.setState((preState) => {
                    return {
                        showDeleteDialog: !preState.showDeleteDialog,
                    }
                }, () => {
                    this.props.getMethodList({
                        pageIndex: 1,
                        pageRows: 10,
                    });
                });
            }
        });
    };

    showDeleteConfirm = (apiId, methodName) => {
        this.setState((preState) => {
            return {
                curApiId: apiId,
                showDeleteDialog: !preState.showDeleteDialog,
                methodName: methodName,
            }
        });
    };

    _getAntDMethodListData = () => {
        let { methodList, pager } = this.props;
        methodList.forEach((item, index) => {
            item.key = item.apiId;
            item.id = (pager.pageIndex - 1) * 10 + index + 1;
        });
        let columns = [{
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        }, {
            title: '统计方法名称',
            dataIndex: 'apiName',
            key: 'apiName',
        }, {
            title: '申请时间',
            dataIndex: 'createDate',
            key: 'createDate',
            render(createDate) {
                return DateTool.utcToDev(createDate);
            }
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render(status) {
                return status === 0 ? '审核中' : (status === 1 ? '审核通过' : '审核拒绝');
            }
        }, {
            title: '操作',
            key: 'opt',
            render: (text, record) => (
                <span>
                    <Link key="detail" to={'/open/bigData/customMethod/detail/' + record.key}>查看</Link>
                    <Divider type="vertical" />
                    <a href="javascript:" onClick={() => this.showDeleteConfirm(record.apiId, record.apiName)}>删除</a>
                </span>
            ),
        }];
        return {
            methodList,
            columns,
        }
    };

    updateOkHandle = () => {
        let { curApiId } = this.state;
        this.delMethod(curApiId);
    };

    updateCancelHandle = () => {
        this.setState((preState) => {
            return {
                showDeleteDialog: !preState.showDeleteDialog,
            }
        });
    };

    addMethod = () => {
        let { history,methodNums ={} } = this.props,
            {MethodNum = 0,MaxMethodNum=0} = methodNums;

        if (MethodNum >= MaxMethodNum) {
            Notification({
                description:'已达到上限值，无法新增！'
            })
            return;
        }

        history.push('/open/bigData/customMethod/add');
    }

    render() {
        let { pager } = this.props;
        let { showDeleteDialog, methodName } = this.state;
        let { methodList, columns } = this._getAntDMethodListData();
        return (
            <div className="method-list-wrapper">
                <PageTitle btnClickHandle={this.addMethod} btnIcon="plus" noback={true} needBtn={true}
                           btnText="新增统计方法" title="自定义统计方法" />
                <div className="method-list-content-wrapper">
                    <div className="method-list-content">
                        <div className="content-title">
                            统计方法列表：
                        </div>
                        <div className="content">
                            <Table
                                dataSource={methodList}
                                columns={columns}
                                pagination={{
                                    onChange: this.onChange,
                                    defaultCurrent: 1,
                                    current: pager.pageIndex,
                                    pageSize: 10,
                                    total: pager.totalRows,
                                    showQuickJumper: true,
                                }}
                            />
                        </div>
                    </div>
                </div>
                {showDeleteDialog && <ActionConfirmModal
                    visible={showDeleteDialog}
                    modalOKHandle={() => this.updateOkHandle()}
                    modalCancelHandle={() => this.updateCancelHandle()}
                    targetName={methodName}
                    title='删除统计方法'
                    descText='删除该统计方法可能会导致APP图表无数据'
                    needWarnIcon={true}
                    tipText='请确认是否继续删除?'
                />}}
            </div>
        );
    }
}

const mapState = (state) => ({
    methodList: state.getIn(['customMethod', 'methodList']).toJS(),
    methodNums: state.getIn(['customMethod', 'MethodNums']).toJS(),
    pager: state.getIn(['customMethod', 'pager']).toJS(),
});

const mapDispatch = (dispatch) => {
    return {
        getMethodList(param) {
            const action = actionCreators.getMethodList(param);
            dispatch(action);
            // 请求列表的时候，同时请求最大值和当前值
            dispatch(actionCreators.getMethodNums())
        }
    }
};

export default connect(mapState, mapDispatch)(CustomMethod);
