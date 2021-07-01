import React, { Component } from 'react';
import { Form, Table, Tabs } from 'antd';
import { Notification } from '../../../../../components/Notification';

const { TabPane } = Tabs;

class SubscriptionContentForm extends Component {

    componentDidMount() {
        this.props.onRef(this);
    }

    handleSubmit = e => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        const { changeCurrent, devicePushDataConfList } = this.props;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                let flag = false;
                devicePushDataConfList && devicePushDataConfList.forEach((item) => {
                    if (item.selectedProtocolRowKeys.length > 0) {
                        flag = true;
                    }
                });
                if (!flag) {
                    Notification({
                        description:'请至少选择一条协议',
                    });
                    
                    return;
                }
                changeCurrent('next');
            }
        });
    };

    _getAntDProtocolListData = (protocolList, dataType) => {
        const { devicePushDataConfList, onSelectChange } = this.props;
        let devicePushDataConfListItem = devicePushDataConfList.find((item) => {
            return item.dataType === dataType;
        });
        let selectedProtocolRowKeys = [];
        if (devicePushDataConfListItem) {
            selectedProtocolRowKeys = devicePushDataConfListItem.selectedProtocolRowKeys;
        }
        let dataSource = protocolList;
        let antDProtocolList = [];
        dataSource.forEach((item) => {
            let { property, bitDefList } = item;
            if (property) {
                antDProtocolList.push(item);
            } else if (bitDefList && bitDefList.length > 0) {
                bitDefList.forEach((bit) => {
                    if (bit.property) {
                        antDProtocolList.push(bit);
                    }
                })
            }
        });
        antDProtocolList.forEach((item) => {
            item.key = item.property;
            // item.controlOrder = `${item.propertyName}_${item.property}`;
        })
        let columns = [{
            title: '数据名称',
            dataIndex: 'propertyName',
            key: 'propertyName',
        }, {
            title: '数据标志',
            dataIndex: 'property',
            key: 'property',
        },{
            title: '数据属性',
            dataIndex: 'propertyValueDesc',
            key: 'propertyValueDesc',
        }];
        const rowSelection = {
            // fixed: 'right',
            selectedRowKeys: selectedProtocolRowKeys,
            onChange: (selectedProtocolRowKeys) => onSelectChange(selectedProtocolRowKeys, dataType),
            hideDefaultSelections: true,
            selections: true,
        };
        return {
            rowSelection,
            antDProtocolList,
            columns,
        }
    };

    _getAntDTabs = () => {
        let { protocolList } = this.props;
        return (
            protocolList && protocolList.map((protocol) => {
                let { dataType, dataTypeName, list } = protocol;
                let { rowSelection, antDProtocolList, columns } = this._getAntDProtocolListData(list, dataType);
                return (
                    <TabPane className="" tab={dataTypeName} key={dataType}>
                        <Table
                            rowSelection={rowSelection}
                            dataSource={antDProtocolList}
                            columns={columns}
                            pagination={false}
                            // pagination={{
                            //     defaultCurrent: 1,
                            //     pageSize: 10,
                            //     total: list.length,
                            //     showQuickJumper: true,
                            // }}
                        />
                    </TabPane>
                )
            })
        );
    };

    render() {
        let { productName } = this.props;
        return (
            <div className="second-content">
                <div className="product-name">
                    <span>已选择产品：</span>
                    <span>{productName}</span>
                </div>
                <div className="protocol-type clearfix">
                    <span className="protocol-type-label">请选择协议类型：</span>
                    <Tabs type="card" className="protocol-type-content" defaultActiveKey="1">
                        {this._getAntDTabs()}
                    </Tabs>
                </div>
            </div>
        );
    }
}

export const WrappedSubscriptionContentForm = Form.create({
    name: 'subscriptionContent',
})(SubscriptionContentForm);
