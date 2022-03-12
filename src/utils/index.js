export const isEmpty = function (val) {
  // null or undefined
  if (val == null) return true;

  if (typeof val === "boolean") return false;

  if (typeof val === "number") return !val;

  if (val instanceof Error) return val.message === "";

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case "[object String]":
    case "[object Array]":
      return !val.length;

    // Map or Set or File
    case "[object File]":
    case "[object Map]":
    case "[object Set]": {
      return !val.size;
    }
    // Plain Object
    case "[object Object]": {
      return !Object.keys(val).length;
    }
  }

  return false;
};

/**
 * @function  将一个对象的内容合并到目标对象
 * @description 如果对象具有相同的属性，则后者会覆盖前者的属性值
 * @param to 目标对象
 * @param _from 被合并的对象
 */
export function extend(to, _from) {
  for (let key in _from) {
    to[key] = _from[key];
  }
  return to;
}
