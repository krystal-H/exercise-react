import React, { PureComponent } from 'react';
import { Pagination, Tabs, Icon, Button, Row, Col, Table } from 'antd';
import ActionConfirmModal from '../../../../components/action-confirm-modal/ActionConfirmModal';
import { Notification } from '../../../../components/Notification';
import ProductIcon from '../../../../components/product-components/product-icon/ProductIcon';
import DetailInHeader from '../../../../components/detail-in-header';
import PageTitle from '../../../../components/page-title/PageTitle';
import { strToAsterisk, DateTool } from '../../../../util/util';
import AddProductRelationModal from './AddProductRelationModal';
import _ from 'lodash';
import { get, Paths, post } from '../../../../api';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import { AddAppVersionForm } from "./AddAppVersion";
import NoSourceWarn from '../../../../components/no-source-warn/NoSourceWarn';
import { CheckPermissions } from '../../../../components/CheckPermissions';
import MyIcon from '../../../../components/my-icon/MyIcon';
import { EditApplicationForm } from './form/editApplicationForm';

import './style.scss';

const { TabPane } = Tabs;
const initPager = {
    pageRows: 10,
    pageIndex: 1,
};
const texts = [{
    title: '删除应用',
    desc: '应用删除后将无法继续APPID。即将删除应用',
    tip: '应用删除操作不可恢复。是否确认删除?',
    targetName: '我的app',
}, {
    title: '删除产品关联',
    desc: '即将删除产品关联',
    tip: '是否确认删除?',
    targetName: '宝莱特血压计',
}, {
    title: '删除应用版本',
    desc: '删除后用户将无法再获取到该版本升级，已升级用户不受影响。即将删除应用版本',
    tip: '是否确认删除?',
    targetName: 'V1.1.3',
}];

