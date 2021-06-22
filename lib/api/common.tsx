import { mapKeys as lodashMapKeys } from "lodash";

export const mapKeys = <T extends {} = never>(
  data: object,
  fn: (v: any, k: string) => string
): T => {
  return { ...lodashMapKeys(data, fn) } as T;
};

export const deepMapKeys = <T extends {} = never>(
  obj: Record<string, any>,
  fn: (v: any, k: string) => string
): T => {
  const isArray = Array.isArray(obj);
  const newObj: Record<any, any> = isArray ? [] : {};
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
