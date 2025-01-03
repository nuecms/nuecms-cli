const DATE_REGEXP = /\d{4}-\d{2}-\d{2}/;

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
}

export function isDate(date: unknown): boolean {
  return new Date(date as string).toString() !== 'Invalid Date' && !isNaN(new Date(date as string).getTime());
}

export function isTimestamp(string: string): boolean {
  return string.length > 18 && !isNaN(new Date(string).getTime());
}

export function isDateString(string: string): boolean {
  return DATE_REGEXP.test(string);
}

export function arrayLastItem<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

export function isString(value: unknown): value is string {
  return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
}

export const stringType = (function () {
  var _toString = ({}).toString;
  return function (obj: unknown) {
    if (obj === null || obj === undefined) {
      return 'null';  // or 'undefined' depending on your needs
    }

    var stype = _toString.call(obj).slice(8, -1);
    return stype.toLowerCase();
  };
})();