export default class ApplicationDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            appId: this.props.match.params.appId,
            showDeleteDialog: false,
            showAddProductRelationDialog: false,
            showAppVersionDialog: false,
            showApplicationDialog: false,
            curProductID: null,
            curAppVersionId: null,
            currentTab: 1,
            currentAppType: 1,
            curAppVersionDetail: {},
            appInfo: {
                appId: { value: '' },
                appName: { value: '' },
                appSecret: { value: '' },
                createTime: { value: '' },
                appType: { value: '' },
                appMode: { value: '' },
                iosBundleId: { value: '' },
                appDesc: { value: '' },
                weChatAppId: { value: '' },
                secret: { value: '' },
                androidPkg: { value: '' },
                appIconLow: { value: '' },
                appVersionType: { value: '' }
            },
            showSecret: false,
            relationProductList: { listAndroid: [], listIos: [] }, // 已关联的产品列表
            versionList: { list: [], pager: {} }, // 版本列表
            relationProductJurisdiction: CheckPermissions('关联产品'),
            versionPublishJurisdiction: CheckPermissions('发布版本'),
            showEditAppForm: true,
            relationedProductIds:{}
        }
    }

    componentDidMount = () => {
        let { appId } = this.state;
        this._getAppInfo(appId);
    };

    handleChange = (type, activeKey) => {
        this.setState(() => {
            return { [type]: activeKey };
        });
    };

    onChange = pageNumber => {
        this._getVersionList({
            pageIndex: pageNumber,
            pageRows: 5,
        });
    };

    _getVersionList = (param) => {
        let { appId } = this.state;
        get(Paths.getVersionList, {
            appId,
            ...param,
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                if ('{}' !== JSON.stringify(data)) {
                    this.setState(() => {
                        return { versionList: data };
                    });
                }
            }
        });
    };

    createAppVersion = (params) => {
        let { appId } = this.state;
        post(Paths.createAppVersion, {
            ...params,
            appType: Number(params.appType),
            status: Number(params.status),
            appId: Number(appId),
            mainVersion: Number(params.mainVersion),
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                Notification({
                    message:'创建成功',
                    description:'创建应用版本成功',
                    type:'success'
                });
                this.setState((preState) => {
                    let { showAppVersionDialog } = preState;
                    return { showAppVersionDialog: !showAppVersionDialog };
                }, () => {
                    this._getVersionList({
                        ...initPager,
                        pageRows: 5,
                    });
                });
            }
        });
    };

    saveAppInfo = (params) => {
        let { appId, appInfo } = this.state;
        let appType = appInfo.appType.value;
        params = { ...params, appMode: 1, appId };
        let url = appType === 0 ? 'saveAppBaseInfo' : 'saveMiniProgramsInfo';
        let app = appType === 0 ? '移动应用编辑成功' : '小程序应用编辑成功';
        if (appType === 2) {
            params = { ...params, weChatAppId: appInfo.weChatAppId.value, secret: appInfo.secret.value }
        }
        post(Paths[url], {
            ...params
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                Notification({
                    description:app,
                    type:'warn'
                });
                this.setState((preState) => {
                    let { showEditAppForm } = preState;
                    return { showEditAppForm: !showEditAppForm };
                }, () => {
                    let { appId } = this.state;
                    this._getAppInfo(appId);
                });
            }
        });
    };

    _getRelaProducts = (appId) => {
        get(Paths.getRelaProducts, {
            appId,
            version: '1.1',
            paged: false,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                // 将接口数据格式化成state需要的格式，ps：后端不要改返回的格式啊，好烦
                let relationProductList = {
                    listAndroid: [],
                    listIos: [],
                },
                relationedProductIds = {android:[],ios:[]};

                data.list && data.list.length > 0 && data.list.forEach((item) => {
                    let { appVersionType,productId } = item;
                    if (appVersionType === 1) {
                        relationProductList.listAndroid.push(item);
                        relationedProductIds.android.push(productId)
                    } else if (appVersionType === 2) {
                        relationProductList.listIos.push(item);
                        relationedProductIds.ios.push(productId)
                    } else {
                        relationProductList.listAndroid.push(item);
                        relationProductList.listIos.push(item);
                        relationedProductIds.ios.push(productId)
                        relationedProductIds.android.push(productId)
                    }
                });
                this.setState(() => {
                    return { relationProductList,relationedProductIds };
                });
            }
        });
    };

    _getAppInfo = (appId) => {
        get(Paths.getAppInfo, {
            appId,
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                // 将appInfo构造成antd需要的格式
                let antdAppInfo = {};
                let appInfo = _.cloneDeep(data);
                texts[2].targetName = appInfo.appName;
                for (let key of Object.keys(appInfo)) {
                    antdAppInfo[key] = {
                        value: appInfo[key],
                    }
                }
                let { androidPkg, iosBundleId, appType } = appInfo;
                this.setState((preState) => {
                    return {
                        appInfo: { ...preState.appInfo, ...antdAppInfo },
                        currentAppType: !androidPkg && iosBundleId ? 2 : 1,
                    };
                });
                if (appType === 0|| appType === 2) {
                    this._getRelaProducts(appId);
                    this._getVersionList({
                        ...initPager,
                        pageRows: 5,
                    });
                }
            }
        });
    };

    updateOkHandle = (type) => {
        let { curProductID, curAppVersionId } = this.state;
        if (type === 'relationProduct') {
            this.deleteRelationProduct(curProductID);
        } else if (type === 'appVersion') {
            this.deleteAppVersion(curAppVersionId);
        } else {
            this.deleteApp();
        }
    };

    updateCancelHandle = (type) => {
        this.changeState(type);
    };

    showDialog = (dialogType, curIdType, id, targetType, targetTypeValue) => {
        if (targetType === 'targetName') {
            texts[0].targetName = targetTypeValue;
        }
        if (targetType === 'versionTargetName') {
            texts[1].targetName = targetTypeValue;
        }
        this.setState((preState) => {
            if (curIdType || id) {
                return {
                    [dialogType]: !preState[dialogType],
                    [curIdType]: id
                };
            }
            return {
                [dialogType]: !preState[dialogType],
            };
        });
    };

    deleteRelationProduct = (productId) => {
        post(Paths.deleteRelationProduct, {
            productId,
            appId: Number(this.state.appId),
            appType: Number(this.state.currentAppType),
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                this.setState((preState) => {
                    return { showDeleteDialog: !preState.showDeleteDialog };
                }, () => {
                    this._getRelaProducts(this.state.appId)
                });
            }
        });
    };

    deleteAppVersion = (appVersionId) => {
        post(Paths.deleteAppVersion, {
            appVersionId,
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                this.setState((preState) => {
                    return { showDeleteDialog: !preState.showDeleteDialog };
                }, () => {
                    this._getVersionList({
                        ...initPager,
                        pageRows: 5,
                    });
                });
            }
        });
    };

    updateRelaProduct = (productIds) => {
        let { appId, currentAppType, relationProductList } = this.state;
        let relationProductListType = currentAppType === 1 ? relationProductList.listAndroid : relationProductList.listIos;
        // let list = relationProductListType.map(item => item.productId);
        post(Paths.updateRelaProduct, {
            productIds: [ ...productIds].join(','),
            appId: Number(appId),
            appVersionType: Number(currentAppType),
        }, { loading: true, needJson: true,noInstance:true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                this.setState((preState) => {
                    return { showAddProductRelationDialog: !preState.showAddProductRelationDialog };
                }, () => {
                    Notification({
                        message:'关联成功',
                        description:'产品关联成功',
                        type:'success'
                    });
                    this._getRelaProducts(appId);
                });
            }
        });
    };

    changeState = (type) => {
        this.setState((preState) => {
            return {
                [type]: !preState[type],
            };
        });
    };

    getAppVersionDetail = (curAppVersionId) => {
        get(Paths.getAppVersionDetail, {
            id: curAppVersionId,
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return {
                        curAppVersionDetail: data,
                    };
                }, () => {
                    this.showDialog('showAppVersionDialog', 'curAppVersionId', curAppVersionId)
                });
            }
        });
    };

    _getAppTypeHTML = () => {
        let { appInfo, currentAppType } = this.state;
        let { androidPkg, iosBundleId, appType } = appInfo;
        let appTypeAndroidHTML = '';
        let appTypeIosHTML = '';
        let weChatHTML = '';
        if (appType.value === 0) {
            appTypeAndroidHTML = (
                <Button onClick={() => this.handleChange('currentAppType', 1)}
                        type={currentAppType === 1 ? 'primary' : 'default'}
                        ghost={currentAppType === 1}
                >Android端</Button>
            )
        

            appTypeIosHTML = (
                <Button onClick={() => this.handleChange('currentAppType', 2)}
                        type={currentAppType === 2 ? 'primary' : 'default'}
                        ghost={currentAppType === 2}
                >iOS端</Button>
            )
            
        } else {
            weChatHTML = (
                <Button type={'primary'}
                        ghost
                >小程序</Button>
            );
        }
        return { appTypeAndroidHTML, appTypeIosHTML, weChatHTML }
    };

    addNewVersion = () => {
        let { versionList } = this.state,
            {appVersionMaxNum = 0 , currentNum = 0} = versionList;

        if (currentNum >= appVersionMaxNum) {
            Notification({
                description:`最多只能创建${appVersionMaxNum}个应用版本`
            })
            return;
        }

        this.showDialog('showAppVersionDialog', 'curAppVersionDetail', {})
    }

    getAntDVersionList = () => {
        let { versionList } = this.state;
        let antDVersionList = versionList.list.slice();
        antDVersionList.forEach((item, index) => {
            item.key = item.appVersionId;
        });
        let columns = [{
            title: '版本号',
            dataIndex: 'externalVersion',
            key: 'externalVersion',
        }, {
            title: '版本序列标志',
            dataIndex: 'appSign',
            key: 'appSign',
        }, {
            title: '版本类型',
            dataIndex: 'appType',
            key: 'appType',
            render: (appType) => {
                return (
                    <div className="version-type">
                        {Number(appType) === 1 ? 'Android' : 'iOS'}
                    </div>
                )
            }
        }, {
            title: '升级方式',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                return (
                    <div className="upgrade">{Number(status) === 1 ? '普通升级' : '强制升级'}</div>
                )
            }
        }, {
            title: '创建时间',
            dataIndex: 'releaseTime',
            key: 'releaseTime',
            render(releaseTime) {
                return releaseTime ? DateTool.utcToDev(releaseTime) : '--';
            }
        }, {
            title: '操作',
            dataIndex: 'opt',
            key: 'opt',
            render: (text, record) => {
                return (
                    <div>
                        <a href="javascript:"
                           onClick={() => this.getAppVersionDetail(record.appVersionId)}
                        >编辑</a>
                        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                        <a href="javascript:"
                           onClick={() => this.showDialog('showDeleteDialog', 'curAppVersionId', record.appVersionId, 'versionTargetName', record.appName)}
                        >删除</a>
                    </div>
                )
            }
        }];
        return {
            antDVersionList,
            columns,
        }
    };

    render() {
        let {
            showDeleteDialog, versionPublishJurisdiction, relationProductJurisdiction, versionList,
            showAppVersionDialog, showAddProductRelationDialog, currentAppType, showSecret,
            appInfo, relationProductList, showEditAppForm
        } = this.state;
        let {
            appId, appName, appSecret, appType, iosBundleId, androidPkg, appDesc,
            androidSchema, iosSchema, appIconLow, appVersionType
        } = appInfo;
        let currentTab = Number(this.state.currentTab);
        let deleteType = currentTab === 1 ? 'relationProduct' : 'appVersion';
        let showSecretType = showSecret ? 'eye-invisible' : 'eye';
        let appSecretText = showSecret ? appSecret.value : strToAsterisk(appSecret.value, 10);
        let relationProductListType = currentAppType === 1 ? relationProductList.listAndroid : relationProductList.listIos;
        let { pager } = versionList;
        let appTypeHTML = this._getAppTypeHTML();
        // let addBtn = true;
        // if (appVersionType.value) {
        //     addBtn = false;
        // }
        const { antDVersionList, columns } = this.getAntDVersionList();
        return (
            <section className="application-detail-wrapper flex-column">
                <header className="application-detail-header">
                    <PageTitle noback={true} title="应用详情" />
                    <DetailInHeader className="clearfix">
                        <span className="fl app-name">应用名称：{appName.value}</span>
                        <span className="fl app-id">APPID：{appId.value}</span>
                        <span className="fl app-secret">
                            APPSecret：{appSecretText}
                            <Icon type={showSecretType} className="icon-display" style={{ fontSize: '18px' }}
                                  theme="twoTone"
                                  twoToneColor="#2874FF" onClick={() => this.changeState('showSecret')} />
                        </span>
                    </DetailInHeader>
                </header>
                <div className="antd-content flex-column flex1">
                    <Tabs defaultActiveKey="0" onChange={(activeKey) => this.handleChange('currentTab', activeKey)}
                          tabBarStyle={{ background: "#fff", padding: "0 24px" }}>
                        <TabPane tab="基础信息" key="0">
                            {showEditAppForm ? <div className="application-detail-content flex1">
                                <Button type="primary" className="edit-app"
                                        onClick={() => this.changeState('showEditAppForm')}>
                                    编辑应用
                                </Button>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        应用名称：
                                    </Col>
                                    <Col span={10} className="detail-right">
                                        {appName.value}
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line app-icon">
                                    <Col span={2} className="detail-left">
                                        应用图标：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        <ProductIcon icon={appIconLow.value} />
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        应用类型：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        {appType.value === 0 ? '移动应用' : '小程序应用'}
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line app-package">
                                    <Col span={2} className="detail-left">
                                        应用包：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        <div className="android clearfix">
                                            {androidPkg.value && <div className="android-package fl">
                                                {androidPkg.value} - Android版
                                            </div>}
                                            {androidSchema && androidSchema.value && <div className="android-schema fl">
                                                分享Schema为 ：{androidSchema && androidSchema.value}
                                            </div>}
                                        </div>
                                        <div className="ios clearfix">
                                            {iosBundleId.value && <div className="ios-package fl">
                                                {iosBundleId.value} - iOS版
                                            </div>}
                                            {iosSchema && iosSchema.value && <div className="ios-schema fl">
                                                分享Schema为 ：{iosSchema && iosSchema.value}
                                            </div>}
                                        </div>
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        APPID：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        {appId.value}
                                        <span className="appId-desc">由系统自动分配的APP唯一标识码</span>
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        APPSecret：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        {appSecretText}
                                        <Icon type={showSecretType} className="icon-display"
                                              style={{ fontSize: '18px' }}
                                              theme="twoTone"
                                              twoToneColor="#2874FF" onClick={() => this.changeState('showSecret')} />
                                        <span className="secret-desc">由系统自动分配的密码</span>
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        构建模式：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        开发模式
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={2} className="detail-left">
                                        应用简介：
                                    </Col>
                                    <Col span={21} className="detail-right">
                                        {appDesc.value}
                                    </Col>
                                </Row>
                            </div> :
                                <div className="application-detail-content">
                                    <EditApplicationForm
                                        appInfo={appInfo}
                                        saveAppBaseInfo={this.saveAppInfo}
                                        handleCancel={this.changeState}
                                    />
                                </div>}
                        </TabPane>
                        {relationProductJurisdiction ?
                            <TabPane tab="关联产品" key="1">
                                <div className="application-detail-content flex-column flex1">
                                    <div className="content flex-column clearfix">
                                        <div className="content-header">
                                            <div className="app-type">
                                                {appTypeHTML.appTypeAndroidHTML}
                                                {appTypeHTML.appTypeIosHTML}
                                                {appTypeHTML.weChatHTML}
                                            </div>
                                            <Button type="primary" className="add-relation"
                                                    // disabled={addBtn}
                                                    onClick={() => this.showDialog('showAddProductRelationDialog')}>添加</Button>
                                        </div>
                                        {(true) ?
                                            <ul className={`product-list flex1`}>
                                                {(relationProductListType && relationProductListType.length > 0 )? relationProductListType.map((item, index) => {
                                                    let { productId, productName, productIcon } = item;
                                                    return <li key={index} className="list-item flex-column">
                                                        <i className="product-pic">
                                                            <ProductIcon icon={productIcon} />
                                                        </i>
                                                        <div className="product-name single-text flex1 flex-row">
                                                            {productName}
                                                        </div>
                                                        <div className="product-id flex-row flex1">
                                                            {productId}
                                                        </div>
                                                        <a href="javascript:"
                                                           onClick={() => this.showDialog('showDeleteDialog', 'curProductID', productId, 'targetName', productName)}
                                                           className="delete-product-relation">
                                                            <MyIcon style={{ fontSize: 20 }} type="icon-shanchu" />
                                                        </a>
                                                    </li>
                                                }) : <NoSourceWarn />}
                                            </ul> : <NoSourceWarn />}
                                    </div>
                                </div>
                            </TabPane> : null}
                        {versionPublishJurisdiction && appType.value == 0 ?
                            <TabPane tab="版本发布" key="2">
                                <div className="application-detail-content flex-column flex1">
                                    {
                                        // (appVersionType.value) ? 
                                        <div className="add-version-wrapper">
                                            <h5>版本历史</h5>
                                            <Button className="add-version" type="primary"
                                                    onClick={this.addNewVersion}>
                                                创建应用版本</Button>
                                        </div> 
                                        // : <div className="add-version-wrapper">
                                        //     <h5>版本历史</h5>
                                        //     <Button className="add-version" type="primary" disabled>
                                        //         创建应用版本</Button>
                                        // </div>
                                    }
                                    <Table
                                        className="version-content"
                                        dataSource={antDVersionList}
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
                            </TabPane>
                            : null}
                    </Tabs>
                </div>
                {showDeleteDialog && <ActionConfirmModal
                    visible={showDeleteDialog}
                    modalOKHandle={() => this.updateOkHandle(deleteType)}
                    modalCancelHandle={() => this.updateCancelHandle('showDeleteDialog')}
                    targetName={texts[currentTab].targetName}
                    title={texts[currentTab].title}
                    descText={texts[currentTab].desc}
                    needWarnIcon={true}
                    tipText={texts[currentTab].tip}
                />}
                {showAddProductRelationDialog && <AddProductRelationModal
                    {...this.state}
                    showDialog={this.showDialog}
                    updateRelaProduct={this.updateRelaProduct}
                />}
                {showAppVersionDialog && <AddAppVersionForm
                    {...this.state}
                    showDialog={this.showDialog}
                    createAppVersion={this.createAppVersion}
                />}
            </section>
        )
    }
}
