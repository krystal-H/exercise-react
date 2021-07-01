import { post,get } from "../../../../api";
import { urlPrefix } from "../../../../api/paths";
import fn from "../tools/fn";

const prefix = urlPrefix + "/serveOpe";

/*const mockData = {
  flowName: "IoT Studio 业务逻辑开发",
  lines:
    '[{"uniqueId":"65543","id":"65537","outputId":"65538","startPoint":{"x":186,"y":142},"path":"M186 142Q195.9 142 202.5 142T219 142","toId":"65539","entryId":"65540"},{"uniqueId":"65551","id":"65539","outputId":"65541","startPoint":{"x":366,"y":133},"path":"M366 133Q375.9 133 382.5 118.5T399 104","toId":"65547","entryId":"65548"},{"uniqueId":"65552","id":"65547","outputId":"65549","startPoint":{"x":546,"y":95},"path":"M546 95Q555.9 95 562.5 80.5T579 66","toId":"65544","entryId":"65545"},{"uniqueId":"65558","id":"65544","outputId":"65546","startPoint":{"x":726,"y":66},"path":"M726 66Q735.9 66 742.5 66T759 66","toId":"65556","entryId":"65557"},{"uniqueId":"65562","id":"65547","outputId":"65550","startPoint":{"x":546,"y":113},"path":"M546 113Q555.9 113 562.5 127.5T579 142","toId":"65559","entryId":"65560"},{"uniqueId":"65565","id":"65559","outputId":"65561","startPoint":{"x":726,"y":142},"path":"M726 142Q735.9 142 742.5 142T759 142","toId":"65563","entryId":"65564"},{"uniqueId":"65569","id":"65539","outputId":"65542","startPoint":{"x":366,"y":151},"path":"M366 151Q375.9 151 382.5 184.5T399 218","toId":"65566","entryId":"65567"},{"uniqueId":"65574","id":"65566","outputId":"65568","startPoint":{"x":546,"y":218},"path":"M546 218Q555.9 218 562.5 218T579 218","toId":"65571","entryId":"65572"},{"uniqueId":"65584","id":"65571","outputId":"65573","startPoint":{"x":726,"y":218},"path":"M726 218Q735.9 218 742.5 218T759 218","toId":"65581","entryId":"65582"},{"uniqueId":"65588","id":"65581","outputId":"65583","startPoint":{"x":906,"y":218},"path":"M906 218Q915.9 218 922.5 218T939 218","toId":"65553","entryId":"65554"}]',
  flowNodeList: [
    {
      id: 65537,
      nodeName: "HTTP事件",
      nodeType: 101,
      pid: null,
      location: "50,126|||65538,65539,65540",
      output: "",
      input:
        '{"input":[{"param_name":"A","param_typ":0,"param_required":0,"param_default":"1","param_desc":"1"},{"param_name":"B","param_typ":0,"param_required":0,"param_default":"","param_desc":""},{"param_name":"C","param_typ":0,"param_required":0,"param_default":"","param_desc":""}]}',
    },
    {
      id: 65539,
      nodeName: "条件判断",
      nodeType: 201,
      pid: 65537,
      location: "230,124|65540|65538|65541,65547,65548;65542,65566,65554",
      output: "",
      input:
        '{"conditions":[{"source":0,"sourceType":0,"sourceValue":"1","operate":0,"target":1,"targetType":0,"targetValue":"65537@A","logicOperate":"&&"},{"source":1,"sourceType":0,"sourceValue":"65537@B","operate":0,"target":1,"targetType":0,"targetValue":"65537@A","logicOperate":"&&"}]}',
    },
    {
      id: 65547,
      nodeName: "路径选择",
      nodeType: 202,
      pid: 65539,
      location: "410,86|65548|65541|65549,65544,65545;65550,65559,65560",
      output: "",
      input:
        '{"source":1,"sourceType":0,"sourceValue":"65537@A","targets":[{"operate":0,"target":1,"targetType":0,"targetValue":"65537@B"},{"operate":0,"target":0,"targetType":0,"targetValue":"2"}]}',
    },
    {
      id: 65544,
      nodeName: "数值计算",
      nodeType: 203,
      pid: 65547,
      location: "590,50|65545|65549|65546,65556,65557",
      output: "",
      input:
        '{"source":1,"sourceType":0,"sourceValue":"65537@B","operateSign":0,"targets":[{"target":0,"targetType":0,"targetValue":"1"},{"target":0,"targetType":0,"targetValue":"2"}]}',
    },
    {
      id: 65556,
      nodeName: "HTTP返回",
      nodeType: 701,
      pid: 65544,
      location: "770,50|65557|65546|",
      output: "",
      input: '{"source":1,"sourceType":0,"value":"65544"}',
    },
    {
      id: 65559,
      nodeName: "NodeJS脚本",
      nodeType: 204,
      pid: 65547,
      location: "590,126|65560|65550|65561,65563,65564",
      output: "",
      input: "{}",
    },
    {
      id: 65563,
      nodeName: "HTTP返回",
      nodeType: 701,
      pid: 65559,
      location: "770,126|65564|65561|",
      output: "",
      input: '{"source":1,"sourceType":0,"value":"65559"}',
    },
    {
      id: 65566,
      nodeName: "键值对操作",
      nodeType: 503,
      pid: 65539,
      location: "410,202|65567|65542|65568,65571,65572",
      output: "",
      input:
        '{"dsId":1,"opeType":0,"keySource":0,"keySourceValue":"dd","source":0,"sourceValue":""}',
    },
    {
      id: 65571,
      nodeName: "API服务调用",
      nodeType: 301,
      pid: 65566,
      location: "590,202|65572|65568|65573,65581,65582",
      output: "",
      input:
        '{"method":"POST","apiUrl":"http://www.example.com/getSomething","encode":"UTF-8","params":"{\\n  \\"param1\\":\\"A\\",\\n  \\"param2\\":\\"B\\"\\n}\\n"}',
    },
    {
      id: 65581,
      nodeName: "RocketMQ发布",
      nodeType: 402,
      pid: 65571,
      location: "770,202|65582|65573|65583,65553,65554",
      output: "",
      input: '{"dsId":3,"msgType":0,"message":"65571"}',
    },
    {
      id: 65553,
      nodeName: "HTTP返回",
      nodeType: 701,
      pid: 65581,
      location: "950,202|65554|65583|",
      output: "",
      input: '{"source":1,"sourceType":0,"value":"65581"}',
    },
  ],
};*/

