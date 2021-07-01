import React, { Component } from "react";
import {
  NodeItem,
  ContextMenuType,
  Status,
  DebugObject,
  CodeType,
} from "../../../store/types";
import { configurationMap } from "../../../store/params";
import {
  moveStart,
  connectStart,
  connectOK,
  showContextMenu,
} from "../../../tools/drag";
import { Icon, Popover } from "antd";
import { getNodeHeight } from "../../../store/action";

interface NodeListProps {
  changeChooseId: (id: string | null) => void;

  readonly: boolean; // 是否是只读模式

  nodeList: NodeItem[]; // 当前所画节点列表
  nodeMap: object; //  当前所画全部节点映射

  testEnv: Status; // 测试环境（0-开发中；1-编译完成；2-运行中；3-停止；4-删除  999-调试中
  debuggedMap: DebugObject; // 当前已调试的每个节点情况,以节点id为key的平面结构

  chooseId: null | string; // 当前选中节点id或线条id
}

class NodeList extends Component<NodeListProps> {
  public render(): JSX.Element {
    const {
      readonly,
      nodeList,
      chooseId,
      testEnv,
      debuggedMap,
      changeChooseId,
    } = this.props;
    return (
      <>
        {nodeList.map((node, idx) => {
          const {
            id,
            nodeType,
            x,
            y,
            pId,
            entryId,
            isError,
            configuration,
          } = node;

          const debugData =
            testEnv === Status.Debugging ? debuggedMap[id] : null;
          const { code } = debugData || {};
          const isSuccess = code === CodeType.Success,
            isFailure = code === CodeType.Failure;

          const { name: nodeTypeName, iconCls } = configurationMap[nodeType];
          const { name, output } = configuration;
          const description = (
            <div className="">
              节点名称：{name}
              <br />
              节点类型：{nodeTypeName}
              <br />
              ID：{id}
            </div>
          );
          const outNum = output.length;
          const clsWrap =
            "draw-nodeItem draw-nodeItem-move" +
            (chooseId === id ? " draw-nodeItem-selected" : "") +
            (isError ? " draw-nodeItem-fault" : "") +
            (readonly ? " draw-readonly" : "");
          const clsOutput =
            "draw-output-wrap" + (outNum === 1 ? " draw-output-wrap-only" : "");
          const clsIcon = "draw-nodeItem-icon " + (iconCls || "");
          const clsEntry = "draw-entry" + (pId ? " draw-forbid" : "");
          const style = {
            left: x + "px",
            top: y + "px",
            height: getNodeHeight(node),
            zIndex: 30 + idx,
          };
          const connectOKEve = (e: React.MouseEvent) =>
            connectOK(e, id, entryId, pId, nodeType);
          return (
            <div
              className={clsWrap}
              style={style}
              id={id}
              data-type={nodeType}
              key={id}
              onContextMenu={
                readonly
                  ? undefined
                  : (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                      showContextMenu(e, ContextMenuType.NODE, id);
                    }
              }
            >
              <Popover
                content={description}
                placement="right"
                overlayClassName="draw-popover"
                mouseEnterDelay={1}
              >
                <div
                  className="draw-nodeItem-inner"
                  onMouseDown={
                    readonly
                      ? undefined
                      : (e: React.MouseEvent) => moveStart(e, id, x, y)
                  }
                  onMouseUp={readonly ? undefined : connectOKEve}
                  onClick={readonly ? () => changeChooseId(id) : undefined}
                >
                  <i className={clsIcon} />
                  <div className="draw-nodeItem-text">{name}</div>
                  {isError || isFailure ? (
                    <Icon
                      className="draw-nodeItem-error"
                      type="close-circle"
                      theme="filled"
                    />
                  ) : null}
                  {isSuccess ? (
                    <Icon
                      className="draw-nodeItem-success"
                      type="check-circle"
                      theme="filled"
                    />
                  ) : null}
                </div>
              </Popover>
              {pId ? (
                <div className="draw-arrow">
                  <div className="draw-arrow-inner" />
                </div>
              ) : null}
              {entryId ? (
                <div
                  id={entryId}
                  className={clsEntry}
                  onMouseUp={readonly ? undefined : connectOKEve}
                />
              ) : null}
              {outNum > 0 ? (
                <div className={clsOutput}>
                  {output.map(({ id: outputId, connectId }, i) => {
                    const _clsOutput =
                        "draw-output draw-output-" +
                        i +
                        (connectId ? " draw-forbid" : ""),
                      connectEve = !connectId // 只有未连接的出口才开启connect事件
                        ? (e: React.MouseEvent) => connectStart(e, id, outputId)
                        : undefined;
                    return (
                      <div
                        key={outputId}
                        id={outputId}
                        className={_clsOutput}
                        onMouseDown={readonly ? undefined : connectEve}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </>
    );
  }
}

export default NodeList;
