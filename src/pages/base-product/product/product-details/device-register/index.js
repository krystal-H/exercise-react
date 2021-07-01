import React, { PureComponent, Component } from 'react';
import { Input, Form, Button, Icon, Select, Table } from 'antd';
import { Notification } from '../../../../../components/Notification';
import { strToAsterisk, DateTool } from '../../../../../util/util';
import { get, Paths, post } from '../../../../../api';
import { REQUEST_SUCCESS } from '../../../../../configs/request.config';
import RegisterDevice from './registerDevice';
import DescWrapper from '../../../../../components/desc-wrapper/DescWrapper';

import './style.scss';

const { Option } = Select;
const { Search } = Input;
const initPager = {
    pageRows: 10,
    pageIndex: 1,
};

export default class DeviceRegister extends PureComponent {
    constructor(props) {
        super(props);
        this.productId = props.productId;
        this.state = {
            statisticsData: {},
            deviceRegister: { list: [], pager: {} },
            secret: [],
            registerDialog: false,
        };
    }

    componentDidMount = () => {
        this._getStatisticsData(this.productId);
        this.getDeviceList({ ...initPager });
    };

    onChange = (page) => {
        this.getDeviceList({ ...initPager, pageIndex: page });
    }

    _getStatisticsData = (productId) => {
        get(Paths.getStatisticsData, {
            productId,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { statisticsData: data };
                });
            }
        });
    };

    getDeviceList = (param) => {
        get(Paths.getDeviceRegisterList, {
            ...param,
            productId: this.productId,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { deviceRegister: data };
                });
            }
        });
    };

    registerImport = (data) => {
        post(Paths.registerImport, {
            data,
            productId: this.productId,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                if (data.failCount > 0) {
                    Notification({
                        type:'error',
                        description:`设备注册失败，失败条数 ${data.failCount} ,成功条数 ${data.totalCount} `,
                    });
                    return;
                }
                Notification({
                    type:'success',
                    description:`设备注册成功`,
                });
                this.setState((preState) => {
                    let { registerDialog } = preState;
                    return { registerDialog: !registerDialog };
                }, () => {
                    this.getDeviceList({
                        ...initPager,
                    });
                });
            }
        });
    }

    showSecret = (index) => {
        this.setState((preState) => {
            preState.secret[index] = !preState.secret[index]
            return { preState }
        });
    }

    changeState = (type) => {
        this.setState((preState) => {
            return { [type]: !preState[type] }
        });
    }

    showDialog = (dialogType) => {
        this.changeState(dialogType)
    }

    _getAntDDeviceRegisterListData = () => {
        let { deviceRegister, secret } = this.state;
        let deviceRegisterList = deviceRegister.list;
        deviceRegisterList.forEach((item, index) => {
            item.key = item.id;
        });
        let columns = [{
            title: '设备ID',
            dataIndex: 'id',
            key: 'id',
            width:'150px'
        }, {
            title: '物理地址',
            dataIndex: 'physicalAddr',
            key: 'physicalAddr',
        }, {
            title: '设备秘钥',
            dataIndex: 'deviceSecret',
            key: 'deviceSecret',
            width:'340px',
            render: (text, record, index) => {
                let showSecretType = secret[index] ? 'eye-invisible' : 'eye';
                let appSecretText = secret[index] ? text : strToAsterisk(text, 10);
                return (
                    <div>
                        <span key="detail">{appSecretText}</span>
                        <Icon type={showSecretType} style={{ fontSize: '18px', marginLeft: '6px' }}
                              theme="twoTone"
                              twoToneColor="#2874FF" onClick={() => this.showSecret(index)} />
                    </div>
                )
            }
        }, {
            title: '入网状态',
            dataIndex: 'status',
            key: 'status',
            width:'100px',
            render(status) {
                let statusStyle = {
                    color: '#FF2E00',
                    marginRight: '10px'
                };
                let statusText = '未入网';
                if (status === 0) {
                    statusStyle.color = '#FF2E00';
                    statusText = '未入网'
                } else {
                    statusStyle.color = '#00B72E';
                    statusText = '已入网';
                }
                return (
                    <div>
                        <span style={statusStyle}>●</span>
                        <span>{statusText}</span>
                    </div>
                )
            }
        }, {
            title: '入网时间',
            dataIndex: 'activeTime',
            key: 'activeTime',
            width:'200px',
            render(activeTime) {
                return activeTime ? DateTool.utcToDev(activeTime) : '--';
            }
        }];
        return {
            deviceRegisterList,
            columns,
        }
    };

    render() {
        let { deviceRegisterList, columns } = this._getAntDDeviceRegisterListData();
        let { statisticsData, deviceRegister, registerDialog } = this.state;
        let { productBaseInfo } = this.props;
        let { authorityType,accessModeId } = productBaseInfo;
        // authorityType = 2;
        let pager = deviceRegister.pager;
        let desctxt = ['温馨提示：'];
        if (accessModeId === 0) {//  <a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank'>使用指南</a>
            desctxt = [...desctxt,
                "1. 您的产品已选择“初级认证”安全机制，可选择导入设备的物理地址或SN号或序列号或MAC列表；",
                "2. 平台将按照您导入的数据，生成12位的设备ID，每次最多生成2万条数据；",
                "3. 您可以在这里管理注册设备，查看所有的设备入网状态。"
            ]
        }else{
            desctxt = [...desctxt,
                "1. 您的产品已选择了云接入“安全认证”能力，需要提前导入设备的物理地址或SN号或序列号或MAC列表；",
                "2. 平台将按照您导入的数据，生成12位的设备ID，每次最多可以注册2万台设备。"
            ]
        }

        return (
            <section className="device-register-wrapper flex-column">
                <div className="device-statistic">
                    <div className="total flex-column"><span className="flex1">设备总数量</span><span
                        className="flex1">{statisticsData.total}</span></div>
                    <div className="register flex-column"><span className="flex1">已入网设备</span><span
                        className="flex1">{statisticsData.activate}</span></div>
                    <div className="unregistered flex-column"><span className="flex1">未入网设备</span><span
                        className="flex1">{statisticsData.unactivate}</span></div>
                </div>
                <div className="device-register-content-wrapper">
                    < DescWrapper desc={desctxt} />
                    <div className="content-list-wrapper">
                        <h4>设备列表</h4>
                        <div className="content-list">
                            <div className="content-list-top clearfix">
                                <WrappedDeviceSearchForm
                                    getDeviceList={this.getDeviceList}
                                    productBaseInfo={productBaseInfo}
                                />
                                <Button className="register-btn" type="primary" onClick={() => this.showDialog('registerDialog')}>注册设备</Button>
                            </div>
                            <Table
                                className="content"
                                dataSource={deviceRegisterList}
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
                </div>
                {registerDialog && <RegisterDevice
                    registerImport={this.registerImport}
                    showDialog={this.showDialog}
                    registerDialog={registerDialog}
                    productBaseInfo={productBaseInfo}
                />}
            </section>
        )
    }
}

