export const idName = "__id__";
export const typeName = "__type__";
export const keyName = "__key__";
export const valueName = "__value__";
export const keysName = "__keys__";
export const parentTypeName = "__parentType__";

type NS = string | number;

export const typeMaps = {
  "[object Null]": "null",
  "[object Undefined]": "undefined",
  "[object String]": "string",
  "[object Number]": "number",
  "[object Boolean]": "boolean",
  "[object Array]": "array",
  "[object Object]": "object",
  Others: "others",
};

export enum Types {
  Null = "null",
  Undefined = "undefined",
  String = "string",
  Number = "number",
  Boolean = "boolean",
  Array = "array",
  Object = "object",
  Others = "others",
}

export interface KeyObjectProps {
  [idName]: number; // 唯一标识
  [typeName]: Types; // 当前值类型
  [keyName]: string | number; // 当前键名
  [valueName]: any; // 当前值
  [keysName]: NS[]; // 当前键值列表
  [parentTypeName]: Types; // 父级值类型

  [key: string]: any;
}
