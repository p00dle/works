import type { AccessControl } from 'works';

/** @internal */
export const forbidAll: AccessControl = async function forbidAll() {
  return false;
}