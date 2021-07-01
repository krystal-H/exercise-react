const win = window,
  doc = document,
  body = doc.body,
  useAddEvent = win.addEventListener;

const addEvent = ((_use: any) => {
  return _use
    ? (ele: any, e: any, f: any) => {
        ele.addEventListener(e, f, false);
      }
    : (ele: any, e: any, f: any) => {
        ele.attachEvent("on" + e, f);
      };
})(useAddEvent);

const removeEvent = ((_use: any) => {
  return _use
    ? (ele: any, e: any, f: any) => {
        ele.removeEventListener(e, f, false);
      }
    : (ele: any, e: any, f: any) => {
        ele.detachEvent("on" + e, f);
      };
})(useAddEvent);

const addClass = (() => {
  if (body.classList) {
    return (dom: HTMLElement, cls: string) => dom.classList.add(cls);
  }
  return (dom: HTMLElement, cls: string) =>
    (dom.className = dom.className + " " + cls);
})();

const removeClass = (() => {
  if (body.classList) {
    return (dom: HTMLElement, cls: string) => dom.classList.remove(cls);
  }
  return (dom: HTMLElement, cls: string) =>
    (dom.className = dom.className
      .split(" ")
      .filter((d) => d !== cls)
      .join(" "));
})();

const getPopupContainerByMine = (dom: HTMLElement) =>
  dom.parentNode as HTMLElement;

const doNothing = () => {};

const nowTime = 65536;
let uniqueNum = 0;
const setUnique = (unique: number) => {
  uniqueNum = unique - nowTime;
};
const getUnique = () => {
  return nowTime + ++uniqueNum + "";
};

const idToNum = (str: string) => {
  return +str.replace(/\D/g, "");
};

const getCopyByPure = (x: object) => JSON.parse(JSON.stringify(x));

const countCenterPoint = (domId: string) => {
  const dom = doc.getElementById(domId);
  let point = { x: 0, y: 0 };
  if (dom) {
    const { left, right, bottom, top } = dom.getBoundingClientRect();
    point.x = (left + right) / 2;
    point.y = (top + bottom) / 2;
  }
  return point;
};

const getParamFormSearch = (key: string) => {
  let rst = null;
  const search = win.location.search.slice(1);
  const val = search.match(new RegExp("(^|&)" + key + "=([^&]*)(&|$)"));
  if (val !== null) rst = val[2];
  return rst;
};

const getJson = (data: string | object) => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  return data;
};

const toTrim = (str: string) =>
  str.replace(/\n/g, "").replace(/(^\s+|\s+$)/g, "");

const isTypeString = (str: string, type: string) => {
  let is = true;
  try {
    const rst = JSON.parse(toTrim(str));
    is = {}.toString.call(rst) === type;
  } catch (e) {
    is = false;
  }
  return is;
};

const isJsonString = (str: string) => {
  return isTypeString(str, "[object Object]");
};

const isArrayString = (str: string) => {
  return isTypeString(str, "[object Array]");
};

const delayForPromise = (_promise: Promise<any>, time: number = 500) => {
  return _promise
    .then((data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, time);
      });
    })
    .catch((e) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(e);
        }, time);
      });
    });
};

const fn = {
  doNothing,
  getParamFormSearch,
  addEvent,
  removeEvent,
  addClass,
  removeClass,
  getPopupContainerByMine,
  nowTime,
  setUnique,
  getUnique,
  idToNum,
  getCopyByPure,
  countCenterPoint,
  getJson,
  toTrim,
  isJsonString,
  isArrayString,
  delayForPromise,
};

export default fn;
