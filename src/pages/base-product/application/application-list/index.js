import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Input, Pagination, Button } from 'antd';
import ApplicationCard from './application-card/ApplicationCard';
import NoSourceWarn from '../../../../components/no-source-warn/NoSourceWarn';
import { CheckPermissions } from '../../../../components/CheckPermissions';
import { get, Paths, post } from '../../../../api';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import PageTitle from '../../../../components/page-title/PageTitle';
import DescWrapper from '../../../../components/desc-wrapper/DescWrapper';
import { Notification } from '../../../../components/Notification';

import './style.scss';

const { Search } = Input;
const initPager = {
    pageRows: 4,
    pageIndex: 1,
};

export default class Application extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            application: {
                list: [],
                pager: {},
            },
            searchValue: '',
            createAppJurisdiction: CheckPermissions('创建应用'),
        }
    }

    componentDidMount = () => {
        this._getApplicationList(initPager);
    };

    onChange = pageNumber => {
        this._getApplicationList({
            ...initPager,
            pageIndex: pageNumber,
            appName: this.state.searchValue,
        });
    };

    searchApplication = (value) => {
        this.setState(() => {
            return { searchValue: value };
        }, () => {
            this._getApplicationList({ ...initPager, appName: value });
        });
    };

    _getApplicationList = (params) => {
        get(Paths.getApplicationList, {
            ...params,
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { application: data };
                });
            }
        });
    };

    deleteApp = (appId) => {
        post(Paths.deleteApp, {
            appId: Number(appId),
        }, { loading: true }).then((res) => {
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                Notification({
                    message:'删除成功',
                    description:'应用删除成功',
                    type:'success'
                });
                
                this._getApplicationList(initPager);
            }
        });
    };

    _getApplicationListHTML = () => {
        let { application } = this.state;
        return application.list && application.list.length > 0 ? application.list.map((item, index) => {
            return (
                <div className="list-item" key={item.appId}>
                    <ApplicationCard deleteApp={this.deleteApp} Info={item} />
                </div>
            );
        }) : <NoSourceWarn style={{margin:'auto'}}/>;
    };

    addNewApplication = () => {
        let { application = {}} = this.state,
            { appMaxNum = 0,currentNum = 0 } = application;

        if (currentNum >= appMaxNum) {
            Notification({
                description:`最多只能创建${appMaxNum}个应用！` 
            })
            return
        }

        window.location.hash = '/open/base/application/add';
    }

    render() {
        let { application, createAppJurisdiction } = this.state;
        let { list, pager } = application;
        let listWrapperClassName = list.length <= 5 ? "lists-wrapper flex-row flex1" : "lists-wrapper flex-row flex1 six-item";
        let desc = (
            <h6>C-Life平台提供完善的应用开发管理服务。您可以构建自主品牌的APP终端应用或小程序应用，您可以在这里对应用进行统一管理。
                {/* &nbsp;&nbsp;<a href="https://opendoc.clife.cn/book/content?documentId=88&identify=develop" target='_blank'>获取开发指导</a>&nbsp;&nbsp; */}
                {/* <a href="https://opendoc.clife.cn/download" target='_blank' >下载SDk</a> */}
            </h6>
        );
        return (
            <section className="application-wrapper flex-column">
                <header className="application-header">
                    <PageTitle noback={true} title="应用管理" />
                    <div className="application-search">
                        <div className="application-header-input-wrapper searchBox">
                            <Search placeholder="请输入应用名称查找"
                                    enterButton
                                    maxLength={100}
                                    onSearch={value => this.searchApplication(value)}
                            />
                        </div>
                        <div className='butFloatRight'>
                            {createAppJurisdiction ?
                                <Button type="primary"
                                        onClick={this.addNewApplication} 
                                        className="application-header-add">创建应用</Button>
                                : null}
                        </div>
                    </div>
                </header>
                <div className="application-content-wrapper flex-column flex1">
                    <div className="application-content flex-column">
                        <DescWrapper
                            desc={["温馨提示：",desc]}
                        />
                        <section className={listWrapperClassName}>
                            {this._getApplicationListHTML()}
                        </section>
                        <footer className="application-list-pagination">
                            {
                                pager && pager.totalRows &&
                                <Pagination
                                    className="self-pa"
                                    total={pager.totalRows}
                                    current={pager.pageIndex}
                                    defaultCurrent={1}
                                    defaultPageSize={pager.pageRows}
                                    onChange={(page) => this.onChange(page)}
                                    pageSize={pager.pageRows}
                                    showTotal={total => <span>共 <a>{total}</a> 条</span>}
                                    showQuickJumper
                                    hideOnSinglePage
                                />
                            }
                        </footer>
                    </div>
                </div>
            </section>
        )
    }
}