/* 获取数据 */
export const _getData = (data: object, readonly: boolean = false) => {
  return post(prefix + (readonly ? "/getFlowStub" : "/editFlow"), data);
};

// 提交数据
export const _saveData = (data: object) => {
  return fn.delayForPromise(
    post(prefix + "/saveFlow", data, {
      needJson: true,
      noInstance: true,
    })
  );
};
// 部署/发布
export const _deploy = (data: object) => {
  return fn.delayForPromise(
    post(prefix + "/publish", data, { timeout: 5 * 60 * 1000 })
  );
};

// 调试
export const _debug = (data: object) => {
  return fn.delayForPromise(
    post(prefix + "/invoke", data, { timeout: 5 * 60 * 1000 })
  );
};

// 基础表单数据获取

// 拉取产品列表
export const _getProductList = (data: object) => {
  return post(urlPrefix + "/prod/getProduct", data).then((_data: any) => {
    const { code, data } = _data;
    return {
      code,
      data: ((data || {}).list || []).map((d: any) => {
        return {
          ...d,
          id: d.productId,
          value: d.productName,
        };
      }),
    };
  });
};

// 拉取项目内api列表
export const _getApiList = (data: object) => {
  return post(prefix + "/getApiList", data).then((_data: any) => {
    const { code, data } = _data;
    return {
      code,
      data: (data || []).map((d: any) => {
        let params = {};
        (fn.getJson(d.input).input || []).forEach(
          ({ param_name, param_default }: any) => {
            params[param_name] = param_default;
          }
        );
        return {
          ...d,
          id: d.flowId,
          value: d.flowName,
          params: JSON.stringify(params), // 该值通过input转化得来
        };
      }),
    };
  });
};

// 拉取平台内api列表
export const _getPlatformApiList = (data: object) => {
  return post(urlPrefix + "/data/assets/getList", data).then((_data: any) => {
    const { code, data={list:[]} } = _data;
    const li = data.list;
    return {
      code,
      data: li.map((d: any) => {
        let params = {};
        let databoj = fn.getJson(d.dataJson)[0];

        (databoj.param || []).forEach(
          ({ name, defaultVal }: any) => {
            params[name] = defaultVal;
          }
        );
        return {
          id:d.id, 
          value: d.name,
          addr:databoj.addr,
          params: JSON.stringify(params), 
        };
      }),
    };
  });
};

// 拉取项目内数据源列表
export const _getSameList = (data: object) => {
  return post(urlPrefix + "/data/assets/getTopic", data).then((_data: any) => {
    const { code, data } = _data;
    return {
      code,
      data: (data || []).map((d: any) => {
        return {
          ...d,
          id: d.id,
          value: d.name,
        };
      }),
    };
  });
};

// //服务导出JSON文件
// export const serveExport = (data: object) => {
//   return get(urlPrefix + "/serveOpe/export", data).then((_data: any) => {
//     const { code, data } = _data;
//     return {
//       code,
//       data: 1,
//     }; 
//   });
// };

// 查询部署状态
export const queryDeployStatus = (data: object) => {
  return get(urlPrefix + "/serveOpe/queryDeployStatus", data).then((_data: any) => {
    const { code, data } = _data;
    return {
      code,
      data: 2,
    };
  });
};


