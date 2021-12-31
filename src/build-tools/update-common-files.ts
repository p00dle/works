import * as path from 'path';
import { file } from '../lib/file';
import { getNames, Names } from '../lib/get-names';
import { getRootDir } from '../lib/get-rootdir';
import { Table } from '../types/table';

function replaceWorksDirectives(text: string, directives: Record<string, string>): string {
  let output = text;
  for (const [directive, replaceWith] of Object.entries(directives)) {
    output = output.replace(new RegExp(`\\s*//\\s*works:${directive}`), match => {
      return replaceWith + '\n' + match;
    });
  }
  return output;
}

async function updateModels(componentRelativePath: string, rootDir: string, names: Names) {
  const targetFile = path.join(rootDir, 'types', 'models.ts');
  const initialText = await file.read.text(targetFile);
  // TODO: assuming that the component will always export its own name; this needs to be done with some file introspection ( maybe tsc, maybe just file read)
  if (!initialText.includes(names.single.pascal)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': `export type { ${names.single.pascal} } from '~/components${componentRelativePath}/types';`,
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateEvents(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'events.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import type { ${name}Events } from '~/components${componentRelativePath}/events';`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement,
      'next_value': `  & ${name}Events`
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateHttpApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'http-api.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import type { ${name}GetEndpoints, ${name}PostEndpoints } from '~/components${componentRelativePath}/http-endpoints';`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement, 
      'next_get_api': `  ${name}GetEndpoints`,
      'next_post_api': `  ${name}PostEndpoints`,
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateCsvApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'csv-api.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import type { ${name}CsvApi } from '~/components${componentRelativePath}/csv-endpoints';`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement,
      'next_value': `  & ${name}CsvApi`
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateWsApi(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'ws-api.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import type { ${name}WsApi } from '~/components${componentRelativePath}/ws-channels';`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement,
      'next_value': `  & ${name}WsApi`
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateKeyValues(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.pascal;
  const targetFile = path.join(rootDir, 'types', 'key-values.ts');
  const initialText = await file.read.text(targetFile);
  const typeImportStatement = `import type { ${name}KeyValues } from '~/components${componentRelativePath}/key-values';`;
  // const typeImportStatement = `import type { ${name}KeyValues, initial${name}KeyValues } from '~/components${componentRelativePath}/key-values';\n`;
  if (!initialText.includes(typeImportStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_type_import': typeImportStatement,
      'next_value_import': `import { initial${name}KeyValues} from ~/components${componentRelativePath}/key-values';`,
      'next_type': `  & ${name}KeyValues`,
      'next_value': `  & initial${name}KeyValues`,
    })
    await file.write.text(targetFile, updatedText);
  }
}

async function updateApiRouter(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.camel;
  const targetFile = path.join(rootDir, 'bootstrap', 'api-router.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import { ${name}GetEndpoints, ${name}PostEndpoints } from '~/components${componentRelativePath}/http-endpoints';\n`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement,
      'next_get_endpoints': `  ${name}GetEndpoints`,
      'next_post_endpoints': `  ${name}PostEndpoints`,
    });
    await file.write.text(targetFile, updatedText);
  }
}

async function updateWsPubSub(componentRelativePath: string, rootDir: string, names: Names) {
  const name = names.single.camel;
  const targetFile = path.join(rootDir, 'bootstrap', 'ws-pub-sub.ts');
  const initialText = await file.read.text(targetFile);
  const importStatement = `import { ${name}WsApi } from '~/components${componentRelativePath}/http-endpoints';\n`;
  if (!initialText.includes(importStatement)) {
    const updatedText = replaceWorksDirectives(initialText, {
      'next_import': importStatement,
      'next_route': `  ${name}WsApi`,
    });
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