import { dir, file } from '../lib/file';
import { getNames } from '../lib/get-names';
import { getRootDir } from '../lib/get-rootdir';
import * as path from 'path';
import { readWorksConfigFile } from '../lib/read-works-config';
import { UserError } from './action-wrapper';

export async function createComponent(componentPath: string) {
  if (typeof componentPath !== 'string') throw Error('Expected componentPath to be a string');
  if (componentPath.length === 0) throw Error('Expected componentPath to be a non-zero length string');
  const componentDirs = componentPath.split('/').filter(str => str !== '');
  const componentName = componentDirs[componentDirs.length - 1];
  const worksConfig = readWorksConfigFile();
  const names = getNames(componentName);
  componentDirs[componentDirs.length - 1] = names[worksConfig.naming.componentDirs[0]][worksConfig.naming.componentDirs[1]];
  const projectRootDir = getRootDir();
  const joinedComponentDirs = componentDirs.map((_,i) => path.join(projectRootDir, 'components', componentDirs.slice(0, i + 1).join('/')));
  for (const dirPath of joinedComponentDirs) {
    await dir.createIfNotExists(dirPath);
  }
  const componentDir = joinedComponentDirs[joinedComponentDirs.length - 1];
  const tableFileSource = path.join(__dirname, '../../assets', 'table.config.ts');
  const tableFileTarget = path.join(componentDir, 'table.config.ts');
  if (await file.exists(tableFileTarget)) {
    throw new UserError(`Component ${componentPath} already exists`);
  }
  const tableFileStr = await file.read.text(tableFileSource)
  const modifiedTableFileStr = tableFileStr
    .replace('$[table_name]', names[worksConfig.naming.dbTables[0]][worksConfig.naming.dbTables[1]]);
  
  await file.write.text(tableFileTarget, modifiedTableFileStr);
  return `Component ${componentName} created successfully`;
}