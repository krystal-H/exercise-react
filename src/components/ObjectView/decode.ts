import {
  Types,
  idName,
  typeName,
  keyName,
  valueName,
  keysName,
  parentTypeName,
  KeyObjectProps,
  typeMaps,
} from "./types";

let id = 0;

const getType = (d: any) => typeMaps[{}.toString.call(d)] || typeMaps.Others;
const getKeys = (d: any) => (typeof d === "string" ? [] : Object.keys(d || {}));

export default function decode(
  key: string,
  _data: object,
  pType: Types = Types.Object
): KeyObjectProps {
  let data: KeyObjectProps = {
    [idName]: id++,
    [typeName]: getType(_data),
    [keyName]: key,
    [valueName]: _data,
    [keysName]: getKeys(_data),
    [parentTypeName]: pType,
  };
  data[keysName].forEach((k: string) => {
    data[k] = decode(k, _data[k], data[typeName]);
  });
  return data;
}
