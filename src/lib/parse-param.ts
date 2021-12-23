import { ParamType, QueryParamType } from '../types/_common';

export function parseParam<T extends QueryParamType>(type: T, str: string): ParamType<T> {
  switch (type) {
    case 'boolean': 
      const strl = str.toLowerCase();
      if (strl === 'true' || strl === 't' || strl === 'yes' || strl === 'y' || strl === '1') return true as ParamType<T>;
      else if (strl === 'false' || strl === 'f' || strl === 'no' || strl === 'n' || strl === '0') return false as ParamType<T>;
      throw Error('Expected parameter to be parsable to boolean');
    case 'date':
      if (/^\d\d\d\d([-\\\/])\d\d([-\\\/])\d\d$/.test(str)) {
        return Date.UTC(+str.substr(0, 4), +str.substr(5, 2) - 1, +str.substr(8, 2)) as ParamType<T>;
      }
      else throw Error('Expected parameter to be of shape YYYY-MM-DD');
    case 'number':
      const parsedNumber = parseFloat(str);
      if (isNaN(parsedNumber)) throw Error('Expected parameter to be parsable to a number');
      return parsedNumber as ParamType<T>;
    case 'string':
      return (str || '') as ParamType<T>;
    case 'string[]':
      return (typeof str === 'string' ? str.split(',') : []) as ParamType<T>;
    default: 
      throw Error(`Invalid type: ${type}`);
  }
}