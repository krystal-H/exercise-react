import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { actionCreators } from "../store";
import { Table, Tabs } from "antd";
import PageTitle from '../../../../components/page-title/PageTitle';

import "./style.scss";

const { TabPane } = Tabs;

@withRouter
class DeviceDataApi extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let path = this.props.match.path;
        this.dataApi = path.split("/")[3];
        this._getDimensionList();
        this._getApiList(1);
    }

    _getDimensionList = () => {
        let dimensionType = 1; // 设备数据--数据汇总
        if (this.dataApi === "userDataApi") {
            dimensionType = 4; // 用户数据--数据汇总
        }
        this.props.getDimensionList({
            dimensionType
        });
    }

    _getApiList = (pageNumber) => {
        let dataType = 1; // 设备数据
        if (this.dataApi === "userDataApi") {
            dataType = 2; // 用户数据
        }
        this.props.getApiList({
            status: 2,
            dataType,
            pageRows: 10,
            pageIndex: pageNumber,
        });
    };

    callback = key => {
        this.props.getDimensionList({
            dimensionType: key
        });
    };

    onChange = pageNumber => {
        this._getApiList(pageNumber);
    };

    _getDataDimensionHTML = () => {
        const { curDataDimension } = this.props;
        const { dataDimension, dataIndex } = curDataDimension || {};
        let dataDimensionHTML =
            dataDimension && dataDimension.length > 0 ?
                dataDimension.map((item, index) => {
                    let { dimensionName, dimensionDesc } = item;
                    let borderBottom = {};
                    //  需要给最后一个奇数li下边框
                    if (dataDimension.length % 2 !== 0 && index === dataDimension.length - 2) {
                        borderBottom = { borderBottom: '1px solid rgba(233, 233, 233, 1)' };
                    }
                    return (
                        <li key={index} style={borderBottom}>
                            <span className="key">{dimensionName}：</span>
                            <span className="value" title={dimensionDesc}>{dimensionDesc}</span>
                        </li>
                    );
                }) :
                <li>
                    <span className="key">暂无数据</span>
                </li>
        let dataIndexHTML =
            dataIndex && dataIndex.length > 0 ?
                dataIndex.map((item, index) => {
                    let { indexName, indexDesc } = item;
                    let borderBottom = {};
                    //  需要给最后一个奇数li下边框
                    if (dataIndex.length % 2 !== 0 && index === dataIndex.length - 2) {
                        borderBottom = { borderBottom: '1px solid rgba(233, 233, 233, 1)' };
                    }
                    return (
                        <li key={index} style={borderBottom}>
                            <span className="key">{indexName}：</span>
                            <span className="value" title={indexDesc}>{indexDesc}</span>
                        </li>
                    );
                }) :
                <li>
                    <span className="key">暂无数据</span>
                </li>
        return { dataDimensionHTML, dataIndexHTML };
    };

    _getAntDApiListData = () => {
        let { apiList } = this.props;
        apiList.forEach(item => {
            item.key = item.releaseId;
        });
        let columns = [
            {
                title: "方法",
                dataIndex: "requestType",
                key: "requestType"
            },
            {
                title: "URL",
                dataIndex: "apiUrl",
                key: "apiUrl"
            },
            {
                title: "描述",
                dataIndex: "apiDesc",
                key: "apiDesc"
            },
            {
                title: "版本",
                dataIndex: "releaseVersion",
                key: "releaseVersion"
            },
            {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render(status) {
                    return status === 1 ? "未发布" : "已发布";
                }
            },
            {
                title: "详情",
                key: "detail",
                render: (text, record) => <a href="javascript:">查看说明</a>
            }
        ];
        return {
            apiList,
            columns
        };
    };

    _getTabPaneHTML = () => {
        let { dataDimensionHTML, dataIndexHTML } = this._getDataDimensionHTML();
        return ["数据汇总", "分析类", "基础数据"].map((item, index) => {
            let key = this.dataApi === "deviceDataApi" ? index + 1 : index + 4;
            return (
                <TabPane tab={item} key={key}>
                    <div className="data-wrapper">
                        <div className="data-dimension">
                            <header>数据维度</header>
                            <ul className="clearfix">{dataDimensionHTML}</ul>
                        </div>
                        <div className="data-index">
                            <header>数据指标</header>
                            <ul className="clearfix">{dataIndexHTML}</ul>
                        </div>
                    </div>
                </TabPane>
            );
        });
    };

    render() {
        const { pager } = this.props;
        let { apiList, columns } = this._getAntDApiListData();
        let TabPaneHTML = this._getTabPaneHTML();
        let defaultActiveKey = this.dataApi === "deviceDataApi" ? "1" : "4";
        let title = this.dataApi === "deviceDataApi" ? "设备数据" : "用户数据";
        return (
            <div className="device-data-api-list-wrapper">
                <PageTitle noback={true} title={title} />
                <div className="data-api-content-wrapper">
                    <div className="data-content">
                        <Tabs
                            defaultActiveKey={defaultActiveKey}
                            tabBarStyle={{ paddingLeft: "32px" }}
                            onChange={this.callback}
                        >
                            {TabPaneHTML}
                        </Tabs>
                    </div>
                    <div className="api-list-content">
                        <header>API</header>
                        <div className="api-table-wrapper">
                            <Table
                                dataSource={apiList}
                                columns={columns}
                                pagination={{
                                    onChange: this.onChange,
                                    defaultCurrent: 1,
                                    pageSize: 10,
                                    total: pager.totalRows,
                                    showQuickJumper: true
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapState = state => ({
    curDataDimension: state.getIn(["deviceDataApi", "curDataDimension"]).toJS(),
    apiList: state.getIn(["deviceDataApi", "apiList"]).toJS(),
    pager: state.getIn(["deviceDataApi", "pager"]).toJS()
});

const mapDispatch = dispatch => {
    return {
        getDimensionList(param) {
            const action = actionCreators.getDimensionList(param);
            dispatch(action);
        },
        getApiList(param) {
            const action = actionCreators.getApiList(param);
            dispatch(action);
        }
    };
};

export default connect(
    mapState,
    mapDispatch
)(DeviceDataApi);
