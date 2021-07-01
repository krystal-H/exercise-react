import React, { Component } from "react";
import { Modal, Descriptions, Button, Icon,Select } from "antd";
import Crash from "../../../../../components/Crash";
import EmptyData from "../../../../../components/EmptyData";
import CommECharts from "../../../../../components/CommECharts";
import moment from "moment";

const timeList = [
    { name:'最近5分钟', val:5 },
    { name:'最近15分钟', val:15 },
    { name:'最近30分钟', val:30 },
    { name:'最近1小时', val:60 },
    { name:'最近6小时', val:6*60 },
    { name:'最近24小时', val:24*60 },
];

// console.log(moment.utc(1588904209132).format("YYYY-MM-DD HH:mm:ss"));
// console.log(moment.utc().format("YYYY-MM-DD HH:mm:ss"));

const distTime = moment().utcOffset() / 60;

const fixList = (list) => {
    return list.map(({ dataTimeStamp, count }) => ({
        name: moment(dataTimeStamp)
            .add(distTime, "h")
            .format("YYYY-MM-DD HH:mm:ss"),
        count,
    }));
};

const colors = ["#1890FF", "#2fc25b"];
const circleHtmlString =
    "<span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:" +
    colors[0] +
    ";'></span>";

const createLineOption = (list, name) => {
    if (!list || list.length === 0) return null;
    const _list = fixList(list);
    const xs = _list.map((d) => d.name);
    const data = _list.map((d) => d.count);
    let option = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "line" },
            formatter: function (param) {
                const { name, seriesName, value } = param[0];
                return (
                    name +
                    " <br />" +
                    circleHtmlString +
                    seriesName +
                    "：" +
                    (value === null || value === undefined ? "暂无" : value)
                );
            },
        },
        color: colors,
        grid: { top: 20, bottom: 20, right: 50, left: 50 },
        toolbox: { show: false },
        xAxis: [
            {
                type: "category",
                boundaryGap: true,
                axisTick: { alignWithLabel: true },
                data: xs,
                axisLabel: {
                    formatter: function (value) {
                        return value.slice(-8);
                    },
                },
            },
        ],
        yAxis: {
            type: "value",
            scale: true,
            min: 0,
            axisTick: {
                show: false,
            },
            axisLine: {
                lineStyle: { opacity: 0 },
            },
            splitLine: {
                lineStyle: {
                    type: "dotted",
                },
            },
        },
        series: [
            {
                type: "line",
                step: "end",
                name,
                data,
            },
        ],
    };
    return option;
};

export default class DeviceShadowHistoryModal extends Component {
    export = (event) => {
        event.stopPropagation();
        this.props.download();
    };

    download = (
        <Button type="link" className="lcp-remark-export" onClick={this.export}>
            <Icon type="export" />
            导出
        </Button>
    );

    getChart = () => {
        const {
            showData, // 当前数据详细数据
            isLoadingForModal, // 是否在加载进行中
            isErrorForModal, // 是否接口报错
            listForModal, // 历史记录列表
            tryAgain,
        } = this.props;
        if (isErrorForModal) {
            return <Crash tryAgain={tryAgain} />;
        }
        if (!isLoadingForModal && listForModal && listForModal.length === 0) {
            return <EmptyData />;
        }
        const option = createLineOption(
            listForModal,
            (showData || {}).propertyName
        );
        return <CommECharts className="lcp-chart" option={option} />;
    };
    onChangeTime=(val)=>{
        this.props.tryAgain(val)
    };

    render() {
        const {
            // showType, // 0-历史数据，1-实时数据
            showModal, // 是否显示展示历史数据模态弹窗
            showData, // 当前数据详细数据
            isLoadingForModal, // 是否在加载进行中
            isErrorForModal, // 是否接口报错
            listForModal, // 历史记录列表
            closeModal,
        } = this.props;
        const {
            propertyName,
            property,
            propertyValueDesc,
            gap,
            mulriple,
            remark,
        } = showData || {};
        const title = (
                <>
                    <span className="lcp-w1">{propertyName}</span>
                    {property}
                </>
            ),
            // isHistory = showType === 0,
            // name = isHistory ? "历史数据" : "实时数据",
            // time = isHistory ? "6小时" : "5分钟",
            canDownload =
                // isHistory &&
                !isLoadingForModal &&
                !isErrorForModal &&
                listForModal &&
                listForModal.length > 0;
        return (
            <Modal
                visible={showModal}
                className="self-modal"
                width={720}
                title='数据查看'
                footer={null}
                onCancel={closeModal}
                centered={true}
                closable={true}
                destroyOnClose
            >
                <Descriptions title={title}>
                    <Descriptions.Item label="范围">
                        {propertyValueDesc}
                    </Descriptions.Item>
                    <Descriptions.Item label="数据间隔">
                        {gap}
                    </Descriptions.Item>
                    <Descriptions.Item label="数据倍数">
                        {mulriple}
                    </Descriptions.Item>
                    <Descriptions.Item label="" span={3}>
                        {remark}
                    </Descriptions.Item>
                </Descriptions>
                <div className="lcp-remark">
                    <Select className='time-select' defaultValue={5} onChange={(val)=>{this.onChangeTime(val)}}>
                        {
                            timeList.map(({name,val})=> <Select.Option key={'_'+val} value={val}>{name}</Select.Option> )
                        }
                    </Select>
                    
                    {canDownload ? this.download : null}
                </div>
                {this.getChart()}
            </Modal>
        );
    }
}
