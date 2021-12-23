import { NamingCase, SingleOrPlural } from '../lib/get-names';

export interface WorksNamingConfig {
  componentDirs:  [SingleOrPlural, NamingCase];
  serviceDirs:    [SingleOrPlural, NamingCase];
  dbTables:       [SingleOrPlural, NamingCase];
  dbColumns:      NamingCase;
  jsProps:        NamingCase;
}

export interface WorksConfigFile {
  naming: WorksNamingConfig;
  spaClientPath?: string;
  apiRoute: string;
  csvRoute: string;
}