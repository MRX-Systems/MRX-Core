import dts from 'bun-plugin-dts';

import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.build({
    target: 'node',
    external: [...dependencies, ...devDependencies, ...peerDependencies],
    root: './source',
    entrypoints: [
        './source/core/util/index.ts',

        './source/error/index.ts',
        './source/error/key/index.ts',

        './source/i18n/index.ts',

        './source/types/index.ts',

        './source/index.ts'
    ],
    plugins: [
        dts({
            output: {
                noBanner: true
            }
        })
    ],
    outdir: './build',
    splitting: true,
    format: 'esm',
    minify: true,
    sourcemap: 'none'
});