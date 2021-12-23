import { WorksConfigFile } from '../types/config-file';
import { getRootDir } from './get-rootdir';
import * as path from 'path';
import { configFilename } from '../defaults/constants';

function validateConfig(config: WorksConfigFile) {

}

function applyDefaultsToConfig(config: WorksConfigFile): WorksConfigFile {
  return config;
}

let config: WorksConfigFile;
export function readWorksConfigFile(): WorksConfigFile {
  if (typeof config !== 'undefined') return config;
  const rootDir = getRootDir();
  const userConfig = require(path.join(rootDir, configFilename));
  validateConfig(userConfig);
  config = applyDefaultsToConfig(userConfig);
  return config;
}