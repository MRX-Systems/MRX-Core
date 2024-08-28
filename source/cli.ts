#!/usr/bin/env node
import { Command } from 'commander';
import { argv } from 'process';
import 'source-map-support/register.js';

import { PackageJsonCore } from '#/common/util/index.ts';
import { initProject, prepareProject, buildProject, startProject, devProject } from '#/domain/usecase/index.ts';

const commander = new Command();

commander.version(PackageJsonCore.content.version ?? '1.0.0', '-v, --version', 'output the current version');

commander
    .command('init')
    .description('Initialize a new project')
    .action(initProject);

commander
    .command('build')
    .description('Build the project')
    .action(buildProject);

commander
    .command('start')
    .description('Start the project')
    .action(startProject);

commander
    .command('dev')
    .description('Start the project in development mode')
    .action(devProject);

commander
    .command('prepare')
    .description('Create .andesite folder')
    .action(prepareProject);

commander.parse(argv);
