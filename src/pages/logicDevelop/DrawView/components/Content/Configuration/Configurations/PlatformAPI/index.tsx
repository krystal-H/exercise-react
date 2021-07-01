import React, { Component } from "react";
import BaseConfiguration from "../../BaseConfiguration";
import { NodeItem, formType } from "../../../../../store/types";
import { ConfigurationProps } from "../../../Configuration";
import { Form, Select } from "antd";
import rules from "../../rules";
import CodeView from "../../../../../../../../components/CodeView2";

interface PlatformAPIProps extends ConfigurationProps {
  nodeItem: NodeItem;
}

class platformAPI extends Component<PlatformAPIProps> {
  state = {
    mustReCode: false, // 是否是必须要更新codeView的情况
  };

  componentDidUpdate() {
    if (this.state.mustReCode) {
      this.setState({ mustReCode: false });
    }
  }

  onChange = (data: object) => {
    const {
      nodeItem: { id },
      changeNodeConfiguration,
    } = this.props;
    changeNodeConfiguration(id, data);
  };
  setParams = (params: string) => {
    this.onChange({ params });
  };
  setParams2 = (apiId: number | string) => {
    const {
      platformapi: { list },
    } = this.props;
    const choose = list.find((d) => d.id === apiId);
    if (choose) {
      this.setParams(choose.params);
      this.setState({ mustReCode: true });
    }
  };

  getChildren = (form: formType) => {
    // console.log(88888,this.props);
    const { mustReCode } = this.state;
    const {
      readonly,
      platformapi: { isLoading, isError, list },
      nodeItem: { configuration },
    } = this.props;
    const { apiId, params } = configuration;
    const { getFieldDecorator } = form;
    const isNull = isError || list.length === 0;

    return (
      <>
        <div className="draw-group">
          <div className="draw-group-inner">可用API配置</div>
        </div>
        <Form.Item label="API">
          {getFieldDecorator("apiId", {
            initialValue: apiId,
            rules: [rules.isRequire("API")],
          })(
            <Select
              showSearch
              placeholder={isNull ? "暂无可用API" : "请选择API"}
              notFoundContent="未找到相应记录"
              optionFilterProp="children"
              loading={isLoading}
              disabled={isNull || readonly}
              onChange={this.setParams2}
            >
              {list.map(({ id, value }) => (
                <Select.Option value={id} key={id}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          )}
          {/* {apiId !== undefined ? (
            <Button className="draw-link" type="link" onClick={undefined}>
              查看该API详情
            </Button>
          ) : null} */}
        </Form.Item>
        <a className="goto-dataasset" href="#/userCenter/dataasset" target='_blank'>数据资产知识库管理</a>

        {apiId !== undefined && !mustReCode ? (
          <Form.Item label="API入参">
            <CodeView
              readOnly={readonly}
              mode="json"
              code={params}
              onChange={this.setParams}
            />
          </Form.Item>
        ) : null}
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

export default platformAPI;
