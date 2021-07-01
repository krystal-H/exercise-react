import { post } from "../../../../../api";
import { Notification } from "../../../../../components/Notification";

const base = "/v5/web/open";

// 获取设备影子上报数据
export const getDataByShadow = (deviceId) => {
    return post(base + "/deviceShadow/getDeviceShadowData", { deviceId });
};

// 获取设备影子历史数据
export const getHistoryDataByShadow = (data) => {
    return post(base + "/deviceShadow/getHistoricalData", data);
};

const _Download = (url, paramsStr) => {
    const href = window.location.origin + base + url + paramsStr;
    try {
        window.open(href);
    } catch (e) {
        Notification({
            description: "下载失败",
            type: "error",
        });
    }
};

// 下载导出历史数据
export const _download = (data) => {
    let paramsStr = "?";
    Object.keys(data).forEach((key) => {
        paramsStr += key + "=" + data[key] + "&";
    });
    return _Download(
        "/deviceShadow/exportHistoricalData",
        paramsStr.replace(/&$/, "")
    );
};
