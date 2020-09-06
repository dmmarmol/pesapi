export function random(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export function nth<T>(offset: number, list: any): T {
  var idx = offset < 0 ? list.length + offset : offset;
  return typeof list === "string" ? list.charAt(idx) : list[idx];
}

export function first<T>(list: Array<T> | string): T | undefined {
  return nth<T>(0, list);
}

export function last<T>(list: Array<T> | string): T | undefined {
  return nth<T>(list.length - 1, list);
}

/** @see https://medium.com/@dtipson/creating-an-es6ish-compose-in-javascript-ac580b95104a */
export const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));

export function getNumber(str: string) {
  return Number(str.match(/\d+/)[0]) ?? undefined;
}

export function identity(x) {
  return x;
}
