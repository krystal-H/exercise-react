import React, { PureComponent } from "react";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/line";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
// import 'echarts/lib/chart/funnel';          //漏斗图
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/toolbox";
import "echarts/lib/component/dataZoom";
import "echarts/lib/component/grid";

const addEvent = (element, eventType, handler) => {
  if (element.addEventListener) {
    element.addEventListener(eventType, handler, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + eventType, handler);
  }
};
const removeEvent = (element, eventType, handler) => {
  if (element.removeEventListener) {
    element.removeEventListener(eventType, handler, false);
  } else if (element.detachEvent) {
    element.detachEvent("on" + eventType, handler);
  }
};

class CommECharts extends PureComponent {
  dom = null;
  thisChart = null;
  option = null;
  bindEvent = null;
  resizeTime = null;
  setDom = ele => {
    this.dom = ele;
  };
  componentDidMount() {
    addEvent(window, "resize", this.checkSize);
    if (this.dom) {
      this.thisChart = echarts.init(this.dom);
      this.thisChart.showLoading();
      this.setOption();
    }
  }
  componentDidUpdate() {
    this.setOption();
    this.doSize();
  }
  componentWillUnmount() {
    removeEvent(window, "resize", this.checkSize);
    this.thisChart && this.thisChart.dispose();
  }
  doSize = () => {
    if (this.thisChart) {
      this.thisChart.resize();
    }
  };
  checkSize = () => {
    if (this.dom && this.thisChart) {
      clearTimeout(this.resizeTime);
      this.resizeTime = setTimeout(this.doSize, 300);
    }
  };
  // 改函数用于防止历史series仍留存在图表中的情况
  checkSeries = option => {
    const _option = this.option;

    // 使用刚指定的配置项和数据显示图表。
    this.option = JSON.stringify(option);

    if (_option) {
      const beforeLength = JSON.parse(_option).series.length;
      while (beforeLength > option.series.length) {
        option.series.push({ data: [] });
      }
    }
    return option;
  };
  //解除所有绑定的事件
  unBindEvent = () => {
    const { bindEvent, thisChart } = this;
    if (thisChart && bindEvent !== null && bindEvent.length > 0) {
      bindEvent.forEach(d => {
        const { eventName, handler } = d;
        thisChart.off(eventName, handler);
      });
    }
  };
  setOption = () => {
    const { thisChart, props } = this;
    let { option, bindEvent } = props;
    if (!option) {
      thisChart && thisChart.showLoading();
    } else if (thisChart && option && this.option !== JSON.stringify(option)) {
      // 检查series的变化，如果是图例少了的话，则要加上
      option = this.checkSeries(option);

      thisChart.hideLoading();
      thisChart.setOption(option);
    } else {
      thisChart && thisChart.hideLoading();
    }

    //判断是否需要添加事件监听
    if (
      thisChart &&
      bindEvent &&
      Object.prototype.toString.call(bindEvent) === "[object Array]" &&
      bindEvent !== this.bindEvent
    ) {
      this.unBindEvent();
      this.bindEvent = bindEvent;
      //开始绑定事件
      bindEvent.forEach(d => {
        const { eventName, query, handler } = d;
        query
          ? thisChart.on(eventName, query, handler, thisChart)
          : thisChart.on(eventName, handler, thisChart);
      });
    }
  };
  /**
   * @param:
   *      className       ：  样式名
   *      width           ：  宽度
   *      height          :   层级
   *      option          ：  制图表项
   *      bindEvent       ：  图标事件绑定
   */
  render() {
    const { width, height, className } = this.props;

    let sty = null;
    if (width !== undefined || height !== undefined) {
      sty = {};
    }
    if (width !== undefined) {
      sty.width = width + "px";
    }
    if (height !== undefined) {
      sty.height = height + "px";
    }
    return <div className={className || null} ref={this.setDom} style={sty} />;
  }
}
export default CommECharts;
