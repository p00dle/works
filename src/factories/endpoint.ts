import { EndpointFactory } from '../types/endpoint';

function id<T>(t: T): T {
  return t;
}

export const endpoint: EndpointFactory = {
  get: id,
  post: id,
}