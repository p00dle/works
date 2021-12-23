#!/usr/bin/env node

import { Command } from 'commander';
import * as dotenv from 'dotenv';

import { actionWrapper } from '../build-tools/action-wrapper';
import { createComponent } from '../build-tools/create-component';
import { initProject } from '../build-tools/init-project';
import { runMigrations } from '../build-tools/run-migrations';
import { reconcile, scanProject } from '../build-tools/scan';
import { worksVersion } from '../config/version';

dotenv.config();

new Command()
  .version(worksVersion)
  .name('works')
  
  .addCommand(new Command()
    .name('init')
    .action(actionWrapper(initProject))
    .description('initiates a new Works project')
    .arguments('[path]')
    .option('-f, --force')
  )

  .addCommand(new Command()
    .name('scan')
    .action(actionWrapper(() => scanProject(false)))
    .description('scans a Works project for changes and generates files')
  )
  .addCommand(new Command()
    .name('migrate')
    .action(actionWrapper(runMigrations))
    .description('migrates database tables to the latest specification')
    .arguments('[version]')
  )  

  .addCommand(new Command()
    .name('reconcile')
    .action(actionWrapper((reconcile)))
    .description(`changes overall migration to v001 and for all unlocked components' migrations to v001`)
  )
  .addCommand(new Command()
    .name('create')
    .addCommand(new Command()
      .name('component')
      .action(actionWrapper(createComponent))
      .description('creates a new Works component')
      .arguments('<component_name>')
    )
  )

  
  .parseAsync(process.argv);