import Xss from "xss";

export function cleanseString(value: string) {
  return Xss(value || "");
}

export function cleanseStringArray(value: Array<string>) {
  return value.map((x) => cleanseString(x)).filter(Boolean);
}

export function isObject(value: any) {
  return typeof value === "object" && value !== null;
}

export function isString(value: any) {
  return typeof value === "string";
}

export function isStringArray(value: any) {
  if (!Array.isArray(value)) {
    return false;
  }
  for (let i = 0; i < value.length; ++i) {
    if (typeof value[i] !== "string") {
      return false;
    }
  }
  return true;
}