class deviceSearchForm extends Component {

    handleSubmit = (value, e) => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { getDeviceList } = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let param = {
                    ...initPager,
                }
                if (values.id) {
                    param.id = values.id;
                }
                if (values.status || values.status === 0) {
                    param.status = values.status;
                }
                getDeviceList(param);
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        const { productBaseInfo } = this.props;
        let { authorityType } = productBaseInfo;
        let placeholder = '请输入设备ID号';
        if (authorityType === 2) {
            placeholder = '请输入设备ID号'
        }
        return (
            <Form layout='inline' className="search-form">
                <Form.Item
                    label=""
                    colon={false}
                    style={{ marginRight: 0 }}
                >
                    {getFieldDecorator('status', {
                        initialValue: '',
                    })
                    (<Select
                        style={{ width: '150px' }}
                        optionFilterProp="children"
                    >
                        <Option key='allStatus' value=''>全部状态</Option>
                        <Option key='unRegistered' value={0}>未入网</Option>
                        <Option key='register' value={1}>已入网</Option>
                    </Select>)}
                </Form.Item>
                <Form.Item
                    label=""
                    colon={false}
                >
                    {getFieldDecorator('id', {
                        rules: [
                            {
                                max: 100,
                                message: '最多可以输入100个字符',
                            },
                        ],
                    })
                    (<Search placeholder={placeholder} enterButton onSearch={(value,e) => this.handleSubmit(value,e)} />)}
                </Form.Item>
            </Form>
        )
    }
}

const WrappedDeviceSearchForm = Form.create({
    name: 'deviceSearch',
})(deviceSearchForm);
