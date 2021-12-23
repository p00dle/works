import * as path from 'path';
import { file } from '../lib/file';
import { getNames, Names } from '../lib/get-names';
import { getRootDir } from '../lib/get-rootdir';
import { Table } from '../types/table';

async function updateModels(componentRelativePath: string, rootDir: string, names: Names) {
  const targetFile = path.join(rootDir, 'types', 'models.ts');
  const initialText = await file.read.text(targetFile);
  // TODO: assuming that the component will always export its own name; this needs to be done with some file introspection ( maybe tsc, maybe just file read)
  if (!initialText.includes(names.single.pascal)) {
    const updatedText = initialText + (initialText.endsWith('\n') ? '' : '\n') + `export { ${names.single.pascal} } from '~/components${componentRelativePath}/types';\n`;
    await file.write.text(targetFile, updatedText);
  }
}

async function updateEvents(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'events.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import type { ${name}Events } from '~/components${componentRelativePath}/events';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = addLine + initialText.replace(/;\s*$/, `  & ${name}Events\n;`);
    await file.write.text(targetFile, updatedText);
  }
}

async function updateHttpApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'api.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import type { ${name}HttpApi } from '~/components${componentRelativePath}/http-endpoints';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = addLine + initialText.replace(/>;\s*$/, `  & ${name}HttpApi\n>;\n`);
    await file.write.text(targetFile, updatedText);
  }
}

async function updateCsvApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'csv-api.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import type { ${name}CsvApi } from '~/components${componentRelativePath}/csv-endpoints';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = addLine + initialText.replace(/>;\s*$/, `  & ${name}CsvApi\n>;\n`);
    await file.write.text(targetFile, updatedText);
  }
}

async function updateWsApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'ws-api.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import type { ${name}WsApi } from '~/components${componentRelativePath}/ws-channels';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = addLine + initialText.replace(/;\s*$/, `  & ${name}WsApi\n;`);
    await file.write.text(targetFile, updatedText);
  }
}

async function updateKeyValues(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'key-values.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import { ${name}KeyValues, initial${name}KeyValues } from '~/components${componentRelativePath}/key-values';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = addLine + initialText
      .replace('// @works:next_type', `& ${name}KeyValues\n  // @works:next_type`)
      .replace('// @works:next_value', `initial${name}KeyValues,\n  // @works:next_value`)
    ;
    await file.write.text(targetFile, updatedText);
  }
}

async function updateApiRouter(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.camel;
  const targetFile = path.join(rootDir, 'bootstrap', 'api-router.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import { ${name}HttpEndpoints } from '~/components${componentRelativePath}/http-endpoints';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = initialText
      .replace('// @works:next_import', addLine + '// @works:next_import')
      .replace('// @works:next_route', `${name}HttpEndpoints,\n  // @works:next_route`)
    ;
    await file.write.text(targetFile, updatedText);
  }
}

async function updateWsPubSub(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.camel;
  const targetFile = path.join(rootDir, 'bootstrap', 'ws-pub-sub.ts');
  const initialText = await file.read.text(targetFile);
  const addLine = `import { ${name}WsApi } from '~/components${componentRelativePath}/http-endpoints';\n`;
  if (!initialText.includes(addLine)) {
    const updatedText = initialText
      .replace('// @works:next_import', addLine + '// @works:next_import')
      .replace('// @works:next_route', `${name}WsApi,\n  // @works:next_route`)
    ;
    await file.write.text(targetFile, updatedText);
  }
}


// TODO: files need to be read to determine whether they have exports and not update common files when that's the case
export async function updateCommonFiles(componentRelativePath: string, table: Table) {
  const rootDir = getRootDir();
  const names = getNames(path.basename(componentRelativePath));
  await Promise.all([
    updateModels,
    updateEvents,
    updateHttpApi,
    updateCsvApi,
    updateKeyValues,
    updateWsApi,
    updateApiRouter,
    updateWsPubSub
  ].map(fn => fn(componentRelativePath, rootDir, names)));
}