import { Command } from 'commander';
import esbuild from 'esbuild';
import fs from 'fs';
import { argv } from 'process';

import pkg from '../package.json' with { type: 'json' };

const safePkg = pkg;

const commander = new Command();

commander.version(safePkg.version ?? '1.0.0', '-v, --version', 'output the current version');

commander
    .command('build')
    .description('Build the project')
    .option('-w, --watch', 'Watch the project')
    .requiredOption('-cwd, --current-working-directory <current-working-directory>', 'Current working directory')
    .requiredOption('-entry, --entry-point <entry>', 'Entry point')
    .requiredOption('-o, --output <output>', 'Output directory')
    
    .action(async (options) => {
        const coreDependencies = safePkg.dependencies ? Object.keys(safePkg.dependencies) : undefined;
        const coreDevDependencies = safePkg.devDependencies ? Object.keys(safePkg.devDependencies) : undefined;
        const filePath = `${options.currentWorkingDirectory}/package.json`;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const userPkg = JSON.parse(fileContent);
        const userDependencies = userPkg.dependencies ? Object.keys(userPkg.dependencies) : undefined;
        const userDevDependencies = userPkg.devDependencies ? Object.keys(userPkg.devDependencies) : undefined;

        const external = [...(coreDependencies || []), ...(coreDevDependencies || []), ...(userDependencies || []), ...(userDevDependencies || [])];

        const userDir = options.currentWorkingDirectory;
        const entryPoints = options.entryPoint;
        const outputDir = `${userDir}/${options.output}`;

        const buildOptions = {
            bundle: true,
            color: true,
            entryPoints: [`${userDir}/${entryPoints}`],
            external,
            format: 'esm',
            keepNames: false,
            loader: { '.ts': 'ts' },
            minify: false,
            outfile: `${outputDir}/app.js`,
            platform: 'node',
            sourcemap: 'linked',
            treeShaking: false,
            tsconfig: `${userDir}/tsconfig.json`,
        };

        if (options.watch) {
            await esbuild.build(buildOptions);
            const ctx = await esbuild.context(buildOptions);
            await ctx.watch();
        } else {
            buildOptions.minify = true;
            buildOptions.treeShaking = true;
            buildOptions.keepNames = true;
            await esbuild.build(buildOptions);
        }
    });

commander.parse(argv)



