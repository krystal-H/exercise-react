import React, { Component } from 'react';
import { Form, Select, Checkbox, Row, Col, Radio } from 'antd';
import { Notification } from '../../../../../components/Notification';

const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

class SubscriptionObjectForm extends Component {

    componentDidMount() {
        this.props.onRef(this);
    }

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { changeCurrent, getProtocolListByProductId, subscriptionObjectForm, labelList } = this.props;
        const { checkedList, labelOrDevice } = subscriptionObjectForm;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                if (labelOrDevice.value === 0) {
                    let count = 0;
                    labelList.forEach(item => {
                        if (item.checked) {
                            count++;
                        }
                    });
                    if (labelList.length > 0 && count <= 0) {
                        Notification({
                            description:'请选择设备标签',
                        });
                        return;
                    }
                    if (labelList.length === 0) {
                        Notification({
                            description:'暂无标签，请选择全量设备进行订阅',
                        });
                        return;
                    }
                }
                changeCurrent('next');
                // 版本号写死1.2
                getProtocolListByProductId(subscriptionObjectForm.productId.value.key, '1.2');
            }
        });
    };

    getLabelByProductId = (value) => {
        let { getLabelByProductId } = this.props;
        getLabelByProductId(value);
    };

    _getProductListHTML = () => {
        let { productList } = this.props;
        return productList && productList.map((product, index) => {
                let { productId, productName } = product;
                return (
                    <Option key={productId} value={productId}>{productName}</Option>
                );
            });
    };

    choiceLabel = (index) => {
        let { choiceLabel } = this.props;
        choiceLabel(index);
    };

    _getLabelListHTML = (labelList) => {
        return labelList.map((label, index) => {
            let { checked, labelKey, labelValue } = label;
            return (
                <div key={index} className={`label-item ${checked && 'active-label'}`}
                     onClick={() => this.choiceLabel(index)}>
                    {labelKey}-{labelValue}
                </div>
            );
        });
    };

    render() {
        const { form, subscriptionObjectForm, labelListPlains, labelList } = this.props;
        const { indeterminate, checkAll, labelOrDevice } = subscriptionObjectForm;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 21 },
        };

        return (
            <div className="first-content">
                <Form {...formItemLayout} className="subscription-object-form">
                    <Form.Item
                        label="选择产品"
                        wrapperCol={{ span: 6 }}
                        className="product-select"
                    >
                        {getFieldDecorator('productId', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择产品',
                                }
                            ],
                        })
                        (<Select
                            showSearch
                            labelInValue
                            placeholder="请选择产品"
                            optionFilterProp="children"
                            onChange={this.getLabelByProductId}
                        >
                            {this._getProductListHTML()}
                        </Select>)}
                    </Form.Item>
                    <Form.Item
                        label="选择设备"
                    >
                        {getFieldDecorator('labelOrDevice', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择设备',
                                },
                            ],
                        })
                        (<Radio.Group>
                            <Radio value={1}>全部设备</Radio>
                            <Radio value={0}>根据标签筛选设备</Radio>
                        </Radio.Group>)}
                    </Form.Item>
                    <Row gutter={8} align="middle">
                        <Col span={3} className="product-label" />
                        {labelOrDevice.value === 0 ? (labelList.length > 0 ?
                            <Col style={{ padding: '24px' }} span={20} className="remarks">
                                <Form.Item
                                    label=""
                                    colon={false}
                                    labelCol={{ span: 0 }}
                                >
                                    {getFieldDecorator('checkAll')
                                    (<Checkbox
                                        indeterminate={indeterminate.value}
                                        checked={checkAll.value}
                                    >
                                        全部标签
                                    </Checkbox>)}
                                </Form.Item>
                                <Form.Item
                                    label=""
                                    colon={false}
                                    labelCol={{ span: 0 }}
                                >
                                    {/*{getFieldDecorator('checkedList', {
                                     rules: [
                                     {
                                     required: false,
                                     message: '请选择设备标签',
                                     }
                                     ],
                                     })
                                     (<CheckboxGroup
                                     options={labelListPlains}
                                     />)}*/}
                                    <div className="label-wrapper">
                                        {this._getLabelListHTML(labelList)}
                                    </div>
                                </Form.Item>
                            </Col> : <div className="label-desc">暂无标签，请选择全量设备进行订阅</div>) :
                            <Col span={20}>
                                <div className="label-desc">备注：选择全量设备，则订阅产品下截止目前的所有激活的设备。
                                </div>
                            </Col>}
                    </Row>
                </Form>
            </div>
        )
    }
}

export const WrappedSubscriptionObjectForm = Form.create({
    name: 'subscriptionObject',
    onFieldsChange(props, changedFields) {
        console.log('changedFields', changedFields);
        if (JSON.stringify(changedFields) === '{}') {
            return;
        }
        props.changeFormData('subscriptionObjectForm', changedFields);
    },
    mapPropsToFields(props) {
        const { subscriptionObjectForm } = props;

        let subscriptionObjectFormMap = {};
        for (let key of Object.keys(subscriptionObjectForm)) {
            subscriptionObjectFormMap[key] = Form.createFormField({
                ...subscriptionObjectForm[key],
                value: subscriptionObjectForm[key].value,
            })
        }
        return subscriptionObjectFormMap;
    }
})(SubscriptionObjectForm);
