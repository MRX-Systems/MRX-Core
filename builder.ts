import pkg from './package.json';

const dependencies = 'dependencies' in pkg ? Object.keys(pkg.dependencies ?? {}) : [];
const devDependencies = 'devDependencies' in pkg ? Object.keys(pkg.devDependencies ?? {}) : [];
const peerDependencies = 'peerDependencies' in pkg ? Object.keys(pkg.peerDependencies ?? {}) : [];

await Bun.$`rm -rf dist`;
console.log('🗑️  Deleted dist folder if it existed. ✅');

await Bun.$`tsc --project tsconfig.dts.json`;
await Bun.$`tsc-alias -p tsconfig.dts.json`;
console.log('🔍 Type analysis and generation completed. ✅');

await Bun.build({
    target: 'bun',
    external: [...dependencies, ...devDependencies, ...peerDependencies],
    root: './source',
    entrypoints: [
        './source/core/database/index.ts',
        './source/core/repository/index.ts',
        './source/core/mailer/index.ts',
        './source/core/store/index.ts',
        './source/core/util/index.ts',

        './source/core/elysia/plugin/index.ts',
        './source/core/elysia/schema/index.ts',

        './source/error/index.ts',
        './source/error/key/index.ts',

        './source/types/index.ts',

        './source/index.ts'
    ],
    outdir: './dist',
    splitting: true,
    format: 'esm',
    minify: true,
    sourcemap: 'none'
});
console.log('🎉 Build completed successfully! 🎉');

process.exit(0);