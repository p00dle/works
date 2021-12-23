import * as path from 'path';
import * as fs from 'fs';
import { configFilename } from '../defaults/constants';



let rootDir: string;
export function getRootDir(): string {
  if (typeof rootDir === 'string') return rootDir;
  let currentDir = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(currentDir, configFilename))) {
      rootDir = currentDir;
      return rootDir;
    } 
    const parentDir = path.join(currentDir, '..');
    if (parentDir === currentDir) {
      console.error(`Unable to find works.config.js; run "works init" in the project's root directory`);
      process.exit(1);
    } 
    currentDir = parentDir;
  }
}
