import esbuild from 'esbuild';

import pkg from '../package.json' with { type: 'json' };

const safePkg = pkg;
const dependencies = safePkg.dependencies ? Object.keys(safePkg.dependencies) : undefined;
 
const external = dependencies ?? [];

const optionsLib = {
    entryPoints: ['./Source/lib.ts'],
    outfile: './Build/lib.js',
    bundle: true,
    format: 'esm',
    platform: 'node',
    external,
    loader: { '.ts': 'ts' },
    tsconfig: './tsconfig.json',
    color: true,
    minify: true,
    keepNames: true,
    treeShaking: true,
    sourcemap: 'linked',
};

const optionsCli = {
    entryPoints: ['./Source/cli.ts'],
    outfile: './Build/cli.js',
    bundle: true,
    format: 'esm',
    platform: 'node',
    external,
    loader: { '.ts': 'ts' },
    tsconfig: './tsconfig.json',
    color: true,
    minify: true,
    keepNames: true,
    treeShaking: true,
    sourcemap: 'linked',
};

esbuild.build(optionsLib);
esbuild.build(optionsCli);