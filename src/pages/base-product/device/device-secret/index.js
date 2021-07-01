/**
 * Created by xiaodaoguang on 2020/1/6.
 */
import React, { useState, useEffect } from "react";
import { Input, Form, Button, Icon, Select, Table } from "antd";
import { strToAsterisk, DateTool } from "../../../../util/util";
import { get, Paths, post } from "../../../../api";
import { REQUEST_SUCCESS } from "../../../../configs/request.config";
import PageTitle from "../../../../components/page-title/PageTitle";
import MyIcon from "../../../../components/my-icon/MyIcon";

// import "./style.scss";

const { Option } = Select;
const initPager = {
    pageRows: 10,
    pageIndex: 1
};

export default props => {
    const [statistics, setStatistics] = useState({});
    const [seniorDeviceList, setSeniorDeviceList] = useState({
        pager: {},
        list: []
    });
    const [secret, setSecret] = useState([]);
    useEffect(() => {
        console.log("useEffect");
        getStatistics();
        getSeniorDeviceList(initPager);
    }, []);
    const getStatistics = () => {
        get(Paths.getStatistics, { loading: true }).then(res => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                setStatistics(data);
            }
        });
    };
    const getSeniorDeviceList = param => {
        get(Paths.getSeniorDeviceList, param, { loading: true }).then(res => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                setSeniorDeviceList(data);
            }
        });
    };
    const showSecret = index => {
        let newSecret = secret.slice();
        newSecret[index] = !newSecret[index];
        setSecret(newSecret);
    };
    const getAntDSeniorDeviceList = () => {
        let antDSeniorDeviceList = seniorDeviceList.list.slice();
        antDSeniorDeviceList.forEach((item, index) => {
            item.key = item.id;
        });
        let columns = [
            {
                title: "设备ID",
                dataIndex: "id",
                key: "id"
            },
            {
                title: "设备秘钥",
                dataIndex: "deviceSecret",
                key: "deviceSecret",
                render: (text, record, index) => {
                    let showSecretType = secret[index]
                        ? "eye-invisible"
                        : "eye";
                    let appSecretText = secret[index]
                        ? text
                        : strToAsterisk(text, 10);
                    return (
                        <div>
                            <span key="detail">{appSecretText}</span>
                            <Icon
                                type={showSecretType}
                                style={{ fontSize: "18px", marginLeft: "6px" }}
                                theme="twoTone"
                                twoToneColor="#2874FF"
                                onClick={() => showSecret(index)}
                            />
                        </div>
                    );
                }
            },
            {
                title: "物理地址",
                dataIndex: "physicalAddr",
                key: "physicalAddr"
            },
            {
                title: "产品名称",
                dataIndex: "productName",
                key: "productName"
            },
            {
                title: "入网状态",
                dataIndex: "status",
                key: "status",
                render(status) {
                    let statusStyle = {
                        color: "#FF2E00",
                        marginRight: "10px"
                    };
                    let statusText = "未知状态";
                    if (status === 0) {
                        statusStyle.color = "#FF2E00";
                        statusText = "未入网";
                    } else if(status === 1) {
                        statusStyle.color = "#00B72E";
                        statusText = "已入网";
                    }else if(status === 2){
                        statusStyle.color = "#f5ad05";
                        statusText = "烧录中";
                    }
                    return (
                        <div>
                            <span style={statusStyle}>●</span>
                            <span>{statusText}</span>
                        </div>
                    );
                }
            },
            {
                title: "入网时间",
                dataIndex: "activeTime",
                key: "activeTime",
                render(activeTime) {
                    return activeTime ? DateTool.utcToDev(activeTime) : "--";
                }
            }
        ];
        return {
            antDSeniorDeviceList,
            columns
        };
    };
    const onChange = page => {
        getSeniorDeviceList({ ...initPager, pageIndex: page });
    };
    const { antDSeniorDeviceList, columns } = getAntDSeniorDeviceList();
    const { pager } = seniorDeviceList;
    return (
        <section className="device-secret-wrapper flex-column">
            <div className="device-secret-header">
                <PageTitle noback={true} title="通用设备密钥管理" />
                <div className="device-secret-statistic clearfix">
                    <div className="common-id">
                        <div>通用ID/密钥对</div>
                        <div>{statistics.total}</div>
                    </div>
                    <div className="used">
                        <div>已烧录使用</div>
                        <div>{statistics.burn}</div>
                    </div>
                    <div className="register">
                        <div>已入网设备</div>
                        <div>{statistics.activate}</div>
                    </div>
                    <div className="unregistered">
                        <div>未入网设备</div>
                        <div>{statistics.unactivate}</div>
                    </div>
                    {/*<div className="export-data">
                     <MyIcon type='icon-wulumuqishigongandashujuguanlipingtai-ico-' />
                     <a href="javascript:">导出数据</a>
                     </div>*/}
                </div>
            </div>
            <div className="device-secret-content-wrapper flex1">
                <div className="device-secret-content">
                    <h4>设备列表</h4>
                    <DeviceSearchForm
                        getSeniorDeviceList={getSeniorDeviceList}
                    />
                    <Table
                        className="content"
                        dataSource={antDSeniorDeviceList}
                        columns={columns}
                        pagination={{
                            onChange: onChange,
                            defaultCurrent: 1,
                            current: pager.pageIndex,
                            pageSize: pager.pageRows,
                            total: pager.totalRows,
                            showQuickJumper: true
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

const DeviceSearchForm = Form.create({
    name: "deviceSearch"
})(props => {
    const handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = props.form;
        const { getSeniorDeviceList } = props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log("Received values of form: ", values);
                let param = {
                    ...initPager
                };
                if (values.id) {
                    param.id = values.id;
                }
                if (values.status || values.status === 0) {
                    param.status = values.status;
                }
                if (values.productName) {
                    param.productName = values.productName;
                }
                getSeniorDeviceList(param);
            }
        });
    };
    const { getFieldDecorator } = props.form;
    return (
        <Form layout="inline" className="search-form" onSubmit={handleSubmit}>
            <Form.Item label="" colon={false} style={{ marginRight: 0 }}>
                {getFieldDecorator("status", {
                    initialValue: ""
                })(
                    <Select
                        style={{ width: "150px" }}
                        optionFilterProp="children"
                    >
                        <Option key="allStatus" value="">
                            全部状态
                        </Option>
                        <Option key="unRegistered" value={0}>
                            未入网
                        </Option>
                        <Option key="register" value={1}>
                            已入网
                        </Option>
                    </Select>
                )}
            </Form.Item>
            <Form.Item label="" colon={false}>
                {getFieldDecorator("id", {
                    rules: [
                        {
                            max: 100,
                            message: "最多可以输入100个字符"
                        }
                    ]
                })(<Input placeholder="请输入设备ID号" />)}
            </Form.Item>
            <Form.Item label="产品名称">
                {getFieldDecorator("productName", {
                    rules: [
                        {
                            max: 100,
                            message: "最多可以输入100个字符"
                        }
                    ]
                })(<Input placeholder="请输入产品名称" />)}
            </Form.Item>
            <Form.Item label="">
                <Button type="primary" htmlType="submit">
                    查询
                </Button>
            </Form.Item>
        </Form>
    );
});
