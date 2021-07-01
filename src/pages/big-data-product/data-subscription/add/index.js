import React, { Component } from 'react';
import { WrappedSubscriptionObjectForm } from './form/subscriptionObjectForm';
import { WrappedSubscriptionContentForm } from './form/subscriptionContentForm';
import { WrappedSubscriptionWayForm } from './form/subscriptionWayForm';
import { get, Paths, post } from '../../../../api';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import DoubleBtns from '@src/components/double-btns/DoubleBtns';
import _ from 'lodash';
import { Notification } from '../../../../components/Notification';
import PageTitle from '../../../../components/page-title/PageTitle';

import './style.scss';

class DataSubscriptionAdd extends Component {

    constructor(props) {
        super(props);
        let {location} = this.props,
            {state = {}} = location,
            {urlConfId,productId,labelOrDevice,deviceLabelIds} = state;
            console.log("DataSubscriptionAdd -> constructor -> state", state)

        this.state = {
            subscriptionObjectForm: {
                productId: productId || { value: undefined },
                checkedList: { value: [] },
                indeterminate: { value: false },
                checkAll: { value: false },
                labelOrDevice: labelOrDevice || { value: 1 },
            },
            subscriptionWayForm: {
                pushWay: { value: 0 },
                url: { value: undefined },
                pushToken: { value: undefined },
            },
            productName: '',
            productList: [],
            labelList: [],
            labelListPlains: [], // 字符串数组，适配antd复选框格式
            protocolList: [],
            devicePushDataConfList: [], // 订阅内容
            current: 0,
            isEdit: urlConfId
        }

        if (deviceLabelIds) {
            get(Paths.getLabelByProductId, {
                productId: Number(productId.value.key),
                version: '1.1',
            }, { loading: true }).then((res) => {
                const code = res.code;
                const data = res.data;
                if (code === REQUEST_SUCCESS) {
                    let labelListPlains = data && data.map((item) => {
                            // 预防标签值重复时，复选框无法区分选中的是哪个标签，所以加上id
                            return `${item.labelId}-${item.labelKey}-${item.labelValue}`;
                        });
                    
                    let ids = deviceLabelIds.split(',');

                    if (data) {
                        data.map(item => {
                            let {labelId} = item;
                            if(ids.indexOf('' + labelId)) {
                                item.checked = true
                            }
                        })
                    }
                    
                    this.setState(() => {
                        return {
                            labelList: data || [],
                            labelListPlains: labelListPlains || [],
                        };
                    });
                }
            });
        }
    }

    componentDidMount() {
        this._getProductByDeveloperId();
    }

    onSelectChange = (selectedProtocolRowKeys, dataType) => {
        this.setState((preState) => {
            let { devicePushDataConfList } = preState;
            let index = devicePushDataConfList.findIndex((item) => {
                return item.dataType === dataType;
            });
            // 协议数据不在订阅内容数组中，则新增
            if (index === -1) {
                devicePushDataConfList.push({
                    dataType,
                    selectedProtocolRowKeys,
                });
            } else {
                devicePushDataConfList[index] = {
                    dataType,
                    selectedProtocolRowKeys,
                }
            }
            return {
                devicePushDataConfList,
            }
        });
    };

