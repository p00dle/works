import type { AccessControl } from 'works';

/** @internal */
export const allowAll: AccessControl = async function allowAll() {
  return true;
}