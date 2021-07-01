import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Badge, Card, Icon, Tooltip, Alert, Table } from "antd";
import {
    getDataByShadow,
    getHistoryDataByShadow,
    _download,
} from "../store/ActionCreatorForShadow";
import Crash from "../../../../../components/Crash";
import CodeMirrorView from "../../../../../components/CodeMirrorView";
import DeviceShadowHistoryModal from "./DeviceShadowHistoryModal";
import { Notification } from "../../../../../components/Notification";
import moment from "moment";
import "./deviceShadow.scss";
import "codemirror/lib/codemirror.css";

const mapStateToProps = (state) => {
    return {};
};
const mapDispatchToProps = (dispatch) => {
    return {};
};

let lcpId = 0;
const tabs = ["表单模式", "Json模式"];
const maps = {
    "2": "controlList",
    "3": "runList",
    "4": "errorList",
    "5": "configList",
};
const getTips = (type, status) => {
    const s = status ? "已" : "未";
    if (type === 0) {
        return (
            <div className="lcp-c">
                公共状态，仅对WIFI设备有意义。
                <br />
                设备当前{s}连接WIFI网络
            </div>
        );
    }
    return (
        <div className="lcp-c">
            公共状态，设备{status ? "已经" : "没有"}上报故障数据。
            <br />
            设备{s}
            发生故障
        </div>
    );
};
const loadingSign = <Icon type="sync" spin title="加载中" />;
const getNow = () => moment().format("YYYY-MM-DD HH:mm:ss");