    _getProductByDeveloperId = () => {
        get(Paths.getProductByDeveloperId, {
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { productList: data };
                });
            }
        });
    };

    choiceLabel = (index) => {
        this.setState((preState) => {
            let { subscriptionObjectForm, labelList } = preState;
            labelList[index].checked = !labelList[index].checked;
            let checkedAll = true;
            let count = 0;
            labelList.forEach(label => {
                if (!label.checked) {
                    checkedAll = false;
                } else {
                    count++;
                }
            })
            return {
                labelList,
                subscriptionObjectForm: {
                    ...subscriptionObjectForm,
                    indeterminate: { value: count && count < labelList.length },
                    checkAll: { value: checkedAll },
                }
            }
        });
    };

    changeFormData = (formType, changedFields) => {
        this.setState(() => {
            let form = this.state[formType];
            let keys = Object.keys(changedFields);
            let values = Object.values(changedFields);
            let key = keys[0];
            let value = values[0];
            let { labelListPlains, labelList } = this.state;
            let rtnObj = {
                [formType]: {
                    ...form,
                    ...changedFields,
                }
            };
            if (key === 'checkAll' && keys.length === 1) {
                labelList.forEach((label) => {
                    label.checked = value.value;
                });
                rtnObj = {
                    [formType]: {
                        ...rtnObj[formType],
                        indeterminate: { value: false },
                        checkedList: { value: value.value ? labelListPlains : [] },
                    },
                    labelList,
                }
            } else if (key === 'checkedList' && keys.length === 1) {
                rtnObj = {
                    [formType]: {
                        ...rtnObj[formType],
                        indeterminate: { value: !!value.value.length && value.value.length < labelListPlains.length },
                        checkAll: { value: value.value.length === labelListPlains.length },
                    }
                }
            } else if (key === 'pushWay' && keys.length === 1) {
                rtnObj = {
                    [formType]: {
                        ...rtnObj[formType],
                        url: { value: undefined },
                        pushToken: { value: undefined },
                    }
                }
            }
            return rtnObj;
        });
    };

    getProtocolListByProductId = (productId, version) => {
        get(Paths.getProtocolListByProductId, {
            productId,
            version,
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return {
                        protocolList: data.list,
                    };
                });
            }
        });
    };

    getLabelByProductId = (param) => {
        this.setState((preState) => {
            let { subscriptionObjectForm } = preState;
            subscriptionObjectForm.checkedList = { value: [] };
            subscriptionObjectForm.indeterminate = { value: false };
            subscriptionObjectForm.checkAll = { value: false };
            preState.devicePushDataConfList = [];
            return {
                productName: param.label,
            }
        }, () => {
            get(Paths.getLabelByProductId, {
                productId: Number(param.key),
                version: '1.1',
            }, { loading: true }).then((res) => {
                const code = res.code;
                const data = res.data;
                if (code === REQUEST_SUCCESS) {
                    let labelListPlains = data && data.map((item) => {
                            // 预防标签值重复时，复选框无法区分选中的是哪个标签，所以加上id
                            return `${item.labelId}-${item.labelKey}-${item.labelValue}`;
                        });
                    this.setState(() => {
                        return {
                            labelList: data || [],
                            labelListPlains: labelListPlains || [],
                        };
                    });
                }
            });
        });
    };

    changeCurrent = (type) => {
        this.setState((prevState) => {
            return {
                current: type === 'next' ? prevState.current + 1 : prevState.current - 1,
            }
        });
    };

    goToNextStep = (form, e) => {
        this[form].handleSubmit(e);
    };

    goToPreStep = () => {
        this.changeCurrent('pre');
    };

    _getCurStepContent() {
        return [
            {
                title: '配置订阅对象',
                content: (
                    <WrappedSubscriptionObjectForm
                        onRef={ref => this.subscriptionObjectForm = ref}
                        changeFormData={this.changeFormData}
                        getLabelByProductId={this.getLabelByProductId}
                        changeCurrent={this.changeCurrent}
                        getProtocolListByProductId={this.getProtocolListByProductId}
                        choiceLabel={this.choiceLabel}
                        {...this.state}
                    />
                ),
            },
            {
                title: '配置订阅内容',
                content: (
                    <WrappedSubscriptionContentForm
                        onRef={ref => this.subscriptionContentForm = ref}
                        changeFormData={this.changeFormData}
                        changeCurrent={this.changeCurrent}
                        onSelectChange={this.onSelectChange}
                        {...this.state}
                    />
                ),
            },
            {
                title: '配置订阅方式',
                content: (
                    <WrappedSubscriptionWayForm
                        changeFormData={this.changeFormData}
                        createSubscription={this.createSubscription}
                        onRef={ref => this.subscriptionWayForm = ref}
                        {...this.state}
                    />
                ),
            },
        ];
    }

    /* 获取全选1/部分选2/未选0 */
    _getDataTypeScope = (dataType, selectedProtocolRowKeys) => {
        let { protocolList } = this.state;
        let curProtocol = protocolList && protocolList.find((protocol) => {
                return protocol.dataType === dataType;
            });
        let list = curProtocol ? curProtocol.list : [];
        let dataTypeScope = 0;
        // 当前数据类型下协议为空
        if (list.length === 0 || selectedProtocolRowKeys.length === 0) {
            return dataTypeScope;
        }
        if (selectedProtocolRowKeys.length === list.length) {
            dataTypeScope = 1;
        } else if (selectedProtocolRowKeys.length < list.length) {
            dataTypeScope = 2;
        }
        return dataTypeScope;
    };

    _getDeviceLabelId = () => {
        let { labelList } = this.state;
        let deviceLabelId = '';
        labelList.forEach((item) => {
            if (item.checked) {
                deviceLabelId += item.labelId + ',';
            }
        });
        return deviceLabelId.substr(0, deviceLabelId.length - 1);
    };

    createSubscription = () => {
        let { subscriptionObjectForm, subscriptionWayForm, devicePushDataConfList,isEdit } = this.state;
        let devicePushDataConfListCopy = _.cloneDeep(devicePushDataConfList);
        let { labelOrDevice } = subscriptionObjectForm;
        devicePushDataConfListCopy.forEach((item) => {
            let { selectedProtocolRowKeys, dataType } = item;
            item.dataTypeScope = this._getDataTypeScope(dataType, selectedProtocolRowKeys);
            if (selectedProtocolRowKeys) {
                item.protocolProperty = selectedProtocolRowKeys.join(',');
            }
            item.dataFormat = 1; // 1-json 2-xml
            delete item.selectedProtocolRowKeys;
        });
        /* 构建请求参数 */
        let params = {
            deviceLabelIds: this._getDeviceLabelId(),
            devicePushDataConfList: devicePushDataConfListCopy,
            pushWay: Number(subscriptionWayForm.pushWay.value),
        };
        if (labelOrDevice.value === 1) {
            delete params.deviceLabelIds;
        }
        if (subscriptionObjectForm.productId.value.key) {
            params.productId = Number(subscriptionObjectForm.productId.value.key);
        }
        if (subscriptionWayForm.url.value) {
            params.url = subscriptionWayForm.url.value;
        }
        if (subscriptionWayForm.pushToken.value) {
            params.pushToken = subscriptionWayForm.pushToken.value;
        }

        if (isEdit) {
            params.urlConfId = isEdit
        }

        post(isEdit ? Paths.saveSubscription : Paths.createSubscription , {
            ...params,
        }, { loading: true, needJson: true,noInstance:true }).then((res) => {
            let { history } = this.props;
            const code = res.code;
            if (code === REQUEST_SUCCESS) {
                Notification({
                    type:'success',
                    description: isEdit ? '订阅编辑成功！' : '订阅生成成功！',
                });
                
                history.replace({
                    pathname: '/open/bigData/dataSubscription',
                })
            }
        });
    };

    render() {
        let { current,isEdit } = this.state;
        let steps = this._getCurStepContent();
        let curStep = 'current-step';
        return (
            <div className="subscription-add-page-wrapper flex-column">
                <PageTitle backHandle={() => this.props.history.goBack()} title={isEdit ? '订阅编辑':'新增订阅'} />
                <div className="step-header-wrapper">
                    <div
                        className="step-header flex-row"
                    >
                        <div className={`step-item flex-row flex1 ${(current === 0) && curStep}`}>
                            <i className="step-product" />
                            <span>1. 选择订阅产品</span>
                        </div>
                        <div
                            className={`step-item flex1 flex-row ${(current === 1) && curStep}`}>
                            <i className="step-data" />
                            <span>2. 选择订阅数据</span>
                        </div>
                        <div className={`step-item flex1 flex-row ${current === 2 && curStep}`}>
                            <i className="step-way" />
                            <span>3. 选择订阅方式</span>
                        </div>
                    </div>
                </div>
                <div className="add-content-wrapper flex1">
                    <div className="add-content">
                        <div className="steps-content">
                            {steps[current].content}
                        </div>
                        <div className="steps-action">
                            {current === 0 && (
                                <DoubleBtns
                                    preBtn={false}
                                    nextHandle={(e) => this.goToNextStep('subscriptionObjectForm', e)}
                                />
                            )}
                            {current !== 0 && current < steps.length - 1 && (
                                <DoubleBtns
                                    preHandle={this.goToPreStep}
                                    nextHandle={(e) => this.goToNextStep('subscriptionContentForm', e)}
                                />
                            )}
                            {current === steps.length - 1 && (
                                <DoubleBtns
                                    nextText={'提交'}
                                    preHandle={this.goToPreStep}
                                    nextHandle={(e) => this.goToNextStep('subscriptionWayForm', e)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DataSubscriptionAdd;
