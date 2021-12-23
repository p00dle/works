import { WorksConfigFile } from '../types/config-file';

export const defaultWorksConfigFile: WorksConfigFile = {
  naming: {
    componentDirs: ['single', 'pascal'],
    serviceDirs: ['single', 'pascal'],
    dbTables: ['plural', 'snake'],
    dbColumns: 'camel',
    jsProps: 'camel',
  },
  spaClientPath: 'client',
  csvRoute: '/csv',
  apiRoute: '/api',
}