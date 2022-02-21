import * as path from 'path';
import { file, dir } from '../lib/file';
import { UserError } from './action-wrapper';

export async function initProject(relativePath: string = '.', {force}: {force?: boolean}) {
  const sourceDir = path.join(__dirname, '../../assets/project-template');
  const destinationDir = path.join(process.cwd(), relativePath);
  if (!force && await file.exists(path.join(destinationDir, 'works.config.js'))) {
    throw new UserError('Project already initiated. Use -f or --force to overwrite project');
  }
  await dir.copy(sourceDir, destinationDir);
  const gitIgnoreFile = path.join(__dirname, '../../assets/gitignore-template.txt');
  await file.copy(gitIgnoreFile, path.join(destinationDir, '.gitignore'));
  return 'Project initiated successfully';
}


