import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { get, Paths } from '../../../../api';
import { DateTool } from '../../../../util/util';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import { Notification } from '../../../../components/Notification';
import PageTitle from '../../../../components/page-title/PageTitle';
import {
    Table,
    Divider,
} from 'antd';

import './style.scss'

const initPager = {
    pageRows: 10,
    pageIndex: 1,
};

class DataSubscription extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            dataSubscription: {
                list: [],
                pager: {},
            },
            showActionDialog: false,
            curSubscriptionId: '',
            dialogType:''
        }
    }

    componentDidMount = () => {
        this._getDataSubscriptionList(initPager);
    };

    onChange = pageNumber => {
        this._getDataSubscriptionList({
            ...initPager,
            pageIndex: pageNumber,
        });
    };

    showActionConfirm = (key,type) => {
        this.setState((preState) => {
            return {
                showActionDialog: !preState.showActionDialog,
                curSubscriptionId: key,
                dialogType: type
            };
        });
    };

    updateOkHandle = () => {
        let { curSubscriptionId,dialogType } = this.state;
        this._SubscriptionAction(curSubscriptionId,dialogType);
    };

    updateCancelHandle = () => {
        this.setState((preState) => {
            return {
                showActionDialog: !preState.showActionDialog,
                dialogType:''
            };
        });
    };

    _getDataSubscriptionList = (pager, loading = true) => {
        get(Paths.getDataSubscriptionList, {
            ...pager,
            version: '1.1',
        }, { loading }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { dataSubscription: data };
                });
            }
        });
    };

    _SubscriptionAction = (key,type) => {
        get(type === 'stop' ? Paths.stopCurSubscription : Paths.enabledCurSubscription, {
            urlConfId: Number(key),
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                this.setState((preState) => {
                    return {
                        showActionDialog: !preState.showActionDialog,
                        dialogType:''
                    };
                }, () => {
                    Notification({
                        type:'success',
                        description: type === 'stop' ? '????????????????????????' : '????????????????????????',
                    });
                    this._getDataSubscriptionList(initPager, false);
                });
            }
        });
    };

    _getAntDDataSubscriptionListData = () => {
        let { dataSubscription } = this.state;
        let dataSubscriptionList = dataSubscription.list;
        dataSubscriptionList.forEach((item, index) => {
            item.key = item.urlConfId;
        });
        let columns = [{
            title: '??????ID',
            dataIndex: 'urlConfId',
            key: 'urlConfId',
        }, {
            title: '????????????',
            dataIndex: 'pushWay',
            key: 'pushWay',
            render(pushWay) {
                return {"0":"API??????PUSH??????","1":"MQTT????????????"}[pushWay] || "--";
                // return pushWay === 0 ? 'API??????PUSH??????' : 'MQTT????????????';
            }
        }, {
            title: '??????????????????',
            dataIndex: 'createTime',
            key: 'createTime',
            render(createTime) {
                return DateTool.utcToDev(createTime);
            }
        },{
            title: '??????????????????',
            dataIndex: 'updateTime',
            key: 'updateTime',
            render(updateTime) {
                return DateTool.utcToDev(updateTime);
            }
        }, {
            title: '??????',
            dataIndex: 'pushState',
            key: 'pushState',
            render(pushState) {
                let pushStateStyle = {
                    color: '#FF2E00',
                    marginRight: '10px'
                };
                let pushStateText = '??????';
                if (pushState === 0) {
                    pushStateStyle.color = '#FF2E00';
                    pushStateText = '??????'
                } else if (pushState === 1){
                    pushStateStyle.color = '#00B72E';
                    pushStateText = '??????';
                } else {
                    pushStateStyle.color = '#FF2E00';
                    pushStateText = '??????';
                }
                return (
                    <div>
                        <span style={pushStateStyle}>???</span>
                        <span>{pushStateText}</span>
                    </div>
                )
            }
        }, {
            title: '??????',
            key: 'opt',
            render: (text, record) => (
                <span>
                    <Link key="detail" to={'/open/bigData/dataSubscription/detail/' + record.key}>??????</Link>
                    <Divider type="vertical" />
                    <a href="javascript:" onClick={() => this.editSubscription(record.key)}>??????</a>
                    <Divider type="vertical" />
                    <a href="javascript:" onClick={() => this.showActionConfirm(record.key, record.pushState !== 0 ? 'stop' : 'start')}>{ record.pushState !== 0 ?'??????':'??????'}</a>
                </span>
            ),
        }];
        return {
            dataSubscriptionList,
            columns,
        }
    };

    editSubscription = (key) => {
        let { history } = this.props;

        get(Paths.getCurSubscription, {
            urlConfId: Number(key),
            version: '1.1',
        }, { loading: true }).then((res) => {
            const {code,data} = res;
            if (code === REQUEST_SUCCESS) {
                const {urlConfId,productId,productName,deviceLabelIds} = data

                history.push({
                    pathname:'/open/bigData/dataSubscription/edit/' + urlConfId,
                    state:{
                        urlConfId,
                        productId:{
                            dirty: false,
                            errors: undefined,
                            name: "productId",
                            touched: true,
                            validating: false,
                            value:{
                                key: productId,
                                label: productName,
                            }
                        },
                        labelOrDevice:{
                            dirty: false,
                            errors: undefined,
                            name: "labelOrDevice",
                            touched: true,
                            validating: false,
                            value: deviceLabelIds ? 0 : 1
                        },
                        deviceLabelIds
                    }
                });
            }
        });
    }

    addSubscription = () => {
        let { history } = this.props,
            { dataSubscription } = this.state,
            { devicePushConfMaxNum , currentNum} = dataSubscription;

        if (currentNum >= devicePushConfMaxNum) {
            Notification({
                description:`??????????????????${devicePushConfMaxNum}?????????`
            })

            return;
        }

        history.push({
            pathname:'/open/bigData/dataSubscription/add'
        });
    }

    render() {
        let { dataSubscription, showActionDialog, curSubscriptionId,dialogType } = this.state;
        let pager = dataSubscription.pager;
        let { dataSubscriptionList, columns } = this._getAntDDataSubscriptionListData();
        return (
            <div className="subscription-list-wrapper flex-column">
                <PageTitle btnClickHandle={this.addSubscription} noback={true} needBtn={true}
                           btnText="????????????" title="????????????" />
                <div className="subscription-list-content-wrapper flex1">
                    <div className="subscription-list-content">
                        <Table
                            className="content"
                            dataSource={dataSubscriptionList}
                            columns={columns}
                            pagination={{
                                onChange: this.onChange,
                                defaultCurrent: 1,
                                current: pager.pageIndex,
                                pageSize: pager.pageRows,
                                total: pager.totalRows,
                                showQuickJumper: true,
                            }}
                        />
                    </div>
                </div>
                {showActionDialog && <ActionConfirmModal
                    visible={showActionDialog}
                    modalOKHandle={() => this.updateOkHandle()}
                    modalCancelHandle={() => this.updateCancelHandle()}
                    targetName={curSubscriptionId}
                    title={dialogType === 'stop' ? '??????' : '??????'}
                    descText={`??????${dialogType === 'stop' ? '??????' : '??????'}??????ID`}
                    descGray={true}
                    needWarnIcon={dialogType === 'stop'}
                    tipText={dialogType === 'stop' ? '????????????????????????????????????????????????' : '???????????????????????????????????????????????????????????????'}
                />}
            </div>
        );
    }
}

export default DataSubscription;
