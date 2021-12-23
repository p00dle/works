import { parseParam } from '../lib/parse-param';
import { EnvVarFactory } from '../types/env-var';

const usedEnvVars: Record<string, true> = {};

export const envVar: EnvVarFactory = function envVar({type, var: envVar, defaultTo, required, parse}) {
  const upperCaseVar = envVar.toUpperCase();
  if (usedEnvVars[upperCaseVar]) throw Error(`Environment variable ${envVar} already defined elsewhere.`);
  else usedEnvVars[upperCaseVar] = true;
  
  const rawEnvValue = process.env[envVar];
  if (typeof rawEnvValue === 'undefined') {
    if (required) throw Error(`Required environment variable ${envVar} not supplied`);
    else if (typeof defaultTo !== 'undefined') return defaultTo as unknown as any;
    else return null as unknown as any;
  } else {
    if (type === 'infer') {
      if (parse === undefined) {
        throw Error(`When type is infer parse is required`);
      } else {
        return parse(rawEnvValue || '');
      }
    } 
    return (typeof parse === 'undefined' ? parseParam(type, rawEnvValue) : parse(rawEnvValue || '')) as unknown as any;
  }
}