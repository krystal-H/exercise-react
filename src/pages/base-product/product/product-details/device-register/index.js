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
                        description:`????????????????????????????????? ${data.failCount} ,???????????? ${data.totalCount} `,
                    });
                    return;
                }
                Notification({
                    type:'success',
                    description:`??????????????????`,
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
            title: '??????ID',
            dataIndex: 'id',
            key: 'id',
            width:'150px'
        }, {
            title: '????????????',
            dataIndex: 'physicalAddr',
            key: 'physicalAddr',
        }, {
            title: '????????????',
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
            title: '????????????',
            dataIndex: 'status',
            key: 'status',
            width:'100px',
            render(status) {
                let statusStyle = {
                    color: '#FF2E00',
                    marginRight: '10px'
                };
                let statusText = '?????????';
                if (status === 0) {
                    statusStyle.color = '#FF2E00';
                    statusText = '?????????'
                } else {
                    statusStyle.color = '#00B72E';
                    statusText = '?????????';
                }
                return (
                    <div>
                        <span style={statusStyle}>???</span>
                        <span>{statusText}</span>
                    </div>
                )
            }
        }, {
            title: '????????????',
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
        let desctxt = ['???????????????'];
        if (accessModeId === 0) {//  <a href="https://opendoc.clife.cn/book/content?documentId=83&identify=product_manage" target='_blank'>????????????</a>
            desctxt = [...desctxt,
                "1. ?????????????????????????????????????????????????????????????????????????????????????????????SN??????????????????MAC?????????",
                "2. ??????????????????????????????????????????12????????????ID?????????????????????2???????????????",
                "3. ???????????????????????????????????????????????????????????????????????????"
            ]
        }else{
            desctxt = [...desctxt,
                "1. ??????????????????????????????????????????????????????????????????????????????????????????????????????SN??????????????????MAC?????????",
                "2. ??????????????????????????????????????????12????????????ID???????????????????????????2???????????????"
            ]
        }

        return (
            <section className="device-register-wrapper flex-column">
                <div className="device-statistic">
                    <div className="total flex-column"><span className="flex1">???????????????</span><span
                        className="flex1">{statisticsData.total}</span></div>
                    <div className="register flex-column"><span className="flex1">???????????????</span><span
                        className="flex1">{statisticsData.activate}</span></div>
                    <div className="unregistered flex-column"><span className="flex1">???????????????</span><span
                        className="flex1">{statisticsData.unactivate}</span></div>
                </div>
                <div className="device-register-content-wrapper">
                    < DescWrapper desc={desctxt} />
                    <div className="content-list-wrapper">
                        <h4>????????????</h4>
                        <div className="content-list">
                            <div className="content-list-top clearfix">
                                <WrappedDeviceSearchForm
                                    getDeviceList={this.getDeviceList}
                                    productBaseInfo={productBaseInfo}
                                />
                                <Button className="register-btn" type="primary" onClick={() => this.showDialog('registerDialog')}>????????????</Button>
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
        let placeholder = '???????????????ID???';
        if (authorityType === 2) {
            placeholder = '???????????????ID???'
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
                        <Option key='allStatus' value=''>????????????</Option>
                        <Option key='unRegistered' value={0}>?????????</Option>
                        <Option key='register' value={1}>?????????</Option>
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
                                message: '??????????????????100?????????',
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
