export function arrayToDict(arr: string[]): Record<string, true> {
  const output: Record<string, true> = {}
  const l = arr.length;
  for (let i = 0; i < l; i++) {
    output[arr[i]] = true;
  }
  return output;
}

export function toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val];
}

export function toType<T>(val: any): T {
  return val as unknown as T;
}

export function isNonEmptyArray<T>(arr: any): arr is T[] {
  return Array.isArray(arr) ? arr.length > 0 : false;
}

export function areArraysSameWithCompare<T>(arr1: T[] | any, arr2: T[] | any, compare: (a: T, b: T) => boolean, orderMatters = true): boolean {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  const l = arr1.length;
  if (l !== arr2.length) return false;
  if (orderMatters) {
    for (let i = 0; i < l; i++) {
      if (!compare(arr1[i], arr2[i])) return false;
    }
    return true;
  } else {
    for (let i = 0; i < l; i++) {
      let sameArrayFound = false;
      for (let j = 0; j < l; j++) {
        if (compare(arr1[i], arr2[j])) {
          sameArrayFound = true;
          break;
        }
      }
      if (!sameArrayFound) return false;
    }
    return true;
  }
}

export function areArraysSame(arr1: any, arr2: any, orderMatters = true): boolean {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  const l = arr1.length;
  if (l !== arr2.length) return false;
  if (orderMatters) {
    for (let i = 0; i < l; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  } else {
    const dict1 = arrayToDict(arr1);
    for (let i = 0; i < l; i++) {
      if (!dict1[arr2[i]]) return false;
    }
    return true;
  }
}


interface StringBuilder {
  read: () => string;
  write: (str: string) => void;
}

export function stringBuilder(): StringBuilder {
  let output = '';
  return {
    read: () => output,
    write: str => output += str
  };
}

import * as crypto from 'crypto';

export function generateSalt(): string {
  return crypto.randomBytes(6).toString('base64').substring(0, 8);
}

export function generateHash(salt: string, password: string): string {
  return salt + crypto.createHmac('sha512', salt).update(password).digest('base64');
}

export function createHash(password: string): string {
  return generateHash(generateSalt(), password);
}

export function verifyHash(password: string, hash: string): boolean {
  const generatedHash = generateHash(hash.substring(0, 8), password);
  let result = 0;
  for (let i = 0, l = generatedHash.length; i < l; i++) {
    result += generatedHash[i] === hash[i] ? 0 : 1;
  }
  return result === 0;
}

export function generateRandomString(length: number) {
  return crypto.randomBytes(length).toString('base64').substring(0, length).replace(/[^a-zA-Z0-9]/g, '_');
}
