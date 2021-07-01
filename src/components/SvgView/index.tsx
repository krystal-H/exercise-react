import React from "react";

export enum MyIcon {
  LeftView = "M32 928V96h960v832H32zM915.2 172.8H352v678.4h563.2V172.8z",
  LogView = "M992 96v832H32V96h960z m-76.8 76.8H108.8v419.2h806.4V172.8z",
  RightView = "M32 928V96h960v832H32zM672 172.8H108.8v678.4H672V172.8z",
  Fullscreen = "M246.624 416H128V128h288v118.624H246.624zM777.376 416H896V128h-288v118.624h169.376zM246.624 608H128v288h288v-118.624H246.624zM777.376 608H896v288h-288v-118.624h169.376z",
  FullscreenBack = "M297.376 128H416v288H128V297.376h169.376zM726.624 128H608v288h288V297.376h-169.376zM297.376 896H416v-288H128v118.624h169.376zM726.624 896H608v-288h288v118.624h-169.376z",
  Close = "M617.92 516.096l272 272-101.824 101.824-272-272-272 272-101.856-101.824 272-272-275.008-275.04L241.056 139.2l275.04 275.04 275.04-275.04 101.824 101.824-275.04 275.04z",
}

interface SvgViewProps {
  icon: MyIcon; // svg图标
  width?: number; // 宽度
  height?: number; // 高度
  fill?: string; // 填充

  [others: string]: any;
}

const svgColor = "#333";

const SvgView = function (props: SvgViewProps) {
  const { icon, width = 16, height = 16, fill = svgColor, ...others } = props;
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={width}
      height={height}
    >
      <path d={icon} fill={fill} {...others}></path>
    </svg>
  );
};

export default SvgView;
