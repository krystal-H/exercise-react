import React, { Component } from "react";
import { Modal, Table } from "antd";

interface ProtocolModalProps {
  isShow: boolean;

  productId: number | string | undefined; // 产品Id
  protocolType: number | string | undefined; // 协议类型

  hide: () => void; // 关闭的方法
}

class ProtocolModal extends Component<ProtocolModalProps> {
  state = {
    isLoading: false,
    isError: false,
    list: [{ lcpId: 1 }, { lcpId: 2 }],
  };
  columns = [
    {
      title: "数据名称",
      dataIndex: "propertyName",
      key: "propertyName",
      width: 160,
    },
    { title: "数据标识", dataIndex: "property", key: "property", width: 160 },
    { title: "数据类型", dataIndex: "javaType", key: "javaType", width: 80 },
    { title: "数据长度", dataIndex: "len", key: "len", width: 80 },
    { title: "数据单位", dataIndex: "unit", key: "unit", width: 80 },
    {
      title: "数据属性",
      dataIndex: "propertyValueDesc",
      key: "propertyValueDesc",
    },
  ];
  onClose = () => {
    this.props.hide();
  };
  public render(): JSX.Element {
    const { isShow } = this.props;
    const { isLoading, isError, list } = this.state;

    return (
      <Modal
        title="协议详情"
        width={960}
        visible={isShow}
        footer={null}
        // centered={true}
        destroyOnClose={true}
        onCancel={this.onClose}
      >
        <Table
          bordered
          className="draw-table-small"
          loading={isLoading}
          rowKey="lcpId"
          pagination={false}
          columns={this.columns}
          dataSource={list}
        />
      </Modal>
    );
  }
}

export default ProtocolModal;
