import esbuild, { BuildOptions } from 'esbuild';

import pkg from '../package.json';

export interface IPackageJson {
    version?: string;
    author?: string;
    name?: string;
    description?: string;
    main?: string;
    keywords?: string[];
    license?: string;
    scripts?: {
        [key: string]: string;
    }
    dependencies?: {
        [key: string]: string;
    },
    devDependencies?: {
        [key: string]: string;
    },
}

const safePkg: IPackageJson = pkg as IPackageJson;
const dependencies = safePkg.dependencies ? Object.keys(safePkg.dependencies) : undefined;
 
const external = dependencies || [];

const optionsLib: BuildOptions = {
    entryPoints: ['./Source/lib.ts'],
    outfile: './Build/lib.js',
    bundle: true,
    platform: 'node',
    external,
    loader: { '.ts': 'ts' },
    tsconfig: './tsconfig.json',
    color: true,
};

const optionsCli: BuildOptions = {
    entryPoints: ['./Source/cli.ts'],
    outfile: './Build/cli.js',
    bundle: true,
    platform: 'node',
    external,
    loader: { '.ts': 'ts' },
    tsconfig: './tsconfig.json',
    color: true,
};

const args = process.argv.slice(2);
(async () => {
    switch (args[0]) {

    case 'dev::pkg::build':
        optionsLib.sourcemap = 'linked';
        await esbuild.build(optionsLib);
        break;
    case 'dev::cli::build':
        optionsCli.sourcemap = 'linked';
        await esbuild.build(optionsCli);
        break;

    case 'dev::pkg::watch':
        optionsLib.sourcemap = 'linked';
        await esbuild.build(optionsLib);
        const ctx = await esbuild.context(optionsLib);
        await ctx.watch();
        break;
    case 'dev::cli::watch':
        optionsCli.sourcemap = 'linked';
        await esbuild.build(optionsCli);
        const ctx2 = await esbuild.context(optionsCli);
        await ctx2.watch();
        break;


    case 'build':
        optionsLib.minify = true;
        optionsLib.keepNames = true;
        optionsLib.treeShaking = true;
        await esbuild.build(optionsLib);

        optionsCli.minify = true;
        optionsCli.keepNames = true;
        optionsCli.treeShaking = true;
        await esbuild.build(optionsCli);
        break;
    default:

        break;
    };
})();