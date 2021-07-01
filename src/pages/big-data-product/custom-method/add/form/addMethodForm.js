/**
 * Created by xiaodaoguang on 2019/8/29.
 */
import React, { Component } from 'react';
import {
    Form,
    Input,
    Select,
    Row,
    Col,
    Button,
    Radio,
} from 'antd';

const Option = Select.Option;

class AddMethodForm extends Component {

    constructor(props) {
        super(props);
    }

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { addMethod, protocolList, curApi } = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                const { property } = values;
                let protocolItemList = protocolList && protocolList.find((protocol, index) => {
                    let { dataType } = protocol;
                    return dataType === curApi.dataType;
                }).list;
                values.propertyName = protocolItemList.find(item => item.property === property).propertyName;
                addMethod(values);
            }
        });
    };

    _getProductListHTML = () => {
        let { productList } = this.props;
        return productList && productList.map((product, index) => {
                let { productId, productName } = product;
                return (
                    <Option key={index} value={productId}>{productName}</Option>
                );
            });
    };

    _getProtocolListHTML = () => {
        let { protocolList, bindType } = this.props;
        let filteredProtocolList = [];
        // 蓝牙设备
        if (bindType === 2) {
            filteredProtocolList = protocolList && protocolList.filter((protocol, index) => {
                    let { dataType } = protocol;
                    // 蓝牙设备需要运行、历史运行、历史控制、状态数据
                    return dataType === 3 || dataType === 8 || dataType === 20 || dataType === 27;
                });
        } else {
            filteredProtocolList = protocolList && protocolList.filter((protocol, index) => {
                    let { dataType } = protocol;
                    // 非蓝牙设备只需要运行数据
                    return dataType === 3
                });

        }
        return filteredProtocolList.map((protocol, index) => {
            let { dataType, dataTypeName } = protocol;
            return (
                <Option key={index} value={dataType}>{dataTypeName}</Option>
            );
        });
    };

    _getCurProtocolListHTML = () => {
        let { protocolList, curApi } = this.props;
        if (protocolList.length === 0 || !curApi.dataType) {
            return;
        }
        let protocolItemList = protocolList && protocolList.find((protocol, index) => {
                let { dataType } = protocol;
                return dataType === curApi.dataType;
            }).list;
        return protocolItemList && protocolItemList.map((item, index) => {
                let { property, propertyName } = item;
                return (
                    <Option key={index} value={property}>{propertyName}</Option>
                );
            });
    };


    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const formItemLayout = {
            labelCol: { span: 3 },
        };
        return (
            <div className="add-method-form-wrapper">
                <div className="title">
                    添加方法
                </div>
                <Form {...formItemLayout} className="add-method-form">
                    <div className="api-name">
                        <Form.Item
                            label="添加方法名称"
                            wrapperCol={{ span: 10 }}
                        >{getFieldDecorator('apiName', {
                            rules: [
                                {
                                    max: 50,
                                    message: '最多可输入50个字符',
                                },
                                {
                                    required: true,
                                    message: '请输入方法名称',
                                }
                            ],
                        })
                        (<Input
                            placeholder='最多可输入50个字符'
                        />)}
                        </Form.Item>
                    </div>
                    <div className="select-wrapper">
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item
                                    label="产品名称"
                                    labelCol={{ span: 9 }}
                                    wrapperCol={{ span: 15 }}
                                >{getFieldDecorator('productId', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择产品',
                                        }
                                    ],
                                })
                                (<Select
                                    showSearch
                                    placeholder="请选择产品"
                                    optionFilterProp="children"
                                    // getPopupContainer={triggerNode => triggerNode.parentElement}
                                >
                                    {this._getProductListHTML()}
                                </Select>)}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="数据类型"
                                    labelCol={{ span: 9 }}
                                    wrapperCol={{ span: 15 }}
                                >{getFieldDecorator('dataType', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择数据类型',
                                        }
                                    ],
                                })
                                (<Select
                                    showSearch
                                    placeholder="请选择数据类型"
                                    optionFilterProp="children"
                                >
                                    {this._getProtocolListHTML()}
                                </Select>)}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                {/* <div className="desc">
                                    <Button type="primary" htmlType="submit">
                                        查看说明
                                    </Button>
                                </div> */}
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item
                                    label="统计协议"
                                    labelCol={{ span: 9 }}
                                    wrapperCol={{ span: 15 }}
                                >{getFieldDecorator('property', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择统计协议',
                                        }
                                    ],
                                })
                                (<Select
                                    showSearch
                                    placeholder="请选择统计协议"
                                    optionFilterProp="children"
                                >
                                    {this._getCurProtocolListHTML()}
                                </Select>)}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label="统计精度"
                                    labelCol={{ span: 9 }}
                                    wrapperCol={{ span: 15 }}
                                >{getFieldDecorator('reportFormsType', {
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择统计精度',
                                        }
                                    ],
                                })
                                (<Select>
                                    <Option value={4}>1小时</Option>
                                    <Option value={3}>1天</Option>
                                    <Option value={2}>1月</Option>
                                    <Option value={1}>1年</Option>
                                </Select>)}
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                    <div className="time-zone">
                        <Form.Item
                            label="时区"
                            labelCol={{ span: 3 }}
                            wrapperCol={{ span: 4 }}
                        >{getFieldDecorator('cityTimeZone', {
                            rules: [
                                {
                                    required: true,
                                    message: '请选择统计精度',
                                }
                            ],
                        })
                        (<Select>
                            <Option value={8}>北京</Option>
                        </Select>)}
                        </Form.Item>
                    </div>
                    <div className="compute-rule">
                        <Form.Item label="返回值计算规则：">
                            {getFieldDecorator('ruleType', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择计算规则',
                                    }
                                ],
                            })
                            (<Radio.Group>
                                <Radio className="radio-item"
                                       value={1}>平均值：y=（a1+a2+...+an）/n</Radio>
                                <Radio className="radio-item" value={2}>和：y= an+a（n-1）</Radio>
                                <br />
                                <Radio className="radio-item" value={3}>最大值：y=amax</Radio>
                                <Radio className="radio-item" value={4}>最小值：y=amin</Radio>
                            </Radio.Group>)}
                        </Form.Item>
                    </div>
                    <div className="submit">
                        <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>
                            提交审核
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}

export const WrappedAddMethodForm = Form.create({
    name: 'addMethod',
    onFieldsChange(props, changedFields) {
        console.log('changedFields', changedFields);
        if (JSON.stringify(changedFields) === '{}') {
            return;
        }
        props.changeCurApi(changedFields);
    },
    mapPropsToFields(props) {
        const { curApi } = props;
        let curApiMap = {};
        for (let key of Object.keys(curApi)) {
            curApiMap[key] = Form.createFormField({
                value: curApi[key],
            })
        }
        return curApiMap;
    }
})(AddMethodForm);
