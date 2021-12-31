import * as path from 'path';
import { dir, file } from '../../lib/file';
import { getRootDir } from '../../lib/get-rootdir';
import { UserError } from '../action-wrapper';

export async function generateModels(outputDir: string): Promise<Record<string, true>> {
  const modelsDir = path.join(outputDir, 'models');
  await dir.createIfNotExists(modelsDir);
  await Promise.all((await dir.read(modelsDir)).map(filename => file.delete(path.join(modelsDir, filename))));
  const modelsText = await file.read.text(path.join(getRootDir(), './types/models.ts'));
  const output: Record<string, true> = {}
  for (const exportLine of modelsText.split('\n').filter(str => str.trim() === '')) {
    const matches = exportLine.match(/export\s*\{([^\}]+)\}\s*from\s*'([^']+)'/);
    if (!matches) throw new UserError(`Unrecognised export declaration: "${exportLine}"`);
    const [, models, importRelativePath] = matches;
    models.split(',').map(str => str.trim()).forEach(model => output[model] = true);
    // const absoluteImportPath = importRelativePath.replace('~', getRootDir());
    // const modelSource = await file.read.text()
    console.log(importRelativePath);
  }
  return output;

}