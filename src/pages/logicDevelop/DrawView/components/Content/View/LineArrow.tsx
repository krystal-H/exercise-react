import React, { Component } from "react";
import { Point } from "../../../store/types";

interface LineArrowProps {
  lineArrow: Point | null; // 连线时产生的箭头
}

class LineArrow extends Component<LineArrowProps> {
  public render(): JSX.Element | null {
    const { lineArrow } = this.props;
    if (lineArrow === null) return null;
    const { x, y } = lineArrow;
    const sty = { left: x + "px", top: y + "px" };
    return (
      <div className="draw-arrow draw-arrow-connect" style={sty}>
        <div className="draw-arrow-inner" />
      </div>
    );
  }
}

export default LineArrow;
