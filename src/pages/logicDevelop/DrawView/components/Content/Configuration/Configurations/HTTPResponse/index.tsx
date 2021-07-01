import React, { Component } from "react";
import BaseConfiguration, { getNameCom } from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Collapse, Table } from "antd"; // Button, Divider, Popconfirm
import ValueMatch from "../comm/ValueMatch";
import { systemCodeList } from "../../../../../store/constants";
// import CodeModal from "../commModal/CodeModal";

interface HTTPResponseProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

interface HTTPResponseState {
  show: string[];
}

// let autoIds = 1;

class HTTPResponse extends Component<HTTPResponseProps, HTTPResponseState> {
  state = {
    show: ["1"],
  };

  // 系统返回码列表
  columns = [
    { title: "返回码", width: 60, dataIndex: "code", key: "code" },
    { title: "信息", dataIndex: "message", key: "message", ellipsis: true },
  ];

  // 自定义返回码列表
  /*columns2 = [
    ...this.columns,
    {
      title: "操作",
      width: 100,
      dataIndex: "do",
      key: "do",
      render: (value: any, data: any) => {
        return (
          <>
            <Button type="link" onClick={() => this.editCode(data.id)}>
              编辑
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="确定要删除该返回码吗？"
              overlayClassName="draw-confirm"
              okText="删除"
              okType="danger"
              getPopupContainer={() => document.body}
              cancelText="取消"
              placement="topRight"
              onConfirm={() => this.delCode(data.id)}
            >
              <Button type="link">删除</Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];*/

  toggle = (show: string[]) => {
    this.setState({ show });
  };

  onChange = (config: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, config);
  };
  /*closeModal = () => {
    this.onChange({
      showCodeModal: false, // 是否显示code编辑弹窗
      showCodeId: undefined, // 当前修改的返回码id
    });
  };
  saveCode = (data: object) => {
    let {
      nodeItem: {
        configuration: { codes, showCodeId },
      },
    } = this.props;
    codes = [...codes];
    if (showCodeId) {
      const d = codes.find((d: any) => d.id === showCodeId);
      if (d) {
        Object.assign(d, data);
      }
    } else {
      codes.push({ ...data, id: ++autoIds });
    }
    this.onChange({ codes });
  };
  addCode = () => {
    this.onChange({
      showCodeModal: true, // 是否显示code编辑弹窗
      showCodeId: undefined, // 当前修改的返回码id
    });
  };
  editCode = (id: number) => {
    this.onChange({
      showCodeModal: true, // 是否显示code编辑弹窗
      showCodeId: id, // 当前修改的返回码id
    });
  };
  delCode = (id: number) => {
    let {
      nodeItem: {
        configuration: { codes },
      },
    } = this.props;
    codes = [...codes];
    const idx = codes.findIndex((d: any) => d.id === id);
    if (idx > -1) {
      codes.splice(idx, 1);
    }
    this.onChange({ codes });
  };*/

  getChildren = (form: formType) => {
    const { show } = this.state;
    const {
      readonly,
      parents,
      nodeItem: { configuration },
    } = this.props;
    const {
      source,
      sourceType,
      sourceValue,
      // codes,
      // showCodeModal,
      // showCodeId,
    } = configuration;

    const label = getNameCom(
      "输出",
      "API返回的body可以是静态数据或来自其他节点（在第一个输入框内指定）；如果来自其他节点，可以返回一个值或一个json。"
    );

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">返回</div>
        </div>
        <Form.Item label={label} required>
          <ValueMatch
            readonly={readonly}
            moreValueType={true}
            parents={parents}
            source={source}
            sourceType={sourceType}
            sourceValue={sourceValue}
            onChange={this.onChange}
          />
        </Form.Item>

        <div className="draw-group">
          <div className="draw-group-inner">返回码</div>
        </div>
        <Collapse defaultActiveKey={show} onChange={this.toggle}>
          <Collapse.Panel header="系统返回码" key="1">
            <Table
              size="small"
              pagination={false}
              columns={this.columns}
              rowKey="code"
              dataSource={systemCodeList}
            />
          </Collapse.Panel>
          {/* <div className="draw-row">
            <Button type="link" onClick={this.addCode} disabled={readonly}>
              新增返回码
            </Button>
          </div>
          <Collapse.Panel header="自定义返回码" key="2">
            {codes.length > 0 ? (
              <Table
                size="small"
                pagination={false}
                columns={readonly?this.columns:this.columns2}
                rowKey="id"
                dataSource={codes}
              />
            ) : null}
          </Collapse.Panel> */}
        </Collapse>

        {/* <CodeModal
          isShow={showCodeModal}
          id={showCodeId}
          list={codes}
          hide={this.closeModal}
          submit={this.saveCode}
        /> */}
      </>
    );
  };
  public render(): JSX.Element {
    const {
      nodeItem: { id },
    } = this.props;

    // 配置传递给高阶组件的参数
    const baseProps = {
      ...this.props,

      // 一些额外参数
      log: undefined, // 日志组件，暂无需求，不知道咋做
      render: this.getChildren,
    };
    return <BaseConfiguration {...baseProps} key={id} />;
  }
}

export default HTTPResponse;
