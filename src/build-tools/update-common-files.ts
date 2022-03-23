import * as path from 'path';
import { file } from '../lib/file';
import { getNames, Names } from '../lib/get-names';
import { getRootDir } from '../lib/get-rootdir';
import { Table } from '../types/table';

type WorksDirective =
  | 'next_import'
  | 'next_value'
  | 'next_get_api'
  | 'next_post_api'
  | 'next_type_import'
  | 'next_get_endpoints'
  | 'next_post_endpoints'
  | 'next_route'
  | 'next_types'
;

type Filepath = string;
type WorksDirectiveReplacer = (componentNames: Names, componentPath: string) => string;

const commonFilesMetadata: Record<Filepath, { next_import: WorksDirectiveReplacer } & Partial<Record<WorksDirective, WorksDirectiveReplacer>>> = {
  'types/models.ts': {
    next_import: (names, componentPath) => `export type { ${names.single.pascal} } from '~/components${componentPath}/types';`,
  },
  'types/events.ts': {
    next_import: (names, componentPath) => `import type { ${names.single.pascal}Events } from '~/components${componentPath}/events';`,
    next_value: names => `  & ${names.single.pascal}Events`,
  },
  'types/http-api.ts': {
    next_import: (names, componentPath) => `import type { ${names.single.pascal}GetEndpoints, ${names.single.pascal}PostEndpoints } from '~/components${componentPath}/http-endpoints';`,
    next_get_api: names => `  & ${names.single.pascal}GetEndpoints`,
    next_post_api: names => `  & ${names.single.pascal}PostEndpoints`,
  },
  'types/csv-api.ts': {
    next_import: (names, componentPath) => `import type { ${names.single.pascal}CsvApi } from '~/components${componentPath}/csv-endpoints';`,
    next_value: names => `  & ${names.single.pascal}CsvApi`
  },
  'types/ws-api.ts': {
    next_import: (names, componentPath) => `import type { ${names.single.pascal}WsApi } from '~/components${componentPath}/ws-channels';`,
    next_value: names => `  & ${names.single.pascal}WsApi`
  },
  'types/key-values.ts': {
    next_import: (names, componentPath) => `import { initial${names.single.pascal}KeyValues} from '~/components${componentPath}/key-values';`,
    next_type_import: (names, componentPath) => `import type { ${names.single.pascal}KeyValues } from '~/components${componentPath}/key-values';`,
    next_types: names => `  & ${names.single.pascal}KeyValues`,
    next_value: names => `  initial${names.single.pascal}KeyValues,`,
  },
  'bootstrap/api-router.ts': {
    next_import: (names, componentPath) => `import { ${names.single.camel}GetEndpoints, ${names.single.camel}PostEndpoints } from '~/components${componentPath}/http-endpoints';`,
    next_get_endpoints: names => `  ${names.single.camel}GetEndpoints,`,
    next_post_endpoints: names => `  ${names.single.camel}PostEndpoints,`,
  },
  'bootstrap/ws-pubsub.ts': {
    next_import: (names, componentPath) => `import { ${names.single.camel}WsChannels } from '~/components${componentPath}/ws-channels';`,
    next_route: names => `  ${names.single.camel}WsChannels,`,
  }
}


const regexCache: Record<string, RegExp> = {}
function replaceWorksDirectives(text: string, directives: Record<string, string>): string {
  let output = text;
  for (const [directive, replaceWith] of Object.entries(directives)) {
    if (!regexCache[directive]) regexCache[directive] = new RegExp(`[\\t ]*//[\\t ]*@works:${directive}`);
    output = output.replace(regexCache[directive], match => {
      return replaceWith + '\n' + match;
    });
  }
  return output;
}

// TODO: account for different naming conventions
export async function updateCommonFiles(componentPath: string, table: Table) {
  const rootDir = getRootDir();
  const names = getNames(path.basename(componentPath));
  await Promise.all(Object.entries(commonFilesMetadata).map(async ([relativeTargetPath, directiveReplacers]) => {
    const targetFile = path.join(rootDir, relativeTargetPath);
    const fileText = await file.read.text(targetFile);
    const directives: {next_import: string} & Record<string, string> = { next_import: ''};
    for (const [directive, directiveReplacer] of Object.entries(directiveReplacers)) {
      directives[directive] = directiveReplacer(names, componentPath);
    }
    console.log('current file: ');
    console.log(fileText);
    console.log('next_import: ' + directives.next_import);
    console.log('!fileText.includes(directives.next_import): ' + !fileText.includes(directives.next_import));
    if (!fileText.includes(directives.next_import)) {
      const updatedFileText = replaceWorksDirectives(fileText, directives);
      console.log('\n\n\n------------');
      await file.write.text(targetFile, updatedFileText);
    }
  }));
}