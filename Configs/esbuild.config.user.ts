import { Command } from 'commander';
import esbuild, { type BuildOptions } from 'esbuild';
import fs from 'fs';
import { argv } from 'process';

import pkg from '../package.json' with { type: 'json' };

export interface IPackageJson {
    version?: string;
    author?: string;
    name?: string;
    description?: string;
    main?: string;
    keywords?: string[];
    license?: string;
    scripts?: Record<string, string>
    dependencies?: Record<string, string>,
    devDependencies?: Record<string, string>,
}

const safePkg: IPackageJson = pkg as IPackageJson;

const commander = new Command();

commander.version(safePkg.version ?? '1.0.0', '-v, --version', 'output the current version');

commander
    .command('build')
    .description('Build the project')
    .option('-w, --watch', 'Watch the project')
    .option('-d, --dev', 'Development mode')
    .option('-min, --minify', 'Minify the project (source: https://esbuild.github.io/api/#minify)')
    .option('-t, --tree-shaking', 'Tree shaking (source: https://esbuild.github.io/api/#tree-shaking)')
    .option('-k, --keep-names', 'Keep names (source: https://esbuild.github.io/api/#keep-names')
    .requiredOption('-cwd, --current-working-directory <current-working-directory>', 'Current working directory')
    .requiredOption('-entry, --entry-point <entry>', 'Entry point')
    .requiredOption('-o, --output <output>', 'Output directory')
    
    .action(async (options) => {
        const coreDependencies = safePkg.dependencies ? Object.keys(safePkg.dependencies) : undefined;
        const filePath = `${options.currentWorkingDirectory}/package.json`;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const userPkg = JSON.parse(fileContent);
        const userDependencies = userPkg.dependencies ? Object.keys(userPkg.dependencies) : undefined;
        const external = [...coreDependencies ? coreDependencies : [], ...userDependencies ? userDependencies : []];

        const userDir = options.currentWorkingDirectory;
        const entryPoints = options.entryPoint;
        const outputDir = `${userDir}/${options.output}`;

        const minify = options.minify;
        const treeShaking = options.treeShaking;
        const keepNames = options.keepNames;
        console.log(external);
        const buildOptions: BuildOptions = {
            bundle: true,
            color: true,
            entryPoints: [`${userDir}/${entryPoints}`],
            keepNames,
            external,
            loader: { '.ts': 'ts' },
            minify,
            outfile: `${outputDir}/app.js`,
            platform: 'node',
            treeShaking,
            tsconfig: `${userDir}/tsconfig.json`,
        };

        if (options.dev)
            buildOptions.sourcemap = 'linked';

        if (options.watch) {
            await esbuild.build(buildOptions);
            const ctx = await esbuild.context(buildOptions);
            await ctx.watch();
        } else {
            await esbuild.build(buildOptions);
        }
    });

commander.parse(argv)