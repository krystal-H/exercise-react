import React, { PureComponent } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Button, Row, Col } from 'antd';
import { get, Paths } from '../../../../api';
import { DateTool } from '../../../../util/util';
import { REQUEST_SUCCESS } from '../../../../configs/request.config';
import PageTitle from '../../../../components/page-title/PageTitle';

import './style.scss'

@withRouter
class DataSubscriptionDetail extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            curSubscription: {},
        }
    }

    componentDidMount = () => {
        // 动态路由的id从this.props.match.params里拿
        const urlConfId = this.props.match.params.urlConfId;
        this._getCurSubscription(urlConfId);
    };

    _getCurSubscription = (urlConfId) => {
        get(Paths.getCurSubscription, {
            urlConfId: Number(urlConfId),
            version: '1.1',
        }, { loading: true }).then((res) => {
            const code = res.code;
            const data = res.data;
            if (code === REQUEST_SUCCESS) {
                this.setState(() => {
                    return { curSubscription: data };
                });
            }
        });
    };

    _getProtocol = (devicePushDataConfList) => {
        let devicePushDataConfListHTML = devicePushDataConfList && devicePushDataConfList.map((item,index) => {
                let { dataType, protocolProperty } = item;
                let dataTypeName = '';
                switch (dataType) {
                    case 2:
                        dataTypeName = '控制数据';
                        break;
                    case 3:
                        dataTypeName = '运行数据';
                        break;
                    case 4:
                        dataTypeName = '故障数据';
                        break;
                    default:
                        break;
                }

                return (
                    <div className="protocol-type" key={index}>
                        <div className="protocol-type-name">
                            {dataTypeName}
                        </div>
                        <div className="protocol-type-list clearfix">
                            { protocolProperty && protocolProperty.split(',').map((item,index) => {
                                return (
                                    <div key={index} className="protocol-type-list-item fl">{item}</div>
                                );
                            })}
                        </div>
                    </div>
                );
            });
        return (
            <div className="protocol-wrapper">
                {devicePushDataConfListHTML}
            </div>
        );
    };

    _editProtocol = () => {
        let {curSubscription} = this.state,
            { history } = this.props,
            {urlConfId,productId,productName,deviceLabelIds} = curSubscription;

        if (!urlConfId) {
            return;
        }
        
        history.push({
            pathname:'/open/bigData/dataSubscription/edit/' + urlConfId,
            state:{
                urlConfId,
                productId:{
                    dirty: false,
                    errors: undefined,
                    name: "productId",
                    touched: true,
                    validating: false,
                    value:{
                        key: productId,
                        label: productName,
                    }
                },
                labelOrDevice:{
                    dirty: false,
                    errors: undefined,
                    name: "labelOrDevice",
                    touched: true,
                    validating: false,
                    value: deviceLabelIds ? 0 : 1
                },
                deviceLabelIds
            }
        });
    }

    render() {
        let { curSubscription } = this.state;
        let { pushWay, pushState, createTime,updateTime, productName, labelVoList, devicePushDataConfList,pushToken,url } = curSubscription;
        let deviceLabelListValue = labelVoList && labelVoList.map((item,index) => {
                return (
                    <div key={index} className="label-item fl">{item.labelValue}</div>
                );
            });
        let pushStateStyle = {
            color: '#00B72E',
        };
        let pushStateText = '正常';
        if (pushState === 0) {
            pushStateStyle = {
                color: '#FF2E00',
            };
            pushStateText = '停用'
        } else if (pushState === 1) {
        } else {
            pushStateStyle = {
                color: '#FF2E00',
            };
            pushStateText = '锁定';
        }
        return (
            <div className="detail-subscription-wrapper flex-column">
                <PageTitle backHandle={() => this.props.history.goBack()} title="订阅详情" />
                <div className="detail-content-wrapper flex1">
                    <div className="detail-content">
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                订阅方式：
                            </Col>
                            <Col span={10} className="detail-right">
                                {pushWay == 0 ? 'API数据PUSH形式' : 'MQTT主题订阅'}
                            </Col>
                        </Row>
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                订阅状态：
                            </Col>
                            <Col span={10} style={pushStateStyle} className="detail-right">
                                {pushStateText}
                            </Col>
                        </Row>
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                创建时间：
                            </Col>
                            <Col span={10} className="detail-right">
                                {DateTool.pekingToStr(createTime)}
                            </Col>
                        </Row>
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                更新时间：
                            </Col>
                            <Col span={10} className="detail-right">
                                {DateTool.pekingToStr(updateTime)}
                            </Col>
                        </Row>
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                订阅产品：
                            </Col>
                            <Col span={10} className="detail-right">
                                {productName}
                            </Col>
                        </Row>
                        {
                            pushWay === 0 && 
                            <>
                                <Row gutter={8} className="detail-line">
                                    <Col span={3} className="detail-left">
                                        数据订阅Url：
                                    </Col>
                                    <Col span={10} className="detail-right">
                                        {url}
                                    </Col>
                                </Row>
                                <Row gutter={8} className="detail-line">
                                    <Col span={3} className="detail-left">
                                        token：
                                    </Col>
                                    <Col span={10} className="detail-right">
                                        {pushToken}
                                    </Col>
                                </Row>
                            </>
                        }
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left product-label">
                                产品标签：
                            </Col>
                            <Col span={22} className="detail-right">
                                {deviceLabelListValue}
                            </Col>
                        </Row>
                        <Row gutter={8} className="detail-line">
                            <Col span={3} className="detail-left">
                                订阅数据：
                            </Col>
                            <Col span={22} className="detail-right">
                                {this._getProtocol(devicePushDataConfList)}
                            </Col>
                        </Row>
                        <div className="edit-wrapper">
                            <Button onClick={this._editProtocol} type="primary">编辑</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DataSubscriptionDetail;
