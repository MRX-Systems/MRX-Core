#!/usr/bin/env node

import { Command } from 'commander';
import { argv } from 'process';
import 'source-map-support/register';

import { PackageJsonCore } from '@/Config';
import { buildProject, initProject, startProject } from '@/Domain/UseCase/CLI';

const commander = new Command();


commander.version(PackageJsonCore.version, '-v, --version', 'output the current version');

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

commander.parse(argv);