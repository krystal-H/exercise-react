import React, { Component } from "react";
import { LineItem, ContextMenuType } from "../../../store/types";
import { showContextMenu } from "../../../tools/drag";

interface LineListProps {
  changeChooseId: (id: string | null) => void;
  changeChooseLineId: (id: string | null) => void;

  readonly: boolean; // 是否是只读模式

  lineList: LineItem[]; // line列表
  chooseId: null | string; // 当前选中节点id或线条id
  chooseLineId: null | string; // 临时悬浮的选中线条id
}

const lineColor = "#c1c1c1",
  lineActiveColor = "#0070CC",
  fakeLineColor = "rgba(255,0,0,.0)";

class LineList extends Component<LineListProps> {
  public render(): JSX.Element {
    const {
      readonly,
      lineList,
      chooseId,
      chooseLineId,
      changeChooseId,
      changeChooseLineId,
    } = this.props;
    // console.log("---readonly---",lineList);
    return (
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        id="drawView-Line"
        onClick={
          readonly
            ? undefined
            : (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
                changeChooseId(null);
              }
        }
        onContextMenu={
          readonly
            ? undefined
            : (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
                showContextMenu(
                  e,
                  ContextMenuType.CONTEXT,
                  ContextMenuType.CONTEXT
                );
              }
        }
      >
        {lineList.map(({ uniqueId, path }) => {
          const color =
            uniqueId === chooseId || uniqueId === chooseLineId
              ? lineActiveColor
              : lineColor;
          return (
            <g key={uniqueId}>
              <path
                id={uniqueId}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1}
              />
              <path
                d={path}
                fill="none"
                stroke={fakeLineColor}
                strokeWidth={20}
                onMouseEnter={() => changeChooseLineId(uniqueId)}
                onMouseLeave={() => changeChooseLineId(null)}
                onClick={
                  readonly
                    ? undefined
                    : (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
                        e.stopPropagation();
                        changeChooseId(uniqueId);
                      }
                }
                onContextMenu={
                  readonly
                    ? undefined
                    : (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
                        showContextMenu(e, ContextMenuType.LINE, uniqueId);
                      }
                }
              />
            </g>
          );
        })}
      </svg>
    );
  }
}

export default LineList;
