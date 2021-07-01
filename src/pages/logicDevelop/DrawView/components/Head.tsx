import React, { Component } from "react";
import { Divider, Popover, Button, message } from "antd";
import ConnectDebugInputModal from "../containers/ConnectDebugInputModal";
import { SystemState, Status } from "../store/types";
import { ServeSourceConfig} from '../../../develop-center/serve-develop/ServeModals'

interface HeadProps {
  undo: () => void;
  clearNode: () => void;
  save: (state: SystemState, nextToPublish?: any) => void;
  deploy: (data: object) => void;
  publish: (data: object) => void;
  showParamsModal: () => void;
  debug: (data: object) => void; // 提交的方法
  openPublish:(num:number)=>void

  productionName: string;
  mustSave: boolean; // 必须要保存才能执行调试发布操作
  testEnv: Status.Developing; // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除
  proEnv: Status.Developing; // 生产环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除
  stackHistory: string[]; // 回滚历史操作堆栈

  isSaving: boolean; // 测试环境节点代码是否正在保存
  isInDeploy: boolean; // 测试环境是否正在部署
  isInDebug: boolean; // 测试环境是否正在调试
  isInPublish: boolean; // 正式环境是否在发布
  isopenPublish: number;
  serviceId: number; // 服务id
  isHTTP: boolean; // 根节点是否是HTTP事件
  params: any[]; // 找到根节点的入参列表

  state: SystemState;
}

interface PopProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
}

export const Pop = function (props: PopProps) {
  const { content, children } = props;
  return (
    <Popover
      content={content}
      mouseEnterDelay={0.3}
      overlayClassName="draw-popover"
    >
      {children}
    </Popover>
  );
};

class Head extends Component<HeadProps> {
  save = () => {
    const { save, state } = this.props;
    save(state);
  };
  // testPublish = () => {
  //   const { save, deploy, mustSave, serviceId, state } = this.props;
  //   if (mustSave) save(state, {});
  //   else deploy({ serviceId });
  // };
  // publish = () => {
  //   const { publish, serviceId } = this.props;
  //   publish({ serviceId });
  // };
  debug = () => {
    // 首先你得确认事件输入是HTTP事件
    // 其次他的参数列表大于0
    // 接着有参数时弹出入参输入列表
    const { debug, showParamsModal, serviceId, isHTTP, params } = this.props;
    if (isHTTP) {
      if (params.length === 0) {
        debug({ serviceId, jsonData: "{}" });
      } else {
        showParamsModal();
      }
    } else {
      message.warn("很抱歉，该触发事件暂不支持调试");
    }
  };

  openPublish = (num:number)=>{//0 没打开  1 打开测试环境发布，2 打开生产
    this.props.openPublish(num)
  }
  //发布确认
 publishOkHandle = (publishdata:object={}) => {
  this.openPublish(0);
  const { isopenPublish, serviceId, mustSave, state, save, publish, deploy} = this.props;
  if(isopenPublish===1){
    if (mustSave) save(state, {...publishdata});
    else deploy({ serviceId,...publishdata });
  }else if(isopenPublish===2){
    publish({ serviceId, ...publishdata});
  }
     
}

  public render(): JSX.Element {
    const {
      productionName,
      mustSave,
      testEnv,
      // proEnv,
      stackHistory,
      isSaving,
      isInDeploy,
      isInDebug,
      isInPublish,
      isopenPublish,
      serviceId,
      undo,
      clearNode,
    } = this.props;
    const canUndo = stackHistory.length > 0,
      disabledDebug =
        mustSave ||
        isSaving ||
        isInDeploy ||
        isInDebug ||
        testEnv < Status.Running, // 是否可以调试（正式环境）
      disabledPublish =
        mustSave ||
        isSaving ||
        isInDeploy ||
        isInPublish ||
        testEnv < Status.Running; // 是否可以发布（正式环境）
    return (
      <div className="draw-top">
        <span>{productionName}</span>
        <div className="draw-tools">
          <Pop content="撤销">
            <Button
              shape="circle"
              icon="rollback"
              disabled={!canUndo}
              onClick={canUndo ? undo : undefined}
            />
          </Pop>

          <Pop content="整理节点">
            <Button
              shape="circle"
              icon="apartment"
              className="draw-rotate"
              onClick={clearNode}
            />
          </Pop>

          <Divider type="vertical" />

          <Pop content="保存">
            <Button
              shape="circle"
              icon="save"
              loading={isSaving}
              disabled={isSaving}
              onClick={this.save}
            />
          </Pop>

          <Pop content="部署">
            <Button
              shape="circle"
              icon="cloud-upload"
              loading={isInDeploy}
              disabled={isSaving || isInDeploy}
              // onClick={this.testPublish}
              onClick={()=>this.openPublish(1)}
            />
          </Pop>

          <Pop content="调试">
            <Button
              shape="circle"
              icon="bug"
              loading={isInDebug}
              disabled={disabledDebug}
              onClick={this.debug}
            />
          </Pop>

          <Pop content="发布正式环境">
            <Button
              shape="circle"
              icon="flag"
              loading={isInPublish}
              disabled={disabledPublish}
              // onClick={this.publish}
              onClick={()=>this.openPublish(2)}
            />
          </Pop>

          <Divider type="vertical" />

          <Pop content="帮助">
            <Button shape="circle" icon="question-circle" disabled={true} />
          </Pop>
        </div>

        <ConnectDebugInputModal />

        <ServeSourceConfig
            visible={isopenPublish>0}
            envdata = {{id:serviceId,actionType:isopenPublish,name:productionName}}
            onOk={this.publishOkHandle}
            onCancel={()=>this.openPublish(0)}
        >
        </ServeSourceConfig>
      </div>
    );
  }
}

export default Head;
