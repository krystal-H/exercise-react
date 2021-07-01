import httpEvent from "./HTTPEvent";
import mqttEvent from "./mqttEvent";
import conditionalJudgment from "./conditionalJudgment";
import optionJudgment from "./optionJudgment";
import calculat from "./calculat";
import nodeJsScript from "./nodeJsScript";
import tripartieApi from "./tripartieApi";
import officialAPI from "./officialAPI";
import httpResponse from "./httpResponse";
import mqttRelease from "./mqttRelease";
import rocketMQRelease from "./rocketMQRelease";
import mySql from "./mySql";
import keyValue from "./keyValue";
import forLoop from "./forLoop";
import forLoopEnd from "./forLoopEnd";
import tcpEvent from "./tcpEvent";
import tcpRelease from "./tcpRelease";

// import dataAnalysis from "./dataAnalysis";
// import variableSet from "./variableSet";
// import device from "./device";

import platformApi from "./platformApi";

import {
  SystemState,
  ConfigurationProps,
  NodeItem,
  OutputType,
  AnyData,
} from "../types";
import fn from "../../tools/fn";
import rules from "../../components/Content/Configuration/rules";

const nodeConfigrationList = [
  {
    id: "eventTrigger",
    name: "触发事件",
    list: [httpEvent, mqttEvent, tcpEvent],
  },
  {
    id: "logicalJudgment",
    name: "逻辑处理",
    list: [conditionalJudgment, optionJudgment, calculat, nodeJsScript,forLoop,forLoopEnd],
  },
  {
    id: "seviceCall",
    name: "服务调用",
    list: [tripartieApi, officialAPI, platformApi],
  },
  {
    id: "output",
    name: "输出",
    list: [httpResponse],
  },
  {
    id: "message",
    name: "消息转发",
    list: [mqttRelease, rocketMQRelease, tcpRelease],
  },
  {
    id: "data",
    name: "数据处理",
    list: [
      mySql,
      keyValue,
      // dataAnalysis,
      // variableSet
    ],
  },
  // {
  //   id: "device",
  //   name: "设备",
  //   list: [device],
  // },
];

export const entryList = (nodeConfigrationList.filter(
  (d: any) => d.id === "eventTrigger"
)[0].list as []).map((d: any) => d.id);

// 节点是否可放置的判断
const input_canDropBase = (
  state: SystemState,
  nodeType: string,
  x: number,
  y: number,
  _nodeConfigrationList: any,
  _nodeConfigurationMaps: any
) => {
  const { nodeList: nowList } = state;
  if (nowList.length > 99) {
    return "节点数量无法超出100个";
  }
  return false;
};
const name_validate = (
  configuration: ConfigurationProps,
  nodeItem: NodeItem,
  state: SystemState,
  _nodeConfigrationList: any,
  _nodeConfigurationMaps: any
) => {
  return configuration.name === ""
    ? "名称不能为空"
    : !rules.nameTest.test(configuration.name)
    ? "名称不合法"
    : false;
};
export const nodeConfigurationMaps = (() => {
  let maps = {};
  nodeConfigrationList.forEach((d) => {
    d.list.forEach((_d: any) => {
      maps[_d.id] = {
        ..._d,
        initData: () => {
          const _fn = _d.initData;
          return _fn ? _fn() : {};
        },
        outputType:
          _d.outputType !== undefined ? _d.outputType : OutputType.AUTO,
        outputValue: _d.outputValue !== undefined ? _d.outputValue : () => [],
        canDrop: (
          state: SystemState,
          nodeType: string,
          x: number,
          y: number
        ) => {
          const _fn = _d.canDrop || fn.doNothing;
          return (
            input_canDropBase(
              state,
              nodeType,
              x,
              y,
              nodeConfigrationList,
              nodeConfigurationMaps
            ) ||
            _fn(
              state,
              nodeType,
              x,
              y,
              nodeConfigrationList,
              nodeConfigurationMaps
            )
          );
        },
        afterConnect: _d.afterConnect ? _d.afterConnect : fn.doNothing,
        validate: (
          configuration: ConfigurationProps,
          nodeItem: NodeItem,
          state: SystemState
        ) => {
          const _fn = _d.validate || (() => false);
          return (
            name_validate(
              configuration,
              nodeItem,
              state,
              nodeConfigrationList,
              nodeConfigurationMaps
            ) ||
            _fn(
              configuration,
              nodeItem,
              state,
              nodeConfigrationList,
              nodeConfigurationMaps
            )
          );
        },
        toConfiguration: (data: AnyData) => {
          // 设置一个默认的转换工具
          const { initData, toConfiguration } = _d;
          return { ...(initData ? initData() : {}), ...toConfiguration(data) };
        },
      };
      maps[_d.nodeType] = maps[_d.id]; // 创建双id映射关系
    });
  });
  return maps;
})();

export default nodeConfigrationList;
