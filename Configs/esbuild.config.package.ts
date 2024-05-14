import { Command } from 'commander';
import esbuild, { BuildOptions } from 'esbuild';
import { argv } from 'process';

import pkg from '../package.json';

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
const dependencies = safePkg.dependencies ? Object.keys(safePkg.dependencies) : undefined;
 
const external = dependencies ?? [];

const commander = new Command();

commander.version(safePkg.version ?? '1.0.0', '-v, --version', 'output the current version');

commander
    .command('build')
    .description('Build the project')
    .option('-w, --watch', 'Watch the project')
    .option('-d, --dev', 'Development mode')
    .option('-o, --output <output>', 'Output directory')
    .action(async (options) => {
        const output = options.output ?? './Build';

        const optionsLib: BuildOptions = {
            entryPoints: ['./Source/lib.ts'],
            outfile: `${output}/lib.js`,
            bundle: true,
            platform: 'node',
            external,
            loader: { '.ts': 'ts' },
            tsconfig: './tsconfig.json',
            color: true,
        };
        
        const optionsCli: BuildOptions = {
            entryPoints: ['./Source/cli.ts'],
            outfile: `${output}/cli.js`,
            bundle: true,
            platform: 'node',
            external,
            loader: { '.ts': 'ts' },
            tsconfig: './tsconfig.json',
            color: true,
        };

        if (options.dev) {
            optionsLib.sourcemap = 'linked';
            optionsCli.sourcemap = 'linked';
        } else {
            optionsLib.minify = true;
            optionsLib.keepNames = true;
            optionsLib.treeShaking = true;

            optionsCli.minify = true;
            optionsCli.keepNames = true;
            optionsCli.treeShaking = true;
        }

        if (options.watch) {
            await Promise.all([
                esbuild.build(optionsLib),
                esbuild.build(optionsCli),
            ]);
            const ctx = await esbuild.context(optionsLib);
            const ctx2 = await esbuild.context(optionsCli);
            await Promise.all([
                ctx.watch(),
                ctx2.watch(),
            ]);
        } else {
            await Promise.all([
                esbuild.build(optionsLib),
                esbuild.build(optionsCli),
            ]);
        }
    });

commander.parse(argv)