@connect(mapStateToProps, mapDispatchToProps)
export default class DeviceShadow extends Component {
    state = {
        tab: 0, // 0-表单模式，1-JSON模式
        time: null, // 最新更新时间
        isLoading: false, // 是否在加载进行中
        isError: false, // 是否接口报错
        result: {}, // 设备影子的返回数据拷贝数据
        controlList: [], // 控制数据
        runList: [], // 运行数据
        errorList: [], // 故障数据
        configList: [], // 配置数据
        online: false, // 在线状态
        onerror: false, // 故障状态

        // showType: 0, // 0-历史数据，1-实时数据
        showModal: false, // 是否显示展示历史数据模态弹窗
        showData: null, // 当前数据详细数据
        isLoadingForModal: false, // 是否在加载进行中
        isErrorForModal: false, // 是否接口报错
        listForModal: [], // 历史记录列表
    };
    alertMsg = (
        <>
            设备影子是设备最新状态在平台的缓存信息，您可以在平台实时查询设备的运行和状态信息，也可以通过API获取设备状态信息。详细说明可参考
            {/* <a href="" target="_blank" rel="noopener">
                文档
            </a> */}
            <Tooltip title="暂无文档，敬请期待~" placement="top">
                <a href="javascript:void(0)">文档</a>
            </Tooltip>
        </>
    );
    columns = [
        { title: "数据名称", dataIndex: "propertyName", key: "propertyName", className:'width1' },
        { title: "数据标识", dataIndex: "property", key: "property",className:'width2' },
        { title: "数据类型", dataIndex: "javaType", key: "javaType",className:'width3' },
        { title: "单位", dataIndex: "unit", key: "unit",className:'width4' },
        { title: "数据属性", dataIndex: "propertyValueDesc", key: "propertyValueDesc",className:'width5'},
        { title: "最新数据", dataIndex: "deviceData", key: "deviceData",className:'width6'},
        { title: "操作", dataIndex: "property", key: "done",className:'width7',
            render: (property, data) => {
                return <a onClick={() => this.showHistory(data)}>数据查看</a>
            },
        },
    ]; 
    componentDidMount() {
        this.getData();
    }
    getData = () => {
        const { deviceId } = this.props;
        // 拉取当前设备影子上报数据
        this.setState({
            isLoading: true,
            isError: false,
        });
        const setError = () => {
            this.setState({
                time: getNow(),
                isLoading: false,
                isError: true,
            });
        };
        getDataByShadow(deviceId)
            .then((rst) => {
                const {
                    data: { deviceData, state },
                    code,
                } = rst;
                if (code === 0) {
                    let s = {
                        result: rst,
                        time: getNow(),
                        isLoading: false,
                        isError: false,
                        online: !!state.online, // 在线状态
                        onerror: !!state.error, // 故障状态
                    };
                    deviceData.forEach(({ dataType, list }) => {
                        s[maps[dataType]] = list.map((d) => ({
                            ...d,
                            lcpId: ++lcpId,
                            dataType,
                        }));
                    });
                    this.setState(s);
                } else {
                    setError();
                }
            })
            .catch((e) => {
                setError();
            });
    };
    toggleTab = (tab) => {
        this.setState({ tab });
    };
    getHistory = (data) => {

        const { deviceId } = this.props;
        /*
            deviceId 设备id
            property 数据标识
            dataType 数据类型
            startTime 开始时间戳
            endTime 截止时间戳
        */
        const { property, dataType } = data;
        if (!property || !dataType) {
            Notification({
                description: "数据标识或数据类型丢失，无法查询",
                type: "warn",
            });
            return;
        }

        // 拉取当前设备影子上报数据
        this.setState({
            isLoadingForModal: true,
            isErrorForModal: false,
            // showType,
            showModal: true,
            showData: data,
            listForModal: [],
        });
        const sendData = {
            deviceId,
            property,
            dataType,
            // startTime:5,
            // endTime,
        };
        this.sendHistoryData = sendData; // 暂存搜索参数
        this.getHistoryNext(5);
    };
    getHistoryNext = (timeLong) => {
        this.sendHistoryData.startTime = this.getHistoryTime(timeLong);
        // console.log('--startime--',moment(this.getHistoryTime(timeLong)).format());
        let sendhistory= this.sendHistoryData;
        const setError = () => {
            this.setState({
                isLoadingForModal: false,
                isErrorForModal: true,
            });
        };
        const { property } = sendhistory;
        getHistoryDataByShadow(sendhistory)
            .then((rst) => {
                const { data, code } = rst;
                if (code === 0) {
                    let s = {
                        isLoadingForModal: false,
                        isErrorForModal: false,
                        listForModal: (data || []).map((d) => ({
                            ...d,
                            count: d[property],
                        })),
                    };
                    this.setState(s);
                } else {
                    setError();
                }
            })
            .catch((e) => {
                setError();
            });
    };
    getHistoryTime = timeLong=>{
        const endTime = moment.utc().valueOf(),
        startTime = endTime - (timeLong * 60 * 1000);
        return startTime

    }
    //重试获取图表数据
    tryAgain = (tim=5) => {
        this.setState({
            isLoadingForModal: true,
            isErrorForModal: false,
            listForModal: [],
        });
        this.getHistoryNext(tim);
    };
    showHistory = (data) => {
        this.getHistory(data);
    };
    // showRealtime = (data) => {
    //     this.getHistory(1, data);
    // };
    closeModal = () => {
        this.setState({ showModal: false });
    };
    download = () => {
        _download(this.sendHistoryData);
    };
    //获取JSON模式视图
    getJsonView = () => {
        const { result = {} } = this.state;
        const code = JSON.stringify(result);
        return <CodeMirrorView code={code} />;
    };
    //获取表单模式视图
    getFormListView = () => {
        const {
            isLoading, // 是否在加载进行中
            controlList, // 控制数据
            runList, // 运行数据
            errorList, // 故障数据
            configList, // 配置数据
            online, // 在线状态
            onerror, // 故障状态
        } = this.state;
        const _data = [
            {nam:'控制数据',source:controlList},
            {nam:'运行数据',source:runList},
            {nam:'故障数据',source:errorList},
            { nam:'配置数据', source:configList},
        ]
        return (
            <>
                <div className="lcp-status">
                    <div className="lcp-status-item lcp-status-item-active">
                        在线状态：
                        <Tooltip title={getTips(0, online)} placement="top">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                    </div>
                    <div className="lcp-status-item">
                        {isLoading ? (
                            loadingSign
                        ) : online ? (
                            <Badge status="success" text="在线" />
                        ) : (
                            <Badge status="error" text="离线" />
                        )}
                    </div>
                    <div className="lcp-status-item lcp-status-item-active">
                        故障状态：
                        <Tooltip title={getTips(1, onerror)} placement="top">
                            <Icon type="question-circle-o" />
                        </Tooltip>
                    </div>
                    <div className="lcp-status-item">
                        {isLoading ? (
                            loadingSign
                        ) : onerror ? (
                            <Badge status="error" text="已发生故障" />
                        ) : (
                            <Badge status="success" text="未发生故障" />
                        )}
                    </div>
                </div>
                {
                    _data.map(({nam,source})=>{
                        return <div key={nam}>
                            <div className="lcp-title marg-top20">{nam}</div>
                            <Table
                                // bordered
                                className="lcp-table-small"
                                loading={isLoading}
                                rowKey="lcpId"
                                pagination={false}
                                columns={this.columns}
                                dataSource={source}
                            />
                        </div>

                    })
                }
            </>
        );
    };
    render() {
        const {
            tab,
            time, // 最新更新时间
            isLoading, // 是否在加载中
            isError, // 是否接口报错

            // showType, // 0-历史数据，1-实时数据
            showModal, // 是否显示展示历史数据模态弹窗
            showData, // 当前数据详细数据
            isLoadingForModal, // 是否在加载进行中
            isErrorForModal, // 是否接口报错
            listForModal, // 历史记录列表
        } = this.state;
        const modalProps = {
            // showType, // 0-历史数据，1-实时数据
            showModal, // 是否显示展示历史数据模态弹窗
            showData, // 当前数据详细数据
            isLoadingForModal, // 是否在加载进行中
            isErrorForModal, // 是否接口报错
            listForModal, // 历史记录列表
            tryAgain: this.tryAgain,
            closeModal: this.closeModal,
            download: this.download,
        };
        return (
                <div className="device-shadow-page">
                    <Alert
                        className="page-visualization-alert"
                        message={this.alertMsg}
                        type="info"
                        showIcon
                    />
                    <div className="btn-changemod" >
                        <Button.Group>
                            {tabs.map((d, i) => {
                                return (
                                    <Button
                                        type={i === tab ? "primary" : undefined}
                                        onClick={() => this.toggleTab(i)}
                                        key={i + d}
                                    >
                                        {d}
                                    </Button>
                                );
                            })}
                        </Button.Group>
                        <span className="fresh-time">
                            最新更新时间：{time}
                            <Icon
                                type="sync"
                                spin={isLoading}
                                title="刷新"
                                className="lcp-refresh"
                                onClick={isLoading ? null : this.getData}
                            />
                        </span>
                    </div>
                    {
                        isError ? 
                        <Crash tryAgain={this.getData} /> : tab === 0 ? 
                        this.getFormListView() : 
                        this.getJsonView()
                    }

                    <DeviceShadowHistoryModal {...modalProps} />
                </div>
        );
    }
}
