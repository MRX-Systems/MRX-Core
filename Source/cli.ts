#!/usr/bin/env node
import { Command } from 'commander';
import { argv } from 'process';
import 'source-map-support/register.js';


import { PackageJsonCore } from '@/Config/index.js';
import { buildProject, devProject, initProject, startProject } from '@/Domain/UseCase/CLI/index.js';

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


commander.parse(argv);
