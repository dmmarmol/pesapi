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

/**
 * Extract number from string
 * @example
 *  getNumber('1234 amazing') // outputs 1234
 */
export function getNumber(str: string) {
  return Number(str.match(/\d+/)[0]) ?? undefined;
}

export function identity(x) {
  return x;
}

/**
 * Generate a two dimensional array from a given length
 * Makes n amount of groups (array) from a one dimensional array
 */
export function chunk(value: number, array: any[]) {
  const array_chunks = (array: any[], chunk_size: number) =>
    Array(Math.ceil(array.length / chunk_size))
      .fill(undefined)
      .map((_, index) => index * chunk_size)
      .map((begin) => array.slice(begin, begin + chunk_size));
  return array_chunks(array, value);
}

export function secToMS(seconds: number) {
  const result = seconds * 1000;
  console.log(`CONVERSION: ${seconds} seconds are ${result} miliseconds`);
  return result;
}

export function minToSec(minutes: number) {
  const result = minutes * 60;
  console.log(`CONVERSION: ${minutes} minutes are ${result} seconds`);
  return result;
}

export function msToMin(ms: number) {
  const result = ms / 60 / 1000;
  console.log(`CONVERSION: ${ms} milliseconds are ${result} minutes`);
  return result;
}

export function minToMs(minutes: number) {
  const result = minutes * 60 * 1000;
  console.log(`CONVERSION: ${minutes} minutes are ${result} miliseconds`);
  return result;
}
