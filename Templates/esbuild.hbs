import esbuild, { BuildOptions } from 'esbuild';

import pkg from './package.json';

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

const options: BuildOptions = {
    entryPoints: ['./Source/App.ts'],
    outfile: './Build/App.js',
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
    case 'watch':
        options.sourcemap = 'linked';
        await esbuild.build(options);
        const ctx = await esbuild.context(options);
        await ctx.watch();
        break;
    case 'prod-build':
        options.minify = true;
        options.keepNames = true;
        options.treeShaking = true;
        await esbuild.build(options);
        break;
    default:
        options.sourcemap = 'linked';
        await esbuild.build(options);
        break;
    };
})();