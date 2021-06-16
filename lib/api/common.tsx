import Xss from "xss";
import { encode } from "html-entities";
import { mapKeys as lodashMapKeys } from "lodash";

export const cleanseString = (value: string) => {
  return encode(Xss((value || "").trim()));
};

export const cleanseStringArray = (value: Array<string>) => {
  return value.map((x) => cleanseString(x)).filter(Boolean);
};

export const isObject = (value: any) => {
  return typeof value === "object" && value !== null;
};

export const isString = (value: any) => {
  return typeof value === "string";
};

export const isStringArray = (value: any) => {
  if (!Array.isArray(value)) {
    return false;
  }
  for (let i = 0; i < value.length; ++i) {
    if (typeof value[i] !== "string") {
      return false;
    }
  }
  return true;
};

export const mapKeys = <T extends {} = never>(
  data: any,
  fn: (v: any, k: string) => string
): T => {
  return { ...lodashMapKeys(data, fn) } as T;
};

export const deepMapKeys = <T extends {} = never>(
  obj: { [key: string]: any },
  fn: (v: any, k: string) => string
): T => {
  const isArray = Array.isArray(obj);
  const newObj: any = isArray ? [] : {};
  for (const k in obj) {
    if (!obj.hasOwnProperty(k)) {
      continue;
    }
    if (typeof obj[k] === "object") {
      const v = deepMapKeys(obj[k], fn);
      newObj[fn(v, k)] = v;
    } else {
      newObj[fn(obj[k], k)] = obj[k];
    }
  }
  return newObj;
};
