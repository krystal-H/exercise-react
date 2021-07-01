import React, { Component } from "react";
import {
  NodeItem,
  ProductProps,
  ParentItemProps,
  DebugObject,
  Status,
} from "../../../store/types";
import DefaultView from "./DefaultView";
import { configurationMap } from "../../../store/params";

export interface ConfigurationProps {
  changeNodeConfiguration: (nodeId: string, config: object) => void;
  nodeError: (nodeId: string, isError?: boolean) => void;
  fullScreen: () => void;

  readonly: boolean; // 是否是只读模式

  isShow: boolean; // 是否显示配置窗口
  isFullScreen: boolean; // 是否全屏显示配置窗口
  nodeItem: NodeItem | undefined;

  parents: ParentItemProps[]; // 父节点列表

  testEnv: Status; // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除  999-调试中
  debuggedData: object | null; // 当前已调试的节点数据（树结构）
  debuggedMap: DebugObject; // 当前已调试的每个节点情况,以节点id为key的平面结构

  /* 全局相关参数 */
  product: ProductProps; // 产品列表
  api: ProductProps; // 项目内api列表
  platformapi:ProductProps;// 平台内api列表
  mqTopic: ProductProps; // 项目内队列列表
  rocketMQTopic: ProductProps; // 项目内topic列表
  database: ProductProps; // 项目内数据源列表
  redis: ProductProps; // 项目内Redis数据源列表
}

const fullty = { left: 0, width: "auto" };

class Configuration extends Component<ConfigurationProps> {
  public render(): JSX.Element | null {
    const { readonly, isShow, isFullScreen, nodeItem } = this.props;
    if (!isShow) return null;

    let Com = <DefaultView />;
    if (nodeItem !== undefined) {
      const { nodeType } = nodeItem;
      const { configuration: Configuration } = configurationMap[nodeType];
      Com = <Configuration {...this.props} />;
    }

    const cls = "draw-right" + (readonly ? " draw-readonly" : ""),
      sty = isFullScreen ? fullty : undefined;
    return (
      <div className={cls} style={sty}>
        {Com}
      </div>
    );
  }
}

export default Configuration;
