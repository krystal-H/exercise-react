import { SystemState } from "../types";

// 获取当前配置 触发事件 节点类型列表清单
const getEntryList = (_nodeConfigrationList: any) => {
  return (_nodeConfigrationList.filter((d: any) => d.id === "eventTrigger")[0]
    .list as []).map((d: any) => d.id);
};

// 触发事件节点的拖置放置判断
export const entry_canDrop = (
  state: SystemState,
  nodeType: string,
  x: number,
  y: number,
  _nodeConfigrationList: any,
  _nodeConfigurationMaps: any
) => {
  const { nodeList: nowList } = state;
  const entryList = getEntryList(_nodeConfigrationList);
  let alreadyHad = false;
  for (let i = 0; i < nowList.length; i++) {
    if (entryList.indexOf(nowList[i].nodeType) > -1) {
      alreadyHad = true;
      break;
    }
  }
  if (alreadyHad) {
    return "最多只能有一个输入类型的节点，请删除不需要的触发节点";
  }
  return false;
};
